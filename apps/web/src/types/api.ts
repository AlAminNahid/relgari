import type { ClassKey } from "@/config/site";
import type { AuthErrorKey } from "@/lib/validations";

export type ApiErrorCode =
  | "VALIDATION_FAILED"
  | "PHONE_TAKEN"
  | "NID_TAKEN"
  | "INVALID_CREDENTIALS"
  | "UNAUTHENTICATED"
  | "STATION_NOT_FOUND"
  | "DATE_OUT_OF_RANGE"
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

export interface ClassAvailability {
  seatClass: ClassKey;
  fare: number;
  quota: number;
  released: number;
  available: number;
  nextReleaseAt: string | null;
  nextReleaseSeats: number;
}

export interface TrainResult {
  number: number;
  nameEn: string;
  nameBn: string;
  departure: string;
  arrival: string;
  arrivalDayOffset: number;
  durationMinutes: number;
  departed: boolean;
  classes: ClassAvailability[];
}

export interface TrainSearch {
  from: Station;
  to: Station;
  date: string;
  routeExists: boolean;
  trains: TrainResult[];
}
