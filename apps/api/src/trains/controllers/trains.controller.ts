import {
  BadRequestException,
  Controller,
  Get,
  Header,
  Query,
} from '@nestjs/common';
import type { ApiError } from '../../shared/types/api.types.js';
import {
  trainSearchSchema,
  type TrainSearchDto,
} from '../dto/train-search.dto.js';
import { TrainSearchService } from '../services/train-search.service.js';

@Controller('trains')
export class TrainsController {
  constructor(private readonly trainSearch: TrainSearchService) {}

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
}
