-- ============================================================================
-- M2.5 — RLS POLICY: Anonymous Self-Registration
--
-- Allows unauthenticated (anon) users to insert into members and
-- member_profiles during self-registration flow (/daftar/member).
--
-- Security constraints:
--   - Only status = 'pending_payment' is allowed for anon inserts
--   - Only branches that are active can be selected (enforced on app layer
--     + existing branches_anon_select policy)
--   - No SELECT/UPDATE/DELETE for anon on members (read via admin approval)
-- ============================================================================

-- Allow anon to INSERT a member with status = pending_payment only
CREATE POLICY "members_anon_self_register" ON public.members
FOR INSERT TO anon
WITH CHECK (
  status = 'pending_payment'
  AND user_id IS NULL
);

-- Allow anon to INSERT a member_profile for an existing pending member
-- (member_id must reference a row that was just created in same request)
CREATE POLICY "member_profiles_anon_self_register" ON public.member_profiles
FOR INSERT TO anon
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.members m
    WHERE m.id = member_profiles.member_id
      AND m.status = 'pending_payment'
      AND m.user_id IS NULL
  )
);
