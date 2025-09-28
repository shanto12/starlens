import { z } from "zod";

export const goals = [
  "career",
  "money",
  "health",
  "relationships",
  "move",
  "study",
  "creative",
] as const;

export const horizonMonths = [3, 6, 12, 24] as const;
export const horizonSchema = z.union([
  z.literal(3),
  z.literal(6),
  z.literal(12),
  z.literal(24),
]);

const boosterSchema = z.object({
  datePicks: z.boolean().optional(),
  relocation: z.array(z.string()).max(3).optional(),
  question: z.string().max(280).optional(),
  home: z
    .object({
      facingDegrees: z.number().min(0).max(359).optional(),
      moveInYear: z.number().min(1800).max(2200).optional(),
    })
    .optional(),
});

export const readingRequestSchema = z.object({
  birth: z.object({
    date: z.string().min(1, "Birth date is required"),
    time: z.string().optional(),
    timeUnknown: z.boolean().optional().default(false),
    city: z.string().min(1, "Birth city is required"),
    country: z.string().min(1, "Birth country is required"),
  }),
  current: z.object({
    city: z.string().min(1, "Current city is required"),
    country: z.string().optional(),
  }),
  names: z
    .object({
      birthName: z.string().optional(),
      currentName: z.string().optional(),
    })
    .optional(),
  goals: z.array(z.enum(goals)).min(1).max(3),
  horizonMonths: horizonSchema,
  options: boosterSchema.optional(),
  locale: z.string().optional(),
  timezone: z.string().optional(),
});

export const confidenceLevels = ["high", "medium", "low"] as const;

export const monthlyForecastSchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/),
  highlights: z.array(z.string()).max(3),
  cautions: z.array(z.string()).max(2),
  bestDays: z.array(z.string()).max(3),
  action: z.string(),
  sources: z.array(z.string()),
});

export const westernProfileSchema = z.object({
  themes: z.array(z.string()).optional(),
  windows: z
    .array(
      z.object({
        start: z.string(),
        end: z.string(),
        focus: z.array(z.enum(goals)).default([]),
        summary: z.string(),
      }),
    )
    .optional(),
});

export const vedicProfileSchema = z.object({
  period: z.string().optional(),
  themes: z.array(z.string()).optional(),
  monthlyTags: z
    .array(
      z.object({
        month: z.string().regex(/^\d{4}-\d{2}$/),
        focus: z.string(),
        opportunity: z.string().optional(),
        caution: z.string().optional(),
      }),
    )
    .optional(),
});

export const baziProfileSchema = z.object({
  dayMaster: z.string().optional(),
  usefulElements: z.array(z.string()).optional(),
  cautionElements: z.array(z.string()).optional(),
  luckPillar: z.string().optional(),
  themes: z.array(z.string()).optional(),
});

export const numerologyProfileSchema = z.object({
  lifePath: z.number().optional(),
  expression: z.number().optional(),
  soulUrge: z.number().optional(),
  personality: z.number().optional(),
  personalYear: z.number().optional(),
  personalMonths: z
    .array(
      z.object({
        month: z.string().regex(/^\d{4}-\d{2}$/),
        theme: z.string(),
        action: z.string(),
      }),
    )
    .optional(),
  pinnacles: z
    .array(
      z.object({
        name: z.string(),
        range: z.string(),
        theme: z.string(),
      }),
    )
    .optional(),
  currentNameSummary: z.string().optional(),
});

export const zodiacProfileSchema = z.object({
  animal: z.string().optional(),
  ally: z.string().optional(),
  clash: z.string().optional(),
  notes: z.array(z.string()).optional(),
});

export const optionalPacksSchema = z.object({
  datePicks: z
    .array(
      z.object({
        date: z.string(),
        goal: z.enum(goals).optional(),
        windowLocal: z.string().optional(),
        score: z.number().optional(),
        rationale: z.string().optional(),
      }),
    )
    .optional(),
  relocation: z
    .array(
      z.object({
        city: z.string(),
        note: z.string(),
      }),
    )
    .optional(),
  home: z
    .object({
      kua: z.number().optional(),
      bestDirections: z.array(z.string()).optional(),
      annualCaution: z.string().optional(),
    })
    .optional(),
  divination: z
    .object({
      system: z.enum(["tarot", "iching"]),
      summary: z.string(),
    })
    .optional(),
});

export const readingResponseSchema = z.object({
  meta: z.object({
    horizonMonths: z.number(),
    confidence: z.enum(confidenceLevels),
    generatedAt: z.string(),
  }),
  profiles: z.object({
    western: westernProfileSchema.optional(),
    vedic: vedicProfileSchema.optional(),
    bazi: baziProfileSchema.optional(),
    numerology: numerologyProfileSchema.optional(),
    zodiac: zodiacProfileSchema.optional(),
  }),
  months: z.array(monthlyForecastSchema),
  optional: optionalPacksSchema.optional(),
  disclaimer: z.string(),
});

export type ReadingRequest = z.infer<typeof readingRequestSchema>;
export type ReadingResponse = z.infer<typeof readingResponseSchema>;



