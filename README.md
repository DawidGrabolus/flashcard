# Flashcard App (React + Vite)

## Supabase — tabela do zapisu progresu nauki

W Supabase dodaj tabelę **`study_progress`**.

### SQL (wklej w Supabase SQL Editor)

```sql
create table if not exists public.study_progress (
  id uuid primary key default gen_random_uuid(),
  deck_id uuid not null references public.flashcard_sets(id) on delete cascade,
  device_session_id text not null,
  mastered_card_ids text[] not null default '{}',
  round_queue int[] not null default '{}',
  remaining_queue int[] not null default '{}',
  mode text not null check (mode in ('flashcard', 'typing')),
  direction text not null check (direction in ('termToAnswer', 'answerToTerm')),
  updated_at timestamptz not null default now(),
  unique (deck_id, device_session_id)
);

create index if not exists idx_study_progress_deck_id
  on public.study_progress(deck_id);

create index if not exists idx_study_progress_updated_at
  on public.study_progress(updated_at desc);
```

### Co zapisuje ta tabela
- `deck_id` – która talia jest uczona.
- `device_session_id` – identyfikator urządzenia/przeglądarki (lokalna sesja użytkownika).
- `mastered_card_ids` – ID kart oznaczonych jako opanowane.
- `round_queue` – aktualna kolejka kart w rundzie.
- `remaining_queue` – karty czekające na kolejne rundy.
- `mode` – aktywny tryb (`flashcard` / `typing`).
- `direction` – kierunek nauki (`termToAnswer` / `answerToTerm`).
- `updated_at` – czas ostatniej aktualizacji progresu.
