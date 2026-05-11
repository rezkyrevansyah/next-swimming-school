-- ============================================================================
-- Migration 013: Add password_changed_at to members and coaches
-- Tracks when admin last reset a user's password from the admin panel.
-- ============================================================================

ALTER TABLE public.members
  ADD COLUMN IF NOT EXISTS password_changed_at timestamptz DEFAULT NULL;

ALTER TABLE public.coaches
  ADD COLUMN IF NOT EXISTS password_changed_at timestamptz DEFAULT NULL;
