import { Deck } from "./deck";

export type StudyMode = "flashcard" | "typing";
export type StudyDirection = "termToAnswer" | "answerToTerm";

export type StudyProgressRow = {
  id: string;
  deck_id: Deck["id"];
  device_session_id: string;
  mastered_card_ids: string[];
  round_queue: number[];
  remaining_queue: number[];
  mode: StudyMode;
  direction: StudyDirection;
  updated_at: string;
};

export type StudyProgressPayload = Omit<StudyProgressRow, "id" | "updated_at">;
