import type { AuthErrorKey } from '../../auth/dto/auth-fields.js';

export type ApiErrorCode =
  | 'VALIDATION_FAILED'
  | 'PHONE_TAKEN'
  | 'NID_TAKEN'
  | 'INVALID_CREDENTIALS'
  | 'UNAUTHENTICATED'
  | 'STATION_NOT_FOUND'
  | 'DATE_OUT_OF_RANGE'
  | 'JOURNEY_NOT_FOUND'
  | 'TRAIN_DEPARTED'
  | 'CLASS_NOT_AVAILABLE'
  | 'SEAT_NOT_FOUND'
  | 'SEAT_TAKEN'
  | 'NOT_ON_SALE'
  | 'HOLD_LIMIT'
  | 'DIFFERENT_JOURNEY'
  | 'HOLD_NOT_FOUND'
  | 'HOLDS_EMPTY'
  | 'BOOKING_NOT_FOUND'
  | 'INVALID_WALLET_NUMBER'
  | 'INVALID_OTP'
  | 'INVALID_PIN'
  | 'INSUFFICIENT_BALANCE'
  | 'INVALID_CARD'
  | 'CARD_DECLINED'
  | 'TOO_MANY_REQUESTS'
  | 'INTERNAL';

export interface ApiError {
  code: ApiErrorCode;
  fields?: Record<string, AuthErrorKey>;
}
