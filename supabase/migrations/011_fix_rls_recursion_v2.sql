-- ============================================================================
-- FIX v2: RLS Infinite Recursion — remaining chains not fixed by 010
--
-- Root causes still active after 010:
--   1. members_select → class_members → classes → class_members (loop)
--   2. coaches_select → class_members → classes → class_members (loop)
--   3. coach_branches_select: coaches sub-query triggers coaches_select
--      which loops back through class_members
--   4. member_profiles_select / coach_profiles_select inherit same problem
--
-- Fix strategy:
--   - Add SECURITY DEFINER helper: user_coaches_class_ids() — get class IDs
--     for current coach without triggering RLS
--   - Add SECURITY DEFINER helper: user_member_class_ids() — get class IDs
--     for current member without triggering RLS
--   - Rewrite members_select, coaches_select, coach_branches_select,
--     member_profiles_select, coach_profiles_select to use helpers only
--   - All sub-selects must go through SECURITY DEFINER functions,
--     never raw cross-table queries inside policies
-- ============================================================================

-- ============================================================================
-- §1  Drop all affected policies
-- ============================================================================
DROP POLICY IF EXISTS "members_select"          ON public.members;
DROP POLICY IF EXISTS "coaches_select"          ON public.coaches;
DROP POLICY IF EXISTS "coach_branches_select"   ON public.coach_branches;
DROP POLICY IF EXISTS "member_profiles_select"  ON public.member_profiles;
DROP POLICY IF EXISTS "member_profiles_modify"  ON public.member_profiles;
DROP POLICY IF EXISTS "coach_profiles_select"   ON public.coach_profiles;
DROP POLICY IF EXISTS "coach_profiles_modify"   ON public.coach_profiles;

-- ============================================================================
-- §2  New SECURITY DEFINER helpers
-- ============================================================================

-- Is the current user a coach in a given branch?
-- Used to avoid coaches_select → coach_branches_select recursion
CREATE OR REPLACE FUNCTION public.current_user_coach_id()
RETURNS UUID
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT id FROM public.coaches WHERE user_id = auth.uid() LIMIT 1;
$$;

-- TRUE if a coach (by internal id) is assigned to a branch
CREATE OR REPLACE FUNCTION public.coach_is_in_branch(target_coach_id UUID, target_branch_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.coach_branches
    WHERE coach_id = target_coach_id
      AND branch_id = target_branch_id
  );
$$;

-- TRUE if a member (by internal id) is in any of the current coach's classes
CREATE OR REPLACE FUNCTION public.coach_has_member(target_member_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.class_members cm
    JOIN public.class_coaches cc ON cc.class_id = cm.class_id
    WHERE cm.member_id = target_member_id
      AND cc.coach_id = public.current_user_coach_id()
  );
$$;

-- TRUE if a coach (by internal id) teaches any member of the current user
CREATE OR REPLACE FUNCTION public.member_has_coach(target_coach_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.class_coaches cc
    JOIN public.class_members cm ON cm.class_id = cc.class_id
    JOIN public.members m ON m.id = cm.member_id
    WHERE cc.coach_id = target_coach_id
      AND m.user_id = auth.uid()
  );
$$;

-- ============================================================================
-- §3  members_select — no cross-table RLS triggers
-- ============================================================================
CREATE POLICY "members_select" ON public.members
FOR SELECT TO authenticated
USING (
  user_id = auth.uid()
  OR public.is_owner()
  OR (public.is_admin() AND branch_id = public.user_branch_id())
  OR public.coach_has_member(id)
);

-- ============================================================================
-- §4  coaches_select — no cross-table RLS triggers
-- ============================================================================
CREATE POLICY "coaches_select" ON public.coaches
FOR SELECT TO authenticated
USING (
  user_id = auth.uid()
  OR public.is_owner()
  OR (
    public.is_admin()
    AND public.coach_is_in_branch(id, public.user_branch_id())
  )
  OR public.member_has_coach(id)
);

-- ============================================================================
-- §5  coach_branches_select — no raw coaches sub-query (use uid directly)
-- ============================================================================
CREATE POLICY "coach_branches_select" ON public.coach_branches
FOR SELECT TO authenticated
USING (
  public.is_admin()
  OR coach_id = public.current_user_coach_id()
);

-- ============================================================================
-- §6  member_profiles_select / modify — no cross-table RLS triggers
-- ============================================================================
CREATE POLICY "member_profiles_select" ON public.member_profiles
FOR SELECT TO authenticated
USING (
  public.is_owner()
  OR EXISTS (
    SELECT 1 FROM public.members m
    WHERE m.id = member_profiles.member_id
      AND (
        m.user_id = auth.uid()
        OR (public.is_admin() AND m.branch_id = public.user_branch_id())
      )
  )
  OR public.coach_has_member(member_profiles.member_id)
);

CREATE POLICY "member_profiles_modify" ON public.member_profiles
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.members m
    WHERE m.id = member_profiles.member_id
      AND (
        m.user_id = auth.uid()
        OR public.is_owner()
        OR (public.is_admin() AND m.branch_id = public.user_branch_id())
      )
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.members m
    WHERE m.id = member_profiles.member_id
      AND (
        m.user_id = auth.uid()
        OR public.is_owner()
        OR (public.is_admin() AND m.branch_id = public.user_branch_id())
      )
  )
);

-- ============================================================================
-- §7  coach_profiles_select / modify — no cross-table RLS triggers
-- ============================================================================
CREATE POLICY "coach_profiles_select" ON public.coach_profiles
FOR SELECT TO authenticated
USING (
  public.is_owner()
  OR coach_id = public.current_user_coach_id()
  OR (
    public.is_admin()
    AND public.coach_is_in_branch(coach_id, public.user_branch_id())
  )
  OR public.member_has_coach(coach_id)
);

CREATE POLICY "coach_profiles_modify" ON public.coach_profiles
FOR ALL TO authenticated
USING (
  coach_id = public.current_user_coach_id()
  OR public.is_owner()
  OR public.is_admin()
)
WITH CHECK (
  coach_id = public.current_user_coach_id()
  OR public.is_owner()
  OR public.is_admin()
);
