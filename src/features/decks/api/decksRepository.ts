import { supabase } from "../../../api/supabaseClient";
import { Card } from "../../../types/card";
import { Deck } from "../../../types/deck";

export type NewDeckPayload = Pick<Deck, "name">;
export type NewCardPayload = Pick<Card, "term" | "answer">;

export async function getDecks(): Promise<Deck[]> {
  const { data, error } = await supabase
    .from("flashcard_sets")
    .select("*, cards(*)")
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []) as Deck[];
}

export async function insertDeck(
  input: NewDeckPayload,
): Promise<{ id: string }> {
  const { data, error } = await supabase
    .from("flashcard_sets")
    .insert({ name: input.name })
    .select("id")
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function insertCards(
  deckId: string,
  cards: NewCardPayload[],
): Promise<void> {
  if (cards.length === 0) {
    return;
  }

  const cardsToInsert = cards.map((card) => ({
    set_id: deckId,
    term: card.term,
    answer: card.answer,
  }));

  const { error } = await supabase.from("cards").insert(cardsToInsert);

  if (error) {
    throw error;
  }
}
