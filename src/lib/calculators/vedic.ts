import type { ReadingContext, VedicProfile } from "@/lib/types/reading";

export function generateVedicProfile(context: ReadingContext): VedicProfile {
  const period = "Mercury over Jupiter";
  const themes = [
    "Skill upgrades pay off",
    "Networks expand through learning",
  ];

  const monthlyTags = Array.from({ length: context.horizonMonths }, (_, index) => {
    const current = new Date();
    const monthDate = new Date(current.getFullYear(), current.getMonth() + index, 1);
    const monthKey = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, "0")}`;
    const focus = index % 2 === 0 ? "Opportunity" : "Integration";
    return {
      month: monthKey,
      focus,
      opportunity: focus === "Opportunity" ? "Collaborate with trusted peers" : undefined,
      caution: focus === "Integration" ? "Avoid over scheduling" : undefined,
    };
  });

  return {
    period,
    themes,
    monthlyTags,
  };
}
