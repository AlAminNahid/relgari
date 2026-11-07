import type { AuthErrorKey } from '../../auth/dto/auth-fields.js';

export type ApiErrorCode =
  | 'VALIDATION_FAILED'
  | 'PHONE_TAKEN'
  | 'NID_TAKEN'
  | 'INVALID_CREDENTIALS'
  | 'UNAUTHENTICATED'
  | 'TOO_MANY_REQUESTS'
  | 'INTERNAL';

export interface ApiError {
  code: ApiErrorCode;
  fields?: Record<string, AuthErrorKey>;
}
