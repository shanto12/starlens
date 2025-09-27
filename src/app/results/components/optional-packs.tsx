import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import type { ReadingResponse } from "@/lib/schemas/reading";

export function OptionalPacks({ optional }: { optional?: ReadingResponse["optional"] }) {
  if (!optional) {
    return null;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {optional.datePicks && optional.datePicks.length > 0 && (
        <Card className="px-6 py-6">
          <CardTitle>Date picks</CardTitle>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            {optional.datePicks.map((pick) => (
              <li key={pick.date} className="rounded-2xl bg-foreground/5 px-4 py-3">
                <span className="font-semibold text-foreground">{pick.date}</span>
                {pick.goal ? ` - ${pick.goal}` : ""}
                {pick.windowLocal ? ` (${pick.windowLocal})` : ""}
                {pick.rationale ? ` - ${pick.rationale}` : ""}
              </li>
            ))}
          </ul>
        </Card>
      )}

      {optional.relocation && optional.relocation.length > 0 && (
        <Card className="px-6 py-6">
          <CardTitle>Relocation-lite</CardTitle>
          <CardDescription className="mt-2">
            Top candidate cities drawn from astrocartography lines.
          </CardDescription>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            {optional.relocation.map((city) => (
              <li key={city.city} className="rounded-2xl bg-foreground/5 px-4 py-3">
                <span className="font-semibold text-foreground">{city.city}</span>
                <span> - {city.note}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {optional.home && (
        <Card className="px-6 py-6">
          <CardTitle>Home-lite</CardTitle>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            {optional.home.kua !== undefined && (
              <li>Kua number: {optional.home.kua}</li>
            )}
            {optional.home.bestDirections && optional.home.bestDirections.length > 0 && (
              <li>Best directions: {optional.home.bestDirections.join(", ")}</li>
            )}
            {optional.home.annualCaution && <li>{optional.home.annualCaution}</li>}
          </ul>
        </Card>
      )}

      {optional.divination && (
        <Card className="px-6 py-6">
          <CardTitle>{optional.divination.system === "tarot" ? "Tarot" : "I Ching"}</CardTitle>
          <CardDescription className="mt-2 text-sm text-muted-foreground">
            {optional.divination.summary}
          </CardDescription>
        </Card>
      )}
    </div>
  );
}
