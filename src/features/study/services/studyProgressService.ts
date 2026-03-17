import {
  clearStudyProgress,
  getStudyProgressByDeckAndDevice,
  upsertStudyProgress,
} from "../api/studyProgressRepository";
import {
  StudyDirection,
  StudyMode,
  StudyProgressPayload,
  StudyProgressRow,
} from "../../../types/studyProgress";

const STORAGE_KEY = "flashcard_device_session_id";

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
