export const CLEVELAND_TZ = 'America/New_York';

function part(
  date: Date,
  type: Intl.DateTimeFormatPartTypes,
  options: Intl.DateTimeFormatOptions,
): string {
  const found = new Intl.DateTimeFormat('en-US', {
    timeZone: CLEVELAND_TZ,
    ...options,
  })
    .formatToParts(date)
    .find((p) => p.type === type);
  return found?.value ?? '';
}

export function clevelandYmd(date = new Date()): { year: number; month: number; day: number } {
  return {
    year: Number(part(date, 'year', { year: 'numeric' })),
    month: Number(part(date, 'month', { month: '2-digit' })),
    day: Number(part(date, 'day', { day: '2-digit' })),
  };
}

/** Instant when America/New_York local time is Y-M-D HH:MM. */
export function clevelandLocalToDate(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
): Date {
  const guess = Date.UTC(year, month - 1, day, hour, minute, 0);
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone: CLEVELAND_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  });
  const parts = Object.fromEntries(
    fmt
      .formatToParts(new Date(guess))
      .filter((p) => p.type !== 'literal')
      .map((p) => [p.type, p.value]),
  );
  const asUtc = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour),
    Number(parts.minute),
    Number(parts.second),
  );
  return new Date(guess - (asUtc - guess));
}

export function parseHm(hm: string): { hour: number; minute: number } {
  const [hour, minute] = hm.split(':').map(Number);
  return { hour, minute };
}

export function blockRange(
  startHm: string,
  endHm: string,
  now = new Date(),
): { start: Date; end: Date } {
  const ymd = clevelandYmd(now);
  const start = parseHm(startHm);
  const end = parseHm(endHm);
  return {
    start: clevelandLocalToDate(ymd.year, ymd.month, ymd.day, start.hour, start.minute),
    end: clevelandLocalToDate(ymd.year, ymd.month, ymd.day, end.hour, end.minute),
  };
}

export type ClockParts = {
  time: string;
  seconds: string;
  weekday: string;
  month: string;
  day: string;
};

export function clevelandClock(date = new Date()): ClockParts {
  const time = new Intl.DateTimeFormat('en-US', {
    timeZone: CLEVELAND_TZ,
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date);
  return {
    time,
    seconds: part(date, 'second', { second: '2-digit' }),
    weekday: part(date, 'weekday', { weekday: 'short' }),
    month: part(date, 'month', { month: 'short' }),
    day: part(date, 'day', { day: 'numeric' }),
  };
}
