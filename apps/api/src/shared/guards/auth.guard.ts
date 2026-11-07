import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { SessionCookieService } from '../../auth/services/session-cookie.service.js';
import { SessionService } from '../../auth/services/session.service.js';
import type { ApiError } from '../types/api.types.js';
import type { AuthedRequest } from '../types/authed-request.type.js';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly sessions: SessionService,
    private readonly cookies: SessionCookieService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<AuthedRequest>();
    const token = this.cookies.read(req);
    const session = token ? await this.sessions.find(token) : null;
    if (!session) {
      throw new UnauthorizedException({
        code: 'UNAUTHENTICATED',
      } satisfies ApiError);
    }
    req.user = session.user;
    req.sessionToken = token as string;
    return true;
  }
}
