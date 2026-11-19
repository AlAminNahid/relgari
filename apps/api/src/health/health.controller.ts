import { timingSafeEqual } from 'node:crypto';
import {
  Controller,
  Get,
  Head,
  NotFoundException,
  Param,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Env } from '../config/env.js';

@Controller('ping')
export class HealthController {
  constructor(private readonly config: ConfigService<Env, true>) {}

  @Get(':token')
  @Head(':token')
  check(@Param('token') given: string): { status: 'ok' } {
    const expected = this.config.get('HEALTH_TOKEN', { infer: true });
    const a = Buffer.from(given);
    const b = Buffer.from(expected ?? '');
    if (!expected || a.length !== b.length || !timingSafeEqual(a, b)) {
      throw new NotFoundException({ code: 'NOT_FOUND' });
    }
    return { status: 'ok' };
  }
}
