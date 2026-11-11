import { Module } from '@nestjs/common';
import { FareService } from './services/fare.service.js';
import { TrainsService } from './services/trains.service.js';

@Module({
  providers: [TrainsService, FareService],
  exports: [TrainsService, FareService],
})
export class TrainsModule {}
