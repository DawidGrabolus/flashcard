import {
  clearStudyProgress,
  getStudyProgressByDeckAndDevice,
  getStudyProgressByDevice,
  upsertStudyProgress,
} from "../api/studyProgressRepository";
import {
  StudyDirection,
  StudyMode,
  StudyProgressPayload,
  StudyProgressRow,
} from "../../../types/studyProgress";

const STORAGE_KEY = "flashcard_device_session_id";

export type DeckProgressSummary = {
  deckId: string;
  masteredCards: number;
  progressPercent: number;
};

export function getOrCreateDeviceSessionId(): string {
  const stored = localStorage.getItem(STORAGE_KEY);

  if (stored) {
    return stored;
  }

  const created = crypto.randomUUID();
  localStorage.setItem(STORAGE_KEY, created);
  return created;
}

export async function loadStudyProgress(
  deckId: string,
  deviceSessionId: string,
): Promise<StudyProgressRow | null> {
  if (!deckId.trim()) {
    throw new Error("Deck id is required");
  }

  return getStudyProgressByDeckAndDevice(deckId, deviceSessionId);
}

export async function loadProgressSummaryByDevice(
  deviceSessionId: string,
  deckCardCounts: Record<string, number>,
): Promise<Record<string, DeckProgressSummary>> {
  const rows = await getStudyProgressByDevice(deviceSessionId);

  return rows.reduce<Record<string, DeckProgressSummary>>((acc, row) => {
    const cardsCount = deckCardCounts[row.deck_id] ?? 0;

    if (cardsCount <= 0) {
      return acc;
    }

    const masteredCards = row.mastered_card_ids.length;

    acc[row.deck_id] = {
      deckId: row.deck_id,
      masteredCards,
      progressPercent: Math.round((masteredCards / cardsCount) * 100),
    };

    return acc;
  }, {});
}

export async function saveStudyProgress(input: {
  deckId: string;
  deviceSessionId: string;
  masteredCardIds: string[];
  roundQueue: number[];
  remainingQueue: number[];
  mode: StudyMode;
  direction: StudyDirection;
}): Promise<void> {
  const payload: StudyProgressPayload = {
    deck_id: input.deckId,
    device_session_id: input.deviceSessionId,
    mastered_card_ids: input.masteredCardIds,
    round_queue: input.roundQueue,
    remaining_queue: input.remainingQueue,
    mode: input.mode,
    direction: input.direction,
  };

  await upsertStudyProgress(payload);
}

export async function resetStudyProgress(
  deckId: string,
  deviceSessionId: string,
): Promise<void> {
  await clearStudyProgress(deckId, deviceSessionId);
}
