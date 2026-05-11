-- ============================================================================
-- FIX: RLS Infinite Recursion
--
-- Root cause: class_schedules_select queries `classes`, which triggers
-- classes_select, which queries class_members → members_select → class_members
-- again → infinite loop.
--
-- Fix strategy:
--   1. Drop problematic policies
--   2. Replace class_schedules_select with a non-recursive version
--   3. Simplify classes_select to avoid cross-table recursion
--   4. Fix report_cards policies that query classes (same issue)
-- ============================================================================

-- ============================================================================
-- §1  Drop all affected policies
-- ============================================================================
DROP POLICY IF EXISTS "classes_select"          ON public.classes;
DROP POLICY IF EXISTS "class_schedules_select"  ON public.class_schedules;
DROP POLICY IF EXISTS "class_coaches_select"    ON public.class_coaches;
DROP POLICY IF EXISTS "class_members_select"    ON public.class_members;
DROP POLICY IF EXISTS "report_cards_coach_select" ON public.report_cards;
DROP POLICY IF EXISTS "report_cards_coach_insert" ON public.report_cards;
DROP POLICY IF EXISTS "report_cards_coach_update" ON public.report_cards;
DROP POLICY IF EXISTS "semesters_select"        ON public.semesters;

-- ============================================================================
-- §2  Helper functions (SECURITY DEFINER = bypass RLS inside function)
-- ============================================================================

-- Is the current user a member of a given class?
CREATE OR REPLACE FUNCTION public.user_is_member_of_class(target_class_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.class_members cm
    JOIN public.members m ON m.id = cm.member_id
    WHERE cm.class_id = target_class_id
      AND m.user_id = auth.uid()
  );
$$;

-- Get branch_id of a class without triggering RLS on classes
CREATE OR REPLACE FUNCTION public.class_branch_id(target_class_id UUID)
RETURNS UUID
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT branch_id FROM public.classes WHERE id = target_class_id LIMIT 1;
$$;

-- ============================================================================
-- §3  classes_select — fixed (no cross-table recursion)
-- ============================================================================
CREATE POLICY "classes_select" ON public.classes
FOR SELECT TO authenticated
USING (
  public.is_owner()
  OR (public.is_admin() AND branch_id = public.user_branch_id())
  OR public.is_coach_of_class(id)
  OR public.user_is_member_of_class(id)
);

-- ============================================================================
-- §4  class_schedules_select — use SECURITY DEFINER helper to avoid recursion
-- ============================================================================
CREATE POLICY "class_schedules_select" ON public.class_schedules
FOR SELECT TO authenticated
USING (
  public.is_owner()
  OR (public.is_admin() AND public.class_branch_id(class_id) = public.user_branch_id())
  OR public.is_coach_of_class(class_id)
  OR public.user_is_member_of_class(class_id)
);

-- ============================================================================
-- §5  class_coaches_select — simplified
-- ============================================================================
CREATE POLICY "class_coaches_select" ON public.class_coaches
FOR SELECT TO authenticated
USING (
  public.is_owner()
  OR public.is_admin()
  OR public.is_coach_of_class(class_id)
  OR public.user_is_member_of_class(class_id)
);

-- ============================================================================
-- §6  class_members_select — simplified, no recursion into classes
-- ============================================================================
CREATE POLICY "class_members_select" ON public.class_members
FOR SELECT TO authenticated
USING (
  public.is_owner()
  OR (public.is_admin() AND public.class_branch_id(class_id) = public.user_branch_id())
  OR public.is_coach_of_class(class_id)
  OR EXISTS (
    SELECT 1 FROM public.members m
    WHERE m.id = class_members.member_id
      AND m.user_id = auth.uid()
  )
);

-- ============================================================================
-- §7  semesters_select — simplified
-- ============================================================================
CREATE POLICY "semesters_select" ON public.semesters
FOR SELECT TO authenticated
USING (
  public.is_owner()
  OR (public.is_admin() AND branch_id = public.user_branch_id())
  OR EXISTS (
    SELECT 1 FROM public.coach_branches cb
    JOIN public.coaches c ON c.id = cb.coach_id
    WHERE cb.branch_id = semesters.branch_id
      AND c.user_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM public.members m
    WHERE m.branch_id = semesters.branch_id
      AND m.user_id = auth.uid()
  )
);

-- ============================================================================
-- §8  report_cards — fixed (use helper instead of querying classes directly)
-- ============================================================================
CREATE POLICY "report_cards_coach_select" ON public.report_cards
FOR SELECT TO authenticated
USING (
  coach_id = public.user_coach_id()
  OR public.is_owner()
  OR (public.is_admin() AND public.class_branch_id(class_id) = public.user_branch_id())
  OR EXISTS (
    SELECT 1 FROM public.members m
    WHERE m.id = report_cards.member_id
      AND m.user_id = auth.uid()
      AND report_cards.status = 'published'
  )
);

CREATE POLICY "report_cards_coach_insert" ON public.report_cards
FOR INSERT TO authenticated
WITH CHECK (
  coach_id = public.user_coach_id()
  AND public.is_coach_of_class(class_id)
  AND EXISTS (
    SELECT 1 FROM public.semesters s
    WHERE s.id = report_cards.semester_id
      AND s.status = 'active'
      AND s.input_deadline >= CURRENT_DATE
  )
);

CREATE POLICY "report_cards_coach_update" ON public.report_cards
FOR UPDATE TO authenticated
USING (
  (
    coach_id = public.user_coach_id()
    AND public.is_coach_of_class(class_id)
    AND status = 'draft'
    AND EXISTS (
      SELECT 1 FROM public.semesters s
      WHERE s.id = report_cards.semester_id
        AND s.status = 'active'
        AND s.input_deadline >= CURRENT_DATE
    )
  )
  OR public.is_owner()
  OR public.is_admin()
)
WITH CHECK (
  (
    coach_id = public.user_coach_id()
    AND public.is_coach_of_class(class_id)
    AND status = 'draft'
  )
  OR public.is_owner()
  OR public.is_admin()
);
