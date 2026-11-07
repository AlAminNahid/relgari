import {
  Body,
  Controller,
  Get,
  Header,
  HttpCode,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Throttle, hours } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import type { User } from '../../generated/prisma/client.js';
import { THROTTLE } from '../../shared/constants/throttle.constants.js';
import { CurrentUser } from '../../shared/decorators/current-user.decorator.js';
import { AuthGuard } from '../../shared/guards/auth.guard.js';
import { ZodPipe } from '../../shared/pipes/zod.pipe.js';
import type { AuthUser } from '../../users/dto/auth-user.dto.js';
import { UsersService } from '../../users/services/users.service.js';
import { loginSchema, type LoginDto } from '../dto/login.dto.js';
import { registerSchema, type RegisterDto } from '../dto/register.dto.js';
import { AuthService } from '../services/auth.service.js';
import { SessionCookieService } from '../services/session-cookie.service.js';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly users: UsersService,
    private readonly cookies: SessionCookieService,
  ) {}

  @Post('register')
  @Throttle({
    default: {
      limit: THROTTLE.register.limit,
      ttl: hours(THROTTLE.register.hours),
    },
  })
  @Header('Cache-Control', 'no-store')
  async register(
    @Body(new ZodPipe(registerSchema)) body: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthUser> {
    const { user, session } = await this.auth.register(body);
    this.cookies.set(res, session);
    return user;
  }

  @Post('login')
  @HttpCode(200)
  @Header('Cache-Control', 'no-store')
  async login(
    @Body(new ZodPipe(loginSchema)) body: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthUser> {
    const { user, session } = await this.auth.login(body);
    this.cookies.set(res, session);
    return user;
  }

  @Post('logout')
  @HttpCode(204)
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    await this.auth.logout(this.cookies.read(req));
    this.cookies.clear(res);
  }

  @Get('me')
  @UseGuards(AuthGuard)
  @Header('Cache-Control', 'no-store')
  me(@CurrentUser() user: User): AuthUser {
    return this.users.toAuthUser(user);
  }
}
