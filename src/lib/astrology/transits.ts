import type { Goal, ReadingContext, WesternWindow } from "@/lib/types/reading";
import { PLANETS, type PlanetName, computePlanetPositions } from "@/lib/astrology/planets";
import { addDays, addMonths, formatISODate, startOfDay } from "@/lib/astrology/time";
import { normalizeAngle, roundTo } from "@/lib/astrology/math";
import { resolveBirthInstant } from "@/lib/astrology/birth";

export type AspectType = "conjunction" | "sextile" | "square" | "trine" | "opposition";

export type TransitAspect = {
  planet: PlanetName;
  natalPlanet: PlanetName;
  aspect: AspectType;
  orb: number;
  exact: number;
  score: number;
  polarity: "positive" | "caution";
  goal: Goal;
  message: string;
  keywords: string[];
};

export type TransitDay = {
  date: string;
  score: number;
  positives: TransitAspect[];
  cautions: TransitAspect[];
  dominantGoal: Goal;
};

export type TransitMonth = {
  month: string;
  highlights: string[];
  cautions: string[];
  bestDays: string[];
  action: string;
  sources: string[];
};

export type TransitModel = {
  themes: string[];
  windows: WesternWindow[];
  days: TransitDay[];
  months: TransitMonth[];
};

const ASPECTS: Array<{ type: AspectType; angle: number; orb: number }> = [
  { type: "conjunction", angle: 0, orb: 8 },
  { type: "sextile", angle: 60, orb: 4 },
  { type: "square", angle: 90, orb: 5 },
  { type: "trine", angle: 120, orb: 5 },
  { type: "opposition", angle: 180, orb: 6 },
];

const PLANET_NATURE: Record<PlanetName, "benefic" | "neutral" | "malefic"> = {
  Sun: "benefic",
  Moon: "benefic",
  Mercury: "neutral",
  Venus: "benefic",
  Mars: "malefic",
  Jupiter: "benefic",
  Saturn: "malefic",
};

const PLANET_KEYWORDS: Record<PlanetName, { focus: string; keywords: string[]; positive: string[]; caution: string[] }> = {
  Sun: {
    focus: "visibility",
    keywords: ["leadership", "purpose", "confidence"],
    positive: ["Showcase work", "Lead with clarity"],
    caution: ["Guard vitality", "Avoid ego clashes"],
  },
  Moon: {
    focus: "emotional rhythm",
    keywords: ["intuition", "rest", "support"],
    positive: ["Nourish routines", "Share feelings with allies"],
    caution: ["Protect rest", "Name your needs before stress spikes"],
  },
  Mercury: {
    focus: "communication",
    keywords: ["messages", "learning", "planning"],
    positive: ["Pitch ideas", "Map the workflow"],
    caution: ["Check details twice", "Avoid scattered commitments"],
  },
  Venus: {
    focus: "alliances",
    keywords: ["relationships", "art", "pleasure"],
    positive: ["Strengthen partnerships", "Invest in aesthetic upgrades"],
    caution: ["Clarify expectations", "Balance giving and receiving"],
  },
  Mars: {
    focus: "drive",
    keywords: ["courage", "assertion", "stamina"],
    positive: ["Direct passion into momentum", "Train body and boundaries"],
    caution: ["Channel anger constructively", "Slow down before acting"],
  },
  Jupiter: {
    focus: "growth",
    keywords: ["expansion", "wisdom", "faith"],
    positive: ["Share your vision", "Open the learning pipeline"],
    caution: ["Avoid overpromising", "Check logistics before scaling"],
  },
  Saturn: {
    focus: "discipline",
    keywords: ["structure", "commitment", "boundaries"],
    positive: ["Solidify systems", "Own long-term responsibilities"],
    caution: ["Respect limits", "Release rigid perfectionism"],
  },
};

const GOAL_ALIGNMENT: Record<PlanetName, Goal[]> = {
  Sun: ["career", "creative"],
  Moon: ["health", "relationships"],
  Mercury: ["career", "study", "money"],
  Venus: ["relationships", "creative", "money"],
  Mars: ["career", "health", "move"],
  Jupiter: ["study", "career", "money"],
  Saturn: ["career", "money", "health"],
};

const GOAL_PHRASES: Record<Goal, { positive: string; caution: string }> = {
  career: {
    positive: "for your career momentum",
    caution: "around leadership visibility",
  },
  money: {
    positive: "for financial traction",
    caution: "with budgets and risk",
  },
  health: {
    positive: "for steady energy",
    caution: "with stress and recovery",
  },
  relationships: {
    positive: "for relationship warmth",
    caution: "in close partnerships",
  },
  move: {
    positive: "for relocation timing",
    caution: "while juggling transitions",
  },
  study: {
    positive: "for learning goals",
    caution: "around focus and pacing",
  },
  creative: {
    positive: "for creative output",
    caution: "with perfectionism and blocks",
  },
};

const ASPECT_VERBS: Record<AspectType, { positive: string; caution: string }> = {
  conjunction: { positive: "ignites", caution: "pressurises" },
  sextile: { positive: "opens", caution: "nudges" },
  square: { positive: "tests", caution: "agitates" },
  trine: { positive: "harmonises", caution: "coaxes" },
  opposition: { positive: "balances", caution: "polarises" },
};

function determineGoal(planet: PlanetName, goals: Goal[]): Goal {
  const aligned = GOAL_ALIGNMENT[planet].find((goal) => goals.includes(goal));
  return aligned ?? goals[0];
}

function computeAspectScore(
  planet: PlanetName,
  natalPlanet: PlanetName,
  aspect: AspectType,
  diff: number,
): { score: number; polarity: "positive" | "caution" } {
  const nature = PLANET_NATURE[planet];
  const natalNature = PLANET_NATURE[natalPlanet];
  const closeness = 1 - diff;

  const baseWeights: Record<AspectType, number> = {
    conjunction: 2,
    sextile: 2.8,
    square: -3.5,
    trine: 3.2,
    opposition: -3.0,
  };

  let score = baseWeights[aspect];

  if (aspect === "conjunction") {
    if (nature === "malefic" || natalNature === "malefic") {
      score = -3.2;
    } else {
      score = 3.0;
    }
  }

  if (score > 0) {
    if (nature === "malefic") score *= 0.75;
    if (nature === "benefic") score *= 1.1;
  } else {
    if (nature === "malefic") score *= 1.2;
    if (nature === "benefic") score *= 0.7;
  }

  score *= closeness;

  return { score, polarity: score >= 0 ? "positive" : "caution" };
}

function buildMessage(
  planet: PlanetName,
  natal: PlanetName,
  aspect: AspectType,
  polarity: "positive" | "caution",
  goal: Goal,
  daySeed: number,
): { text: string; keywords: string[] } {
  const planetNotes = PLANET_KEYWORDS[planet];
  const goalPhrase = GOAL_PHRASES[goal][polarity === "positive" ? "positive" : "caution"];
  const verb = ASPECT_VERBS[aspect][polarity];
  const pool = polarity === "positive" ? planetNotes.positive : planetNotes.caution;
  const phrase = pool[daySeed % pool.length];
  const text = `${planet} ${verb} natal ${natal} — ${phrase} ${goalPhrase}.`;
  return { text, keywords: planetNotes.keywords };
}

function determineOrb(
  planet: PlanetName,
  natal: PlanetName,
  aspect: AspectType,
): number {
  const base = ASPECTS.find((item) => item.type === aspect)?.orb ?? 4;
  let modifier = 0;
  if (planet === "Moon" || natal === "Moon") modifier += 2;
  if (planet === "Sun" || natal === "Sun") modifier += 1;
  if (aspect === "sextile") modifier -= 0.5;
  return Math.max(2, base + modifier);
}

export function scanTransits(context: ReadingContext): TransitModel {
  const birthDate = resolveBirthInstant(context);
  const natalPositions = computePlanetPositions(birthDate);

  const start = startOfDay(new Date(), context.timezone);
  const end = addMonths(start, context.horizonMonths);

  const days: TransitDay[] = [];
  const themeWeights = new Map<string, number>();
  const monthBuckets = new Map<string, { positives: TransitAspect[]; cautions: TransitAspect[]; scores: Array<{ date: string; score: number; goal: Goal }>; goalScores: Map<Goal, number> }>();

  let dayIndex = 0;

  for (let current = new Date(start); current <= end; current = addDays(current, 1), dayIndex += 1) {
    const dateKey = formatISODate(current);
    const transitPositions = computePlanetPositions(current);

    const dailyPositives: TransitAspect[] = [];
    const dailyCautions: TransitAspect[] = [];
    const goalScores = new Map<Goal, number>();

    for (const planet of PLANETS) {
      const goal = determineGoal(planet, context.goals);

      for (const natalPlanet of PLANETS) {
        const target = natalPositions[natalPlanet];
        const aspectDefinitions = ASPECTS;

        const delta = normalizeAngle(transitPositions[planet].longitude - target.longitude);

        for (const definition of aspectDefinitions) {
          const orb = determineOrb(planet, natalPlanet, definition.type);
          const separation = Math.abs(delta - definition.angle);
          const distance = Math.min(separation, 360 - separation);
          if (distance > orb) continue;
          const closeness = distance / orb;
          const { score, polarity } = computeAspectScore(planet, natalPlanet, definition.type, closeness);
          if (Math.abs(score) < 0.1) continue;

          const { text, keywords } = buildMessage(
            planet,
            natalPlanet,
            definition.type,
            polarity,
            goal,
            dayIndex + dailyPositives.length + dailyCautions.length,
          );

          const aspect: TransitAspect = {
            planet,
            natalPlanet,
            aspect: definition.type,
            orb,
            exact: roundTo(distance, 2),
            score,
            polarity,
            goal,
            message: text,
            keywords,
          };

          const list = polarity === "positive" ? dailyPositives : dailyCautions;
          list.push(aspect);

          const prior = goalScores.get(goal) ?? 0;
          goalScores.set(goal, prior + score);

          if (polarity === "positive") {
            for (const keyword of keywords) {
              const weight = themeWeights.get(keyword) ?? 0;
              themeWeights.set(keyword, weight + score);
            }
          }
        }
      }
    }

    dailyPositives.sort((a, b) => b.score - a.score);
    dailyCautions.sort((a, b) => a.score - b.score);

    const dominantGoal =
      [...goalScores.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? context.goals[0];

    const score = [...dailyPositives, ...dailyCautions].reduce((total, item) => total + item.score, 0);

    const dayEntry: TransitDay = {
      date: dateKey,
      score: roundTo(score, 2),
      positives: dailyPositives.slice(0, 4),
      cautions: dailyCautions.slice(0, 4),
      dominantGoal,
    };
    days.push(dayEntry);

    const monthKey = dateKey.slice(0, 7);
    if (!monthBuckets.has(monthKey)) {
      monthBuckets.set(monthKey, {
        positives: [],
        cautions: [],
        scores: [],
        goalScores: new Map<Goal, number>(),
      });
    }
    const bucket = monthBuckets.get(monthKey)!;
    bucket.positives.push(...dailyPositives);
    bucket.cautions.push(...dailyCautions);
    bucket.scores.push({ date: dateKey, score: dayEntry.score, goal: dominantGoal });

    const monthGoalScore = bucket.goalScores.get(dominantGoal) ?? 0;
    bucket.goalScores.set(dominantGoal, monthGoalScore + dayEntry.score);
  }

  const windows: WesternWindow[] = [];
  let activeWindow: { start: string; end: string; goals: Set<Goal>; notes: string[] } | undefined;

  for (const day of days) {
    if (day.score >= 2) {
      if (!activeWindow) {
        activeWindow = { start: day.date, end: day.date, goals: new Set([day.dominantGoal]), notes: [] };
      } else {
        activeWindow.end = day.date;
        activeWindow.goals.add(day.dominantGoal);
      }
      const message = day.positives[0]?.message;
      if (message) {
        activeWindow?.notes.push(message);
      }
    } else if (activeWindow) {
      const summary = activeWindow.notes[0] ?? "Momentum spike";
      windows.push({
        start: activeWindow.start,
        end: activeWindow.end,
        focus: Array.from(activeWindow.goals),
        summary,
      });
      activeWindow = undefined;
    }
  }
  if (activeWindow) {
    const summary = activeWindow.notes[0] ?? "Momentum spike";
    windows.push({
      start: activeWindow.start,
      end: activeWindow.end,
      focus: Array.from(activeWindow.goals),
      summary,
    });
  }

  const themes = [...themeWeights.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([keyword]) => keyword);

  const months: TransitMonth[] = [];
  for (const [month, bucket] of monthBuckets.entries()) {
    const highlights = bucket.positives
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map((item) => item.message);

    const cautions = bucket.cautions
      .sort((a, b) => a.score - b.score)
      .slice(0, 3)
      .map((item) => item.message);

    const bestDays = bucket.scores
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map((item) => item.date);

    const dominantGoal = [...bucket.goalScores.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? context.goals[0];
    const action = `Prioritise ${GOAL_PHRASES[dominantGoal].positive.replace("for ", "")} with consistent check-ins.`;

    months.push({
      month,
      highlights,
      cautions,
      bestDays,
      action,
      sources: ["western-transits"],
    });
  }

  months.sort((a, b) => (a.month < b.month ? -1 : 1));

  return {
    themes,
    windows,
    days,
    months,
  };
}
