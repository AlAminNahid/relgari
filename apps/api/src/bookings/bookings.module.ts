import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { HoldsModule } from '../holds/holds.module.js';
import { BookingsController } from './controllers/bookings.controller.js';
import { BookingsService } from './services/bookings.service.js';
import { PaymentService } from './services/payment.service.js';

@Module({
  imports: [AuthModule, HoldsModule],
  controllers: [BookingsController],
  providers: [BookingsService, PaymentService],
})
export class BookingsModule {}
