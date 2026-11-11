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
