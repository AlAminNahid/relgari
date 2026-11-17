import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import type { ApiError } from '../../shared/types/api.types.js';
import { addDays } from '../../shared/utils/bd-time.js';
import { dbDate } from './journey.service.js';
import { ReleaseService } from './release.service.js';

interface StopInfo {
  trainId: string;
  departs: number;
}

@Injectable()
export class SeatVersionService {
  private readonly stops = new Map<string, StopInfo>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly release: ReleaseService,
  ) {}

  async runOf(
    trainNumber: number,
    fromCode: string,
    date: string,
  ): Promise<{ trainId: string; runDate: string }> {
    const stop = await this.stopOf(trainNumber, fromCode);
    return {
      trainId: stop.trainId,
      runDate: addDays(date, -Math.floor(stop.departs / 1440)),
    };
  }

  async version(
    trainNumber: number,
    fromCode: string,
    date: string,
    now: Date,
  ): Promise<{ version: string }> {
    const stop = await this.stopOf(trainNumber, fromCode);
    const run = dbDate(addDays(date, -Math.floor(stop.departs / 1440)));

    const [holds, booked] = await Promise.all([
      this.prisma.hold.aggregate({
        where: { trainId: stop.trainId, runDate: run, expiresAt: { gt: now } },
        _count: true,
        _max: { createdAt: true },
      }),
      this.prisma.bookingSeat.count({
        where: { trainId: stop.trainId, runDate: run },
      }),
    ]);
    const opened = this.release.openedBatches(date, now);
    return {
      version: `${holds._count}.${holds._max.createdAt?.getTime() ?? 0}.${booked}.${opened}`,
    };
  }

  private async stopOf(
    trainNumber: number,
    fromCode: string,
  ): Promise<StopInfo> {
    const key = `${trainNumber}:${fromCode}`;
    const known = this.stops.get(key);
    if (known) return known;
    const stop = await this.prisma.trainStop.findFirst({
      where: { train: { number: trainNumber }, station: { code: fromCode } },
      select: { trainId: true, departureMinute: true, arrivalMinute: true },
    });
    const departs = stop?.departureMinute ?? stop?.arrivalMinute;
    if (!stop || departs == null) {
      throw new NotFoundException({
        code: 'JOURNEY_NOT_FOUND',
      } satisfies ApiError);
    }
    const info = { trainId: stop.trainId, departs };
    this.stops.set(key, info);
    return info;
  }
}
