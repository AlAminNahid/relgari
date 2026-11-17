export interface CoachPlan {
  rows: (number | null)[][];
  tableAfterRow: number;
}

const run = (from: number, to: number): (number | null)[][] =>
  Array.from({ length: (to - from + 1) / 4 }, (_, i) =>
    [0, 1, 2, 3].map((place) => from + i * 4 + place),
  );

export const COACH_PLANS: Record<number, CoachPlan> = {
  60: {
    rows: [
      [1, null, null, null],
      [2, null, 3, 4],
      ...run(5, 32),
      ...run(33, 56),
      [57, 58, null, 59],
      [null, null, null, 60],
    ],
    tableAfterRow: 8,
  },
};

export function planFor(total: number): CoachPlan {
  const known = COACH_PLANS[total];
  if (known) return known;
  const rows: (number | null)[][] = [];
  for (let first = 1; first <= total; first += 4) {
    rows.push(
      [0, 1, 2, 3].map((place) =>
        first + place <= total ? first + place : null,
      ),
    );
  }
  return { rows, tableAfterRow: Math.max(0, Math.floor(rows.length / 2) - 1) };
}
