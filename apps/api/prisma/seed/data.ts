import { readFileSync } from 'node:fs';
import { AC, isDayBoarding } from '../../src/shared/constants/ac.constants.js';

export type SeatClassKey = 'shovan' | 'schair' | 'snigdha' | 'ac' | 'acs';
export type CoachClassKey = 'schair' | 'snigdha' | 'ac';

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
  seatClass: CoachClassKey;
}

export interface TrainSeed {
  number: number;
  nameEn: string;
  nameBn: string;
  offDay: number | null;
  stops: StopSeed[];
}

const SOFAS_PER_AC_COACH = AC.cabins.reduce<number>((sum, n) => sum + n, 0);

export const COACH_LAYOUT: Record<
  CoachClassKey,
  { rows: number; seatsPerRow: number }
> = {
  schair: { rows: 15, seatsPerRow: 4 },
  snigdha: { rows: 13, seatsPerRow: 4 },
  ac: { rows: SOFAS_PER_AC_COACH, seatsPerRow: AC.seatsPerSofaByDay },
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
  ];
  coaches.push({ code: 'JA', seatClass: 'ac' });
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

export function toMinute(time: string | undefined): number | null {
  if (!time) return null;
  const [clock, nextDay] = time.split('+');
  const [hours, minutes] = clock.split(':').map(Number);
  return (nextDay ? Number(nextDay) * 1440 : 0) + hours * 60 + minutes;
}

export function quotasFor(
  train: TrainSeed,
  seats: number,
  only?: ReadonlySet<string>,
): Map<string, number> {
  const boarding = train.stops
    .slice(0, -1)
    .map((stop) => stop.station)
    .filter((code) => !only || only.has(code));
  if (boarding.length === 0) return new Map();
  const first = train.stops[0].station;
  const hasOrigin = boarding[0] === first;
  const rest = hasOrigin ? boarding.slice(1) : boarding;
  const origin = hasOrigin ? first : undefined;
  const weights = rest.map((code) =>
    QUOTA.majorStations.has(code) ? QUOTA.majorWeight : QUOTA.otherWeight,
  );
  const weightTotal = weights.reduce((sum, w) => sum + w, 0);
  const originSeats = !hasOrigin
    ? 0
    : rest.length === 0
      ? seats
      : Math.round(seats * QUOTA.originShare);
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

  const quotas = new Map<string, number>();
  if (origin) quotas.set(origin, originSeats);
  rest.forEach((code, index) => quotas.set(code, whole[index]));
  return quotas;
}

export interface QuotaSeed {
  station: string;
  seatClass: SeatClassKey;
  seats: number;
}

export function quotasForTrain(train: TrainSeed): QuotaSeed[] {
  const rows: QuotaSeed[] = [];
  const share = (
    seatClass: SeatClassKey,
    seats: number,
    only?: Set<string>,
  ) => {
    for (const [station, count] of quotasFor(train, seats, only)) {
      if (count > 0) rows.push({ station, seatClass, seats: count });
    }
  };

  const seatsOf = (seatClass: CoachClassKey) =>
    coachesFor(train)
      .filter((coach) => coach.seatClass === seatClass)
      .reduce(
        (sum, coach) =>
          sum +
          COACH_LAYOUT[seatClass].rows * COACH_LAYOUT[seatClass].seatsPerRow,
        0,
      );
  share('schair', seatsOf('schair'));
  share('snigdha', seatsOf('snigdha'));

  const sofas = seatsOf('ac') / AC.seatsPerSofaByDay;
  if (sofas > 0) {
    const day = new Set<string>();
    const night = new Set<string>();
    for (const stop of train.stops.slice(0, -1)) {
      const minute = toMinute(stop.depart ?? stop.arrive) ?? 0;
      (isDayBoarding(minute) ? day : night).add(stop.station);
    }
    share('acs', sofas * AC.seatsPerSofaByDay, day);
    share('ac', sofas * AC.berthsPerSofaByNight, night);
  }
  return rows;
}
