import type { PaymentMethod } from "@/config/payment";
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
  | "HOLDS_EMPTY"
  | "BOOKING_NOT_FOUND"
  | "INVALID_WALLET_NUMBER"
  | "INVALID_OTP"
  | "INVALID_PIN"
  | "INSUFFICIENT_BALANCE"
  | "INVALID_CARD"
  | "CARD_DECLINED"
  | "CANCEL_CLOSED"
  | "JOURNEY_LIMIT"
  | "MONTHLY_LIMIT"
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

export interface Checkout {
  holds: Hold[];
  subtotal: number;
  serviceCharge: number;
  total: number;
}

export interface Booking {
  id: string;
  pnr: string;
  train: { number: number; nameEn: string; nameBn: string };
  from: Station;
  to: Station;
  date: string;
  departure: string;
  arrival: string;
  arrivalDayOffset: number;
  passenger: { name: string; phone: string };
  seats: {
    id: string;
    label: string;
    coach: string;
    seatClass: ClassKey;
    fare: number;
  }[];
  subtotal: number;
  serviceCharge: number;
  total: number;
  paymentMethod: PaymentMethod;
  transactionId: string;
  paidAt: string;
  status: BookingStatus;
  departureAt: string;
  canCancel: boolean;
  cancelFeePercent: number | null;
  refunds: Refund[];
}

export type BookingStatus =
  | "confirmed"
  | "partly_cancelled"
  | "cancelled"
  | "departed";

export interface RefundSeat {
  label: string;
  coach: string;
  seatClass: ClassKey;
  fare: number;
  fee: number;
  refund: number;
}

export interface Refund {
  reference: string;
  paymentMethod: PaymentMethod;
  feePercent: number;
  fareTotal: number;
  fee: number;
  amount: number;
  createdAt: string;
  seats: RefundSeat[];
}

export interface CancelQuote {
  feePercent: number;
  fareTotal: number;
  fee: number;
  amount: number;
  paymentMethod: PaymentMethod;
  seats: (RefundSeat & { id: string })[];
}
export interface PurchaseLimit {
  used: number;
  max: number;
  remaining: number;
  resetsOn: string;
}

export interface BoardRow {
  number: number;
  nameEn: string;
  nameBn: string;
  to: Station;
  date: string;
  departure: string;
  arrival: string;
  arrivalDayOffset: number;
  classes: {
    seatClass: ClassKey | "shovan";
    quota: number;
    released: number;
    available: number;
    nextReleaseAt: string | null;
  }[];
}

export interface DepartureBoard {
  station: Station;
  rows: BoardRow[];
}

export interface TicketCheck {
  pnr: string;
  status: BookingStatus;
  valid: boolean;
  train: { number: number; nameEn: string; nameBn: string };
  from: Station;
  to: Station;
  date: string;
  departure: string;
  passenger: string;
  seats: { label: string; coach: string; seatClass: ClassKey }[];
}
