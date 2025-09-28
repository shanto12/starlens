import type { BaZiProfile, ReadingContext, ZodiacProfile } from "@/lib/types/reading";
import { julianDay, addMonths, startOfDay, createZonedDate } from "@/lib/astrology/time";
import { resolveBirthInstant } from "@/lib/astrology/birth";

const MS_PER_DAY = 86_400_000;

const HEAVENLY_STEMS = [
  { name: "Jia", element: "Wood", yinYang: "Yang" },
  { name: "Yi", element: "Wood", yinYang: "Yin" },
  { name: "Bing", element: "Fire", yinYang: "Yang" },
  { name: "Ding", element: "Fire", yinYang: "Yin" },
  { name: "Wu", element: "Earth", yinYang: "Yang" },
  { name: "Ji", element: "Earth", yinYang: "Yin" },
  { name: "Geng", element: "Metal", yinYang: "Yang" },
  { name: "Xin", element: "Metal", yinYang: "Yin" },
  { name: "Ren", element: "Water", yinYang: "Yang" },
  { name: "Gui", element: "Water", yinYang: "Yin" },
] as const;

const EARTHLY_BRANCHES = [
  { name: "Zi", animal: "Rat", element: "Water", yinYang: "Yang" },
  { name: "Chou", animal: "Ox", element: "Earth", yinYang: "Yin" },
  { name: "Yin", animal: "Tiger", element: "Wood", yinYang: "Yang" },
  { name: "Mao", animal: "Rabbit", element: "Wood", yinYang: "Yin" },
  { name: "Chen", animal: "Dragon", element: "Earth", yinYang: "Yang" },
  { name: "Si", animal: "Snake", element: "Fire", yinYang: "Yin" },
  { name: "Wu", animal: "Horse", element: "Fire", yinYang: "Yang" },
  { name: "Wei", animal: "Goat", element: "Earth", yinYang: "Yin" },
  { name: "Shen", animal: "Monkey", element: "Metal", yinYang: "Yang" },
  { name: "You", animal: "Rooster", element: "Metal", yinYang: "Yin" },
  { name: "Xu", animal: "Dog", element: "Earth", yinYang: "Yang" },
  { name: "Hai", animal: "Pig", element: "Water", yinYang: "Yin" },
] as const;

const SOLAR_BOUNDARIES = [
  { month: 1, day: 6, branch: 1 },
  { month: 2, day: 4, branch: 2 },
  { month: 3, day: 6, branch: 3 },
  { month: 4, day: 5, branch: 4 },
  { month: 5, day: 6, branch: 5 },
  { month: 6, day: 6, branch: 6 },
  { month: 7, day: 7, branch: 7 },
  { month: 8, day: 8, branch: 8 },
  { month: 9, day: 8, branch: 9 },
  { month: 10, day: 8, branch: 10 },
  { month: 11, day: 7, branch: 11 },
  { month: 12, day: 7, branch: 0 },
] as const;

const ALLY_MAP: Record<string, string> = {
  Rat: "Ox",
  Ox: "Rat",
  Tiger: "Pig",
  Rabbit: "Dog",
  Dragon: "Rooster",
  Snake: "Monkey",
  Horse: "Goat",
  Goat: "Horse",
  Monkey: "Snake",
  Rooster: "Dragon",
  Dog: "Rabbit",
  Pig: "Tiger",
};

const CLASH_MAP: Record<string, string> = {
  Rat: "Horse",
  Ox: "Goat",
  Tiger: "Monkey",
  Rabbit: "Rooster",
  Dragon: "Dog",
  Snake: "Pig",
  Horse: "Rat",
  Goat: "Ox",
  Monkey: "Tiger",
  Rooster: "Rabbit",
  Dog: "Dragon",
  Pig: "Snake",
};

const FIVE_ELEMENT_SUPPORT = {
  Wood: { resource: "Water", output: "Fire", control: "Earth", controlledBy: "Metal" },
  Fire: { resource: "Wood", output: "Earth", control: "Metal", controlledBy: "Water" },
  Earth: { resource: "Fire", output: "Metal", control: "Water", controlledBy: "Wood" },
  Metal: { resource: "Earth", output: "Water", control: "Wood", controlledBy: "Fire" },
  Water: { resource: "Metal", output: "Wood", control: "Fire", controlledBy: "Earth" },
} as const;

function positiveModulo(value: number, base: number): number {
  let result = value % base;
  if (result < 0) result += base;
  return result;
}

function determineMonthBranch(month: number, day: number): number {
  let branch = 0;
  for (const boundary of SOLAR_BOUNDARIES) {
    if (month > boundary.month || (month === boundary.month && day >= boundary.day)) {
      branch = boundary.branch;
    }
  }
  return branch;
}

function computeNextSolarTerm(birthInstant: Date, year: number, timeZone?: string): Date {
  let nextTerm = addMonths(startOfDay(birthInstant, timeZone), 1);
  let smallestDiff = Number.POSITIVE_INFINITY;
  for (const boundary of SOLAR_BOUNDARIES) {
    const candidate = createZonedDate(year, boundary.month, boundary.day, 0, 0, timeZone);
    let diff = candidate.getTime() - birthInstant.getTime();
    if (diff <= 0) {
      const nextYearCandidate = createZonedDate(year + 1, boundary.month, boundary.day, 0, 0, timeZone);
      diff = nextYearCandidate.getTime() - birthInstant.getTime();
    }
    if (diff < smallestDiff) {
      smallestDiff = diff;
      nextTerm = new Date(birthInstant.getTime() + diff);
    }
  }
  return nextTerm;
}

export type BaZiCalculation = {
  profile: BaZiProfile;
  zodiac: ZodiacProfile;
};

export function generateBaZiProfile(context: ReadingContext): BaZiCalculation {
  const birthInstant = resolveBirthInstant(context);
  const [year, month, day] = context.birth.date.split("-").map(Number);
  const parsedTime = context.birth.time?.split(":").map(Number) ?? [];
  const hour = context.birth.timeUnknown ? 12 : parsedTime[0] ?? 12;

  let solarYear = year;
  if (month < 2 || (month === 2 && day < 4)) {
    solarYear -= 1;
  }

  const yearCycle = positiveModulo(solarYear - 1984, 60);
  const yearStemIndex = positiveModulo(yearCycle, 10);
  const yearBranchIndex = positiveModulo(yearCycle, 12);

  const monthBranchIndex = determineMonthBranch(month, day);
  const monthOrder = positiveModulo(monthBranchIndex - 2, 12) + 1;
  const monthStemIndex = positiveModulo(yearStemIndex * 2 + monthOrder, 10);

  const jd = julianDay(birthInstant);
  const dayIndex = positiveModulo(Math.floor(jd + 49), 60);
  const dayStemIndex = positiveModulo(dayIndex, 10);
  const dayBranchIndex = positiveModulo(dayIndex, 12);

  const hourIndex = positiveModulo(Math.floor(((hour + 1) % 24) / 2), 12);
  const hourStemIndex = positiveModulo(dayStemIndex * 2 + hourIndex, 10);

  const dayStem = HEAVENLY_STEMS[dayStemIndex];
  const dayBranch = EARTHLY_BRANCHES[dayBranchIndex];
  const monthBranch = EARTHLY_BRANCHES[monthBranchIndex];
  const monthStem = HEAVENLY_STEMS[monthStemIndex];
  const yearStem = HEAVENLY_STEMS[yearStemIndex];
  const yearBranch = EARTHLY_BRANCHES[yearBranchIndex];
  const hourStem = HEAVENLY_STEMS[hourStemIndex];
  const hourBranch = EARTHLY_BRANCHES[hourIndex];
  const support = FIVE_ELEMENT_SUPPORT[dayStem.element as keyof typeof FIVE_ELEMENT_SUPPORT];
  const usefulElements = Array.from(
    new Set([support.resource, support.output, monthBranch.element]),
  );
  const cautionElements = Array.from(new Set([support.controlledBy, support.control]));

  const nextSolarTerm = computeNextSolarTerm(birthInstant, year, context.timezone);
  const diffDays = Math.max(1, Math.round((nextSolarTerm.getTime() - birthInstant.getTime()) / MS_PER_DAY));
  const startAge = Math.max(0, Math.round(diffDays / 3));
  const ageNow = Math.max(0, Math.floor((Date.now() - birthInstant.getTime()) / (MS_PER_DAY * 365.25)));
  const pillarIndex = Math.max(0, Math.floor((ageNow - startAge) / 10));
  const pillarStemIndex = positiveModulo(monthStemIndex + pillarIndex, 10);
  const pillarBranchIndex = positiveModulo(monthBranchIndex + pillarIndex, 12);
  const pillarStart = startAge + pillarIndex * 10;
  const pillarEnd = pillarStart + 10;
  const luckPillar = `${pillarStart}-${pillarEnd}: ${HEAVENLY_STEMS[pillarStemIndex].name} ${EARTHLY_BRANCHES[pillarBranchIndex].animal}`;

  const dayMaster = `${dayStem.yinYang} ${dayStem.element}`;

  const themes = [
    `Year pillar ${yearStem.name} ${yearBranch.animal} emphasises ${yearBranch.element.toLowerCase()} alliances this cycle.`,
    `${dayMaster} day master gains momentum when ${support.resource.toLowerCase()} resources stay replenished.`,
    `Day pillar ${dayStem.name} ${dayBranch.animal} invites ${dayBranch.element.toLowerCase()} rituals in your daily flow.`,
    `Month pillar ${monthStem.name} ${monthBranch.animal} keeps focus on ${monthBranch.element.toLowerCase()} habits.`,
    `Hour pillar ${hourStem.name} ${hourBranch.animal} rewards ${hourBranch.element.toLowerCase()} practices before key moves.`,
    `Luck pillar ${luckPillar} highlights ${FIVE_ELEMENT_SUPPORT[EARTHLY_BRANCHES[pillarBranchIndex].element as keyof typeof FIVE_ELEMENT_SUPPORT].output.toLowerCase()} expressions.`,
  ];

  const zodiacAnimal = yearBranch.animal;
  const ally = ALLY_MAP[zodiacAnimal];
  const clash = CLASH_MAP[zodiacAnimal];
  const zodiacNotes = [
    `Tai Sui ${zodiacAnimal}: align with ${ally} allies for smoother breakthroughs.`,
    `Avoid overextending with ${clash} energies during key launches.`,
  ];

  const profile: BaZiProfile = {
    dayMaster,
    usefulElements,
    cautionElements,
    luckPillar,
    themes,
  };

  const zodiac: ZodiacProfile = {
    animal: zodiacAnimal,
    ally,
    clash,
    notes: zodiacNotes,
  };

  return { profile, zodiac };
}
