import { Module } from '@nestjs/common';
import { TrainsController } from './controllers/trains.controller.js';
import { FareService } from './services/fare.service.js';
import { ReleaseService } from './services/release.service.js';
import { TrainSearchService } from './services/train-search.service.js';
import { TrainsService } from './services/trains.service.js';

@Module({
  controllers: [TrainsController],
  providers: [TrainsService, FareService, ReleaseService, TrainSearchService],
  exports: [TrainsService, FareService, ReleaseService],
})
export class TrainsModule {}
