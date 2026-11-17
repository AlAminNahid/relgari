import type { SeatClass, SeatKind } from '../../generated/prisma/client.js';

export function soldClass(coachClass: SeatClass, kind: SeatKind): SeatClass {
  if (coachClass !== 'ac') return coachClass;
  return kind === 'berth' ? 'ac' : 'acs';
}

export function coachClassOf(sold: SeatClass): SeatClass {
  return sold === 'acs' ? 'ac' : sold;
}

export function kindOf(sold: SeatClass): SeatKind {
  return sold === 'ac' ? 'berth' : 'seat';
}

const LETTERS = 'ABCD';
export const sofaLetter = (index: number) =>
  LETTERS[index] ?? String(index + 1);
