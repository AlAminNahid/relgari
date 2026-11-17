import { Injectable } from '@nestjs/common';
import { ThrottlerGuard, normalizeIp } from '@nestjs/throttler';
import type { Request } from 'express';
import { clientIp } from '../utils/client-ip.js';

@Injectable()
export class AppThrottlerGuard extends ThrottlerGuard {
  protected override getTracker(req: Record<string, unknown>): Promise<string> {
    return Promise.resolve(normalizeIp(clientIp(req as unknown as Request)));
  }
}
