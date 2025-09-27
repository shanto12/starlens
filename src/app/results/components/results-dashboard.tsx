'use client';

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import type { ReadingResponse } from "@/lib/schemas/reading";
import { useReadingStore } from "@/store/results-store";

import { ConfidenceBadge } from "./confidence-badge";
import { Profiles } from "./profiles";
import { OptionalPacks } from "./optional-packs";
import { Timeline } from "./timeline";
import { sampleReading } from "../sample-reading";

export function ResultsDashboard() {
  const reading = useReadingStore((state) => state.latest);
  const data: ReadingResponse = reading ?? sampleReading;
  const usingSample = !reading;
  const locale = typeof navigator !== "undefined" ? navigator.language : "en-US";

  return (
    <div className="flex flex-col gap-10">
      <Card className="px-6 py-8 sm:flex sm:items-center sm:justify-between">
        <div className="space-y-3">
          <CardTitle className="text-3xl sm:text-4xl">
            {usingSample ? "Sample reading" : "Your reading"}
          </CardTitle>
          <CardDescription>
            Horizon: {data.meta.horizonMonths} months
            <span className="mx-2">|</span>
            Generated {new Date(data.meta.generatedAt).toLocaleString(locale)}
          </CardDescription>
          <ConfidenceBadge level={data.meta.confidence} />
          {usingSample && (
            <p className="text-sm text-muted-foreground">
              Viewing a sample dashboard. Complete the intake to receive your personalized guidance.
            </p>
          )}
        </div>
        <div className="mt-6 flex flex-col gap-3 sm:mt-0 sm:w-64">
          <Button variant="outline" asChild>
            <Link href="/intake">Start a new intake</Link>
          </Button>
          <Button variant="ghost" disabled>
            Download PDF (coming soon)
          </Button>
        </div>
      </Card>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-foreground">Your timeline</h2>
          <span className="text-sm text-muted-foreground">Confidence: {data.meta.confidence}</span>
        </div>
        <Timeline months={data.months} locale={locale} />
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-foreground">Profiles</h2>
        <Profiles profiles={data.profiles} />
      </section>

      {data.optional && (
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">Optional packs</h2>
          <OptionalPacks optional={data.optional} />
        </section>
      )}

      <Card className="px-6 py-6 text-sm text-muted-foreground">{data.disclaimer}</Card>
    </div>
  );
}
