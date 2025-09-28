import type { ReadingContext, WesternProfile } from "@/lib/types/reading";
import { scanTransits, type TransitModel } from "@/lib/astrology/transits";

export type WesternCalculation = {
  profile: WesternProfile;
  transits: TransitModel;
};

export function generateWesternProfile(
  context: ReadingContext,
  existingTransits?: TransitModel,
): WesternCalculation {
  const transits = existingTransits ?? scanTransits(context);

  const profile: WesternProfile = {
    themes: transits.themes,
    windows: transits.windows,
  };

  return { profile, transits };
}
