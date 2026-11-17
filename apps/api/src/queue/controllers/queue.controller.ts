import {
  BadRequestException,
  Body,
  Controller,
  Header,
  HttpCode,
  Post,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';
import { SessionCookieService } from '../../auth/services/session-cookie.service.js';
import { SessionService } from '../../auth/services/session.service.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import type { ApiError } from '../../shared/types/api.types.js';
import { dbDate } from '../../trains/services/journey.service.js';
import { SeatVersionService } from '../../trains/services/seat-version.service.js';
import { queueSchema } from '../dto/queue.dto.js';
import { QueueService, type QueueStatus } from '../services/queue.service.js';

@Controller('queue')
export class QueueController {
  constructor(
    private readonly queue: QueueService,
    private readonly runs: SeatVersionService,
    private readonly sessions: SessionService,
    private readonly cookies: SessionCookieService,
    private readonly prisma: PrismaService,
  ) {}

  @Post('join')
  @HttpCode(200)
  @Header('Cache-Control', 'no-store')
  async join(@Req() req: Request, @Body() body: unknown): Promise<QueueStatus> {
    const input = this.parse(body);
    const run = await this.runs.runOf(input.train, input.from, input.date);
    const priority = await this.holdsSeats(req, run.trainId, run.runDate);
    return this.queue.join(
      `${run.trainId}:${run.runDate}`,
      input.visitorId,
      priority,
    );
  }

  @Post('leave')
  @HttpCode(204)
  async leave(@Body() body: unknown): Promise<void> {
    const input = this.parse(body);
    const run = await this.runs.runOf(input.train, input.from, input.date);
    this.queue.leave(`${run.trainId}:${run.runDate}`, input.visitorId);
  }

  private parse(body: unknown) {
    const parsed = queueSchema.safeParse(body);
    if (!parsed.success) {
      throw new BadRequestException({
        code: 'VALIDATION_FAILED',
      } satisfies ApiError);
    }
    return parsed.data;
  }

  private async holdsSeats(
    req: Request,
    trainId: string,
    runDate: string,
  ): Promise<boolean> {
    const token = this.cookies.read(req);
    const session = token ? await this.sessions.find(token) : null;
    if (!session) return false;
    const count = await this.prisma.hold.count({
      where: {
        userId: session.userId,
        trainId,
        runDate: dbDate(runDate),
        expiresAt: { gt: new Date() },
      },
    });
    return count > 0;
  }
}
