-- Run this in your Supabase project: Dashboard → SQL Editor → New query

-- ── Tables ───────────────────────────────────────────────────────────────────

CREATE TABLE public.habits (
  id           TEXT PRIMARY KEY,
  user_id      UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name         TEXT NOT NULL,
  icon         TEXT NOT NULL DEFAULT '⭐',
  type         TEXT NOT NULL DEFAULT 'binary',
  target_count INTEGER NOT NULL DEFAULT 1,
  completions  JSONB NOT NULL DEFAULT '{}',
  created_at   TEXT,
  reminder_hour   INTEGER,
  reminder_minute INTEGER,
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.challenges (
  id             TEXT PRIMARY KEY,
  user_id        UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  template_id    TEXT,
  habit_id       TEXT,
  start_date     TEXT NOT NULL,
  status         TEXT NOT NULL DEFAULT 'active',
  completed_date TEXT,
  is_custom      BOOLEAN DEFAULT FALSE,
  title          TEXT,
  description    TEXT,
  icon           TEXT,
  type           TEXT,
  target         INTEGER,
  xp_reward      INTEGER,
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.profiles (
  user_id    UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  xp         INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Row Level Security ────────────────────────────────────────────────────────

ALTER TABLE public.habits     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles   ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own habits"
  ON public.habits FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users manage own challenges"
  ON public.challenges FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users manage own profile"
  ON public.profiles FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
