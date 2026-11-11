import type { Prisma } from '../../generated/prisma/client.js';

export const trainDetailInclude = {
  stops: { orderBy: { sequence: 'asc' }, include: { station: true } },
  coaches: { orderBy: { position: 'asc' } },
} satisfies Prisma.TrainInclude;

export type TrainDetail = Prisma.TrainGetPayload<{
  include: typeof trainDetailInclude;
}>;
