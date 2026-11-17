import {
  BadRequestException,
  Controller,
  Get,
  Header,
  Param,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import type { ApiError } from '../../shared/types/api.types.js';
import { seatMapSchema, type SeatMapDto } from '../dto/seat-map.dto.js';
import {
  departureBoardSchema,
  trainSearchSchema,
  type DepartureBoardDto,
  type TrainSearchDto,
} from '../dto/train-search.dto.js';
import { SeatMapService } from '../services/seat-map.service.js';
import { SeatVersionService } from '../services/seat-version.service.js';
import { seatVersionSchema } from '../dto/seat-map.dto.js';
import { TrainSearchService } from '../services/train-search.service.js';

@Controller('trains')
export class TrainsController {
  constructor(
    private readonly trainSearch: TrainSearchService,
    private readonly seatMaps: SeatMapService,
    private readonly seatVersions: SeatVersionService,
  ) {}

  @Get('search')
  @Header('Cache-Control', 'no-store')
  search(@Query() query: Record<string, unknown>): Promise<TrainSearchDto> {
    const parsed = trainSearchSchema.safeParse(query);
    if (!parsed.success) {
      throw new BadRequestException({
        code: 'VALIDATION_FAILED',
      } satisfies ApiError);
    }
    return this.trainSearch.search(parsed.data, new Date());
  }

  @Get('board')
  @Header('Cache-Control', 'no-store')
  board(@Query() query: Record<string, unknown>): Promise<DepartureBoardDto> {
    const parsed = departureBoardSchema.safeParse(query);
    if (!parsed.success) {
      throw new BadRequestException({
        code: 'VALIDATION_FAILED',
      } satisfies ApiError);
    }
    return this.trainSearch.board(parsed.data, new Date());
  }

  @Get(':number/seats/version')
  @Header('Cache-Control', 'no-store')
  seatVersion(
    @Param('number', ParseIntPipe) number: number,
    @Query() query: Record<string, unknown>,
  ): Promise<{ version: string }> {
    const parsed = seatVersionSchema.safeParse(query);
    if (!parsed.success) {
      throw new BadRequestException({
        code: 'VALIDATION_FAILED',
      } satisfies ApiError);
    }
    return this.seatVersions.version(
      number,
      parsed.data.from,
      parsed.data.date,
      new Date(),
    );
  }

  @Get(':number/seats')
  @Header('Cache-Control', 'no-store')
  seats(
    @Param('number', ParseIntPipe) number: number,
    @Query() query: Record<string, unknown>,
  ): Promise<SeatMapDto> {
    const parsed = seatMapSchema.safeParse(query);
    if (!parsed.success) {
      throw new BadRequestException({
        code: 'VALIDATION_FAILED',
      } satisfies ApiError);
    }
    return this.seatMaps.get(number, parsed.data, new Date());
  }
}
