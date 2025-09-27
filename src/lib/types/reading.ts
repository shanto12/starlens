import type { goals, confidenceLevels, horizonMonths } from "@/lib/schemas/reading";

export type Goal = (typeof goals)[number];
export type ConfidenceLevel = (typeof confidenceLevels)[number];
export type HorizonMonths = (typeof horizonMonths)[number];

export type BirthDetails = {
  date: string;
  time?: string;
  timeUnknown?: boolean;
  city: string;
  country: string;
};

export type Names = {
  birthName?: string;
  currentName?: string;
};

export type ReadingContext = {
  birth: BirthDetails;
  current: {
    city: string;
    country?: string;
  };
  names?: Names;
  goals: Goal[];
  horizonMonths: HorizonMonths;
  locale?: string;
  timezone?: string;
};

export type TimelineEntry = {
  month: string;
  highlights: string[];
  cautions: string[];
  bestDays: string[];
  action: string;
  sources: string[];
};

export type WesternWindow = {
  start: string;
  end: string;
  focus: Goal[];
  summary: string;
};

export type WesternProfile = {
  themes: string[];
  windows: WesternWindow[];
};

export type VedicMonthlyTag = {
  month: string;
  focus: string;
  opportunity?: string;
  caution?: string;
};

export type VedicProfile = {
  period: string;
  themes: string[];
  monthlyTags: VedicMonthlyTag[];
};

export type BaZiProfile = {
  dayMaster: string;
  usefulElements: string[];
  cautionElements: string[];
  luckPillar: string;
  themes: string[];
};

export type NumerologyMonth = {
  month: string;
  theme: string;
  action: string;
};

export type NumerologyProfile = {
  lifePath: number;
  expression?: number;
  soulUrge?: number;
  personality?: number;
  personalYear: number;
  personalMonths: NumerologyMonth[];
  currentNameSummary?: string;
};

export type ZodiacProfile = {
  animal: string;
  ally: string;
  clash: string;
  notes: string[];
};

export type OptionalDatePick = {
  date: string;
  goal?: Goal;
  windowLocal?: string;
  score?: number;
  rationale?: string;
};

export type OptionalRelocation = {
  city: string;
  note: string;
};

export type OptionalHome = {
  kua?: number;
  bestDirections?: string[];
  annualCaution?: string;
};

export type OptionalDivination = {
  system: "tarot" | "iching";
  summary: string;
};

export type ReadingResult = {
  meta: {
    horizonMonths: HorizonMonths;
    confidence: ConfidenceLevel;
    generatedAt: string;
  };
  profiles: {
    western?: WesternProfile;
    vedic?: VedicProfile;
    bazi?: BaZiProfile;
    numerology?: NumerologyProfile;
    zodiac?: ZodiacProfile;
  };
  months: TimelineEntry[];
  optional?: {
    datePicks?: OptionalDatePick[];
    relocation?: OptionalRelocation[];
    home?: OptionalHome;
    divination?: OptionalDivination;
  };
  disclaimer: string;
};
