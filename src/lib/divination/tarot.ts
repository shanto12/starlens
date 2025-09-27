import seedrandom from "seedrandom";

const cards = [
  "The Fool",
  "The Magician",
  "The High Priestess",
  "The Empress",
  "The Emperor",
  "The Hierophant",
  "The Lovers",
  "The Chariot",
  "Strength",
  "The Hermit",
  "Wheel of Fortune",
  "Justice",
  "The Hanged Man",
  "Death",
  "Temperance",
  "The Devil",
  "The Tower",
  "The Star",
  "The Moon",
  "The Sun",
  "Judgement",
  "The World",
];

export type TarotSpread = {
  cards: string[];
  summary: string;
};

export function drawTarot(question: string, referenceDate: string): TarotSpread {
  const rng = seedrandom(`${question}-${referenceDate}`);
  const spread = [] as string[];
  const available = [...cards];

  for (let i = 0; i < 3; i += 1) {
    const index = Math.floor(rng() * available.length);
    spread.push(available.splice(index, 1)[0]);
  }

  const summary =
    "The cards point to steady progress through intentional action and grounded communication.";

  return { cards: spread, summary };
}
