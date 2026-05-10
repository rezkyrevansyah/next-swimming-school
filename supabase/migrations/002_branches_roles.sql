-- ============================================================================
-- M2.1 — BRANCHES, ROLES, PERMISSIONS, USER_ROLES
-- Run AFTER 001_enums.sql
-- ============================================================================

-- ----------------------------------------------------------------------------
-- BRANCHES
-- Note: manager_id FK to auth.users added AFTER roles/user_roles to avoid
-- circular dependency issues. The column is added at the end of this file.
-- ----------------------------------------------------------------------------
CREATE TABLE public.branches (
  id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT         NOT NULL,
  slug        TEXT         UNIQUE NOT NULL,
  address     TEXT,
  location_lat  DECIMAL(10, 7),
  location_lng  DECIMAL(10, 7),
  contact_phone TEXT,
  contact_email TEXT,
  manager_id  UUID,        -- FK added below (avoids circular reference)
  is_default  BOOLEAN      NOT NULL DEFAULT FALSE,
  status      branch_status NOT NULL DEFAULT 'active',
  deleted_at  TIMESTAMPTZ,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_branches_status  ON public.branches(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_branches_default ON public.branches(is_default) WHERE is_default = TRUE;

-- ----------------------------------------------------------------------------
-- ROLES, PERMISSIONS, ROLE_PERMISSIONS
-- ----------------------------------------------------------------------------
CREATE TABLE public.roles (
  id          UUID  PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT  UNIQUE NOT NULL,
  description TEXT,
  level       INT   NOT NULL,  -- higher = more permission
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.permissions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource    TEXT NOT NULL,  -- e.g. 'members', 'classes'
  action      TEXT NOT NULL,  -- e.g. 'create', 'read', 'update', 'delete'
  description TEXT,
  UNIQUE (resource, action)
);

CREATE TABLE public.role_permissions (
  role_id       UUID REFERENCES public.roles(id)       ON DELETE CASCADE,
  permission_id UUID REFERENCES public.permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);

-- ----------------------------------------------------------------------------
-- USER_ROLES
-- branch_id NULL = global access (owner role)
--
-- PRIMARY KEY cannot contain nullable columns in Postgres.
-- Instead: surrogate PK + UNIQUE NULLS NOT DISTINCT (Postgres 15+)
-- which treats NULLs as equal, preventing duplicate (user, role, NULL) rows.
-- ----------------------------------------------------------------------------
CREATE TABLE public.user_roles (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id   UUID NOT NULL REFERENCES auth.users(id)      ON DELETE CASCADE,
  role_id   UUID NOT NULL REFERENCES public.roles(id)    ON DELETE CASCADE,
  branch_id UUID          REFERENCES public.branches(id) ON DELETE CASCADE,
  -- NULL branch_id = global (owner); non-null = branch-scoped
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enforce uniqueness: one row per (user, role, branch) — NULLs treated as equal
CREATE UNIQUE INDEX idx_user_roles_unique
  ON public.user_roles (user_id, role_id, branch_id)
  NULLS NOT DISTINCT;

CREATE INDEX idx_user_roles_user   ON public.user_roles(user_id);
CREATE INDEX idx_user_roles_branch ON public.user_roles(branch_id);

-- ----------------------------------------------------------------------------
-- Add FK from branches.manager_id now that auth.users exists (always did)
-- and user_roles is defined
-- ----------------------------------------------------------------------------
ALTER TABLE public.branches
  ADD CONSTRAINT fk_branches_manager
  FOREIGN KEY (manager_id) REFERENCES auth.users(id) ON DELETE SET NULL;

-- ----------------------------------------------------------------------------
-- SEED ROLES
-- ----------------------------------------------------------------------------
INSERT INTO public.roles (name, description, level) VALUES
  ('owner',   'Full system access across all branches',                  100),
  ('manager', 'Branch-level manager with admin oversight',               80),
  ('admin',   'Daily operations admin within a branch',                  60),
  ('coach',   'Swimming coach with class access',                        40),
  ('member',  'Swimming school student or parent',                       20),
  ('school',  'Affiliated school read-only access (Phase 2)',            30);

-- ============================================================================
-- ROLLBACK:
-- DROP TABLE IF EXISTS public.user_roles CASCADE;
-- DROP TABLE IF EXISTS public.role_permissions CASCADE;
-- DROP TABLE IF EXISTS public.permissions CASCADE;
-- DROP TABLE IF EXISTS public.roles CASCADE;
-- ALTER TABLE public.branches DROP CONSTRAINT IF EXISTS fk_branches_manager;
-- DROP TABLE IF EXISTS public.branches CASCADE;
-- ============================================================================
