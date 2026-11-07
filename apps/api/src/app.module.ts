import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import {
  ThrottlerGuard,
  ThrottlerModule,
  minutes,
  normalizeIp,
} from '@nestjs/throttler';
import type { Request } from 'express';
import { AuthModule } from './auth/auth.module.js';
import { normalizePhone } from './auth/dto/auth-fields.js';
import { validateEnv } from './config/env.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { THROTTLE } from './shared/constants/throttle.constants.js';
import { ApiExceptionFilter } from './shared/filters/api-exception.filter.js';

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
          `${accountPhone(req as Request)}|${normalizeIp((req as Request).ip ?? '')}`,
      },
    ]),
    PrismaModule,
    AuthModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_FILTER, useClass: ApiExceptionFilter },
  ],
})
export class AppModule {}
