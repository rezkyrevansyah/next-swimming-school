-- ============================================================================
-- M2.2 — SCHOOLS, MEMBERS, MEMBER_PROFILES, MEMBER_QR_TOKENS,
--         COACHES, COACH_BRANCHES, COACH_PROFILES, COACH_CERTIFICATES
-- Run AFTER 002_branches_roles.sql
-- ============================================================================

-- ----------------------------------------------------------------------------
-- SCHOOLS (Phase 2 use, but table created now so FK references work later)
-- ----------------------------------------------------------------------------
CREATE TABLE public.schools (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id       UUID NOT NULL REFERENCES public.branches(id) ON DELETE RESTRICT,
  name            TEXT NOT NULL,
  contact_person  TEXT,
  contact_phone   TEXT,
  address         TEXT,
  school_user_id  UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  deleted_at      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_schools_branch ON public.schools(branch_id);

-- ----------------------------------------------------------------------------
-- MEMBERS
-- ----------------------------------------------------------------------------
CREATE TABLE public.members (
  id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID         UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL,
  -- NULL allowed: affiliate members without an account (Phase 2)
  branch_id       UUID         NOT NULL REFERENCES public.branches(id) ON DELETE RESTRICT,
  member_id_code  TEXT         NOT NULL,
  type            member_type  NOT NULL DEFAULT 'regular',
  school_id       UUID         REFERENCES public.schools(id) ON DELETE SET NULL,
  payment_handling payment_handling NOT NULL DEFAULT 'individual',
  has_account     BOOLEAN      NOT NULL DEFAULT TRUE,
  status          member_status NOT NULL DEFAULT 'pending_payment',
  joined_date     DATE         NOT NULL DEFAULT CURRENT_DATE,
  deleted_at      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

  CONSTRAINT unique_member_code_per_branch UNIQUE (branch_id, member_id_code),
  CONSTRAINT affiliate_must_have_school CHECK (
    type != 'affiliate' OR school_id IS NOT NULL
  ),
  CONSTRAINT affiliate_payment_check CHECK (
    type != 'affiliate' OR payment_handling = 'covered_by_school'
  )
);

CREATE INDEX idx_members_user     ON public.members(user_id);
CREATE INDEX idx_members_branch   ON public.members(branch_id);
CREATE INDEX idx_members_status   ON public.members(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_members_type     ON public.members(type);

-- ----------------------------------------------------------------------------
-- MEMBER_PROFILES
-- ----------------------------------------------------------------------------
CREATE TABLE public.member_profiles (
  id          UUID  PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id   UUID  UNIQUE NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  full_name   TEXT  NOT NULL,
  nickname    TEXT,
  dob         DATE  NOT NULL,
  gender      TEXT  CHECK (gender IN ('male', 'female')),
  photo_url   TEXT,
  phone       TEXT,
  phone_owner phone_owner NOT NULL DEFAULT 'self',
  parent_name  TEXT,
  parent_phone TEXT,
  address     TEXT,
  health_history TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- MEMBER_QR_TOKENS (security-sensitive; short-lived rotating tokens)
-- ----------------------------------------------------------------------------
CREATE TABLE public.member_qr_tokens (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id  UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  token      TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_qr_tokens_token  ON public.member_qr_tokens(token);
CREATE INDEX idx_qr_tokens_member ON public.member_qr_tokens(member_id);
CREATE INDEX idx_qr_tokens_expiry ON public.member_qr_tokens(expires_at);

-- ----------------------------------------------------------------------------
-- COACHES
-- ----------------------------------------------------------------------------
CREATE TABLE public.coaches (
  id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID         UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  coach_id_code   TEXT         NOT NULL UNIQUE,
  status          coach_status NOT NULL DEFAULT 'active',
  deleted_at      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_coaches_user ON public.coaches(user_id);

-- ----------------------------------------------------------------------------
-- COACH_BRANCHES (M2M: a coach can teach at multiple branches in Phase 2)
-- ----------------------------------------------------------------------------
CREATE TABLE public.coach_branches (
  coach_id    UUID NOT NULL REFERENCES public.coaches(id)  ON DELETE CASCADE,
  branch_id   UUID NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
  is_primary  BOOLEAN NOT NULL DEFAULT FALSE,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (coach_id, branch_id)
);

CREATE INDEX idx_coach_branches_branch  ON public.coach_branches(branch_id);
CREATE INDEX idx_coach_branches_primary ON public.coach_branches(coach_id) WHERE is_primary = TRUE;

-- ----------------------------------------------------------------------------
-- COACH_PROFILES
-- ----------------------------------------------------------------------------
CREATE TABLE public.coach_profiles (
  id              UUID   PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id        UUID   UNIQUE NOT NULL REFERENCES public.coaches(id) ON DELETE CASCADE,
  full_name       TEXT   NOT NULL,
  nickname        TEXT,
  dob             DATE,
  gender          TEXT   CHECK (gender IN ('male', 'female')),
  photo_url       TEXT,
  phone           TEXT,
  specializations TEXT[] DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- COACH_CERTIFICATES
-- ----------------------------------------------------------------------------
CREATE TABLE public.coach_certificates (
  id              UUID               PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id        UUID               NOT NULL REFERENCES public.coaches(id) ON DELETE CASCADE,
  name            TEXT               NOT NULL,
  photo_url       TEXT,
  issued_year     INT,
  valid_until     DATE,
  no_expiry       BOOLEAN            NOT NULL DEFAULT FALSE,
  approval_status certificate_status NOT NULL DEFAULT 'pending_approval',
  approved_by     UUID               REFERENCES auth.users(id) ON DELETE SET NULL,
  approved_at     TIMESTAMPTZ,
  approval_notes  TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT valid_year CHECK (
    issued_year IS NULL
    OR (issued_year >= 1970 AND issued_year <= EXTRACT(YEAR FROM NOW())::INT + 1)
  )
);

CREATE INDEX idx_certs_coach  ON public.coach_certificates(coach_id);
CREATE INDEX idx_certs_status ON public.coach_certificates(approval_status);

-- ============================================================================
-- ROLLBACK:
-- DROP TABLE IF EXISTS public.coach_certificates CASCADE;
-- DROP TABLE IF EXISTS public.coach_profiles CASCADE;
-- DROP TABLE IF EXISTS public.coach_branches CASCADE;
-- DROP TABLE IF EXISTS public.coaches CASCADE;
-- DROP TABLE IF EXISTS public.member_qr_tokens CASCADE;
-- DROP TABLE IF EXISTS public.member_profiles CASCADE;
-- DROP TABLE IF EXISTS public.members CASCADE;
-- DROP TABLE IF EXISTS public.schools CASCADE;
-- ============================================================================
