import type {
  Prisma,
  SeatClass,
  SeatKind,
} from '../../generated/prisma/client.js';

export interface TakenSeat {
  seatId: string;
  seatClass: SeatClass;
  fromStationId: string;
  coachId: string;
  sofa: number | null;
  kind: SeatKind;
  booked: boolean;
}

export async function takenOnRun(
  db: Pick<Prisma.TransactionClient, 'hold' | 'bookingSeat'>,
  trainId: string,
  runDate: Date,
  now: Date,
): Promise<TakenSeat[]> {
  const seatFields = { select: { coachId: true, sofa: true, kind: true } };
  const [holds, booked] = await Promise.all([
    db.hold.findMany({
      where: { trainId, runDate, expiresAt: { gt: now } },
      select: {
        seatId: true,
        seatClass: true,
        fromStationId: true,
        seat: seatFields,
      },
    }),
    db.bookingSeat.findMany({
      where: { trainId, runDate },
      select: {
        seatId: true,
        seatClass: true,
        fromStationId: true,
        seat: seatFields,
      },
    }),
  ]);
  const flat = (
    row: (typeof holds)[number] | (typeof booked)[number],
    isBooked: boolean,
  ): TakenSeat => ({
    seatId: row.seatId,
    seatClass: row.seatClass,
    fromStationId: row.fromStationId,
    coachId: row.seat.coachId,
    sofa: row.seat.sofa,
    kind: row.seat.kind,
    booked: isBooked,
  });
  return [
    ...holds.map((row) => flat(row, false)),
    ...booked.map((row) => flat(row, true)),
  ];
}
