import type { Goal, ReadingContext, VedicMonthlyTag, VedicProfile } from "@/lib/types/reading";
import { computePlanetPositions } from "@/lib/astrology/planets";
import { tropicalToSidereal, addMonths, startOfDay, formatISODate } from "@/lib/astrology/time";
import { resolveBirthInstant } from "@/lib/astrology/birth";

const MS_PER_DAY = 86_400_000;
const NAKSHATRA_SPAN = 360 / 27;

const NAKSHATRAS = [
  { name: "Ashwini", ruler: "Ketu" },
  { name: "Bharani", ruler: "Venus" },
  { name: "Krittika", ruler: "Sun" },
  { name: "Rohini", ruler: "Moon" },
  { name: "Mrigashira", ruler: "Mars" },
  { name: "Ardra", ruler: "Rahu" },
  { name: "Punarvasu", ruler: "Jupiter" },
  { name: "Pushya", ruler: "Saturn" },
  { name: "Ashlesha", ruler: "Mercury" },
  { name: "Magha", ruler: "Ketu" },
  { name: "Purva Phalguni", ruler: "Venus" },
  { name: "Uttara Phalguni", ruler: "Sun" },
  { name: "Hasta", ruler: "Moon" },
  { name: "Chitra", ruler: "Mars" },
  { name: "Swati", ruler: "Rahu" },
  { name: "Vishakha", ruler: "Jupiter" },
  { name: "Anuradha", ruler: "Saturn" },
  { name: "Jyeshtha", ruler: "Mercury" },
  { name: "Mula", ruler: "Ketu" },
  { name: "Purva Ashadha", ruler: "Venus" },
  { name: "Uttara Ashadha", ruler: "Sun" },
  { name: "Shravana", ruler: "Moon" },
  { name: "Dhanishta", ruler: "Mars" },
  { name: "Shatabhisha", ruler: "Rahu" },
  { name: "Purva Bhadrapada", ruler: "Jupiter" },
  { name: "Uttara Bhadrapada", ruler: "Saturn" },
  { name: "Revati", ruler: "Mercury" },
] as const;

const DASHA_SEQUENCE = [
  "Ketu",
  "Venus",
  "Sun",
  "Moon",
  "Mars",
  "Rahu",
  "Jupiter",
  "Saturn",
  "Mercury",
] as const;

export type DashaPlanet = (typeof DASHA_SEQUENCE)[number];

const DASHA_YEARS: Record<DashaPlanet, number> = {
  Ketu: 7,
  Venus: 20,
  Sun: 6,
  Moon: 10,
  Mars: 7,
  Rahu: 18,
  Jupiter: 16,
  Saturn: 19,
  Mercury: 17,
};

const DASHA_GUIDANCE: Record<
  DashaPlanet,
  { themes: string[]; focus: string; opportunity: string; caution: string; goals: Goal[] }
> = {
  Ketu: {
    themes: ["Decluttering attachments", "Integrating spiritual reset"],
    focus: "Streamline commitments",
    opportunity: "Release what drains energy",
    caution: "Stay grounded as plans pivot",
    goals: ["health", "study", "move"],
  },
  Venus: {
    themes: ["Strengthening partnerships", "Celebrating creative magnetism"],
    focus: "Cultivate alliances",
    opportunity: "Invest in supportive relationships",
    caution: "Balance pleasure with budgets",
    goals: ["relationships", "creative", "money"],
  },
  Sun: {
    themes: ["Owning leadership", "Clarifying visibility"],
    focus: "Lead with integrity",
    opportunity: "Showcase expertise to key allies",
    caution: "Avoid ego-based conflicts",
    goals: ["career", "creative"],
  },
  Moon: {
    themes: ["Nurturing emotional resilience", "Centering community care"],
    focus: "Protect inner rhythms",
    opportunity: "Lean into trusted support circles",
    caution: "Watch mood-driven decisions",
    goals: ["relationships", "health"],
  },
  Mars: {
    themes: ["Mobilising courage", "Executing decisive action"],
    focus: "Channel drive productively",
    opportunity: "Advance bold moves with preparation",
    caution: "Avoid reactive confrontations",
    goals: ["career", "move", "health"],
  },
  Rahu: {
    themes: ["Innovating strategy", "Scaling unconventional paths"],
    focus: "Experiment with visibility",
    opportunity: "Expand reach through modern platforms",
    caution: "Verify motives and fine print",
    goals: ["career", "money", "study"],
  },
  Jupiter: {
    themes: ["Broadening wisdom", "Mentoring and teaching"],
    focus: "Invest in growth",
    opportunity: "Share knowledge generously",
    caution: "Anchor enthusiasm in logistics",
    goals: ["study", "career", "money"],
  },
  Saturn: {
    themes: ["Fortifying structures", "Committing to mastery"],
    focus: "Refine systems",
    opportunity: "Build sustainable momentum",
    caution: "Respect physical limits",
    goals: ["career", "money", "health"],
  },
  Mercury: {
    themes: ["Synthesising skills", "Optimising workflows"],
    focus: "Document and communicate",
    opportunity: "Launch thoughtful messaging",
    caution: "Avoid scattered multitasking",
    goals: ["study", "career", "money"],
  },
};

type DashaPeriod = { planet: DashaPlanet; start: Date; end: Date };

function yearsToMs(years: number): number {
  return years * 365.25 * MS_PER_DAY;
}

function computeNakshatra(longitude: number) {
  const index = Math.floor(longitude / NAKSHATRA_SPAN) % NAKSHATRAS.length;
  const info = NAKSHATRAS[index];
  const within = longitude - index * NAKSHATRA_SPAN;
  const fraction = within / NAKSHATRA_SPAN;
  return { ...info, index, fraction, within };
}

function buildMahadashaTimeline(
  startPlanet: DashaPlanet,
  fractionConsumed: number,
  birthInstant: Date,
  horizonMonths: number,
): DashaPeriod[] {
  const startIndex = DASHA_SEQUENCE.indexOf(startPlanet);
  const initialDuration = yearsToMs(DASHA_YEARS[startPlanet]);
  const consumedMs = initialDuration * fractionConsumed;
  let cursor = new Date(birthInstant.getTime() - consumedMs);

  const now = new Date();
  const coverageEnd = addMonths(startOfDay(now), horizonMonths + 48);

  const timeline: DashaPeriod[] = [];
  for (let offset = 0; offset < DASHA_SEQUENCE.length * 6; offset += 1) {
    const planet = DASHA_SEQUENCE[(startIndex + offset) % DASHA_SEQUENCE.length];
    const durationMs = yearsToMs(DASHA_YEARS[planet]);
    const end = new Date(cursor.getTime() + durationMs);
    timeline.push({ planet, start: cursor, end });
    cursor = end;
    if (cursor > coverageEnd) break;
  }
  return timeline;
}

function findPeriod(timeline: DashaPeriod[], date: Date): DashaPeriod | undefined {
  return timeline.find((period) => date >= period.start && date < period.end);
}

function buildAntardashaTimeline(mahadasha: DashaPeriod): DashaPeriod[] {
  const startIndex = DASHA_SEQUENCE.indexOf(mahadasha.planet);
  const totalYears = DASHA_YEARS[mahadasha.planet];
  let cursor = new Date(mahadasha.start);
  const timeline: DashaPeriod[] = [];

  for (let offset = 0; offset < DASHA_SEQUENCE.length; offset += 1) {
    const planet = DASHA_SEQUENCE[(startIndex + offset) % DASHA_SEQUENCE.length];
    const subYears = (totalYears * DASHA_YEARS[planet]) / 120;
    const durationMs = yearsToMs(subYears);
    let end = new Date(cursor.getTime() + durationMs);
    if (end > mahadasha.end || offset === DASHA_SEQUENCE.length - 1) {
      end = mahadasha.end;
    }
    timeline.push({ planet, start: cursor, end });
    cursor = end;
    if (cursor >= mahadasha.end) break;
  }

  return timeline;
}

function selectGoal(planet: DashaPlanet, goals: Goal[]): Goal {
  const preferences = DASHA_GUIDANCE[planet].goals;
  const match = preferences.find((goal) => goals.includes(goal));
  return match ?? goals[0];
}

export function generateVedicProfile(context: ReadingContext): VedicProfile {
  const birthInstant = resolveBirthInstant(context);
  const positions = computePlanetPositions(birthInstant);
  const moonSidereal = tropicalToSidereal(positions.Moon.longitude, birthInstant);
  const nakshatraInfo = computeNakshatra(moonSidereal);
  const ruler = nakshatraInfo.ruler as DashaPlanet;

  const mahadashaTimeline = buildMahadashaTimeline(
    ruler,
    nakshatraInfo.fraction,
    birthInstant,
    context.horizonMonths,
  );
  const now = new Date();
  const currentMahadasha = findPeriod(mahadashaTimeline, now) ?? mahadashaTimeline[0];
  const antardashaTimeline = buildAntardashaTimeline(currentMahadasha);
  const currentAntardasha = findPeriod(antardashaTimeline, now) ?? antardashaTimeline[0];

  const mahadashaGuidance = DASHA_GUIDANCE[currentMahadasha.planet];
  const antardashaGuidance = DASHA_GUIDANCE[currentAntardasha.planet];

  const period = `${currentMahadasha.planet} mahadasha • ${currentAntardasha.planet} antardasha until ${formatISODate(currentAntardasha.end)}`;
  const themes = [...new Set([...mahadashaGuidance.themes, ...antardashaGuidance.themes])];

  const monthlyTags: VedicMonthlyTag[] = [];
  const baseStart = startOfDay(new Date(), context.timezone);

  for (let index = 0; index < context.horizonMonths; index += 1) {
    const monthDate = addMonths(baseStart, index);
    const monthKey = monthDate.toISOString().slice(0, 7);
    const antar =
      findPeriod(antardashaTimeline, monthDate) ?? antardashaTimeline[antardashaTimeline.length - 1];
    const guidance = DASHA_GUIDANCE[antar.planet];
    const focusGoal = selectGoal(antar.planet, context.goals);

    monthlyTags.push({
      month: monthKey,
      focus: `${guidance.focus} for ${focusGoal}`,
      opportunity: guidance.opportunity,
      caution: guidance.caution,
    });
  }

  return {
    period,
    themes,
    monthlyTags,
  };
}
