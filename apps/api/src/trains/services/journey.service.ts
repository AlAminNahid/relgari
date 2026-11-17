import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import type { ApiError, ApiErrorCode } from '../../shared/types/api.types.js';
import {
  addDays,
  bdMoment,
  bdToday,
  weekday,
} from '../../shared/utils/bd-time.js';
import { ReleaseService } from './release.service.js';

const DAY_MINUTES = 1440;

export interface JourneyQuery {
  train: number;
  from: string;
  to: string;
  date: string;
}

const fail = (code: ApiErrorCode) => ({ code }) satisfies ApiError;

@Injectable()
export class JourneyService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly release: ReleaseService,
  ) {}

  async resolve(query: JourneyQuery, now: Date) {
    if (query.date < bdToday(now) || query.date > this.release.lastDate(now)) {
      throw new BadRequestException(fail('DATE_OUT_OF_RANGE'));
    }

    const [from, to] = await Promise.all(
      [query.from, query.to].map((code) =>
        this.prisma.station.findUnique({ where: { code } }),
      ),
    );
    if (!from || !to) throw new NotFoundException(fail('STATION_NOT_FOUND'));

    const train = await this.prisma.train.findUnique({
      where: { number: query.train },
      include: { stops: { where: { stationId: { in: [from.id, to.id] } } } },
    });
    const board = train?.stops.find((s) => s.stationId === from.id);
    const leave = train?.stops.find((s) => s.stationId === to.id);
    if (!train || !board || !leave || board.sequence >= leave.sequence) {
      throw new NotFoundException(fail('JOURNEY_NOT_FOUND'));
    }

    const departs = board.departureMinute ?? board.arrivalMinute;
    const arrives = leave.arrivalMinute ?? leave.departureMinute;
    if (departs == null || arrives == null) {
      throw new NotFoundException(fail('JOURNEY_NOT_FOUND'));
    }

    const runDate = addDays(query.date, -Math.floor(departs / DAY_MINUTES));
    if (train.offDay !== null && weekday(runDate) === train.offDay) {
      throw new NotFoundException(fail('JOURNEY_NOT_FOUND'));
    }

    const departed = bdMoment(query.date, departs % DAY_MINUTES) <= now;
    return {
      train,
      from,
      to,
      board,
      leave,
      departs,
      arrives,
      runDate,
      departed,
    };
  }
}

export type Journey = Awaited<ReturnType<JourneyService['resolve']>>;

export const dbDate = (date: string) => new Date(`${date}T00:00:00Z`);
