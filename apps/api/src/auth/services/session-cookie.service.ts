import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { CookieOptions, Request, Response } from 'express';
import { SESSION_COOKIE } from '../../shared/constants/auth.constants.js';

@Injectable()
export class SessionCookieService {
  private readonly options: CookieOptions;

  constructor(config: ConfigService) {
    this.options = {
      httpOnly: true,
      sameSite: 'lax',
      secure: config.get('NODE_ENV') === 'production',
      path: '/',
    };
  }

  set(res: Response, session: { token: string; expiresAt: Date }): void {
    res.cookie(SESSION_COOKIE, session.token, {
      ...this.options,
      expires: session.expiresAt,
    });
  }

  clear(res: Response): void {
    res.clearCookie(SESSION_COOKIE, this.options);
  }

  read(req: Request): string | undefined {
    const token = req.cookies?.[SESSION_COOKIE];
    return typeof token === 'string' && token ? token : undefined;
  }
}
