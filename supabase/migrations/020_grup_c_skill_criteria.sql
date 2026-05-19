-- Grup C: Dynamic skill criteria for report cards, per branch

CREATE TABLE IF NOT EXISTS public.skill_criteria (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id    UUID NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
  key          TEXT NOT NULL,           -- used as skill_scores JSON key, e.g. "teknik_dasar"
  label        TEXT NOT NULL,           -- display name, e.g. "Teknik Dasar"
  description  TEXT,                    -- optional tooltip/hint
  sort_order   INTEGER NOT NULL DEFAULT 0,
  is_active    BOOLEAN NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT skill_criteria_branch_key UNIQUE (branch_id, key)
);

-- Seed default criteria for all existing branches
INSERT INTO public.skill_criteria (branch_id, key, label, sort_order)
SELECT b.id, v.key, v.label, v.sort_order
FROM public.branches b
CROSS JOIN (VALUES
  ('teknik_dasar',  'Teknik Dasar',      1),
  ('teknik_napas',  'Teknik Napas',      2),
  ('koordinasi',    'Koordinasi Gerak',  3),
  ('kecepatan',     'Kecepatan',         4),
  ('ketahanan',     'Ketahanan',         5),
  ('kedisiplinan',  'Kedisiplinan',      6)
) AS v(key, label, sort_order)
ON CONFLICT (branch_id, key) DO NOTHING;
