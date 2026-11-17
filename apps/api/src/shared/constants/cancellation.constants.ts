export const CANCELLATION = {
  tiers: [
    { hoursBefore: 48, feePercent: 10 },
    { hoursBefore: 24, feePercent: 25 },
    { hoursBefore: 6, feePercent: 50 },
  ],
  closesHoursBefore: 6,
} as const;

export function feePercentFor(hoursLeft: number): number | null {
  if (hoursLeft < CANCELLATION.closesHoursBefore) return null;
  const tier = CANCELLATION.tiers.find((t) => hoursLeft >= t.hoursBefore);
  return tier ? tier.feePercent : CANCELLATION.tiers.at(-1)!.feePercent;
}
