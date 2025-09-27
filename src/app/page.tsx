import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";

const sellingPoints = [
  {
    title: "90-second intake",
    description:
      "Answer only what matters. We auto-detect time zones and remember nothing once you finish.",
  },
  {
    title: "Cross-tradition guidance",
    description:
      "Western, Vedic, BaZi, Numerology, and optional boosters synthesize into one clear plan.",
  },
  {
    title: "Action-first results",
    description:
      "Monthly highlights, cautions, and best days make it simple to act on your reading.",
  },
];

const assurances = [
  {
    title: "Privacy by default",
    description:
      "Your data stays in the browser and short-lived server memory. Export or delete in one tap.",
  },
  {
    title: "Fast everywhere",
    description:
      "Edge-rendered pages, offline-ready caching, and lightweight components keep things snappy.",
  },
  {
    title: "Accessible for all",
    description:
      "Keyboard-friendly forms, readable typography, and dark mode support welcome every seeker.",
  },
];

export default function HomePage() {
  return (
    <main className="flex flex-col gap-24 pb-24" id="main-content">
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-6 pt-20 text-balance sm:pt-28">
        <div className="flex flex-col items-start gap-6">
          <span className="rounded-full bg-primary/10 px-4 py-1 text-sm font-medium text-primary">
            Guidance for your next 3-24 months
          </span>
          <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            Clarity for your next moves. Grounded in tradition, delivered in minutes.
          </h1>
          <p className="max-w-3xl text-lg text-muted-foreground">
            Starlens blends Western Astrology, Vedic/Jyotish, Chinese BaZi, Chinese Zodiac, and
            Pythagorean Numerology to surface the windows that matter. Optional Tarot, I Ching, date
            picks, relocation, and home energy add nuance when you need it.
          </p>
        </div>
        <div className="flex flex-col gap-4 sm:flex-row">
          <Button asChild>
            <Link href="/intake">Start free reading</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/privacy">How we protect your data</Link>
          </Button>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6">
        <div className="grid gap-6 sm:grid-cols-3">
          {sellingPoints.map((point) => (
            <Card key={point.title} className="px-6 py-8">
              <CardTitle>{point.title}</CardTitle>
              <CardDescription className="mt-3">{point.description}</CardDescription>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-6">
        <div className="space-y-4">
          <h2 className="text-3xl font-semibold text-foreground sm:text-4xl">What to expect</h2>
          <p className="max-w-3xl text-base text-muted-foreground">
            Begin with a short intake: birth details, names, focus, optional boosters. Starlens then
            synthesizes monthly guidance, confidence scores, and actionable cards in under a minute.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-3">
          {assurances.map((assurance) => (
            <Card key={assurance.title} className="px-6 py-8">
              <CardTitle>{assurance.title}</CardTitle>
              <CardDescription className="mt-3">{assurance.description}</CardDescription>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-4xl px-6">
        <Card className="bg-gradient-to-br from-primary/10 via-surface to-surface px-8 py-10 text-center">
          <CardTitle className="text-3xl font-semibold text-foreground sm:text-4xl">
            Ready when you are.
          </CardTitle>
          <CardDescription className="mx-auto mt-4 max-w-2xl text-base">
            Get a clear view of your next season in life. No jargon, no overwhelm, just the timing,
            themes, and actions to focus on.
          </CardDescription>
          <div className="mt-6 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button asChild>
              <Link href="/intake">Start free reading</Link>
            </Button>
            <span className="text-sm text-muted-foreground">About 90 seconds to complete intake</span>
          </div>
        </Card>
      </section>
    </main>
  );
}
