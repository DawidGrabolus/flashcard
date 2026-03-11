import { PostgrestError } from "@supabase/supabase-js";
import { Deck } from "../../../types/deck";
import {
  getDecks as getDecksFromRepo,
  getDeckById as getDeckByIdFromRepo,
  insertCards as insertCardsFromRepo,
  insertDeck as insertDeckFromRepo,
  updateDeckName as updateDeckNameFromRepo,
  deleteCards as deleteCardsFromRepo,
  deleteDeck as deleteDeckFromRepo,
  NewCardPayload,
  NewDeckPayload,
} from "../api/decksRepository";

export type CreateDeckInput = NewDeckPayload & {
  cards: NewCardPayload[];
};
export type UpdateDeckInput = {
  deckId: string;
  name: string;
  cards: NewCardPayload[];
};

export async function fetchDecks(): Promise<Deck[]> {
  return getDecksFromRepo();
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

  const createdDeck = await insertDeckFromRepo({
    name: sanitizedName,
  });

  try {
    await insertCardsFromRepo(createdDeck.id, sanitizedCards);
  } catch (error) {
    const typedError = error as PostgrestError;
    throw new Error(
      `Deck created, but cards failed to save: ${typedError.message}`,
    );
  }

  return createdDeck.id;
}

export async function getDeckById(id: string): Promise<Deck | null> {
  if (typeof id !== "string" || !id.trim()) {
    throw new Error("Deck id is required and must be a non-empty string.");
  }

  const safeId = id.trim();

  try {
    const deck = await getDeckByIdFromRepo(safeId);

    if (!deck) {
      return null; // Może być 404 w logice wyższej warstwy
    }

    if (!deck.name || !deck.name.trim()) {
      throw new Error("Invalid deck data retrieved from DB: missing name.");
    }

    return deck;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    throw new Error(`Failed to fetch deck by id: ${message}`);
  }
}

export async function editDeck(input: UpdateDeckInput): Promise<void> {
  await updateDeckNameFromRepo(input.deckId, input.name.trim());
  await deleteCardsFromRepo(input.deckId);
  await insertCardsFromRepo(input.deckId, input.cards);
}

export async function deleteDeck(id: string): Promise<void> {
  await deleteDeckFromRepo(id);
}
