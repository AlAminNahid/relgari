import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { AuthedRequest } from '../types/authed-request.type.js';

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext) =>
    context.switchToHttp().getRequest<AuthedRequest>().user,
);
