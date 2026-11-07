import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Logger,
} from '@nestjs/common';
import { ThrottlerException } from '@nestjs/throttler';
import type { ApiError } from '../types/api.types.js';
import type { Response } from 'express';

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('Exceptions');

  catch(exception: unknown, host: ArgumentsHost) {
    const res = host.switchToHttp().getResponse<Response>();

    if (exception instanceof ThrottlerException) {
      return res
        .status(429)
        .json({ code: 'TOO_MANY_REQUESTS' } satisfies ApiError);
    }
    if (exception instanceof HttpException) {
      return res.status(exception.getStatus()).json(exception.getResponse());
    }
    this.logger.error(
      exception instanceof Error
        ? (exception.stack ?? exception.message)
        : String(exception),
    );
    return res.status(500).json({ code: 'INTERNAL' } satisfies ApiError);
  }
}
