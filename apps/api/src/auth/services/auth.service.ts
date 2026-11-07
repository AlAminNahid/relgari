import { Injectable, UnauthorizedException } from '@nestjs/common';
import type { ApiError } from '../../shared/types/api.types.js';
import type { AuthUser } from '../../users/dto/auth-user.dto.js';
import { UsersService } from '../../users/services/users.service.js';
import { LoginDto } from '../dto/login.dto.js';
import { normalizePhone } from '../dto/auth-fields.js';
import { RegisterDto } from '../dto/register.dto.js';
import { PasswordService } from './password.service.js';
import { SessionService } from './session.service.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    private readonly passwords: PasswordService,
    private readonly sessions: SessionService,
  ) {}

  async register(input: RegisterDto) {
    const phone = normalizePhone(input.phone);
    await this.users.assertAvailable(phone, input.nid);

    const passwordHash = await this.passwords.hash(input.password);
    const user = await this.users.create({
      name: input.name,
      phone,
      nid: input.nid,
      passwordHash,
    });
    return {
      user: this.users.toAuthUser(user),
      session: await this.sessions.create(user.id),
    };
  }

  async login(
    input: LoginDto,
  ): Promise<{ user: AuthUser; session: { token: string; expiresAt: Date } }> {
    const user = await this.users.findByPhone(normalizePhone(input.phone));

    if (!user) {
      await this.passwords.spendTimeLikeAVerify(input.password);
      throw this.invalidCredentials();
    }
    if (!(await this.passwords.verify(user.passwordHash, input.password))) {
      throw this.invalidCredentials();
    }
    return {
      user: this.users.toAuthUser(user),
      session: await this.sessions.create(user.id),
    };
  }

  async logout(token: string | undefined): Promise<void> {
    if (token) await this.sessions.destroy(token);
  }

  private invalidCredentials() {
    return new UnauthorizedException({
      code: 'INVALID_CREDENTIALS',
    } satisfies ApiError);
  }
}
