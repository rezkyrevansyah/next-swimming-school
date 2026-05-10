-- ============================================================================
-- M2.3 — CLASSES, CLASS_SCHEDULES, CLASS_COACHES, CLASS_MEMBERS,
--         ATTENDANCE_RECORDS, COACH_CLOCK_RECORDS, ACTIVITY_LOGS,
--         UPDATE TIMESTAMP TRIGGER
-- Run AFTER 003_members_coaches.sql
-- ============================================================================

-- ----------------------------------------------------------------------------
-- CLASSES
-- ----------------------------------------------------------------------------
CREATE TABLE public.classes (
  id               UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id        UUID         NOT NULL REFERENCES public.branches(id) ON DELETE RESTRICT,
  name             TEXT         NOT NULL,
  slug             TEXT         NOT NULL,
  description      TEXT,
  age_range_min    INT,
  age_range_max    INT,
  monthly_price    DECIMAL(12, 2) NOT NULL DEFAULT 0,
  sessions_per_month INT        NOT NULL DEFAULT 4,
  capacity         INT          NOT NULL DEFAULT 10,
  location_lat     DECIMAL(10, 7),
  location_lng     DECIMAL(10, 7),
  location_name    TEXT,
  status           class_status NOT NULL DEFAULT 'active',
  deleted_at       TIMESTAMPTZ,
  created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

  CONSTRAINT positive_price     CHECK (monthly_price >= 0),
  CONSTRAINT positive_capacity  CHECK (capacity > 0),
  CONSTRAINT positive_sessions  CHECK (sessions_per_month > 0),
  CONSTRAINT valid_age_range    CHECK (
    age_range_min IS NULL
    OR age_range_max IS NULL
    OR age_range_min <= age_range_max
  ),
  CONSTRAINT unique_slug_per_branch UNIQUE (branch_id, slug)
);

CREATE INDEX idx_classes_branch ON public.classes(branch_id);
CREATE INDEX idx_classes_status ON public.classes(status) WHERE deleted_at IS NULL;

-- ----------------------------------------------------------------------------
-- CLASS_SCHEDULES
-- day_of_week: 0 = Sunday, 1 = Monday, ... 6 = Saturday
-- ----------------------------------------------------------------------------
CREATE TABLE public.class_schedules (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id     UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  day_of_week  INT  NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time   TIME NOT NULL,
  end_time     TIME NOT NULL,

  CONSTRAINT valid_time_range CHECK (end_time > start_time)
);

CREATE INDEX idx_schedules_class ON public.class_schedules(class_id);
CREATE INDEX idx_schedules_dow   ON public.class_schedules(day_of_week);

-- ----------------------------------------------------------------------------
-- CLASS_COACHES (M2M)
-- ----------------------------------------------------------------------------
CREATE TABLE public.class_coaches (
  class_id    UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  coach_id    UUID NOT NULL REFERENCES public.coaches(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (class_id, coach_id)
);

CREATE INDEX idx_class_coaches_coach ON public.class_coaches(coach_id);

-- ----------------------------------------------------------------------------
-- CLASS_MEMBERS (M2M)
-- ----------------------------------------------------------------------------
CREATE TABLE public.class_members (
  class_id   UUID NOT NULL REFERENCES public.classes(id)  ON DELETE CASCADE,
  member_id  UUID NOT NULL REFERENCES public.members(id)  ON DELETE CASCADE,
  joined_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status     TEXT NOT NULL DEFAULT 'enrolled'
             CHECK (status IN ('enrolled', 'completed', 'withdrawn')),
  PRIMARY KEY (class_id, member_id)
);

CREATE INDEX idx_class_members_member ON public.class_members(member_id);

-- ----------------------------------------------------------------------------
-- ATTENDANCE_RECORDS
-- ----------------------------------------------------------------------------
CREATE TABLE public.attendance_records (
  id                   UUID             PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id            UUID             NOT NULL REFERENCES public.members(id)  ON DELETE RESTRICT,
  class_id             UUID             NOT NULL REFERENCES public.classes(id)  ON DELETE RESTRICT,
  branch_id            UUID             NOT NULL REFERENCES public.branches(id) ON DELETE RESTRICT,
  session_date         DATE             NOT NULL,
  status               attendance_status NOT NULL,
  recorded_by_coach_id UUID             REFERENCES public.coaches(id) ON DELETE SET NULL,
  scanned_at           TIMESTAMPTZ,
  scan_method          scan_method      NOT NULL DEFAULT 'manual',
  notes                TEXT,
  created_at           TIMESTAMPTZ      NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ      NOT NULL DEFAULT NOW(),

  -- Prevent duplicate records for same member + class + date
  CONSTRAINT unique_attendance UNIQUE (member_id, class_id, session_date)
);

CREATE INDEX idx_attendance_member     ON public.attendance_records(member_id);
CREATE INDEX idx_attendance_class_date ON public.attendance_records(class_id, session_date);
CREATE INDEX idx_attendance_branch     ON public.attendance_records(branch_id);
CREATE INDEX idx_attendance_date       ON public.attendance_records(session_date);

-- ----------------------------------------------------------------------------
-- COACH_CLOCK_RECORDS
-- One clock-in per coach per branch per calendar day.
-- ----------------------------------------------------------------------------
CREATE TABLE public.coach_clock_records (
  id                    UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id              UUID        NOT NULL REFERENCES public.coaches(id)  ON DELETE RESTRICT,
  branch_id             UUID        NOT NULL REFERENCES public.branches(id) ON DELETE RESTRICT,
  clock_in_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- Explicit DATE column so we can put a plain UNIQUE constraint on it.
  -- Stored as UTC date; application should pass the correct local date.
  clock_in_date         DATE        NOT NULL DEFAULT CURRENT_DATE,
  clock_in_selfie_url   TEXT,
  clock_in_lat          DECIMAL(10, 7),
  clock_in_lng          DECIMAL(10, 7),
  clock_in_distance_m   DECIMAL(10, 2),  -- distance from branch location
  clock_in_accuracy     DECIMAL(10, 2),  -- GPS accuracy in metres
  ip_address            INET,
  user_agent            TEXT,
  suspicious_flag       BOOLEAN     NOT NULL DEFAULT FALSE,
  notes                 TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT unique_clock_per_day UNIQUE (coach_id, branch_id, clock_in_date),
  CONSTRAINT positive_distance    CHECK (clock_in_distance_m IS NULL OR clock_in_distance_m >= 0)
);

CREATE INDEX idx_clock_coach       ON public.coach_clock_records(coach_id);
CREATE INDEX idx_clock_branch_date ON public.coach_clock_records(branch_id, clock_in_at);

-- ----------------------------------------------------------------------------
-- ACTIVITY_LOGS (append-only audit trail)
-- ----------------------------------------------------------------------------
CREATE TABLE public.activity_logs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID REFERENCES auth.users(id)    ON DELETE SET NULL,
  branch_id     UUID REFERENCES public.branches(id) ON DELETE SET NULL,
  action        TEXT NOT NULL,          -- e.g. 'create', 'update', 'soft_delete'
  resource_type TEXT NOT NULL,          -- e.g. 'member', 'class'
  resource_id   UUID,
  metadata      JSONB,                  -- extra context (old/new values, etc.)
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_logs_user     ON public.activity_logs(user_id);
CREATE INDEX idx_logs_branch   ON public.activity_logs(branch_id);
CREATE INDEX idx_logs_resource ON public.activity_logs(resource_type, resource_id);
CREATE INDEX idx_logs_created  ON public.activity_logs(created_at DESC);

-- ----------------------------------------------------------------------------
-- UPDATE TIMESTAMP TRIGGER
-- Applied to all tables that have an updated_at column.
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.branches
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.schools
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.members
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.member_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.coaches
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.coach_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.coach_certificates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.classes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.attendance_records
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================================================
-- ROLLBACK:
-- DROP TABLE IF EXISTS public.activity_logs CASCADE;
-- DROP TABLE IF EXISTS public.coach_clock_records CASCADE;
-- DROP TABLE IF EXISTS public.attendance_records CASCADE;
-- DROP TABLE IF EXISTS public.class_members CASCADE;
-- DROP TABLE IF EXISTS public.class_coaches CASCADE;
-- DROP TABLE IF EXISTS public.class_schedules CASCADE;
-- DROP TABLE IF EXISTS public.classes CASCADE;
-- DROP FUNCTION IF EXISTS public.update_updated_at CASCADE;
-- ============================================================================
