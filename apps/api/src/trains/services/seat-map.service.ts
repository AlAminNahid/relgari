import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { HOLD } from '../../shared/constants/hold.constants.js';
import type { ApiError } from '../../shared/types/api.types.js';
import type {
  CoachMapDto,
  SeatDto,
  SeatMapDto,
  SeatMapQuery,
} from '../dto/seat-map.dto.js';
import { FareService } from './fare.service.js';
import { dbDate, JourneyService } from './journey.service.js';
import { ReleaseService } from './release.service.js';
import { coachClassOf, kindOf } from './seat-class.js';
import { planFor } from '../../shared/constants/coach-layout.constants.js';

function clock(minute: number): string {
  const inDay = minute % 1440;
  const hours = String(Math.floor(inDay / 60)).padStart(2, '0');
  return `${hours}:${String(inDay % 60).padStart(2, '0')}`;
}

@Injectable()
export class SeatMapService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly journeys: JourneyService,
    private readonly fares: FareService,
    private readonly release: ReleaseService,
  ) {}

  async get(
    trainNumber: number,
    query: SeatMapQuery,
    now: Date,
  ): Promise<SeatMapDto> {
    const journey = await this.journeys.resolve(
      { train: trainNumber, from: query.from, to: query.to, date: query.date },
      now,
    );
    const { train, from, to, board, leave, runDate } = journey;
    const sold = query.class;

    const quota = await this.prisma.stationQuota.findUnique({
      where: {
        trainId_stationId_seatClass: {
          trainId: train.id,
          stationId: from.id,
          seatClass: sold,
        },
      },
    });
    if (!quota) {
      throw new NotFoundException({
        code: 'CLASS_NOT_AVAILABLE',
      } satisfies ApiError);
    }

    const [coaches, holds] = await Promise.all([
      this.prisma.coach.findMany({
        where: { trainId: train.id, seatClass: coachClassOf(sold) },
        orderBy: { position: 'asc' },
        include: {
          cabins: { orderBy: { number: 'asc' } },
          seats: {
            where: { kind: kindOf(sold) },
            orderBy: { number: 'asc' },
          },
        },
      }),
      this.prisma.hold.findMany({
        where: {
          trainId: train.id,
          runDate: dbDate(runDate),
          expiresAt: { gt: now },
        },
        select: { seatId: true, seatClass: true, fromStationId: true },
      }),
    ]);
    const heldIds = new Set(holds.map((h) => h.seatId));
    const heldFromHere = holds.filter(
      (h) => h.seatClass === sold && h.fromStationId === from.id,
    ).length;

    const heldSofas = new Set<string>();
    if (coachClassOf(sold) === 'ac') {
      const other = await this.prisma.seat.findMany({
        where: {
          id: { in: [...heldIds] },
          coach: { trainId: train.id, seatClass: 'ac' },
          kind: sold === 'ac' ? 'seat' : 'berth',
        },
        select: { coachId: true, sofa: true },
      });
      for (const seat of other) heldSofas.add(`${seat.coachId}:${seat.sofa}`);
    }

    const status = this.release.status(sold, quota.seats, query.date, now);
    const mapCoaches: CoachMapDto[] = coaches.map((coach) => {
      const isAc = coach.cabins.length > 0;
      const plan = isAc ? null : planFor(coach.rows * coach.seatsPerRow);
      const places = new Map<number, { row: number; column: number }>();
      plan?.rows.forEach((cells, row) =>
        cells.forEach((number, column) => {
          if (number !== null) places.set(number, { row, column });
        }),
      );
      const cabinOfSofa: { cabin: number; sofa: number }[] = [];
      for (const cabin of coach.cabins) {
        for (let i = 0; i < cabin.sofas; i += 1) {
          cabinOfSofa.push({ cabin: cabin.number, sofa: i });
        }
      }
      const perSofa = sold === 'ac' ? 2 : 3;
      const seats = coach.seats.map<SeatDto>((seat) => {
        const taken =
          heldIds.has(seat.id) ||
          (isAc && heldSofas.has(`${coach.id}:${seat.sofa}`));
        const berth = seat.kind === 'berth';
        const printed = berth
          ? `${coach.code}-${(seat.number - 1) % 2 === 0 ? 'LO' : 'UP'}-${seat.number}`
          : `${coach.code}-${seat.number}`;
        const base = {
          id: seat.id,
          number: seat.number,
          label: printed,
          state: taken ? ('taken' as const) : ('free' as const),
        };
        if (!isAc) {
          const place = places.get(seat.number);
          return {
            ...base,
            row: place?.row ?? null,
            column: place?.column ?? null,
            cabin: null,
            sofa: null,
            slot: null,
          };
        }
        const place = cabinOfSofa[(seat.sofa ?? 1) - 1];
        return {
          ...base,
          row: null,
          column: null,
          cabin: place.cabin,
          sofa: place.sofa,
          slot: (seat.number - 1) % perSofa,
        };
      });
      return {
        code: coach.code,
        rowCount: plan?.rows.length ?? 0,
        tableAfterRow: plan?.tableAfterRow ?? null,
        cabins: coach.cabins.map((c) => ({ number: c.number, sofas: c.sofas })),
        seats,
      };
    });

    return {
      train: {
        number: train.number,
        nameEn: train.nameEn,
        nameBn: train.nameBn,
      },
      from: { code: from.code, nameEn: from.nameEn, nameBn: from.nameBn },
      to: { code: to.code, nameEn: to.nameEn, nameBn: to.nameBn },
      date: query.date,
      seatClass: sold,
      fare: this.fares.calculate(sold, board.distanceKm, leave.distanceKm),
      departure: clock(journey.departs),
      departed: journey.departed,
      maxSeats: HOLD.maxSeats,
      availability: {
        quota: quota.seats,
        released: status.released,
        available: journey.departed
          ? 0
          : Math.max(0, status.released - heldFromHere),
        nextReleaseAt: status.nextReleaseAt?.toISOString() ?? null,
        nextReleaseSeats: status.nextReleaseSeats,
      },
      coaches: mapCoaches,
    };
  }
}
