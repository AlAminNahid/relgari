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
  | "JOURNEY_NOT_FOUND"
  | "TRAIN_DEPARTED"
  | "CLASS_NOT_AVAILABLE"
  | "SEAT_NOT_FOUND"
  | "SEAT_TAKEN"
  | "NOT_ON_SALE"
  | "HOLD_LIMIT"
  | "DIFFERENT_JOURNEY"
  | "HOLD_NOT_FOUND"
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
  seatClass: ClassKey | "shovan";
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

export interface SeatInfo {
  id: string;
  number: number;
  label: string;
  state: "free" | "taken";
  row: number | null;
  column: number | null;
  cabin: number | null;
  sofa: number | null;
  slot: number | null;
}

export interface CoachMap {
  code: string;
  rowCount: number;
  tableAfterRow: number | null;
  cabins: { number: number; sofas: number }[];
  seats: SeatInfo[];
}

export interface SeatMap {
  train: { number: number; nameEn: string; nameBn: string };
  from: Station;
  to: Station;
  date: string;
  seatClass: ClassKey;
  fare: number;
  departure: string;
  departed: boolean;
  maxSeats: number;
  availability: {
    quota: number;
    released: number;
    available: number;
    nextReleaseAt: string | null;
    nextReleaseSeats: number;
  };
  coaches: CoachMap[];
}

export interface Hold {
  id: string;
  seatId: string;
  label: string;
  coach: string;
  seatClass: ClassKey;
  fare: number;
  train: { number: number; nameEn: string; nameBn: string };
  from: Station;
  to: Station;
  date: string;
  expiresAt: string;
  secondsLeft: number;
}
