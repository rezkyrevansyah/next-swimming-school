-- ============================================================================
-- M2.4 — PERFORMANCE INDEXES FOR RLS
-- Run AFTER 006_rls_policies.sql
--
-- RLS helper functions touch these columns on every query.
-- Without indexes, Postgres does sequential scans on every row-level check.
-- Source: PERMISSION_MATRIX.md §8
-- ============================================================================

-- user_roles: looked up on every auth.user_role(), auth.is_owner(), etc.
CREATE INDEX IF NOT EXISTS idx_user_roles_user   ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_branch ON public.user_roles(branch_id);

-- members: looked up by user_id in RLS for member self-access
CREATE INDEX IF NOT EXISTS idx_members_user_id   ON public.members(user_id);
CREATE INDEX IF NOT EXISTS idx_members_branch_id ON public.members(branch_id);

-- coaches: looked up by user_id in RLS for coach self-access
CREATE INDEX IF NOT EXISTS idx_coaches_user_id ON public.coaches(user_id);

-- coach_branches: looked up in coaches RLS and coach_branches RLS
CREATE INDEX IF NOT EXISTS idx_coach_branches_coach_branch ON public.coach_branches(coach_id, branch_id);

-- class_coaches: looked up in auth.is_coach_of_class() and various policies
CREATE INDEX IF NOT EXISTS idx_class_coaches_coach ON public.class_coaches(coach_id);

-- class_members: looked up in member self-access and coach's class member list
CREATE INDEX IF NOT EXISTS idx_class_members_member ON public.class_members(member_id);

-- attendance_records: high-volume table; compound index for common queries
CREATE INDEX IF NOT EXISTS idx_attendance_member     ON public.attendance_records(member_id);
CREATE INDEX IF NOT EXISTS idx_attendance_class_date ON public.attendance_records(class_id, session_date);

-- ============================================================================
-- These indexes duplicate some created in earlier migrations.
-- IF NOT EXISTS ensures they are idempotent (safe to run multiple times).
-- ============================================================================
