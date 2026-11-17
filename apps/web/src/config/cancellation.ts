export const CANCEL_TIERS = [
  { hoursBefore: 48, feePercent: 10 },
  { hoursBefore: 24, feePercent: 25 },
  { hoursBefore: 6, feePercent: 50 },
] as const;
export const CANCEL_CLOSES_HOURS = 6;
