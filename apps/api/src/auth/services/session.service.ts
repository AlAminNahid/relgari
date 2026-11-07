import { createHash, randomBytes } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { SESSION_DAYS, SESSION_TOKEN_BYTES } from '../../shared/constants/auth.constants.js';

@Injectable()
export class SessionService {
  constructor(private readonly prisma: PrismaService) {}

  private hash(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  async create(userId: string) {
    const token = randomBytes(SESSION_TOKEN_BYTES).toString('base64url');
    const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
    await this.prisma.session.create({
      data: { userId, tokenHash: this.hash(token), expiresAt },
    });
    await this.prisma.session.deleteMany({
      where: { userId, expiresAt: { lt: new Date() } },
    });
    return { token, expiresAt };
  }

  async find(token: string) {
    const session = await this.prisma.session.findUnique({
      where: { tokenHash: this.hash(token) },
      include: { user: true },
    });
    if (!session) return null;
    if (session.expiresAt <= new Date()) {
      await this.prisma.session.deleteMany({ where: { id: session.id } });
      return null;
    }
    return session;
  }

  async destroy(token: string): Promise<void> {
    await this.prisma.session.deleteMany({
      where: { tokenHash: this.hash(token) },
    });
  }
}
