import { describe, expect, it } from "vitest";

import { readingRequestSchema } from "@/lib/schemas/reading";

describe("readingRequestSchema", () => {
  const basePayload = {
    birth: {
      date: "1992-08-15",
      time: "08:45",
      timeUnknown: false,
      city: "Paris",
      country: "FR",
    },
    current: {
      city: "Berlin",
      country: "DE",
    },
    names: {
      birthName: "Alex Example",
      currentName: "Alex",
    },
    goals: ["career", "health"],
    horizonMonths: 6,
    options: {
      datePicks: true,
      relocation: ["Lisbon, PT"],
      question: "Is this the right time to pivot?",
      home: {
        facingDegrees: 180,
        moveInYear: 2022,
      },
    },
    timezone: "Europe/Berlin",
    locale: "de-DE",
  } as const;

  it("accepts a well formed payload", () => {
    const result = readingRequestSchema.safeParse(basePayload);
    expect(result.success).toBe(true);
  });

  it("rejects payloads without goals", () => {
    const result = readingRequestSchema.safeParse({
      ...basePayload,
      goals: [],
    });

    expect(result.success).toBe(false);
  });

  it("enforces relocation limits", () => {
    const result = readingRequestSchema.safeParse({
      ...basePayload,
      options: {
        ...basePayload.options,
        relocation: ["City 1", "City 2", "City 3", "City 4"],
      },
    });

    expect(result.success).toBe(false);
  });
});
