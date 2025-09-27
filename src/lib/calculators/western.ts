import type { ReadingContext, WesternProfile } from "@/lib/types/reading";

export function generateWesternProfile(context: ReadingContext): WesternProfile {
  const baseThemes = [
    "Momentum builds around visibility",
    "Negotiations favor clarity",
    "Health routines benefit from consistency",
  ];

  const windows = [
    {
      start: `${context.birth.date.slice(0, 4)}-11-05`,
      end: `${context.birth.date.slice(0, 4)}-12-02`,
      focus: context.goals.slice(0, 2),
      summary: "Supportive transits highlight relationship allies and communication clarity.",
    },
    {
      start: `${context.birth.date.slice(0, 4)}-12-18`,
      end: `${context.birth.date.slice(0, 4)}-12-30`,
      focus: context.goals.slice(0, 1),
      summary: "Best days for focused outreach and sharing big news.",
    },
  ];

  return {
    themes: baseThemes,
    windows,
  };
}
