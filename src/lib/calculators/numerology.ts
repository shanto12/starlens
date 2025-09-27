import type { ReadingContext, NumerologyMonth, NumerologyProfile } from "@/lib/types/reading";

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

function reduceNumber(value: number): number {
  const masterNumbers = new Set([11, 22, 33]);
  let current = value;

  while (current > 9 && !masterNumbers.has(current)) {
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

  const personalMonths: NumerologyMonth[] = Array.from(
    { length: context.horizonMonths },
    (_, index) => {
      const monthDate = new Date(referenceDate.getFullYear(), referenceDate.getMonth() + index, 1);
      const monthNumber = monthDate.getMonth() + 1;
      const personalMonth = reduceNumber(personalYear + monthNumber);
      const monthKey = `${monthDate.getFullYear()}-${String(monthNumber).padStart(2, "0")}`;
      return {
        month: monthKey,
        theme: personalMonth % 2 === 0 ? "Structure" : "Momentum",
        action: personalMonth % 2 === 0 ? "Organize finances" : "Share your work boldly",
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
  };

  if (currentName && currentName !== birthName) {
    profile.currentNameSummary = `${currentName} channels your Life Path ${lifePath} into daily practice.`;
  }

  return profile;
}
