import type {
  BaZiProfile,
  NumerologyProfile,
  ReadingContext,
  TimelineEntry,
  VedicProfile,
} from "@/lib/types/reading";
import type { TransitModel } from "@/lib/astrology/transits";

function mergeHighlights(base: string[], additions: string[], limit: number): string[] {
  const combined = [...base];
  for (const addition of additions) {
    if (combined.length >= limit) break;
    if (!combined.includes(addition)) {
      combined.push(addition);
    }
  }
  return combined.slice(0, limit);
}

function buildVedicNotes(month: string, vedic?: VedicProfile): { highlight?: string; caution?: string } {
  if (!vedic?.monthlyTags) return {};
  const tag = vedic.monthlyTags.find((item) => item.month === month);
  if (!tag) return {};

  const pieces: string[] = [];
  if (tag.focus) pieces.push(`Vedic focus: ${tag.focus}`);
  if (tag.opportunity) pieces.push(`Opportunity: ${tag.opportunity}`);
  const highlight = pieces.length > 0 ? pieces.join(" — ") : undefined;
  const caution = tag.caution ? `Jyotish caution: ${tag.caution}` : undefined;
  return { highlight, caution };
}

function buildNumerologyAction(month: string, numerology?: NumerologyProfile): string | undefined {
  if (!numerology?.personalMonths) return undefined;
  const tag = numerology.personalMonths.find((item) => item.month === month);
  if (!tag) return undefined;
  return `Numerology ${tag.theme}: ${tag.action}`;
}

function buildBaZiHighlight(month: string, bazi?: BaZiProfile): string | undefined {
  if (!bazi) return undefined;
  const element = bazi.usefulElements?.[0];
  if (!element) return undefined;
  return `BaZi month cue: weave ${element} qualities into plans.`;
}

export function buildTimeline(
  _context: ReadingContext,
  options: {
    transits: TransitModel;
    vedic?: VedicProfile;
    numerology?: NumerologyProfile;
    bazi?: BaZiProfile;
  },
): TimelineEntry[] {
  const entries: TimelineEntry[] = [];
  const { transits, vedic, numerology, bazi } = options;

  for (const month of transits.months) {
    const vedicNotes = buildVedicNotes(month.month, vedic);
    const numerologyAction = buildNumerologyAction(month.month, numerology);
    const baziHighlight = buildBaZiHighlight(month.month, bazi);

    const highlights = mergeHighlights(
      month.highlights,
      [vedicNotes.highlight, baziHighlight].filter(Boolean) as string[],
      3,
    );

    const cautions = mergeHighlights(
      month.cautions,
      [vedicNotes.caution].filter(Boolean) as string[],
      2,
    );

    const actionPieces = [month.action];
    if (numerologyAction) actionPieces.push(numerologyAction);
    if (vedic?.period) actionPieces.push(`Mahadasha: ${vedic.period}`);
    const action = actionPieces.join(" • ");

    const sources = new Set(month.sources);
    if (vedicNotes.highlight || vedicNotes.caution || vedic?.period) sources.add("vedic-dasha");
    if (numerologyAction) sources.add("numerology-cycles");
    if (baziHighlight) sources.add("bazi-pillar");

    entries.push({
      month: month.month,
      highlights,
      cautions,
      bestDays: month.bestDays,
      action,
      sources: Array.from(sources),
    });
  }

  return entries;
}
