import type { ReadingContext, BaZiProfile } from "@/lib/types/reading";

const usefulElementMap: Record<string, string[]> = {
  career: ["Water", "Metal"],
  money: ["Earth", "Metal"],
  health: ["Wood", "Water"],
  relationships: ["Fire", "Wood"],
  move: ["Earth", "Fire"],
  study: ["Water", "Wood"],
  creative: ["Fire", "Wood"],
};

export function generateBaZiProfile(context: ReadingContext): BaZiProfile {
  const primaryGoal = context.goals[0] ?? "career";
  const usefulElements = usefulElementMap[primaryGoal];

  return {
    dayMaster: "Yang Wood",
    usefulElements,
    cautionElements: ["Earth"],
    luckPillar: "2023-2032",
    themes: [
      "Strengthen alliances with patient collaboration",
      "Track energy dips around seasonal transitions",
    ],
  };
}
