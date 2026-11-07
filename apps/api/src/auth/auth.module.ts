import { Module } from '@nestjs/common';
import { AuthGuard } from '../shared/guards/auth.guard.js';
import { UsersModule } from '../users/users.module.js';
import { AuthController } from './controllers/auth.controller.js';
import { AuthService } from './services/auth.service.js';
import { PasswordService } from './services/password.service.js';
import { SessionCookieService } from './services/session-cookie.service.js';
import { SessionService } from './services/session.service.js';

@Module({
  imports: [UsersModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    PasswordService,
    SessionService,
    SessionCookieService,
    AuthGuard,
  ],
  exports: [AuthGuard, SessionService, SessionCookieService],
})
export class AuthModule {}
