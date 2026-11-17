import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Header,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import type { User } from '../../generated/prisma/client.js';
import { CurrentUser } from '../../shared/decorators/current-user.decorator.js';
import { AuthGuard } from '../../shared/guards/auth.guard.js';
import type { ApiError } from '../../shared/types/api.types.js';
import {
  cancelSchema,
  payBookingSchema,
  quoteSchema,
  type BookingDto,
  type CheckoutDto,
  type LimitDto,
  type QuoteDto,
  type RefundDto,
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

  @Get('limits')
  @Header('Cache-Control', 'no-store')
  limits(@CurrentUser() user: User): Promise<LimitDto> {
    return this.bookings.monthlyUsage(user.id, new Date());
  }

  @Get()
  @Header('Cache-Control', 'no-store')
  list(@CurrentUser() user: User): Promise<BookingDto[]> {
    return this.bookings.list(user.id, new Date());
  }

  @Get(':id/cancel-quote')
  @Header('Cache-Control', 'no-store')
  quote(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Query() query: Record<string, unknown>,
  ): Promise<QuoteDto> {
    const parsed = quoteSchema.safeParse(query);
    if (!parsed.success) {
      throw new BadRequestException({
        code: 'VALIDATION_FAILED',
      } satisfies ApiError);
    }
    return this.bookings.quote(user.id, id, parsed.data.seats, new Date());
  }

  @Post(':id/cancel')
  @Header('Cache-Control', 'no-store')
  cancel(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() body: unknown,
  ): Promise<RefundDto> {
    const parsed = cancelSchema.safeParse(body);
    if (!parsed.success) {
      throw new BadRequestException({
        code: 'VALIDATION_FAILED',
      } satisfies ApiError);
    }
    return this.bookings.cancel(user.id, id, parsed.data.seatIds, new Date());
  }

  @Get(':id')
  @Header('Cache-Control', 'no-store')
  get(@CurrentUser() user: User, @Param('id') id: string): Promise<BookingDto> {
    return this.bookings.get(user.id, id);
  }
}
