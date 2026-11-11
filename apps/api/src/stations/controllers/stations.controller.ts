import { Controller, Get, Header } from '@nestjs/common';
import type { StationDto } from '../dto/station.dto.js';
import { StationsService } from '../services/stations.service.js';

@Controller('stations')
export class StationsController {
  constructor(private readonly stations: StationsService) {}

  @Get()
  @Header('Cache-Control', 'public, max-age=300')
  findAll(): Promise<StationDto[]> {
    return this.stations.findAll();
  }
}
