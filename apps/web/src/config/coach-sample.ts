import type { CoachMap, SeatInfo } from "@/types/api";

const run = (from: number, to: number): (number | null)[][] =>
  Array.from({ length: (to - from + 1) / 4 }, (_, i) =>
    [0, 1, 2, 3].map((place) => from + i * 4 + place),
  );

const ROWS: (number | null)[][] = [
  [1, null, null, null],
  [2, null, 3, 4],
  ...run(5, 32),
  ...run(33, 56),
  [57, 58, null, 59],
  [null, null, null, 60],
];
const TABLE_AFTER_ROW = 8;

const TAKEN = new Set([3, 4, 7, 9, 10, 14, 16, 19, 20, 27, 28, 31, 32, 35]);

export function sampleCoach(code = "GA"): CoachMap {
  const seats: SeatInfo[] = [];
  ROWS.forEach((cells, row) =>
    cells.forEach((number, column) => {
      if (number === null) return;
      seats.push({
        id: `sample-${number}`,
        number,
        label: `${code}-${number}`,
        state: TAKEN.has(number) ? "taken" : "free",
        row,
        column,
        cabin: null,
        sofa: null,
        slot: null,
      });
    }),
  );
  return {
    code,
    rowCount: ROWS.length,
    tableAfterRow: TABLE_AFTER_ROW,
    cabins: [],
    seats,
  };
}
