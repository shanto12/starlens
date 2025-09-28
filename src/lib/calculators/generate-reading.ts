import type { ReadingRequest } from "@/lib/schemas/reading";
import type {
  BaZiProfile,
  NumerologyProfile,
  ReadingResult,
} from "@/lib/types/reading";
import { buildTimeline } from "@/lib/calculators/timeline";
import { generateWesternProfile } from "@/lib/calculators/western";
import { generateVedicProfile } from "@/lib/calculators/vedic";
import { generateBaZiProfile } from "@/lib/calculators/bazi";
import { generateNumerologyProfile } from "@/lib/calculators/numerology";
import { createSeed, pickFrom } from "@/lib/random";
import type { TransitModel } from "@/lib/astrology/transits";

const PLANET_WINDOWS: Record<string, string> = {
  Sun: "10:00-14:00",
  Moon: "19:00-21:00",
  Mercury: "09:00-11:00",
  Venus: "14:00-18:00",
  Mars: "07:00-09:00",
  Jupiter: "13:00-16:00",
  Saturn: "06:00-08:00",
};

function computeConfidence(payload: ReadingRequest): "high" | "medium" | "low" {
  const hasTime = Boolean(payload.birth.time) && !payload.birth.timeUnknown;
  const hasNames = Boolean(payload.names?.birthName);

  if (hasTime && hasNames) return "high";
  if (hasTime || hasNames) return "medium";
  return "low";
}

const MASTER_NUMBERS = new Set([11, 22, 33]);

function reduceDigits(value: number): number {
  let current = value;
  while (current > 9 && !MASTER_NUMBERS.has(current)) {
    current = current
      .toString()
      .split("")
      .reduce((sum, digit) => sum + Number(digit), 0);
  }
  return current;
}

function createDatePicks(
  payload: ReadingRequest,
  transits: TransitModel,
  numerology: NumerologyProfile,
) {
  if (!payload.options?.datePicks) return undefined;
  const candidates = transits.days
    .filter((day) => day.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 7);

  const picks = candidates.map((day) => {
    const [, monthString, dayString] = day.date.split("-");
    const personalDay = reduceDigits(
      (numerology.personalYear ?? 0) + Number(monthString) + Number(dayString),
    );
    const numerologyBoost = personalDay === numerology.personalYear ? 6 : personalDay % 3 === 0 ? 4 : 2;
    const baseScore = Math.min(99, Math.max(60, Math.round(70 + day.score * 6 + numerologyBoost)));
    const focusPlanet = day.positives[0]?.planet ?? "Sun";
    const windowLocal = PLANET_WINDOWS[focusPlanet] ?? "10:00-14:00";

    return {
      date: day.date,
      goal: day.dominantGoal,
      windowLocal,
      score: baseScore,
      rationale: `${day.positives[0]?.message ?? "Transit tailwind"} Personal day ${personalDay} aligns with your year ${numerology.personalYear}.`,
    };
  });

  return picks.slice(0, 5);
}

function createRelocationNotes(payload: ReadingRequest, bazi: BaZiProfile) {
  const cities = payload.options?.relocation;
  if (!cities || cities.length === 0) return undefined;
  const elementFocus = bazi.usefulElements?.[0] ?? "Earth";
  const elementNotes: Record<string, string> = {
    Wood: "Choose leafy neighbourhoods or coworking spaces with natural light.",
    Fire: "Opt for vibrant districts that keep inspiration high.",
    Earth: "Stabilise in grounded communities with reliable infrastructure.",
    Metal: "Look for organised hubs with strong systems and mentors.",
    Water: "Favour waterfront or fluid, collaborative environments.",
  };

  return cities.map((city) => ({
    city,
    note: `${elementNotes[elementFocus] ?? "Prioritise balanced qi."} Align the move with ${payload.goals[0]} intentions.`,
  }));
}

const ELEMENT_DIRECTIONS: Record<string, string[]> = {
  Wood: ["east", "southeast"],
  Fire: ["south", "southwest"],
  Earth: ["northeast", "southwest"],
  Metal: ["west", "northwest"],
  Water: ["north", "northwest"],
};

function createHomeSnapshot(
  payload: ReadingRequest,
  bazi: BaZiProfile,
  numerology: NumerologyProfile,
) {
  if (!payload.options?.home) return undefined;
  const birthYear = Number(payload.birth.date.slice(0, 4));
  let kua = reduceDigits(birthYear);
  if (kua === 5) kua = 8;

  const primaryElement = bazi.usefulElements?.[0] ?? "Wood";
  const directions = ELEMENT_DIRECTIONS[primaryElement] ?? ["east", "southeast"];
  const cautionElement = bazi.cautionElements?.[0] ?? "Metal";

  return {
    kua,
    bestDirections: directions,
    annualCaution: `Keep the ${cautionElement.toLowerCase()} sector restful while you navigate Personal Year ${numerology.personalYear}.`,
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

  const westernCalculation = generateWesternProfile(context);
  const vedic = generateVedicProfile(context);
  const baziCalculation = generateBaZiProfile(context);
  const numerology = generateNumerologyProfile(context);
  const timeline = buildTimeline(context, {
    transits: westernCalculation.transits,
    vedic,
    numerology,
    bazi: baziCalculation.profile,
  });

  const optional = {
    datePicks: createDatePicks(payload, westernCalculation.transits, numerology),
    relocation: createRelocationNotes(payload, baziCalculation.profile),
    home: createHomeSnapshot(payload, baziCalculation.profile, numerology),
    divination: createDivination(payload),
  };

  return {
    meta: {
      horizonMonths: payload.horizonMonths,
      confidence: computeConfidence(payload),
      generatedAt: new Date().toISOString(),
    },
    profiles: {
      western: westernCalculation.profile,
      vedic,
      bazi: baziCalculation.profile,
      numerology,
      zodiac: baziCalculation.zodiac,
    },
    months: timeline,
    optional,
    disclaimer:
      "Interpretive guidance only. Pair insights with your judgment and professional advice as needed.",
  } satisfies ReadingResult;
}

