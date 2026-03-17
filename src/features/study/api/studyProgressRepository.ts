import { supabase } from "../../../api/supabaseClient";
import { StudyProgressPayload, StudyProgressRow } from "../../../types/studyProgress";

const TABLE_NAME = "study_progress";

export async function getStudyProgressByDeckAndDevice(
  deckId: string,
  deviceSessionId: string,
): Promise<StudyProgressRow | null> {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select("*")
    .eq("deck_id", deckId)
    .eq("device_session_id", deviceSessionId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data as StudyProgressRow | null;
}

export async function getStudyProgressByDevice(
  deviceSessionId: string,
): Promise<StudyProgressRow[]> {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select("*")
    .eq("device_session_id", deviceSessionId);

  if (error) {
    throw error;
  }

  return (data ?? []) as StudyProgressRow[];
}

export async function upsertStudyProgress(
  payload: StudyProgressPayload,
): Promise<void> {
  const { error } = await supabase.from(TABLE_NAME).upsert(payload, {
    onConflict: "deck_id,device_session_id",
  });

  if (error) {
    throw error;
  }
}

export async function clearStudyProgress(
  deckId: string,
  deviceSessionId: string,
): Promise<void> {
  const { error } = await supabase
    .from(TABLE_NAME)
    .delete()
    .eq("deck_id", deckId)
    .eq("device_session_id", deviceSessionId);

  if (error) {
    throw error;
  }
}
