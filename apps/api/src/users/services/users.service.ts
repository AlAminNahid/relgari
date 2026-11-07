import { ConflictException, Injectable } from '@nestjs/common';
import { Prisma, type User } from '../../generated/prisma/client.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import type { ApiError } from '../../shared/types/api.types.js';
import type { CreateUserDto } from '../dto/create-user.dto.js';
import type { AuthUser } from '../dto/auth-user.dto.js';
import { NidCryptoService } from './nid-crypto.service.js';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly nid: NidCryptoService,
  ) {}

  findByPhone(phone: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { phone } });
  }

  async assertAvailable(phone: string, nid: string): Promise<void> {
    const taken = await this.prisma.user.findFirst({
      where: { OR: [{ phone }, { nidHash: this.nid.hash(nid) }] },
      select: { phone: true },
    });
    if (taken) {
      throw new ConflictException({
        code: taken.phone === phone ? 'PHONE_TAKEN' : 'NID_TAKEN',
      } satisfies ApiError);
    }
  }

  async create(input: CreateUserDto): Promise<User> {
    try {
      return await this.prisma.user.create({
        data: {
          name: input.name,
          phone: input.phone,
          nidHash: this.nid.hash(input.nid),
          nidEncrypted: this.nid.encrypt(input.nid),
          passwordHash: input.passwordHash,
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        await this.assertAvailable(input.phone, input.nid);
      }
      throw error;
    }
  }

  toAuthUser(user: User): AuthUser {
    return {
      id: user.id,
      name: user.name,
      phone: user.phone,
      nid: this.nid.decrypt(user.nidEncrypted),
      createdAt: user.createdAt.toISOString(),
    };
  }
}
