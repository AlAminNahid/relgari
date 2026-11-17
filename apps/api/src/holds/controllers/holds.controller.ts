import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Header,
  HttpCode,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import type { User } from '../../generated/prisma/client.js';
import { CurrentUser } from '../../shared/decorators/current-user.decorator.js';
import { AuthGuard } from '../../shared/guards/auth.guard.js';
import type { ApiError } from '../../shared/types/api.types.js';
import { createHoldSchema, type HoldDto } from '../dto/hold.dto.js';
import { HoldsService } from '../services/holds.service.js';

@Controller('holds')
@UseGuards(AuthGuard)
export class HoldsController {
  constructor(private readonly holds: HoldsService) {}

  @Get('current')
  @Header('Cache-Control', 'no-store')
  current(@CurrentUser() user: User): Promise<HoldDto[]> {
    return this.holds.list(user.id, new Date());
  }

  @Post()
  @Header('Cache-Control', 'no-store')
  create(@CurrentUser() user: User, @Body() body: unknown): Promise<HoldDto> {
    const parsed = createHoldSchema.safeParse(body);
    if (!parsed.success) {
      throw new BadRequestException({
        code: 'VALIDATION_FAILED',
      } satisfies ApiError);
    }
    return this.holds.create(user.id, parsed.data, new Date());
  }

  @Delete(':id')
  @HttpCode(204)
  async release(
    @CurrentUser() user: User,
    @Param('id') id: string,
  ): Promise<void> {
    await this.holds.releaseSeat(user.id, id);
  }
}
