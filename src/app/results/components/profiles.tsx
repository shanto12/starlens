import type { ReadingResponse } from "@/lib/schemas/reading";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";

function ProfileCard({
  title,
  description,
  details,
}: {
  title: string;
  description?: string;
  details: string[];
}) {
  return (
    <Card className="px-6 py-6">
      <CardTitle>{title}</CardTitle>
      {description && <CardDescription className="mt-2">{description}</CardDescription>}
      <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
        {details.map((detail) => (
          <li key={detail} className="list-disc pl-4">
            {detail}
          </li>
        ))}
      </ul>
    </Card>
  );
}

export function Profiles({ profiles }: { profiles: ReadingResponse["profiles"] }) {

  if (profiles.western) {
    cards.push(
      <ProfileCard
        key="western"
        title="Western Astrology"
        details={[
          ...(profiles.western.themes ?? []),
          ...(profiles.western.windows?.map(
            (window) => `Window ${window.start} to ${window.end}: ${window.summary}`,
          ) ?? []),
        ]}
      />,
    );
  }

  if (profiles.vedic) {
    cards.push(
      <ProfileCard
        key="vedic"
        title="Vedic / Jyotish"
        description={profiles.vedic.period}
        details={[
          ...(profiles.vedic.themes ?? []),
          ...(profiles.vedic.monthlyTags?.map(
            (tag) => `${tag.month}: ${tag.focus}${tag.opportunity ? ` — ${tag.opportunity}` : ""}${tag.caution ? ` (Caution: ${tag.caution})` : ""}`,
          ) ?? []),
        ]}
      />,
    );
  }

  if (profiles.bazi) {
    cards.push(
      <ProfileCard
        key="bazi"
        title="Chinese BaZi"
        description={`Day Master: ${profiles.bazi.dayMaster ?? "Unknown"}`}
        details={[
          ...(profiles.bazi.themes ?? []),
          `Useful elements: ${(profiles.bazi.usefulElements ?? []).join(", ")}`,
          profiles.bazi.cautionElements?.length
            ? `Watch elements: ${profiles.bazi.cautionElements.join(", ")}`
            : "",
          profiles.bazi.luckPillar ? `Current pillar: ${profiles.bazi.luckPillar}` : "",
        ].filter(Boolean)}
      />,
    );
  }

  if (profiles.numerology) {
    cards.push(
      <ProfileCard
        key="numerology"
        title="Numerology"
        details={[
          `Life Path: ${profiles.numerology.lifePath}`,
          profiles.numerology.expression ? `Expression: ${profiles.numerology.expression}` : "",
          profiles.numerology.soulUrge ? `Soul Urge: ${profiles.numerology.soulUrge}` : "",
          profiles.numerology.personality ? `Personality: ${profiles.numerology.personality}` : "",
          `Personal Year: ${profiles.numerology.personalYear}`,
          ...(profiles.numerology.personalMonths?.map((month) =>
            `${month.month}: ${month.theme} — ${month.action}`,
          ) ?? []),
          profiles.numerology.currentNameSummary ?? "",
        ].filter(Boolean)}
      />,
    );
  }

  if (profiles.zodiac) {
    cards.push(
      <ProfileCard
        key="zodiac"
        title="Chinese Zodiac / Tai Sui"
        details={[
          `Animal: ${profiles.zodiac.animal ?? "Unknown"}`,
          profiles.zodiac.ally ? `Ally: ${profiles.zodiac.ally}` : "",
          profiles.zodiac.clash ? `Clash: ${profiles.zodiac.clash}` : "",
          ...(profiles.zodiac.notes ?? []),
        ].filter(Boolean)}
      />,
    );
  }

  if (cards.length === 0) {
    return (
      <Card className="px-6 py-6 text-sm text-muted-foreground">
        Profiles will appear once a reading is generated.
      </Card>
    );
  }

  return <div className="grid gap-4 md:grid-cols-2">{cards}</div>;
}
