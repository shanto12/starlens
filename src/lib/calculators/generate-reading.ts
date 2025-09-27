import type { ReadingRequest } from "@/lib/schemas/reading";
import type { Goal, ReadingResult } from "@/lib/types/reading";
import { buildTimeline } from "@/lib/calculators/timeline";
import { generateWesternProfile } from "@/lib/calculators/western";
import { generateVedicProfile } from "@/lib/calculators/vedic";
import { generateBaZiProfile } from "@/lib/calculators/bazi";
import { generateNumerologyProfile } from "@/lib/calculators/numerology";
import { createSeed, pickFrom } from "@/lib/random";

const goalLabels: Record<Goal, string> = {
  career: "career",
  money: "money",
  health: "health",
  relationships: "relationships",
  move: "moves",
  study: "learning",
  creative: "creative work",
};

function computeConfidence(payload: ReadingRequest): "high" | "medium" | "low" {
  const hasTime = Boolean(payload.birth.time) && !payload.birth.timeUnknown;
  const hasNames = Boolean(payload.names?.birthName);

  if (hasTime && hasNames) return "high";
  if (hasTime || hasNames) return "medium";
  return "low";
}

function createDatePicks(payload: ReadingRequest) {
  if (!payload.options?.datePicks) return undefined;
  const rng = createSeed(`${payload.birth.date}-${payload.birth.city}`);
  return Array.from({ length: 5 }, (_, index) => {
    const baseMonth = index + 1;
    const goal = payload.goals[index % payload.goals.length];
    const date = `${new Date().getFullYear()}-${String(baseMonth).padStart(2, "0")}-0${(index % 3) + 7}`;
    return {
      date,
      goal,
      windowLocal: "09:00-11:00",
      score: Math.round(rng() * 20 + 70),
      rationale: `Moon supports ${goalLabels[goal] ?? goal}.`,
    };
  });
}

function createRelocationNotes(payload: ReadingRequest) {
  const cities = payload.options?.relocation;
  if (!cities || cities.length === 0) return undefined;
  return cities.map((city) => ({
    city,
    note: "Amplifies visibility. Balance rest and pace.",
  }));
}

function createHomeSnapshot(payload: ReadingRequest) {
  if (!payload.options?.home) return undefined;
  return {
    kua: 1,
    bestDirections: ["east", "southeast", "south", "north"],
    annualCaution: "Keep the northwest sector calm and clutter free.",
  };
}

function createDivination(payload: ReadingRequest) {
  const question = payload.options?.question;
  if (!question) return undefined;
  const rng = createSeed(question);
  const systems: Array<"tarot" | "iching"> = ["tarot", "iching"];
  const system = pickFrom(rng, systems);
  const summary =
    system === "tarot"
      ? "Three card spread points to embracing mentorship while releasing perfectionism."
      : "Hexagram 46 (Pushing Upward) advises steady progress with honest allies.";
  return { system, summary };
}

export function generateReading(payload: ReadingRequest): ReadingResult {
  const context = {
    birth: payload.birth,
    current: payload.current,
    names: payload.names,
    goals: payload.goals,
    horizonMonths: payload.horizonMonths,
    locale: payload.locale,
    timezone: payload.timezone,
  };

  const timeline = buildTimeline(context);
  const western = generateWesternProfile(context);
  const vedic = generateVedicProfile(context);
  const bazi = generateBaZiProfile(context);
  const numerology = generateNumerologyProfile(context);

  const optional = {
    datePicks: createDatePicks(payload),
    relocation: createRelocationNotes(payload),
    home: createHomeSnapshot(payload),
    divination: createDivination(payload),
  };

  return {
    meta: {
      horizonMonths: payload.horizonMonths,
      confidence: computeConfidence(payload),
      generatedAt: new Date().toISOString(),
    },
    profiles: {
      western,
      vedic,
      bazi,
      numerology,
      zodiac: {
        animal: "Wood Dragon",
        ally: "Rat",
        clash: "Dog",
        notes: [
          "Stay grounded during the spring eclipse window.",
          "Lean on water and metal allies when plans pivot.",
        ],
      },
    },
    months: timeline,
    optional,
    disclaimer:
      "Interpretive guidance only. Pair insights with your judgment and professional advice as needed.",
  } satisfies ReadingResult;
}

