import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { TrainsModule } from '../trains/trains.module.js';
import { HoldsController } from './controllers/holds.controller.js';
import { HoldsService } from './services/holds.service.js';

@Module({
  imports: [AuthModule, TrainsModule],
  controllers: [HoldsController],
  providers: [HoldsService],
  exports: [HoldsService],
})
export class HoldsModule {}
