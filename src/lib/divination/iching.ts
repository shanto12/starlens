import seedrandom from "seedrandom";

const hexagrams = [
  {
    id: 1,
    name: "Creative Force",
    message: "Lead with clarity and endurance; align actions with long term vision.",
  },
  {
    id: 2,
    name: "Receptive Field",
    message: "Stay open and adaptable; collaborations bring momentum.",
  },
  {
    id: 46,
    name: "Pushing Upward",
    message: "Steady steps upward. Celebrate incremental wins and honor mentors.",
  },
];

export type IChingReading = {
  hexagram: number;
  name: string;
  message: string;
};

export function castIChing(question: string, referenceDate: string): IChingReading {
  const rng = seedrandom(`${question}-${referenceDate}`);
  const choice = hexagrams[Math.floor(rng() * hexagrams.length)];
  return choice;
}
