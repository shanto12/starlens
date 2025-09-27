import type { ReadingContext, TimelineEntry } from "@/lib/types/reading";

const highlightTemplates = [
  "Momentum builds around %s",
  "New allies appear in %s projects",
  "Health energy rises when you prioritize rest",
  "Finances benefit from consistent tracking",
];

const cautionTemplates = [
  "Guard boundaries around mid-month",
  "Confirm details before signing",
  "Watch energy dips after social bursts",
];

const actionTemplates = [
  "Schedule a strategy day",
  "Reach out to a mentor",
  "Refresh your budget tracker",
  "Book a wellness check",
];

function fill(template: string, goal: string) {
  return template.replace("%s", goal);
}

export function buildTimeline(context: ReadingContext): TimelineEntry[] {
  const reference = new Date();
  const goals = context.goals.length > 0 ? context.goals : ["career"];

  return Array.from({ length: context.horizonMonths }, (_, index) => {
    const monthDate = new Date(reference.getFullYear(), reference.getMonth() + index, 1);
    const monthKey = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, "0")}`;
    const dominantGoal = goals[index % goals.length];

    const highlights = highlightTemplates.slice(0, 3).map((template) => fill(template, dominantGoal));
    const cautions = cautionTemplates.slice(0, 2);
    const bestDays = [7, 14, 21]
      .slice(0, 2)
      .map((day) => `${monthKey}-${String(day).padStart(2, "0")}`);
    const action = actionTemplates[index % actionTemplates.length];

    return {
      month: monthKey,
      highlights,
      cautions,
      bestDays,
      action,
      sources: ["western", "vedic", "bazi", "numerology"],
    } satisfies TimelineEntry;
  });
}
