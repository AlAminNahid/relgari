import { readFileSync } from 'node:fs';

export type SeatClassKey = 'shovan' | 'schair' | 'snigdha' | 'ac';

export interface StationSeed {
  code: string;
  nameEn: string;
  nameBn: string;
}

export interface StopSeed {
  station: string;
  arrive?: string;
  depart?: string;
  km: number;
}

export interface CoachSeed {
  code: string;
  seatClass: SeatClassKey;
}

export interface TrainSeed {
  number: number;
  nameEn: string;
  nameBn: string;
  offDay: number | null;
  stops: StopSeed[];
}

export const COACH_LAYOUT: Record<
  SeatClassKey,
  { rows: number; seatsPerRow: number }
> = {
  shovan: { rows: 16, seatsPerRow: 5 },
  schair: { rows: 15, seatsPerRow: 4 },
  snigdha: { rows: 13, seatsPerRow: 4 },
  ac: { rows: 8, seatsPerRow: 4 },
};

const load = <T>(file: string): T =>
  JSON.parse(readFileSync(new URL(file, import.meta.url), 'utf8')) as T;

export const STATIONS = load<StationSeed[]>('./stations.json');
export const TRAINS = load<TrainSeed[]>('./trains.json');

export function coachesFor(train: TrainSeed): CoachSeed[] {
  const coaches: CoachSeed[] = [
    { code: 'KA', seatClass: 'snigdha' },
    { code: 'KHA', seatClass: 'snigdha' },
    { code: 'GA', seatClass: 'schair' },
    { code: 'GHA', seatClass: 'schair' },
    { code: 'UMA', seatClass: 'schair' },
    { code: 'CHA', seatClass: 'shovan' },
    { code: 'CHHA', seatClass: 'shovan' },
  ];
  const overnight = train.stops.some((stop) => stop.arrive?.includes('+'));
  if (overnight) coaches.push({ code: 'JA', seatClass: 'ac' });
  return coaches;
}

export const QUOTA = {
  originShare: 0.5,
  majorWeight: 3,
  otherWeight: 1,
  majorStations: new Set([
    'DAC',
    'BMR',
    'CGP',
    'RAJ',
    'KLN',
    'SYL',
    'CXB',
    'MYM',
    'CML',
    'RNP',
    'DNJ',
    'BGR',
    'JSR',
    'ISH',
    'SNT',
    'PRB',
    'BHA',
    'AKH',
    'LKS',
    'FNN',
    'JYD',
    'NTR',
    'TNG',
    'BRA',
    'SRM',
    'KSJ',
    'JMN',
    'PNC',
    'LLM',
    'SDP',
  ]),
} as const;

export function quotasFor(
  train: TrainSeed,
  seats: number,
): Map<string, number> {
  const boarding = train.stops.slice(0, -1).map((stop) => stop.station);
  const [origin, ...rest] = boarding;
  const weights = rest.map((code) =>
    QUOTA.majorStations.has(code) ? QUOTA.majorWeight : QUOTA.otherWeight,
  );
  const weightTotal = weights.reduce((sum, w) => sum + w, 0);
  const originSeats =
    rest.length === 0 ? seats : Math.round(seats * QUOTA.originShare);
  const left = seats - originSeats;

  const exact = weights.map((w) => (left * w) / weightTotal);
  const whole = exact.map(Math.floor);
  let spare = left - whole.reduce((sum, n) => sum + n, 0);
  const byLoss = exact
    .map((value, index) => ({ index, loss: value - whole[index] }))
    .sort((a, b) => b.loss - a.loss || a.index - b.index);
  for (const { index } of byLoss) {
    if (spare === 0) break;
    whole[index] += 1;
    spare -= 1;
  }

  const quotas = new Map<string, number>([[origin, originSeats]]);
  rest.forEach((code, index) => quotas.set(code, whole[index]));
  return quotas;
}
