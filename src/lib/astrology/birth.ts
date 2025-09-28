import type { ReadingContext } from "@/lib/types/reading";
import { createZonedDate } from "@/lib/astrology/time";

export function resolveBirthInstant(context: ReadingContext): Date {
  const [year, month, day] = context.birth.date.split("-").map(Number);
  let hour = 12;
  let minute = 0;

  if (context.birth.time && !context.birth.timeUnknown) {
    const [h, m] = context.birth.time.split(":").map(Number);
    hour = Number.isFinite(h) ? h : hour;
    minute = Number.isFinite(m) ? m : minute;
  }

  return createZonedDate(year, month, day, hour, minute, context.timezone);
}
