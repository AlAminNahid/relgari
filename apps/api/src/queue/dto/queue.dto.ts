import { z } from 'zod';
import { isDateString } from '../../shared/utils/bd-time.js';

const stationCode = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^[A-Z]{2,6}$/);

export const queueSchema = z.object({
  train: z.number().int().positive(),
  from: stationCode,
  date: z.string().refine(isDateString),
  visitorId: z.string().regex(/^[A-Za-z0-9-]{8,64}$/),
});

export type QueueDto = z.infer<typeof queueSchema>;
