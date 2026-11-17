import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { SeatClass } from '../../generated/prisma/client.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import type { ApiError } from '../../shared/types/api.types.js';
import {
  addDays,
  bdMoment,
  bdToday,
  weekday,
} from '../../shared/utils/bd-time.js';
import type {
  ClassAvailabilityDto,
  TrainResultDto,
  TrainSearchDto,
  TrainSearchQuery,
} from '../dto/train-search.dto.js';
import { FareService } from './fare.service.js';
import { ReleaseService } from './release.service.js';

const DAY_MINUTES = 1440;
const CLASS_ORDER: SeatClass[] = ['shovan', 'schair', 'snigdha', 'acs', 'ac'];
const stationFields = { code: true, nameEn: true, nameBn: true } as const;

function clock(minute: number): string {
  const inDay = minute % DAY_MINUTES;
  const hours = String(Math.floor(inDay / 60)).padStart(2, '0');
  return `${hours}:${String(inDay % 60).padStart(2, '0')}`;
}

@Injectable()
export class TrainSearchService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly fares: FareService,
    private readonly release: ReleaseService,
  ) {}

  async search(query: TrainSearchQuery, now: Date): Promise<TrainSearchDto> {
    const { date } = query;
    if (date < bdToday(now) || date > this.release.lastDate(now)) {
      throw new BadRequestException({
        code: 'DATE_OUT_OF_RANGE',
      } satisfies ApiError);
    }

    const [from, to] = await Promise.all(
      [query.from, query.to].map((code) =>
        this.prisma.station.findUnique({
          where: { code },
          select: { id: true, ...stationFields },
        }),
      ),
    );
    if (!from || !to) {
      throw new NotFoundException({
        code: 'STATION_NOT_FOUND',
      } satisfies ApiError);
    }

    const candidates = await this.prisma.train.findMany({
      where: {
        AND: [
          { stops: { some: { stationId: from.id } } },
          { stops: { some: { stationId: to.id } } },
        ],
      },
      include: {
        stops: { where: { stationId: { in: [from.id, to.id] } } },
        quotas: { where: { stationId: from.id } },
      },
    });

    const heldRows = await this.prisma.hold.findMany({
      where: {
        fromStationId: from.id,
        trainId: { in: candidates.map((train) => train.id) },
        expiresAt: { gt: now },
      },
      select: { trainId: true, runDate: true, seatClass: true },
    });
    const held = new Map<string, number>();
    for (const row of heldRows) {
      const key = `${row.trainId}:${row.runDate.toISOString().slice(0, 10)}:${row.seatClass}`;
      held.set(key, (held.get(key) ?? 0) + 1);
    }

    const trains: TrainResultDto[] = [];
    let routeExists = false;
    for (const train of candidates) {
      const board = train.stops.find((stop) => stop.stationId === from.id);
      const leave = train.stops.find((stop) => stop.stationId === to.id);
      if (!board || !leave || board.sequence >= leave.sequence) continue;
      routeExists = true;

      const departs = board.departureMinute ?? board.arrivalMinute;
      const arrives = leave.arrivalMinute ?? leave.departureMinute;
      if (departs == null || arrives == null) continue;

      const startDate = addDays(date, -Math.floor(departs / DAY_MINUTES));
      if (train.offDay !== null && weekday(startDate) === train.offDay)
        continue;

      const boardingMinute = departs % DAY_MINUTES;
      const durationMinutes = arrives - departs;
      const departed = bdMoment(date, boardingMinute) <= now;

      const classes: ClassAvailabilityDto[] = [];
      for (const seatClass of CLASS_ORDER) {
        const quota = train.quotas.find((q) => q.seatClass === seatClass);
        if (!quota) continue;
        const status = this.release.status(seatClass, quota.seats, date, now);
        // Bookings will be subtracted here too once tickets can be bought.
        const sold = held.get(`${train.id}:${startDate}:${seatClass}`) ?? 0;
        classes.push({
          seatClass,
          fare: this.fares.calculate(
            seatClass,
            board.distanceKm,
            leave.distanceKm,
          ),
          quota: quota.seats,
          released: status.released,
          available: departed ? 0 : Math.max(0, status.released - sold),
          nextReleaseAt: departed
            ? null
            : (status.nextReleaseAt?.toISOString() ?? null),
          nextReleaseSeats: departed ? 0 : status.nextReleaseSeats,
        });
      }

      trains.push({
        number: train.number,
        nameEn: train.nameEn,
        nameBn: train.nameBn,
        departure: clock(departs),
        arrival: clock(arrives),
        arrivalDayOffset: Math.floor(
          (boardingMinute + durationMinutes) / DAY_MINUTES,
        ),
        durationMinutes,
        departed,
        classes,
      });
    }
    trains.sort(
      (a, b) => a.departure.localeCompare(b.departure) || a.number - b.number,
    );

    const publicStation = ({ code, nameEn, nameBn }: typeof from) => ({
      code,
      nameEn,
      nameBn,
    });
    return {
      from: publicStation(from),
      to: publicStation(to),
      date,
      routeExists,
      trains,
    };
  }
}
