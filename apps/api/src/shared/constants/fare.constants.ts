import type { SeatClass } from '../../generated/prisma/client.js';

export const FARE = {
  ratePerKm: {
    shovan: 1.25,
    schair: 1.5,
    snigdha: 2.9,
    ac: 4.9,
  } satisfies Record<SeatClass, number>,
  roundTo: 5,
  minimum: 50,
} as const;
