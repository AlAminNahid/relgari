const BD_OFFSET_MS = 6 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;
const MINUTE_MS = 60 * 1000;

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function isDateString(value: string): boolean {
  if (!DATE_PATTERN.test(value)) return false;
  const time = Date.parse(`${value}T00:00:00Z`);
  return !Number.isNaN(time) && new Date(time).toISOString().startsWith(value);
}

export function bdToday(now: Date): string {
  return new Date(now.getTime() + BD_OFFSET_MS).toISOString().slice(0, 10);
}

export function addDays(date: string, days: number): string {
  const time = Date.parse(`${date}T00:00:00Z`) + days * DAY_MS;
  return new Date(time).toISOString().slice(0, 10);
}

export function weekday(date: string): number {
  return new Date(`${date}T00:00:00Z`).getUTCDay();
}

export function bdMonthRange(now: Date): {
  start: Date;
  end: Date;
  resetsOn: string;
} {
  const today = bdToday(now);
  const [year, month] = today.split('-').map(Number);
  const nextYear = month === 12 ? year + 1 : year;
  const nextMonth = month === 12 ? 1 : month + 1;
  const pad = (n: number) => String(n).padStart(2, '0');
  const first = `${year}-${pad(month)}-01`;
  const resetsOn = `${nextYear}-${pad(nextMonth)}-01`;
  return { start: bdMoment(first, 0), end: bdMoment(resetsOn, 0), resetsOn };
}

export function bdMoment(date: string, minute: number): Date {
  return new Date(
    Date.parse(`${date}T00:00:00Z`) - BD_OFFSET_MS + minute * MINUTE_MS,
  );
}
