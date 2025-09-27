import { Card, CardDescription, CardTitle } from "@/components/ui/card";

const traditions = [
  {
    name: "Western Astrology",
    focus:
      "Transit timing, major aspects, and practical coaching. We track outer planet windows, retrogrades, and house emphasis when the birth time is known.",
  },
  {
    name: "Vedic and Jyotish",
    focus:
      "Vimshottari dasha sequencing, nakshatra insights, and Saturn or Jupiter overlays for focus and opportunity tags.",
  },
  {
    name: "Chinese BaZi and Zodiac",
    focus:
      "Day Master strength, useful elements, current ten year pillars, and Tai Sui dynamics for timing and relationships.",
  },
  {
    name: "Pythagorean Numerology",
    focus:
      "Life Path, Expression, Soul Urge, Personality, and Personal Year or Month cycles to highlight rhythm and mindset shifts.",
  },
];

const principles = [
  "Interpretive guidance only. Never medical, legal, or financial verdicts.",
  "Transparent confidence indicators based on data completeness.",
  "Explainable insights: every highlight shows which traditions contributed.",
  "Bias aware development with continuous review across diverse use cases.",
];

export default function AboutPage() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-6 pb-24 pt-16" id="main-content">
      <header className="space-y-4 text-balance">
        <p className="text-sm font-semibold uppercase tracking-wider text-primary">Methodology</p>
        <h1 className="text-3xl font-semibold text-foreground sm:text-4xl">
          Tradition meets modern product thinking
        </h1>
        <p className="text-base text-muted-foreground">
          Starlens harmonizes several divination and timing systems to surface the most relevant
          guidance. Each engine is documented, testable, and built for continuous calibration.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-2">
        {traditions.map((tradition) => (
          <Card key={tradition.name} className="px-6 py-6">
            <CardTitle>{tradition.name}</CardTitle>
            <CardDescription className="mt-2">{tradition.focus}</CardDescription>
          </Card>
        ))}
      </section>

      <Card className="px-6 py-6">
        <CardTitle>Product principles</CardTitle>
        <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
          {principles.map((principle) => (
            <li key={principle} className="flex items-start gap-2">
              <span aria-hidden className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-primary" />
              <span>{principle}</span>
            </li>
          ))}
        </ul>
      </Card>

      <Card className="bg-primary/10 px-6 py-6 text-sm text-foreground">
        <CardTitle>Limitations</CardTitle>
        <CardDescription className="mt-2 text-muted-foreground">
          Starlens offers reflective insight, not deterministic answers. Pair readings with grounded
          action and professional advice when needed. We test for accuracy across different calendars
          and cultures.
        </CardDescription>
      </Card>
    </main>
  );
}
