import { Module } from '@nestjs/common';
import { TrainsController } from './controllers/trains.controller.js';
import { FareService } from './services/fare.service.js';
import { JourneyService } from './services/journey.service.js';
import { ReleaseService } from './services/release.service.js';
import { SeatMapService } from './services/seat-map.service.js';
import { SeatVersionService } from './services/seat-version.service.js';
import { TrainSearchService } from './services/train-search.service.js';
import { TrainsService } from './services/trains.service.js';

@Module({
  controllers: [TrainsController],
  providers: [
    TrainsService,
    FareService,
    ReleaseService,
    JourneyService,
    SeatMapService,
    SeatVersionService,
    TrainSearchService,
  ],
  exports: [
    TrainsService,
    FareService,
    ReleaseService,
    JourneyService,
    SeatVersionService,
  ],
})
export class TrainsModule {}
