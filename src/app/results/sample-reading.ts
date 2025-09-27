import type { ReadingResponse } from "@/lib/schemas/reading";

export const sampleReading: ReadingResponse = {
  meta: {
    horizonMonths: 12,
    confidence: "medium",
    generatedAt: new Date().toISOString(),
  },
  profiles: {
    western: {
      themes: ["Visibility surge", "Negotiation wins"],
      windows: [
        {
          start: "2025-02-04",
          end: "2025-02-18",
          focus: ["career", "relationships"],
          summary: "Collaborations land with ease. Schedule big asks mid-month.",
        },
        {
          start: "2025-04-10",
          end: "2025-04-22",
          focus: ["money"],
          summary: "Budget reviews highlight new revenue lanes.",
        },
      ],
    },
    vedic: {
      period: "Mercury over Jupiter",
      themes: ["Learning opens doors", "Consistency builds trust"],
      monthlyTags: [
        { month: "2025-01", focus: "Opportunity", opportunity: "Pitch new clients" },
        { month: "2025-02", focus: "Integration", caution: "Guard bandwidth" },
      ],
    },
    bazi: {
      dayMaster: "Yang Wood",
      usefulElements: ["Water", "Metal"],
      cautionElements: ["Earth"],
      luckPillar: "2023-2032",
      themes: ["Grow community alliances", "Track energy at seasonal shifts"],
    },
    numerology: {
      lifePath: 7,
      expression: 5,
      personalYear: 8,
      personalMonths: [
        { month: "2025-01", theme: "Structure", action: "Refresh systems" },
        { month: "2025-02", theme: "Momentum", action: "Share your wins" },
      ],
      currentNameSummary: "Preferred Name channels your Life Path 7 into daily practice.",
    },
    zodiac: {
      animal: "Wood Dragon",
      ally: "Rat",
      clash: "Dog",
      notes: [
        "Annual Tai Sui favors strategic risks.",
        "Keep water and metal elements nearby during launches.",
      ],
    },
  },
  months: [
    {
      month: "2025-01",
      highlights: ["Career doors open", "Mentorship connections blossom", "Momentum builds"],
      cautions: ["Guard your energy mid-month"],
      bestDays: ["2025-01-08", "2025-01-19"],
      action: "Pitch two collaborations and block one recharge day.",
      sources: ["western", "vedic", "numerology"],
    },
    {
      month: "2025-02",
      highlights: ["Finances stabilize", "Creative spark returns"],
      cautions: ["Clarify expectations in partnerships"],
      bestDays: ["2025-02-04", "2025-02-22"],
      action: "Schedule review conversations and track budget wins.",
      sources: ["western", "bazi", "numerology"],
    },
  ],
  optional: {
    datePicks: [
      {
        date: "2025-02-04",
        goal: "career",
        windowLocal: "09:00-11:00",
        score: 88,
        rationale: "Moon trine natal Sun + personal day boost",
      },
    ],
    relocation: [
      {
        city: "Austin, US",
        note: "High visibility; balance recovery windows.",
      },
    ],
    home: {
      kua: 1,
      bestDirections: ["east", "southeast", "south", "north"],
      annualCaution: "Keep the northwest sector calm and clutter free.",
    },
    divination: {
      system: "tarot",
      summary: "Three card spread encourages bold outreach while tending your energy budget.",
    },
  },
  disclaimer: "Interpretive guidance only. Pair insights with your judgment and professional advice as needed.",
};
