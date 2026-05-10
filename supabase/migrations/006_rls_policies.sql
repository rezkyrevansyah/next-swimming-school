-- ============================================================================
-- M2.4 — ROW LEVEL SECURITY POLICIES
-- Run AFTER 005_rls_helpers.sql
--
-- Helper functions live in public schema (not auth schema — Supabase restricts
-- that). All calls use public.is_owner(), public.user_branch_id(), etc.
-- ============================================================================

-- ============================================================================
-- §4.1  branches
-- ============================================================================
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "branches_select" ON public.branches
FOR SELECT TO authenticated
USING (
  public.is_owner()
  OR id = public.user_branch_id()
);

CREATE POLICY "branches_anon_select" ON public.branches
FOR SELECT TO anon
USING (status = 'active');

CREATE POLICY "branches_insert" ON public.branches
FOR INSERT TO authenticated
WITH CHECK (public.is_owner());

CREATE POLICY "branches_update" ON public.branches
FOR UPDATE TO authenticated
USING (
  public.is_owner()
  OR (public.is_manager() AND id = public.user_branch_id())
)
WITH CHECK (
  public.is_owner()
  OR (public.is_manager() AND id = public.user_branch_id())
);

CREATE POLICY "branches_delete" ON public.branches
FOR DELETE TO authenticated
USING (public.is_owner());

-- ============================================================================
-- §4.2  roles, permissions, role_permissions
-- ============================================================================
ALTER TABLE public.roles            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "roles_select" ON public.roles
FOR SELECT TO authenticated USING (true);

CREATE POLICY "permissions_select" ON public.permissions
FOR SELECT TO authenticated USING (true);

CREATE POLICY "role_permissions_select" ON public.role_permissions
FOR SELECT TO authenticated USING (true);

CREATE POLICY "roles_admin_only" ON public.roles
FOR ALL TO authenticated
USING (public.is_owner())
WITH CHECK (public.is_owner());

CREATE POLICY "permissions_admin_only" ON public.permissions
FOR ALL TO authenticated
USING (public.is_owner())
WITH CHECK (public.is_owner());

CREATE POLICY "role_permissions_admin_only" ON public.role_permissions
FOR ALL TO authenticated
USING (public.is_owner())
WITH CHECK (public.is_owner());

-- ============================================================================
-- §4.3  user_roles
-- ============================================================================
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_roles_select" ON public.user_roles
FOR SELECT TO authenticated
USING (
  user_id = auth.uid()
  OR public.is_owner()
  OR (public.is_admin() AND branch_id = public.user_branch_id())
);

CREATE POLICY "user_roles_insert" ON public.user_roles
FOR INSERT TO authenticated
WITH CHECK (
  public.is_owner()
  OR (public.is_manager() AND branch_id = public.user_branch_id())
);

CREATE POLICY "user_roles_update" ON public.user_roles
FOR UPDATE TO authenticated
USING (
  public.is_owner()
  OR (public.is_manager() AND branch_id = public.user_branch_id())
);

CREATE POLICY "user_roles_delete" ON public.user_roles
FOR DELETE TO authenticated
USING (
  public.is_owner()
  OR (public.is_manager() AND branch_id = public.user_branch_id())
);

-- ============================================================================
-- §4.4  members
-- ============================================================================
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "members_select" ON public.members
FOR SELECT TO authenticated
USING (
  user_id = auth.uid()
  OR public.is_owner()
  OR (public.is_admin() AND branch_id = public.user_branch_id())
  OR EXISTS (
    SELECT 1
    FROM public.class_members cm
    JOIN public.class_coaches cc ON cc.class_id = cm.class_id
    JOIN public.coaches co ON co.id = cc.coach_id
    WHERE cm.member_id = members.id
      AND co.user_id = auth.uid()
  )
);

CREATE POLICY "members_insert_admin" ON public.members
FOR INSERT TO authenticated
WITH CHECK (
  public.is_owner()
  OR (public.is_admin() AND branch_id = public.user_branch_id())
);

CREATE POLICY "members_update_admin" ON public.members
FOR UPDATE TO authenticated
USING (
  public.is_owner()
  OR (public.is_admin() AND branch_id = public.user_branch_id())
)
WITH CHECK (
  public.is_owner()
  OR (public.is_admin() AND branch_id = public.user_branch_id())
);

-- Hard DELETE denied. Soft-delete via UPDATE deleted_at.

-- ============================================================================
-- §4.5  member_profiles
-- ============================================================================
ALTER TABLE public.member_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "member_profiles_select" ON public.member_profiles
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.members m
    WHERE m.id = member_profiles.member_id
      AND (
        m.user_id = auth.uid()
        OR public.is_owner()
        OR (public.is_admin() AND m.branch_id = public.user_branch_id())
        OR EXISTS (
          SELECT 1
          FROM public.class_members cm
          JOIN public.class_coaches cc ON cc.class_id = cm.class_id
          JOIN public.coaches co ON co.id = cc.coach_id
          WHERE cm.member_id = m.id
            AND co.user_id = auth.uid()
        )
      )
  )
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
-- §4.6  coaches
-- ============================================================================
ALTER TABLE public.coaches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "coaches_select" ON public.coaches
FOR SELECT TO authenticated
USING (
  user_id = auth.uid()
  OR public.is_owner()
  OR (
    public.is_admin()
    AND EXISTS (
      SELECT 1 FROM public.coach_branches cb
      WHERE cb.coach_id = coaches.id
        AND cb.branch_id = public.user_branch_id()
    )
  )
  OR EXISTS (
    SELECT 1
    FROM public.class_members cm
    JOIN public.class_coaches cc ON cc.class_id = cm.class_id
    JOIN public.members m ON m.id = cm.member_id
    WHERE cc.coach_id = coaches.id
      AND m.user_id = auth.uid()
  )
);

CREATE POLICY "coaches_modify" ON public.coaches
FOR ALL TO authenticated
USING (
  public.is_owner()
  OR public.is_admin()
)
WITH CHECK (
  public.is_owner()
  OR public.is_admin()
);

-- ============================================================================
-- §4.7  coach_branches
-- ============================================================================
ALTER TABLE public.coach_branches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "coach_branches_select" ON public.coach_branches
FOR SELECT TO authenticated
USING (
  public.is_admin()
  OR EXISTS (
    SELECT 1 FROM public.coaches c
    WHERE c.id = coach_branches.coach_id
      AND c.user_id = auth.uid()
  )
);

CREATE POLICY "coach_branches_modify" ON public.coach_branches
FOR ALL TO authenticated
USING (
  public.is_owner()
  OR (public.is_admin() AND branch_id = public.user_branch_id())
)
WITH CHECK (
  public.is_owner()
  OR (public.is_admin() AND branch_id = public.user_branch_id())
);

-- ============================================================================
-- §4.8  coach_profiles, coach_certificates
-- ============================================================================
ALTER TABLE public.coach_profiles     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coach_certificates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "coach_profiles_select" ON public.coach_profiles
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.coaches c
    WHERE c.id = coach_profiles.coach_id
      AND (
        c.user_id = auth.uid()
        OR public.is_owner()
        OR (
          public.is_admin()
          AND EXISTS (
            SELECT 1 FROM public.coach_branches cb
            WHERE cb.coach_id = c.id
              AND cb.branch_id = public.user_branch_id()
          )
        )
        OR EXISTS (
          SELECT 1
          FROM public.class_members cm
          JOIN public.class_coaches cc ON cc.class_id = cm.class_id
          JOIN public.members m ON m.id = cm.member_id
          WHERE cc.coach_id = c.id
            AND m.user_id = auth.uid()
        )
      )
  )
);

CREATE POLICY "coach_profiles_modify" ON public.coach_profiles
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.coaches c
    WHERE c.id = coach_profiles.coach_id
      AND (c.user_id = auth.uid() OR public.is_admin() OR public.is_owner())
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.coaches c
    WHERE c.id = coach_profiles.coach_id
      AND (c.user_id = auth.uid() OR public.is_admin() OR public.is_owner())
  )
);

CREATE POLICY "coach_certs_select" ON public.coach_certificates
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.coaches c
    WHERE c.id = coach_certificates.coach_id
      AND (c.user_id = auth.uid() OR public.is_admin() OR public.is_owner())
  )
);

CREATE POLICY "coach_certs_modify" ON public.coach_certificates
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.coaches c
    WHERE c.id = coach_certificates.coach_id
      AND (c.user_id = auth.uid() OR public.is_admin() OR public.is_owner())
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.coaches c
    WHERE c.id = coach_certificates.coach_id
      AND (c.user_id = auth.uid() OR public.is_admin() OR public.is_owner())
  )
);

-- ============================================================================
-- §4.9  classes, class_schedules, class_coaches, class_members
-- ============================================================================
ALTER TABLE public.classes         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_coaches   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_members   ENABLE ROW LEVEL SECURITY;

CREATE POLICY "classes_select" ON public.classes
FOR SELECT TO authenticated
USING (
  public.is_owner()
  OR (public.is_admin() AND branch_id = public.user_branch_id())
  OR EXISTS (
    SELECT 1 FROM public.class_coaches cc
    JOIN public.coaches c ON c.id = cc.coach_id
    WHERE cc.class_id = classes.id
      AND c.user_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM public.class_members cm
    JOIN public.members m ON m.id = cm.member_id
    WHERE cm.class_id = classes.id
      AND m.user_id = auth.uid()
  )
);

CREATE POLICY "classes_anon_select" ON public.classes
FOR SELECT TO anon
USING (status = 'active' AND deleted_at IS NULL);

CREATE POLICY "classes_modify" ON public.classes
FOR ALL TO authenticated
USING (
  public.is_owner()
  OR (public.is_admin() AND branch_id = public.user_branch_id())
)
WITH CHECK (
  public.is_owner()
  OR (public.is_admin() AND branch_id = public.user_branch_id())
);

CREATE POLICY "class_schedules_select" ON public.class_schedules
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.classes c WHERE c.id = class_schedules.class_id
  )
);

CREATE POLICY "class_schedules_modify" ON public.class_schedules
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.classes c
    WHERE c.id = class_schedules.class_id
      AND (public.is_owner() OR (public.is_admin() AND c.branch_id = public.user_branch_id()))
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.classes c
    WHERE c.id = class_schedules.class_id
      AND (public.is_owner() OR (public.is_admin() AND c.branch_id = public.user_branch_id()))
  )
);

CREATE POLICY "class_coaches_select" ON public.class_coaches
FOR SELECT TO authenticated USING (true);

CREATE POLICY "class_coaches_modify" ON public.class_coaches
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.classes c
    WHERE c.id = class_coaches.class_id
      AND (public.is_owner() OR (public.is_admin() AND c.branch_id = public.user_branch_id()))
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.classes c
    WHERE c.id = class_coaches.class_id
      AND (public.is_owner() OR (public.is_admin() AND c.branch_id = public.user_branch_id()))
  )
);

CREATE POLICY "class_members_select" ON public.class_members
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.classes c
    WHERE c.id = class_members.class_id
      AND (public.is_owner() OR (public.is_admin() AND c.branch_id = public.user_branch_id()))
  )
  OR EXISTS (
    SELECT 1 FROM public.class_coaches cc
    JOIN public.coaches co ON co.id = cc.coach_id
    WHERE cc.class_id = class_members.class_id
      AND co.user_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM public.members m
    WHERE m.id = class_members.member_id
      AND m.user_id = auth.uid()
  )
);

CREATE POLICY "class_members_modify" ON public.class_members
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.classes c
    WHERE c.id = class_members.class_id
      AND (public.is_owner() OR (public.is_admin() AND c.branch_id = public.user_branch_id()))
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.classes c
    WHERE c.id = class_members.class_id
      AND (public.is_owner() OR (public.is_admin() AND c.branch_id = public.user_branch_id()))
  )
);

-- ============================================================================
-- §4.10  attendance_records
-- ============================================================================
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "attendance_select" ON public.attendance_records
FOR SELECT TO authenticated
USING (
  public.is_owner()
  OR (public.is_admin() AND branch_id = public.user_branch_id())
  OR public.is_coach_of_class(class_id)
  OR EXISTS (
    SELECT 1 FROM public.members m
    WHERE m.id = attendance_records.member_id
      AND m.user_id = auth.uid()
  )
);

CREATE POLICY "attendance_insert" ON public.attendance_records
FOR INSERT TO authenticated
WITH CHECK (
  public.is_owner()
  OR (public.is_admin() AND branch_id = public.user_branch_id())
  OR public.is_coach_of_class(class_id)
);

CREATE POLICY "attendance_update" ON public.attendance_records
FOR UPDATE TO authenticated
USING (
  public.is_owner()
  OR (public.is_admin() AND branch_id = public.user_branch_id())
  OR (
    public.is_coach_of_class(class_id)
    AND recorded_by_coach_id = public.user_coach_id()
    AND session_date = CURRENT_DATE
  )
)
WITH CHECK (
  public.is_owner()
  OR (public.is_admin() AND branch_id = public.user_branch_id())
  OR (
    public.is_coach_of_class(class_id)
    AND recorded_by_coach_id = public.user_coach_id()
    AND session_date = CURRENT_DATE
  )
);

CREATE POLICY "attendance_delete" ON public.attendance_records
FOR DELETE TO authenticated
USING (
  public.is_owner()
  OR (public.is_admin() AND branch_id = public.user_branch_id())
);

-- ============================================================================
-- §4.11  coach_clock_records
-- ============================================================================
ALTER TABLE public.coach_clock_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "coach_clock_select" ON public.coach_clock_records
FOR SELECT TO authenticated
USING (
  public.is_owner()
  OR (public.is_admin() AND branch_id = public.user_branch_id())
  OR coach_id = public.user_coach_id()
);

CREATE POLICY "coach_clock_insert" ON public.coach_clock_records
FOR INSERT TO authenticated
WITH CHECK (
  coach_id = public.user_coach_id()
  OR public.is_owner()
  OR (public.is_admin() AND branch_id = public.user_branch_id())
);

CREATE POLICY "coach_clock_update" ON public.coach_clock_records
FOR UPDATE TO authenticated
USING (
  public.is_owner()
  OR (public.is_admin() AND branch_id = public.user_branch_id())
)
WITH CHECK (
  public.is_owner()
  OR (public.is_admin() AND branch_id = public.user_branch_id())
);

-- No DELETE — clock records are a permanent audit trail

-- ============================================================================
-- §4.12  member_qr_tokens
-- ============================================================================
ALTER TABLE public.member_qr_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "qr_tokens_select" ON public.member_qr_tokens
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.members m
    WHERE m.id = member_qr_tokens.member_id
      AND m.user_id = auth.uid()
  )
);

CREATE POLICY "qr_tokens_modify" ON public.member_qr_tokens
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.members m
    WHERE m.id = member_qr_tokens.member_id
      AND m.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.members m
    WHERE m.id = member_qr_tokens.member_id
      AND m.user_id = auth.uid()
  )
);

-- ============================================================================
-- §4.14  activity_logs
-- ============================================================================
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "logs_select" ON public.activity_logs
FOR SELECT TO authenticated
USING (
  public.is_owner()
  OR (public.is_admin() AND branch_id = public.user_branch_id())
);

CREATE POLICY "logs_insert" ON public.activity_logs
FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

-- No UPDATE/DELETE — logs are permanent

-- ============================================================================
-- schools (Phase 2 table — lock it down now)
-- ============================================================================
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;

CREATE POLICY "schools_select" ON public.schools
FOR SELECT TO authenticated
USING (
  public.is_owner()
  OR (public.is_admin() AND branch_id = public.user_branch_id())
);

CREATE POLICY "schools_modify" ON public.schools
FOR ALL TO authenticated
USING (
  public.is_owner()
  OR (public.is_admin() AND branch_id = public.user_branch_id())
)
WITH CHECK (
  public.is_owner()
  OR (public.is_admin() AND branch_id = public.user_branch_id())
);

-- ============================================================================
-- ROLLBACK (drop all public policies):
-- DO $$
-- DECLARE pol RECORD;
-- BEGIN
--   FOR pol IN SELECT schemaname, tablename, policyname FROM pg_policies
--              WHERE schemaname = 'public'
--   LOOP
--     EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I',
--       pol.policyname, pol.schemaname, pol.tablename);
--   END LOOP;
-- END $$;
-- ============================================================================
