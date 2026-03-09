import { Deck } from "../../../types/deck";

export type CreateDeckInput = {
  name: string;
  colorScheme: Deck["colorScheme"];
  cards: Array<{
    term: string;
    answer: string;
  }>;
};
