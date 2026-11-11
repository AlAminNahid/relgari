import { Injectable } from '@nestjs/common';
import type { SeatClass } from '../../generated/prisma/client.js';
import { FARE } from '../../shared/constants/fare.constants.js';

@Injectable()
export class FareService {
  calculate(seatClass: SeatClass, fromKm: number, toKm: number): number {
    const distance = toKm - fromKm;
    if (!Number.isFinite(distance) || distance <= 0) {
      throw new RangeError('The destination must come after the origin.');
    }
    const raw = distance * FARE.ratePerKm[seatClass];
    const rounded = Math.round(raw / FARE.roundTo) * FARE.roundTo;
    return Math.max(FARE.minimum, rounded);
  }
}
