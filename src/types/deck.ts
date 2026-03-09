import { Card } from "./card";
export type Deck = {
  id: string;
  name: string;
  cards: Card[];
  colorScheme: "primary" | "purple" | "amber" | "blue";
};
