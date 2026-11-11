import { Module } from '@nestjs/common';
import { StationsController } from './controllers/stations.controller.js';
import { StationsService } from './services/stations.service.js';

@Module({
  controllers: [StationsController],
  providers: [StationsService],
  exports: [StationsService],
})
export class StationsModule {}
