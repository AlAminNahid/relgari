export const AC = {
  seatsPerSofaByDay: 3,
  berthsPerSofaByNight: 2,
  dayStartsAt: 6 * 60,
  dayEndsAt: 18 * 60,
  cabins: [2, 2, 1, 1, 1, 2, 2],
} as const;

export function isDayBoarding(minute: number): boolean {
  const inDay = minute % 1440;
  return inDay >= AC.dayStartsAt && inDay < AC.dayEndsAt;
}
