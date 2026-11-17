import { z } from 'zod';
import type { SeatClass } from '../../generated/prisma/client.js';
import { isDateString } from '../../shared/utils/bd-time.js';
import type { StationDto } from '../../stations/dto/station.dto.js';

const stationCode = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^[A-Z]{2,6}$/);

export const seatMapSchema = z.object({
  from: stationCode,
  to: stationCode,
  date: z.string().refine(isDateString),
  class: z.enum(['schair', 'snigdha', 'acs', 'ac']),
});

export const seatVersionSchema = z.object({
  from: stationCode,
  date: z.string().refine(isDateString),
});

export type SeatMapQuery = z.infer<typeof seatMapSchema>;

export type SeatState = 'free' | 'taken';

export interface SeatDto {
  id: string;
  number: number;
  label: string;
  state: SeatState;
  row: number | null;
  column: number | null;
  cabin: number | null;
  sofa: number | null;
  slot: number | null;
}

export interface CoachMapDto {
  code: string;
  rowCount: number;
  tableAfterRow: number | null;
  cabins: { number: number; sofas: number }[];
  seats: SeatDto[];
}

export interface SeatMapDto {
  train: { number: number; nameEn: string; nameBn: string };
  from: StationDto;
  to: StationDto;
  date: string;
  seatClass: Exclude<SeatClass, 'shovan'>;
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
  coaches: CoachMapDto[];
}
