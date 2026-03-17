import { FlashCard } from "./flashCard";
export type Deck = {
  id: string;
  name: string;
  cards: FlashCard[];
  created_at?: string;
  cover_key?: string | null;
};
