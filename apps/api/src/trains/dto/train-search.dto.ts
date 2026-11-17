import { z } from 'zod';
import type { SeatClass } from '../../generated/prisma/client.js';
import { isDateString } from '../../shared/utils/bd-time.js';
import type { StationDto } from '../../stations/dto/station.dto.js';

const stationCode = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^[A-Z]{2,6}$/);

export const trainSearchSchema = z
  .object({
    from: stationCode,
    to: stationCode,
    date: z.string().refine(isDateString),
  })
  .refine((query) => query.from !== query.to);

export type TrainSearchQuery = z.infer<typeof trainSearchSchema>;

export interface ClassAvailabilityDto {
  seatClass: SeatClass;
  fare: number;
  quota: number;
  released: number;
  available: number;
  nextReleaseAt: string | null;
  nextReleaseSeats: number;
}

export interface TrainResultDto {
  number: number;
  nameEn: string;
  nameBn: string;
  departure: string;
  arrival: string;
  arrivalDayOffset: number;
  durationMinutes: number;
  departed: boolean;
  classes: ClassAvailabilityDto[];
}

export interface TrainSearchDto {
  from: StationDto;
  to: StationDto;
  date: string;
  routeExists: boolean;
  trains: TrainResultDto[];
}

export const departureBoardSchema = z.object({
  station: stationCode,
  limit: z.coerce.number().int().min(1).max(12).default(6),
});

export type DepartureBoardQuery = z.infer<typeof departureBoardSchema>;

export interface BoardRowDto {
  number: number;
  nameEn: string;
  nameBn: string;
  to: StationDto;
  date: string;
  departure: string;
  arrival: string;
  arrivalDayOffset: number;
  classes: {
    seatClass: SeatClass;
    quota: number;
    released: number;
    available: number;
    nextReleaseAt: string | null;
  }[];
}

export interface DepartureBoardDto {
  station: StationDto;
  rows: BoardRowDto[];
}
