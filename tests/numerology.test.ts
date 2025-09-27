import { describe, expect, it } from "vitest";

import { generateNumerologyProfile } from "@/lib/calculators/numerology";
import type { ReadingContext } from "@/lib/types/reading";

const baseContext: ReadingContext = {
  birth: {
    date: "1988-04-04",
    time: "13:25",
    timeUnknown: false,
    city: "Kochi",
    country: "IN",
  },
  current: {
    city: "Dallas",
    country: "US",
  },
  names: {
    birthName: "Firstname Middlename Lastname",
    currentName: "Preferred Name",
  },
  goals: ["career"],
  horizonMonths: 6,
};

describe("generateNumerologyProfile", () => {
  it("derives master numbers and personal months", () => {
    const profile = generateNumerologyProfile(baseContext);

    expect(profile.lifePath).toBe(7);
    expect(profile.personalYear).toBeTypeOf("number");
    expect(profile.personalMonths).toHaveLength(baseContext.horizonMonths);
    expect(profile.personalMonths[0].month).toMatch(/\d{4}-\d{2}/);
  });

  it("falls back gracefully when names are missing", () => {
    const profile = generateNumerologyProfile({
      ...baseContext,
      names: undefined,
    });

    expect(profile.expression).toBeUndefined();
    expect(profile.currentNameSummary).toBeUndefined();
  });
});
