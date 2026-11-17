import {
  Controller,
  Get,
  Header,
  NotFoundException,
  Param,
} from '@nestjs/common';
import type { ApiError } from '../../shared/types/api.types.js';
import type { VerifyDto } from '../dto/booking.dto.js';
import { BookingsService } from '../services/bookings.service.js';

@Controller('verify')
export class VerifyController {
  constructor(private readonly bookings: BookingsService) {}

  @Get(':pnr')
  @Header('Cache-Control', 'no-store')
  verify(@Param('pnr') pnr: string): Promise<VerifyDto> {
    const code = pnr.trim().toUpperCase();

    if (!/^RG[A-Z0-9]{6}$/.test(code)) {
      throw new NotFoundException({
        code: 'BOOKING_NOT_FOUND',
      } satisfies ApiError);
    }
    return this.bookings.verify(code, new Date());
  }
}
