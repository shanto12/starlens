import { roundTo } from "@/lib/astrology/math";

const MS_PER_DAY = 86_400_000;

export function julianDay(date: Date): number {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate() +
    (date.getUTCHours() + (date.getUTCMinutes() + date.getUTCSeconds() / 60) / 60) / 24;

  let y = year;
  let m = month;

  if (m <= 2) {
    y -= 1;
    m += 12;
  }

  const A = Math.floor(y / 100);
  const B = 2 - A + Math.floor(A / 4);

  const jd = Math.floor(365.25 * (y + 4716)) +
    Math.floor(30.6001 * (m + 1)) +
    day +
    B -
    1524.5;

  return jd;
}

export function centuriesSinceJ2000(date: Date): number {
  return (julianDay(date) - 2451545.0) / 36525;
}

export function daysSinceJ2000(date: Date): number {
  return (julianDay(date) - 2451545.0);
}

export function normalizeDateToZone(date: Date, timeZone?: string): Date {
  if (!timeZone) return new Date(date);

  const instant = new Date(date);
  const tzOffsetMinutes = getOffsetMinutes(instant, timeZone);
  const utc = instant.getTime() - tzOffsetMinutes * 60_000;
  return new Date(utc);
}

export function getOffsetMinutes(date: Date, timeZone: string): number {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const parts = dtf.formatToParts(date).reduce<Record<string, number>>((acc, part) => {
    if (part.type !== "literal") {
      acc[part.type] = Number(part.value);
    }
    return acc;
  }, {});

  const asUTC = Date.UTC(
    parts.year,
    (parts.month ?? 1) - 1,
    parts.day ?? 1,
    parts.hour ?? 0,
    parts.minute ?? 0,
    parts.second ?? 0,
  );

  return Math.round((asUTC - date.getTime()) / 60000);
}

export function createZonedDate(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  timeZone?: string,
): Date {
  const base = new Date(Date.UTC(year, month - 1, day, hour, minute));
  if (!timeZone) {
    return base;
  }

  let offset = getOffsetMinutes(base, timeZone);
  let adjusted = new Date(base.getTime() - offset * 60_000);

  // Refine once to account for DST transitions
  offset = getOffsetMinutes(adjusted, timeZone);
  adjusted = new Date(base.getTime() - offset * 60_000);
  return adjusted;
}

export function startOfDay(date: Date, timeZone?: string): Date {
  const zoned = normalizeDateToZone(date, timeZone);
  return new Date(Date.UTC(zoned.getUTCFullYear(), zoned.getUTCMonth(), zoned.getUTCDate()));
}

export function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * MS_PER_DAY);
}

export function addMonths(date: Date, months: number): Date {
  const copy = new Date(date);
  copy.setUTCMonth(copy.getUTCMonth() + months);
  return copy;
}

export function formatISODate(date: Date): string {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`;
}

export function computeAyanamsha(date: Date): number {
  // Lahiri ayanamsha approximation using linear drift from J2000 (23°51' at epoch)
  const days = daysSinceJ2000(date);
  const years = days / 365.25636;
  const base = 23 + 51 / 60 + 27 / 3600; // 23°51'27"
  const rate = 50.29 / 3600; // arcseconds per year converted to degrees
  return roundTo(base + rate * years, 6);
}

export function tropicalToSidereal(longitude: number, date: Date): number {
  const ayanamsha = computeAyanamsha(date);
  return (longitude - ayanamsha + 360) % 360;
}
