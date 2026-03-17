BEGIN;

-- 1) Cover obrazka decku (wymagane przez aktualny kod frontendu)
ALTER TABLE public.flashcard_sets
  ADD COLUMN IF NOT EXISTS cover_key text;

-- 2) Walidacja dozwolonych wartości covera
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'flashcard_sets_cover_key_check'
  ) THEN
    ALTER TABLE public.flashcard_sets
      ADD CONSTRAINT flashcard_sets_cover_key_check
      CHECK (
        cover_key IS NULL
        OR cover_key IN ('cover1', 'cover2', 'cover3', 'cover4', 'cover5', 'cover6')
      );
  END IF;
END $$;

-- 3) Backfill istniejących rekordów (deterministycznie po id)
UPDATE public.flashcard_sets
SET cover_key = (
  ARRAY['cover1', 'cover2', 'cover3', 'cover4', 'cover5', 'cover6']
)[1 + (ABS(hashtext(id::text)) % 6)]
WHERE cover_key IS NULL;

-- 4) (Opcjonalnie) historia testów z decku
CREATE TABLE IF NOT EXISTS public.deck_tests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deck_id uuid NOT NULL REFERENCES public.flashcard_sets(id) ON DELETE CASCADE,
  device_session_id text,
  question_count integer NOT NULL CHECK (question_count > 0),
  correct_count integer NOT NULL CHECK (correct_count >= 0),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_deck_tests_deck_id_created_at
  ON public.deck_tests(deck_id, created_at DESC);

COMMIT;
