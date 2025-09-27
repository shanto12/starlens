import seedrandom from "seedrandom";

export function createSeed(sequence: string) {
  return seedrandom(sequence);
}

export function pickFrom<T>(rng: seedrandom.PRNG, items: T[]): T {
  if (items.length === 0) {
    throw new Error("Cannot pick from empty array");
  }
  const index = Math.floor(rng() * items.length);
  return items[index];
}

export function shuffle<T>(rng: seedrandom.PRNG, items: T[]): T[] {
  const clone = [...items];
  for (let i = clone.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [clone[i], clone[j]] = [clone[j], clone[i]];
  }
  return clone;
}
