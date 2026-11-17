import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, minutes, normalizeIp } from '@nestjs/throttler';
import type { Request } from 'express';
import { AuthModule } from './auth/auth.module.js';
import { normalizePhone } from './auth/dto/auth-fields.js';
import { validateEnv } from './config/env.js';
import { BookingsModule } from './bookings/bookings.module.js';
import { HoldsModule } from './holds/holds.module.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { QueueModule } from './queue/queue.module.js';
import { THROTTLE } from './shared/constants/throttle.constants.js';
import { ApiExceptionFilter } from './shared/filters/api-exception.filter.js';
import { AppThrottlerGuard } from './shared/guards/app-throttler.guard.js';
import { clientIp } from './shared/utils/client-ip.js';
import { StationsModule } from './stations/stations.module.js';
import { TrainsModule } from './trains/trains.module.js';

function accountPhone(req: Request): string {
  const phone = (req.body as { phone?: unknown } | undefined)?.phone;
  return typeof phone === 'string' ? normalizePhone(phone) : '';
}

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnv }),
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: minutes(THROTTLE.default.minutes),
        limit: THROTTLE.default.limit,
      },
      {
        name: 'account',
        ttl: minutes(THROTTLE.account.minutes),
        limit: THROTTLE.account.limit,
        skipIf: (context) =>
          !accountPhone(context.switchToHttp().getRequest<Request>()),
        getTracker: (req) =>
          `${accountPhone(req as Request)}|${normalizeIp(clientIp(req as Request))}`,
      },
    ]),
    PrismaModule,
    AuthModule,
    StationsModule,
    TrainsModule,
    HoldsModule,
    BookingsModule,
    QueueModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: AppThrottlerGuard },
    { provide: APP_FILTER, useClass: ApiExceptionFilter },
  ],
})
export class AppModule {}
