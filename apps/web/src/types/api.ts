import type { AuthErrorKey } from "@/lib/validations";

export type ApiErrorCode =
  | "VALIDATION_FAILED"
  | "PHONE_TAKEN"
  | "NID_TAKEN"
  | "INVALID_CREDENTIALS"
  | "UNAUTHENTICATED"
  | "TOO_MANY_REQUESTS"
  | "INTERNAL";

export interface ApiError {
  code: ApiErrorCode;
  fields?: Record<string, AuthErrorKey>;
}

export interface AuthUser {
  id: string;
  name: string;
  phone: string;
  nid: string;
  createdAt: string;
}

export interface Station {
  code: string;
  nameEn: string;
  nameBn: string;
}
