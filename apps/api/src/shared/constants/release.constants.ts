import type { SeatClass } from '../../generated/prisma/client.js';

export const RELEASE = {
  windowDays: 10,
  everyDays: 2,
  atMinute: 17 * 60,
  batches: {
    shovan: [30, 25, 20, 15, 10],
    schair: [30, 25, 20, 15, 10],
    snigdha: [20, 20, 20, 20, 20],
    acs: [20, 20, 20, 20, 20],
    ac: [20, 20, 20, 20, 20],
  } satisfies Record<SeatClass, number[]>,
} as const;
