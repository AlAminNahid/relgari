import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import type { StationDto } from '../dto/station.dto.js';

@Injectable()
export class StationsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(): Promise<StationDto[]> {
    return this.prisma.station.findMany({
      select: { code: true, nameEn: true, nameBn: true },
      orderBy: { nameEn: 'asc' },
    });
  }
}
