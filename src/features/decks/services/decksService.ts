import { PostgrestError } from "@supabase/supabase-js";
import { Deck } from "../../../types/deck";
import { getDecks, insertCards, insertDeck } from "../api/decksRepository";
import { CreateDeckInput } from "../types/deckContracts";

export async function fetchDecks(): Promise<Deck[]> {
  return getDecks();
}

export async function createDeck(input: CreateDeckInput): Promise<string> {
  const sanitizedName = input.name.trim();
  const sanitizedCards = input.cards
    .map((card) => ({
      term: card.term.trim(),
      answer: card.answer.trim(),
    }))
    .filter((card) => card.term.length > 0 && card.answer.length > 0);

  if (!sanitizedName) {
    throw new Error("Deck name is required");
  }

  const createdDeck = await insertDeck({
    name: sanitizedName,
    colorScheme: input.colorScheme,
    cards: [],
  });

  try {
    await insertCards(createdDeck.id, sanitizedCards);
  } catch (error) {
    const typedError = error as PostgrestError;
    throw new Error(`Deck created, but cards failed to save: ${typedError.message}`);
  }

  return createdDeck.id;
}
