import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import type { TimelineEntry } from "@/lib/types/reading";

function formatMonth(month: string, locale = "en-US") {
  const [year, monthPart] = month.split("-");
  const date = new Date(Number(year), Number(monthPart) - 1, 1);
  return date.toLocaleDateString(locale, { month: "long", year: "numeric" });
}

function formatBestDays(days: string[]) {
  return days.map((day) => new Date(day).toLocaleDateString(undefined, { month: "short", day: "numeric" }));
}

export function Timeline({ months, locale }: { months: TimelineEntry[]; locale?: string }) {
  if (months.length === 0) {
    return (
      <Card className="px-6 py-6 text-sm text-muted-foreground">
        No monthly forecasts yet. Complete the intake to generate your timeline.
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {months.map((month) => (
        <Card key={month.month} className="flex flex-col gap-4 px-6 py-6">
          <header className="flex items-baseline justify-between gap-4">
            <CardTitle>{formatMonth(month.month, locale)}</CardTitle>
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              Sources: {month.sources.join(" / ")}
            </span>
          </header>
          <CardDescription className="space-y-2">
            <p>
              <span className="font-semibold text-foreground">Highlights:</span> {month.highlights.join(", ")}
            </p>
            <p>
              <span className="font-semibold text-foreground">Cautions:</span> {month.cautions.join(", ")}
            </p>
            <p>
              <span className="font-semibold text-foreground">Best days:</span> {formatBestDays(month.bestDays).join(", ")}
            </p>
          </CardDescription>
          <div className="rounded-2xl bg-foreground/5 px-4 py-3 text-sm text-foreground">
            Action: {month.action}
          </div>
        </Card>
      ))}
    </div>
  );
}
