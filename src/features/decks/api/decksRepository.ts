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

export async function getDeckById(id: string): Promise<Deck | null> {
  const { data, error } = await supabase
    .from("flashcard_sets")
    .select("*, cards(*)")
    .eq("id", id)
    .single();

  if (error) {
    throw error;
  }

  return (data as Deck) || null;
}

export async function updateDeckName(
  id: string,
  newName: string,
): Promise<void> {
  const { error } = await supabase
    .from("flashcard_sets")
    .update({ name: newName })
    .eq("id", id);
}

export async function deleteCards(id: string): Promise<void> {
  const { error } = await supabase.from("cards").delete().eq("set_id", id);
}

export async function deleteDeck(id: string): Promise<void> {
  await deleteCards(id);
  const { error } = await supabase.from("flashcard_sets").delete().eq("id", id);
}
