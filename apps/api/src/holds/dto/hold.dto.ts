import { z } from 'zod';
import type { SeatClass } from '../../generated/prisma/client.js';
import { isDateString } from '../../shared/utils/bd-time.js';
import type { StationDto } from '../../stations/dto/station.dto.js';

const stationCode = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^[A-Z]{2,6}$/);

export const createHoldSchema = z.object({
  train: z.number().int().positive(),
  from: stationCode,
  to: stationCode,
  date: z.string().refine(isDateString),
  seatId: z.string().min(1).max(64),
});

export type CreateHoldDto = z.infer<typeof createHoldSchema>;

export interface HoldDto {
  id: string;
  seatId: string;
  label: string;
  coach: string;
  seatClass: Exclude<SeatClass, 'shovan'>;
  fare: number;
  train: { number: number; nameEn: string; nameBn: string };
  from: StationDto;
  to: StationDto;
  date: string;
  expiresAt: string;
  secondsLeft: number;
}
