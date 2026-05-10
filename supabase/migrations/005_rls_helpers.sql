-- ============================================================================
-- M2.4 — RLS HELPER FUNCTIONS (public schema)
-- Run AFTER 004_classes_attendance.sql and BEFORE 006_rls_policies.sql
--
-- Note: Supabase SQL Editor does not allow creating functions in the auth
-- schema. All helpers live in public schema instead.
-- RLS policies in 006 call public.is_owner(), public.user_role(), etc.
-- ============================================================================

-- Get the highest-level role name for the current user
CREATE OR REPLACE FUNCTION public.user_role()
RETURNS TEXT
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT r.name
  FROM public.user_roles ur
  JOIN public.roles r ON r.id = ur.role_id
  WHERE ur.user_id = auth.uid()
  ORDER BY r.level DESC
  LIMIT 1;
$$;

-- Get the branch_id of the current user (NULL if owner — global access)
CREATE OR REPLACE FUNCTION public.user_branch_id()
RETURNS UUID
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT ur.branch_id
  FROM public.user_roles ur
  JOIN public.roles r ON r.id = ur.role_id
  WHERE ur.user_id = auth.uid()
  ORDER BY r.level DESC
  LIMIT 1;
$$;

-- TRUE if current user has the 'owner' role
CREATE OR REPLACE FUNCTION public.is_owner()
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.roles r ON r.id = ur.role_id
    WHERE ur.user_id = auth.uid()
      AND r.name = 'owner'
  );
$$;

-- TRUE if current user has the 'manager' role (any branch)
CREATE OR REPLACE FUNCTION public.is_manager()
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.roles r ON r.id = ur.role_id
    WHERE ur.user_id = auth.uid()
      AND r.name = 'manager'
  );
$$;

-- TRUE if current user has admin-level access (admin, manager, or owner)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.roles r ON r.id = ur.role_id
    WHERE ur.user_id = auth.uid()
      AND r.name IN ('admin', 'manager', 'owner')
  );
$$;

-- TRUE if current user has admin-level access to a specific branch
CREATE OR REPLACE FUNCTION public.has_admin_access_to_branch(target_branch_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.roles r ON r.id = ur.role_id
    WHERE ur.user_id = auth.uid()
      AND (
        r.name = 'owner'
        OR (r.name IN ('manager', 'admin') AND ur.branch_id = target_branch_id)
      )
  );
$$;

-- TRUE if current user is a coach assigned to a specific class
CREATE OR REPLACE FUNCTION public.is_coach_of_class(target_class_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.coaches c
    JOIN public.class_coaches cc ON cc.coach_id = c.id
    WHERE c.user_id = auth.uid()
      AND cc.class_id = target_class_id
  );
$$;

-- Get the coaches.id for the current user (NULL if not a coach)
CREATE OR REPLACE FUNCTION public.user_coach_id()
RETURNS UUID
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT id FROM public.coaches WHERE user_id = auth.uid() LIMIT 1;
$$;

-- Get the members.id for the current user (NULL if not a member)
CREATE OR REPLACE FUNCTION public.user_member_id()
RETURNS UUID
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT id FROM public.members WHERE user_id = auth.uid() LIMIT 1;
$$;

-- ============================================================================
-- VERIFY (run after applying):
--   SELECT public.user_role();
--   SELECT public.is_owner();
--   SELECT public.is_admin();
-- ============================================================================
