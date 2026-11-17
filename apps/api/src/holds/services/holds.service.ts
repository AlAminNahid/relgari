import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { HOLD } from '../../shared/constants/hold.constants.js';
import type { ApiError, ApiErrorCode } from '../../shared/types/api.types.js';
import { addDays } from '../../shared/utils/bd-time.js';
import { FareService } from '../../trains/services/fare.service.js';
import {
  dbDate,
  JourneyService,
} from '../../trains/services/journey.service.js';
import { ReleaseService } from '../../trains/services/release.service.js';
import { seatLabel, soldClass } from '../../trains/services/seat-class.js';
import { takenOnRun } from '../../trains/services/seat-usage.js';
import type { CreateHoldDto, HoldDto } from '../dto/hold.dto.js';

const fail = (code: ApiErrorCode) => ({ code }) satisfies ApiError;
const isoDate = (date: Date) => date.toISOString().slice(0, 10);

@Injectable()
export class HoldsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly journeys: JourneyService,
    private readonly fares: FareService,
    private readonly release: ReleaseService,
  ) {}

  async list(userId: string, now: Date): Promise<HoldDto[]> {
    const holds = await this.prisma.hold.findMany({
      where: { userId, expiresAt: { gt: now } },
      orderBy: [{ expiresAt: 'asc' }, { createdAt: 'asc' }],
      include: {
        seat: { include: { coach: true } },
        train: { include: { stops: true } },
        fromStation: true,
        toStation: true,
      },
    });
    return holds.map((hold) => {
      const board = hold.train.stops.find(
        (stop) => stop.stationId === hold.fromStationId,
      );
      const departs = board?.departureMinute ?? board?.arrivalMinute ?? 0;
      const { seat } = hold;
      return {
        id: hold.id,
        seatId: seat.id,
        label: seatLabel(seat, seat.coach.code),
        coach: seat.coach.code,
        seatClass: hold.seatClass as HoldDto['seatClass'],
        fare: hold.fare,
        train: {
          number: hold.train.number,
          nameEn: hold.train.nameEn,
          nameBn: hold.train.nameBn,
        },
        from: pick(hold.fromStation),
        to: pick(hold.toStation),
        date: addDays(isoDate(hold.runDate), Math.floor(departs / 1440)),
        expiresAt: hold.expiresAt.toISOString(),
        secondsLeft: Math.max(
          0,
          Math.ceil((hold.expiresAt.getTime() - now.getTime()) / 1000),
        ),
      };
    });
  }

  async create(
    userId: string,
    input: CreateHoldDto,
    now: Date,
  ): Promise<HoldDto> {
    const journey = await this.journeys.resolve(
      { train: input.train, from: input.from, to: input.to, date: input.date },
      now,
    );
    if (journey.departed) {
      throw new BadRequestException(fail('TRAIN_DEPARTED'));
    }
    const { train, from, to, board, leave, runDate } = journey;

    const seat = await this.prisma.seat.findUnique({
      where: { id: input.seatId },
      include: { coach: true },
    });
    if (!seat || seat.coach.trainId !== train.id) {
      throw new NotFoundException(fail('SEAT_NOT_FOUND'));
    }
    const sold = soldClass(seat.coach.seatClass, seat.kind);
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
      throw new BadRequestException(fail('CLASS_NOT_AVAILABLE'));
    }
    const fare = this.fares.calculate(sold, board.distanceKm, leave.distanceKm);
    const run = dbDate(runDate);
    const status = this.release.status(sold, quota.seats, input.date, now);

    try {
      await this.prisma.$transaction(async (tx) => {
        await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${`${train.id}:${runDate}`}, 0))`;

        await tx.hold.deleteMany({
          where: { trainId: train.id, runDate: run, expiresAt: { lte: now } },
        });

        const mine = await tx.hold.findMany({
          where: { userId, expiresAt: { gt: now } },
        });
        if (mine.length >= HOLD.maxSeats) {
          throw new ConflictException(fail('HOLD_LIMIT'));
        }
        const sameJourney = mine.every(
          (hold) =>
            hold.trainId === train.id &&
            hold.runDate.getTime() === run.getTime() &&
            hold.fromStationId === from.id &&
            hold.toStationId === to.id,
        );
        if (!sameJourney) {
          throw new ConflictException(fail('DIFFERENT_JOURNEY'));
        }

        const taken = await takenOnRun(tx, train.id, run, now);
        if (taken.some((t) => t.seatId === seat.id)) {
          throw new ConflictException(fail('SEAT_TAKEN'));
        }
        if (
          seat.sofa !== null &&
          taken.some(
            (t) =>
              t.coachId === seat.coachId &&
              t.sofa === seat.sofa &&
              t.kind !== seat.kind,
          )
        ) {
          throw new ConflictException(fail('SEAT_TAKEN'));
        }

        const takenFromHere = taken.filter(
          (t) => t.seatClass === sold && t.fromStationId === from.id,
        ).length;
        if (status.released - takenFromHere <= 0) {
          throw new ConflictException(fail('NOT_ON_SALE'));
        }

        await tx.hold.create({
          data: {
            userId,
            trainId: train.id,
            runDate: run,
            seatId: seat.id,
            seatClass: sold,
            fromStationId: from.id,
            toStationId: to.id,
            fare,
            expiresAt: new Date(now.getTime() + HOLD.minutes * 60_000),
          },
        });
      });
    } catch (error) {
      if ((error as { code?: string }).code === 'P2002') {
        throw new ConflictException(fail('SEAT_TAKEN'));
      }
      throw error;
    }

    const created = (await this.list(userId, now)).find(
      (hold) => hold.seatId === seat.id,
    );
    if (!created) throw new ConflictException(fail('SEAT_TAKEN'));
    return created;
  }

  async releaseSeat(userId: string, holdId: string): Promise<void> {
    const { count } = await this.prisma.hold.deleteMany({
      where: { id: holdId, userId },
    });
    if (count === 0) throw new NotFoundException(fail('HOLD_NOT_FOUND'));
  }
}

function pick(station: { code: string; nameEn: string; nameBn: string }) {
  return { code: station.code, nameEn: station.nameEn, nameBn: station.nameBn };
}
