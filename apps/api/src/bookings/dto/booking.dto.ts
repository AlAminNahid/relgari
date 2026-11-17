import { z } from 'zod';
import type {
  PaymentMethod,
  SeatClass,
} from '../../generated/prisma/client.js';
import type { StationDto } from '../../stations/dto/station.dto.js';
import type { HoldDto } from '../../holds/dto/hold.dto.js';

const walletSchema = z.object({
  method: z.enum(['bkash', 'nagad', 'rocket']),
  number: z.string().trim().min(1).max(20),
  otp: z.string().trim().min(1).max(12),
  pin: z.string().trim().min(1).max(12),
});

const cardSchema = z.object({
  method: z.literal('card'),
  number: z.string().trim().min(1).max(30),
  name: z.string().trim().min(1).max(60),
  expiry: z.string().trim().min(1).max(7),
  cvc: z.string().trim().min(1).max(4),
});

export const payBookingSchema = z.discriminatedUnion('method', [
  walletSchema,
  cardSchema,
]);

export type PayBookingDto = z.infer<typeof payBookingSchema>;

export interface VerifyDto {
  pnr: string;
  status: BookingStatus;
  valid: boolean;
  train: { number: number; nameEn: string; nameBn: string };
  from: StationDto;
  to: StationDto;
  date: string;
  departure: string;
  passenger: string;
  seats: {
    label: string;
    coach: string;
    seatClass: Exclude<SeatClass, 'shovan'>;
  }[];
}

export interface LimitDto {
  used: number;
  max: number;
  remaining: number;
  resetsOn: string;
}

export interface CheckoutDto {
  holds: HoldDto[];
  subtotal: number;
  serviceCharge: number;
  total: number;
}

export const cancelSchema = z.object({
  seatIds: z.array(z.string().min(1).max(64)).min(1).max(8),
});
export type CancelDto = z.infer<typeof cancelSchema>;

export const quoteSchema = z.object({
  seats: z
    .string()
    .min(1)
    .max(600)
    .transform((value) => value.split(',').filter(Boolean)),
});

export type BookingStatus =
  'confirmed' | 'partly_cancelled' | 'cancelled' | 'departed';

export interface RefundSeatDto {
  label: string;
  coach: string;
  seatClass: Exclude<SeatClass, 'shovan'>;
  fare: number;
  fee: number;
  refund: number;
}

export interface RefundDto {
  reference: string;
  paymentMethod: PaymentMethod;
  feePercent: number;
  fareTotal: number;
  fee: number;
  amount: number;
  createdAt: string;
  seats: RefundSeatDto[];
}

export interface QuoteDto {
  feePercent: number;
  fareTotal: number;
  fee: number;
  amount: number;
  paymentMethod: PaymentMethod;
  seats: (RefundSeatDto & { id: string })[];
}

export interface BookingDto {
  id: string;
  pnr: string;
  train: { number: number; nameEn: string; nameBn: string };
  from: StationDto;
  to: StationDto;
  date: string;
  departure: string;
  arrival: string;
  arrivalDayOffset: number;
  passenger: { name: string; phone: string };
  seats: {
    id: string;
    label: string;
    coach: string;
    seatClass: Exclude<SeatClass, 'shovan'>;
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
  refunds: RefundDto[];
}
