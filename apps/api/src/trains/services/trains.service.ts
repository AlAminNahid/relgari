import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import {
  trainDetailInclude,
  type TrainDetail,
} from '../dto/train-detail.dto.js';

@Injectable()
export class TrainsService {
  constructor(private readonly prisma: PrismaService) {}

  findByNumber(number: number): Promise<TrainDetail | null> {
    return this.prisma.train.findUnique({
      where: { number },
      include: trainDetailInclude,
    });
  }
}
