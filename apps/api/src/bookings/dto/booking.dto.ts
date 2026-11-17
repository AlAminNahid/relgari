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

export interface CheckoutDto {
  holds: HoldDto[];
  subtotal: number;
  serviceCharge: number;
  total: number;
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
}
