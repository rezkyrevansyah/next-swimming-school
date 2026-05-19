-- Grup D: Coach profile additions, suspension system, and leave system

-- 1. Tambah field profil tambahan ke coach_profiles
ALTER TABLE public.coach_profiles
  ADD COLUMN IF NOT EXISTS alamat            TEXT,
  ADD COLUMN IF NOT EXISTS pendidikan_nama   TEXT,
  ADD COLUMN IF NOT EXISTS pendidikan_tahun  INT,
  ADD COLUMN IF NOT EXISTS nomor_rekening    TEXT,
  ADD COLUMN IF NOT EXISTS nama_bank         TEXT,
  ADD COLUMN IF NOT EXISTS bio               TEXT;

-- 2. Tabel suspensi pelatih
CREATE TABLE IF NOT EXISTS public.coach_suspensions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id      UUID NOT NULL REFERENCES public.coaches(id) ON DELETE CASCADE,
  suspended_by  UUID NOT NULL REFERENCES auth.users(id),
  reason        TEXT,
  suspended_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resume_at     TIMESTAMPTZ NOT NULL,
  lifted_at     TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Tabel izin pelatih
CREATE TABLE IF NOT EXISTS public.coach_leaves (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id             UUID NOT NULL REFERENCES public.coaches(id) ON DELETE CASCADE,
  class_id             UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  leave_date           DATE NOT NULL,
  replacement_coach_id UUID NOT NULL REFERENCES public.coaches(id) ON DELETE CASCADE,
  reason               TEXT,
  is_read              BOOLEAN NOT NULL DEFAULT FALSE,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT coach_leaves_unique UNIQUE (coach_id, class_id, leave_date)
);
