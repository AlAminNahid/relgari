import { BadRequestException, PipeTransform } from '@nestjs/common';
import type { ZodType } from 'zod';
import { getFieldErrors } from '../../auth/dto/auth-fields.js';
import type { ApiError } from '../types/api.types.js';

export class ZodPipe<T> implements PipeTransform<unknown, T> {
  constructor(private readonly schema: ZodType<T>) {}

  transform(value: unknown): T {
    const result = this.schema.safeParse(value);
    if (!result.success) {
      throw new BadRequestException({
        code: 'VALIDATION_FAILED',
        fields: getFieldErrors(result.error),
      } satisfies ApiError);
    }
    return result.data;
  }
}
