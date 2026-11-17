import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Header,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import type { User } from '../../generated/prisma/client.js';
import { CurrentUser } from '../../shared/decorators/current-user.decorator.js';
import { AuthGuard } from '../../shared/guards/auth.guard.js';
import type { ApiError } from '../../shared/types/api.types.js';
import {
  payBookingSchema,
  type BookingDto,
  type CheckoutDto,
} from '../dto/booking.dto.js';
import { BookingsService } from '../services/bookings.service.js';

@Controller('bookings')
@UseGuards(AuthGuard)
export class BookingsController {
  constructor(private readonly bookings: BookingsService) {}

  @Post('checkout')
  @Header('Cache-Control', 'no-store')
  checkout(@CurrentUser() user: User): Promise<CheckoutDto> {
    return this.bookings.checkout(user.id, new Date());
  }

  @Post()
  @Header('Cache-Control', 'no-store')
  create(
    @CurrentUser() user: User,
    @Body() body: unknown,
  ): Promise<BookingDto> {
    const parsed = payBookingSchema.safeParse(body);
    if (!parsed.success) {
      throw new BadRequestException({
        code: 'VALIDATION_FAILED',
      } satisfies ApiError);
    }
    return this.bookings.create(user, parsed.data, new Date());
  }

  @Get(':id')
  @Header('Cache-Control', 'no-store')
  get(@CurrentUser() user: User, @Param('id') id: string): Promise<BookingDto> {
    return this.bookings.get(user.id, id);
  }
}
