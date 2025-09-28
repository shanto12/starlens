import type {
  ReadingContext,
  NumerologyMonth,
  NumerologyProfile,
  NumerologyCycle,
} from "@/lib/types/reading";

const letterMap: Record<string, number> = {
  A: 1,
  B: 2,
  C: 3,
  D: 4,
  E: 5,
  F: 6,
  G: 7,
  H: 8,
  I: 9,
  J: 1,
  K: 2,
  L: 3,
  M: 4,
  N: 5,
  O: 6,
  P: 7,
  Q: 8,
  R: 9,
  S: 1,
  T: 2,
  U: 3,
  V: 4,
  W: 5,
  X: 6,
  Y: 7,
  Z: 8,
};

const PINNACLE_THEMES: Record<number, string> = {
  1: "Lead with self-belief and original ideas",
  2: "Build patient partnerships and listen deeply",
  3: "Amplify storytelling and joyful visibility",
  4: "Lay dependable systems and honour consistency",
  5: "Embrace change, travel, and experimentation",
  6: "Anchor home, family, and heart-led service",
  7: "Prioritise study, intuition, and contemplative space",
  8: "Step into executive power and resource mastery",
  9: "Complete cycles, mentor others, and release clutter",
  11: "Channel inspired leadership with spiritual insight",
  22: "Design lasting impact with practical vision",
  33: "Serve through compassion and creative healing",
};

const PERSONAL_MONTH_MEANINGS: Record<number, { theme: string; action: string }> = {
  1: { theme: "Initiation", action: "Launch bold pitches and outline new plans." },
  2: { theme: "Collaboration", action: "Schedule listening sessions and align expectations." },
  3: { theme: "Expression", action: "Share content, speak on panels, and celebrate wins." },
  4: { theme: "Structure", action: "Update budgets, workflows, and key docs." },
  5: { theme: "Momentum", action: "Experiment with outreach and adapt swiftly." },
  6: { theme: "Care", action: "Support your circle and refresh wellbeing rituals." },
  7: { theme: "Insight", action: "Block study days and trust your inner compass." },
  8: { theme: "Influence", action: "Negotiate agreements and steward resources intentionally." },
  9: { theme: "Integration", action: "Complete lingering projects and offer mentorship." },
  11: { theme: "Vision", action: "Meditate on inspired messages before broadcasting." },
  22: { theme: "Master Builder", action: "Draft the long-range blueprint and recruit allies." },
};

const MASTER_NUMBERS = new Set([11, 22, 33]);

function reduceNumber(value: number): number {
  let current = value;

  while (current > 9 && !MASTER_NUMBERS.has(current)) {
    current = current
      .toString()
      .split("")
      .reduce((sum, digit) => sum + Number(digit), 0);
  }

  return current;
}

function lifePathFromDate(date: string): number {
  const digits = date.replace(/[^0-9]/g, "");
  const total = digits.split("").reduce((sum, digit) => sum + Number(digit), 0);
  return reduceNumber(total);
}

function sumNameLetters(name: string, filter: (letter: string) => boolean): number {
  return name
    .toUpperCase()
    .split("")
    .filter((letter) => /[A-Z]/.test(letter) && filter(letter))
    .reduce((sum, letter) => sum + (letterMap[letter] ?? 0), 0);
}

function calculatePinnacles(date: string): NumerologyCycle[] {
  const month = Number(date.slice(5, 7));
  const day = Number(date.slice(8, 10));
  const year = Number(date.slice(0, 4));

  const first = reduceNumber(month + day);
  const second = reduceNumber(day + year);
  const third = reduceNumber(first + second);
  const fourth = reduceNumber(month + year);

  const values = [
    { value: first, range: "Age 0-34" },
    { value: second, range: "Age 35-43" },
    { value: third, range: "Age 44-52" },
    { value: fourth, range: "Age 53+" },
  ];

  return values.map((entry, index) => {
    const theme = PINNACLE_THEMES[entry.value] ?? "Balance intuition with action";
    return {
      name: `Pinnacle ${index + 1}`,
      range: entry.range,
      theme,
    } satisfies NumerologyCycle;
  });
}

function ageOnDate(birth: Date, target: Date): number {
  const diff = target.getTime() - birth.getTime();
  return Math.max(0, Math.floor(diff / (365.25 * 86_400_000)));
}

function resolvePinnacleTheme(age: number, pinnacles: NumerologyCycle[]): string {
  if (age <= 34) return pinnacles[0]?.theme ?? "Activate self-trust";
  if (age <= 43) return pinnacles[1]?.theme ?? "Collaborate intentionally";
  if (age <= 52) return pinnacles[2]?.theme ?? "Express seasoned mastery";
  return pinnacles[3]?.theme ?? "Mentor and legacy-build";
}

export function generateNumerologyProfile(context: ReadingContext): NumerologyProfile {
  const birthName = context.names?.birthName?.trim() ?? "";
  const currentName = context.names?.currentName?.trim() ?? birthName;
  const baseDate = context.birth.date;
  const lifePath = lifePathFromDate(baseDate);

  const expression = birthName ? reduceNumber(sumNameLetters(birthName, () => true)) : undefined;
  const soulUrge = birthName
    ? reduceNumber(sumNameLetters(birthName, (letter) => "AEIOUY".includes(letter)))
    : undefined;
  const personality = birthName
    ? reduceNumber(sumNameLetters(birthName, (letter) => !"AEIOUY".includes(letter)))
    : undefined;

  const referenceDate = new Date();
  const currentYear = referenceDate.getFullYear();
  const personalYear = reduceNumber(
    Number(baseDate.slice(5, 7)) + Number(baseDate.slice(8, 10)) + currentYear,
  );

  const pinnacles = calculatePinnacles(baseDate);
  const birthDate = new Date(`${baseDate}T00:00:00Z`);

  const personalMonths: NumerologyMonth[] = Array.from(
    { length: context.horizonMonths },
    (_, index) => {
      const monthDate = new Date(referenceDate.getFullYear(), referenceDate.getMonth() + index, 1);
      const monthNumber = monthDate.getMonth() + 1;
      const personalMonth = reduceNumber(personalYear + monthNumber);
      const monthKey = `${monthDate.getFullYear()}-${String(monthNumber).padStart(2, "0")}`;
      const meaning = PERSONAL_MONTH_MEANINGS[personalMonth] ?? {
        theme: "Integration",
        action: "Review priorities and simplify schedules.",
      };
      const age = ageOnDate(birthDate, monthDate);
      const pinnacleTheme = resolvePinnacleTheme(age, pinnacles);
      return {
        month: monthKey,
        theme: `${meaning.theme} • ${pinnacleTheme}`,
        action: meaning.action,
      } satisfies NumerologyMonth;
    },
  );

  const profile: NumerologyProfile = {
    lifePath,
    expression,
    soulUrge,
    personality,
    personalYear,
    personalMonths,
    pinnacles,
  };

  if (currentName && currentName !== birthName) {
    profile.currentNameSummary = `${currentName} channels your Life Path ${lifePath} into daily practice.`;
  }

  return profile;
}
