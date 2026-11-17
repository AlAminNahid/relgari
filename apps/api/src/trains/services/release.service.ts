import { Injectable } from '@nestjs/common';
import type { SeatClass } from '../../generated/prisma/client.js';
import { RELEASE } from '../../shared/constants/release.constants.js';
import { addDays, bdMoment, bdToday } from '../../shared/utils/bd-time.js';

export interface ReleaseStatus {
  released: number;
  nextReleaseAt: Date | null;
  nextReleaseSeats: number;
}

@Injectable()
export class ReleaseService {
  lastDate(now: Date): string {
    return addDays(bdToday(now), RELEASE.windowDays);
  }

  batchTime(journeyDate: string, index: number): Date {
    const daysBefore = RELEASE.windowDays - index * RELEASE.everyDays;
    return bdMoment(addDays(journeyDate, -daysBefore), RELEASE.atMinute);
  }

  releasedAfter(seatClass: SeatClass, quota: number, opened: number): number {
    const batches = RELEASE.batches[seatClass];
    if (opened <= 0 || quota <= 0) return 0;
    if (opened >= batches.length) return quota;
    const percent = batches.slice(0, opened).reduce((sum, p) => sum + p, 0);
    return Math.min(Math.round((quota * percent) / 100), quota - 1);
  }

  openedBatches(journeyDate: string, now: Date): number {
    const total = RELEASE.batches.schair.length;
    let opened = 0;
    while (opened < total && this.batchTime(journeyDate, opened) <= now) {
      opened += 1;
    }
    return opened;
  }

  status(
    seatClass: SeatClass,
    quota: number,
    journeyDate: string,
    now: Date,
  ): ReleaseStatus {
    const total = RELEASE.batches[seatClass].length;
    let opened = 0;
    while (opened < total && this.batchTime(journeyDate, opened) <= now) {
      opened += 1;
    }
    const released = this.releasedAfter(seatClass, quota, opened);

    let next = opened;
    while (
      next < total &&
      this.releasedAfter(seatClass, quota, next + 1) === released
    ) {
      next += 1;
    }
    if (next >= total) {
      return { released, nextReleaseAt: null, nextReleaseSeats: 0 };
    }
    return {
      released,
      nextReleaseAt: this.batchTime(journeyDate, next),
      nextReleaseSeats:
        this.releasedAfter(seatClass, quota, next + 1) - released,
    };
  }
}
