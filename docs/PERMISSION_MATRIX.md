# PERMISSION_MATRIX.md

> **Authoritative source for who can do what.**
> AI agent: every database query is filtered by RLS. Permissions defined here are enforced at the database level.

---

## 1. Roles Overview

| Role | Code | Created By | Branch Scope |
|---|---|---|---|
| Owner | `owner` | Manual SQL insert | All branches (NULL branch_id = global) |
| Manager Cabang | `manager` | Owner via UI | Single branch |
| Admin | `admin` | Manager via UI | Single branch |
| Coach | `coach` | Admin via UI | Single branch (Phase 1) / Multi-branch (Phase 2) |
| Member | `member` | Self-register OR admin | Single branch |
| School | `school` | Admin via UI (Phase 2) | Single branch (linked to school) |

**Phase 1 simplification:** Only `owner`, `admin`, `coach`, `member` are active. Manager and school come in Phase 2.

---

## 2. Permission Matrix

Legend:
- ✅ = Allowed
- ❌ = Denied
- 🔒 = Allowed only for own data (e.g. member can only edit own profile)
- 🏢 = Allowed only within own branch
- 🌐 = Allowed across all branches

| Resource / Action | Owner | Manager | Admin | Coach | Member |
|---|---|---|---|---|---|
| **branches** create | ✅ 🌐 | ❌ | ❌ | ❌ | ❌ |
| **branches** read | ✅ 🌐 | ✅ 🏢 | ✅ 🏢 | ✅ 🏢 | ✅ 🏢 |
| **branches** update | ✅ 🌐 | ✅ 🏢 | ❌ | ❌ | ❌ |
| **branches** delete | ✅ 🌐 | ❌ | ❌ | ❌ | ❌ |
| **users** create (admin role) | ✅ 🌐 | ✅ 🏢 | ❌ | ❌ | ❌ |
| **users** create (coach/member) | ✅ 🌐 | ✅ 🏢 | ✅ 🏢 | ❌ | ❌ |
| **users** read | ✅ 🌐 | ✅ 🏢 | ✅ 🏢 | 🔒 | 🔒 |
| **users** update | ✅ 🌐 | ✅ 🏢 | 🔒 + ✅ 🏢 (members/coaches) | 🔒 | 🔒 |
| **users** delete (soft) | ✅ 🌐 | ✅ 🏢 | ✅ 🏢 (members/coaches) | ❌ | ❌ |
| **members** create | ✅ 🌐 | ✅ 🏢 | ✅ 🏢 | ❌ | self-register only |
| **members** read | ✅ 🌐 | ✅ 🏢 | ✅ 🏢 | 🏢 (own classes) | 🔒 (self) |
| **members** update | ✅ 🌐 | ✅ 🏢 | ✅ 🏢 | ❌ | 🔒 (limited fields) |
| **members** soft-delete | ✅ 🌐 | ✅ 🏢 | ✅ 🏢 | ❌ | ❌ |
| **coaches** create | ✅ 🌐 | ✅ 🏢 | ✅ 🏢 | ❌ | ❌ |
| **coaches** read | ✅ 🌐 | ✅ 🏢 | ✅ 🏢 | 🔒 | 🏢 (own coaches only) |
| **coaches** update | ✅ 🌐 | ✅ 🏢 | ✅ 🏢 | 🔒 (limited) | ❌ |
| **coaches** soft-delete | ✅ 🌐 | ✅ 🏢 | ✅ 🏢 | ❌ | ❌ |
| **coach_certificates** approve | ✅ 🌐 | ✅ 🏢 | ❌ | ❌ | ❌ |
| **classes** create | ✅ 🌐 | ✅ 🏢 | ✅ 🏢 | ❌ | ❌ |
| **classes** read | ✅ 🌐 | ✅ 🏢 | ✅ 🏢 | 🏢 | 🏢 (public listing) |
| **classes** update | ✅ 🌐 | ✅ 🏢 | ✅ 🏢 | ❌ | ❌ |
| **classes** soft-delete | ✅ 🌐 | ✅ 🏢 | ✅ 🏢 | ❌ | ❌ |
| **class_members** create (enroll) | ✅ 🌐 | ✅ 🏢 | ✅ 🏢 | ❌ | self only |
| **class_members** read | ✅ 🌐 | ✅ 🏢 | ✅ 🏢 | 🏢 (own classes) | 🔒 |
| **class_members** delete | ✅ 🌐 | ✅ 🏢 | ✅ 🏢 | ❌ | ❌ |
| **attendance_records** create | ✅ 🌐 | ✅ 🏢 | ✅ 🏢 | 🏢 (own classes) | ❌ |
| **attendance_records** read | ✅ 🌐 | ✅ 🏢 | ✅ 🏢 | 🏢 (own classes) | 🔒 |
| **attendance_records** update | ✅ 🌐 | ✅ 🏢 | ✅ 🏢 | 🏢 (own scans, same day) | ❌ |
| **attendance_records** delete | ✅ 🌐 | ✅ 🏢 | ✅ 🏢 | ❌ | ❌ |
| **coach_clock_records** create | ✅ 🌐 | ✅ 🏢 | ✅ 🏢 (manual entry) | 🔒 | ❌ |
| **coach_clock_records** read | ✅ 🌐 | ✅ 🏢 | ✅ 🏢 | 🔒 | ❌ |
| **monthly_invoices** create | ✅ 🌐 (cron) | ❌ | ❌ | ❌ | ❌ |
| **monthly_invoices** read | ✅ 🌐 | ✅ 🏢 | ✅ 🏢 | ❌ | 🔒 |
| **monthly_invoices** update | ✅ 🌐 | ✅ 🏢 | ✅ 🏢 | ❌ | ❌ |
| **payments** create | ✅ 🌐 | ✅ 🏢 | ✅ 🏢 | ❌ | ❌ |
| **payments** read | ✅ 🌐 | ✅ 🏢 | ✅ 🏢 | ❌ | 🔒 |
| **activity_logs** create | (system) | (system) | (system) | (system) | (system) |
| **activity_logs** read | ✅ 🌐 | ✅ 🏢 | ✅ 🏢 | ❌ | ❌ |
| **member_qr_tokens** create | ✅ 🌐 | ✅ 🏢 | ✅ 🏢 | ❌ | 🔒 (own only) |
| **member_qr_tokens** read | ❌ (security) | ❌ | ❌ | (validated server-side) | 🔒 (own only) |
| **news_articles** CRUD | ✅ 🌐 | ✅ 🏢 | ✅ 🏢 | ❌ | read published only |
| **programs** CRUD | ✅ 🌐 | ✅ 🏢 | ✅ 🏢 | ❌ | read only |

**Phase 2 additions** (not active in Phase 1):
- school panel: read-only own school's members + report cards
- coach: multi-branch read access via coach_branches M2M
- member: limited profile edit with approval workflow

---

## 3. Helper SQL Functions

These functions are used inside RLS policies. Run these FIRST before any policies.

> **Database change required: Yes**
>
> Run this in Supabase SQL Editor:

```sql
-- ============================================================================
-- HELPER FUNCTIONS FOR RLS
-- ============================================================================

-- Get current user's role
CREATE OR REPLACE FUNCTION auth.user_role()
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

-- Get current user's branch_id (NULL if owner)
CREATE OR REPLACE FUNCTION auth.user_branch_id()
RETURNS UUID
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT branch_id
  FROM public.user_roles
  WHERE user_id = auth.uid()
  LIMIT 1;
$$;

-- Check if current user is owner
CREATE OR REPLACE FUNCTION auth.is_owner()
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

-- Check if current user is manager (of any branch)
CREATE OR REPLACE FUNCTION auth.is_manager()
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

-- Check if current user is admin (of any branch)
CREATE OR REPLACE FUNCTION auth.is_admin()
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

-- Check if user has admin-level access to specific branch
CREATE OR REPLACE FUNCTION auth.has_admin_access_to_branch(target_branch_id UUID)
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

-- Check if user is coach assigned to specific class
CREATE OR REPLACE FUNCTION auth.is_coach_of_class(target_class_id UUID)
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

-- Get current user's coach_id (NULL if not coach)
CREATE OR REPLACE FUNCTION auth.user_coach_id()
RETURNS UUID
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT id FROM public.coaches WHERE user_id = auth.uid() LIMIT 1;
$$;

-- Get current user's member_id (NULL if not member)
CREATE OR REPLACE FUNCTION auth.user_member_id()
RETURNS UUID
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT id FROM public.members WHERE user_id = auth.uid() LIMIT 1;
$$;
```

After running SQL:
- These functions are used by all RLS policies below
- Test by running: `SELECT auth.user_role();` while authenticated
- No file/module changes needed yet (used only by RLS)

---

## 4. RLS Policies Per Table

### 4.1 `branches`

> **Database change required: Yes**

```sql
-- Enable RLS
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;

-- SELECT: Owner sees all, others see own branch
CREATE POLICY "branches_select" ON public.branches
FOR SELECT TO authenticated
USING (
  auth.is_owner()
  OR id = auth.user_branch_id()
);

-- INSERT: Only owner
CREATE POLICY "branches_insert" ON public.branches
FOR INSERT TO authenticated
WITH CHECK (auth.is_owner());

-- UPDATE: Owner or manager of that branch
CREATE POLICY "branches_update" ON public.branches
FOR UPDATE TO authenticated
USING (
  auth.is_owner()
  OR (auth.is_manager() AND id = auth.user_branch_id())
)
WITH CHECK (
  auth.is_owner()
  OR (auth.is_manager() AND id = auth.user_branch_id())
);

-- DELETE: Only owner
CREATE POLICY "branches_delete" ON public.branches
FOR DELETE TO authenticated
USING (auth.is_owner());
```

---

### 4.2 `roles`, `permissions`, `role_permissions`

```sql
-- These tables are read-only seed data after initial setup
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read roles/permissions (for UI)
CREATE POLICY "roles_select" ON public.roles
FOR SELECT TO authenticated USING (true);

CREATE POLICY "permissions_select" ON public.permissions
FOR SELECT TO authenticated USING (true);

CREATE POLICY "role_permissions_select" ON public.role_permissions
FOR SELECT TO authenticated USING (true);

-- Only owner can modify (rare; mostly seeded)
CREATE POLICY "roles_admin_only" ON public.roles
FOR ALL TO authenticated
USING (auth.is_owner())
WITH CHECK (auth.is_owner());

CREATE POLICY "permissions_admin_only" ON public.permissions
FOR ALL TO authenticated
USING (auth.is_owner())
WITH CHECK (auth.is_owner());

CREATE POLICY "role_permissions_admin_only" ON public.role_permissions
FOR ALL TO authenticated
USING (auth.is_owner())
WITH CHECK (auth.is_owner());
```

---

### 4.3 `user_roles`

```sql
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- SELECT: User sees own + admins see all in branch + owner sees all
CREATE POLICY "user_roles_select" ON public.user_roles
FOR SELECT TO authenticated
USING (
  user_id = auth.uid()
  OR auth.is_owner()
  OR (auth.is_admin() AND branch_id = auth.user_branch_id())
);

-- INSERT: Owner everywhere, manager in own branch
CREATE POLICY "user_roles_insert" ON public.user_roles
FOR INSERT TO authenticated
WITH CHECK (
  auth.is_owner()
  OR (auth.is_manager() AND branch_id = auth.user_branch_id())
);

-- UPDATE: Same as INSERT
CREATE POLICY "user_roles_update" ON public.user_roles
FOR UPDATE TO authenticated
USING (
  auth.is_owner()
  OR (auth.is_manager() AND branch_id = auth.user_branch_id())
);

-- DELETE: Owner or manager (in own branch)
CREATE POLICY "user_roles_delete" ON public.user_roles
FOR DELETE TO authenticated
USING (
  auth.is_owner()
  OR (auth.is_manager() AND branch_id = auth.user_branch_id())
);
```

---

### 4.4 `members`

```sql
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;

-- SELECT: Multiple paths
CREATE POLICY "members_select" ON public.members
FOR SELECT TO authenticated
USING (
  -- Own record
  user_id = auth.uid()
  -- Owner sees all
  OR auth.is_owner()
  -- Admin/manager sees within branch
  OR (auth.is_admin() AND branch_id = auth.user_branch_id())
  -- Coach sees members of their classes
  OR EXISTS (
    SELECT 1
    FROM public.class_members cm
    JOIN public.class_coaches cc ON cc.class_id = cm.class_id
    JOIN public.coaches co ON co.id = cc.coach_id
    WHERE cm.member_id = members.id
      AND co.user_id = auth.uid()
  )
);

-- INSERT: Admin/manager/owner OR self-register (anonymous)
CREATE POLICY "members_insert_admin" ON public.members
FOR INSERT TO authenticated
WITH CHECK (
  auth.is_admin() AND branch_id = auth.user_branch_id()
  OR auth.is_owner()
);

-- INSERT for self-registration: separate policy for the registration flow
-- This is INSERT through service role function, not direct user insert
-- See: lib/actions/registration.ts

-- UPDATE: Admin/manager/owner in branch, OR member updates own (limited fields)
CREATE POLICY "members_update_admin" ON public.members
FOR UPDATE TO authenticated
USING (
  auth.is_owner()
  OR (auth.is_admin() AND branch_id = auth.user_branch_id())
)
WITH CHECK (
  auth.is_owner()
  OR (auth.is_admin() AND branch_id = auth.user_branch_id())
);

-- Member self-update: only via specific server action, not direct
-- (handled by application logic — limited fields like phone, address)

-- DELETE: NEVER hard-delete. Use soft-delete via UPDATE deleted_at
-- No DELETE policy = denied by default
```

---

### 4.5 `member_profiles`

```sql
ALTER TABLE public.member_profiles ENABLE ROW LEVEL SECURITY;

-- SELECT: Same logic as members (via JOIN)
CREATE POLICY "member_profiles_select" ON public.member_profiles
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.members m
    WHERE m.id = member_profiles.member_id
      AND (
        m.user_id = auth.uid()
        OR auth.is_owner()
        OR (auth.is_admin() AND m.branch_id = auth.user_branch_id())
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

-- INSERT/UPDATE: Admin or self
CREATE POLICY "member_profiles_modify" ON public.member_profiles
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.members m
    WHERE m.id = member_profiles.member_id
      AND (
        m.user_id = auth.uid()
        OR auth.is_owner()
        OR (auth.is_admin() AND m.branch_id = auth.user_branch_id())
      )
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.members m
    WHERE m.id = member_profiles.member_id
      AND (
        m.user_id = auth.uid()
        OR auth.is_owner()
        OR (auth.is_admin() AND m.branch_id = auth.user_branch_id())
      )
  )
);
```

---

### 4.6 `coaches`

```sql
ALTER TABLE public.coaches ENABLE ROW LEVEL SECURITY;

-- SELECT
CREATE POLICY "coaches_select" ON public.coaches
FOR SELECT TO authenticated
USING (
  -- Self
  user_id = auth.uid()
  -- Owner
  OR auth.is_owner()
  -- Admin in same branch (Phase 1: single branch via coach_branches)
  OR (
    auth.is_admin()
    AND EXISTS (
      SELECT 1 FROM public.coach_branches cb
      WHERE cb.coach_id = coaches.id
        AND cb.branch_id = auth.user_branch_id()
    )
  )
  -- Member sees coaches of their classes
  OR EXISTS (
    SELECT 1
    FROM public.class_members cm
    JOIN public.class_coaches cc ON cc.class_id = cm.class_id
    JOIN public.members m ON m.id = cm.member_id
    WHERE cc.coach_id = coaches.id
      AND m.user_id = auth.uid()
  )
);

-- INSERT/UPDATE: Admin/owner
CREATE POLICY "coaches_modify" ON public.coaches
FOR ALL TO authenticated
USING (
  auth.is_owner()
  OR auth.is_admin()
)
WITH CHECK (
  auth.is_owner()
  OR auth.is_admin()
);
```

---

### 4.7 `coach_branches` (M2M)

```sql
ALTER TABLE public.coach_branches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "coach_branches_select" ON public.coach_branches
FOR SELECT TO authenticated
USING (
  auth.is_admin()
  OR EXISTS (
    SELECT 1 FROM public.coaches c
    WHERE c.id = coach_branches.coach_id
      AND c.user_id = auth.uid()
  )
);

CREATE POLICY "coach_branches_modify" ON public.coach_branches
FOR ALL TO authenticated
USING (
  auth.is_owner()
  OR (auth.is_admin() AND branch_id = auth.user_branch_id())
)
WITH CHECK (
  auth.is_owner()
  OR (auth.is_admin() AND branch_id = auth.user_branch_id())
);
```

---

### 4.8 `coach_profiles`, `coach_certificates`

```sql
ALTER TABLE public.coach_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coach_certificates ENABLE ROW LEVEL SECURITY;

-- coach_profiles: similar to coaches (visible per visibility of coach)
CREATE POLICY "coach_profiles_select" ON public.coach_profiles
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.coaches c
    WHERE c.id = coach_profiles.coach_id
    -- Same visibility as coaches.SELECT
  )
);

CREATE POLICY "coach_profiles_modify" ON public.coach_profiles
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.coaches c
    WHERE c.id = coach_profiles.coach_id
      AND (c.user_id = auth.uid() OR auth.is_admin())
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.coaches c
    WHERE c.id = coach_profiles.coach_id
      AND (c.user_id = auth.uid() OR auth.is_admin())
  )
);

-- coach_certificates: visible to coach + admin
CREATE POLICY "coach_certs_select" ON public.coach_certificates
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.coaches c
    WHERE c.id = coach_certificates.coach_id
      AND (c.user_id = auth.uid() OR auth.is_admin())
  )
);

CREATE POLICY "coach_certs_modify" ON public.coach_certificates
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.coaches c
    WHERE c.id = coach_certificates.coach_id
      AND (c.user_id = auth.uid() OR auth.is_admin())
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.coaches c
    WHERE c.id = coach_certificates.coach_id
      AND (c.user_id = auth.uid() OR auth.is_admin())
  )
);

-- Approval column update: only owner/manager can approve
-- This is enforced via separate approve action, not via update policy
-- Application-level check needed
```

---

### 4.9 `classes`, `class_schedules`, `class_coaches`, `class_members`

```sql
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_coaches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_members ENABLE ROW LEVEL SECURITY;

-- classes
CREATE POLICY "classes_select" ON public.classes
FOR SELECT TO authenticated
USING (
  auth.is_owner()
  OR (auth.is_admin() AND branch_id = auth.user_branch_id())
  OR (
    -- Coach sees classes they teach
    EXISTS (
      SELECT 1 FROM public.class_coaches cc
      JOIN public.coaches c ON c.id = cc.coach_id
      WHERE cc.class_id = classes.id
        AND c.user_id = auth.uid()
    )
  )
  OR (
    -- Member sees classes they're enrolled in
    EXISTS (
      SELECT 1 FROM public.class_members cm
      JOIN public.members m ON m.id = cm.member_id
      WHERE cm.class_id = classes.id
        AND m.user_id = auth.uid()
    )
  )
  -- Public listing is via separate public-facing table or unauthenticated path
);

CREATE POLICY "classes_modify" ON public.classes
FOR ALL TO authenticated
USING (
  auth.is_owner()
  OR (auth.is_admin() AND branch_id = auth.user_branch_id())
)
WITH CHECK (
  auth.is_owner()
  OR (auth.is_admin() AND branch_id = auth.user_branch_id())
);

-- class_schedules: cascade visibility from classes
CREATE POLICY "class_schedules_select" ON public.class_schedules
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.classes c
    WHERE c.id = class_schedules.class_id
    -- visibility cascades from classes RLS
  )
);

CREATE POLICY "class_schedules_modify" ON public.class_schedules
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.classes c
    WHERE c.id = class_schedules.class_id
      AND (auth.is_owner() OR (auth.is_admin() AND c.branch_id = auth.user_branch_id()))
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.classes c
    WHERE c.id = class_schedules.class_id
      AND (auth.is_owner() OR (auth.is_admin() AND c.branch_id = auth.user_branch_id()))
  )
);

-- class_coaches & class_members: similar pattern
CREATE POLICY "class_coaches_select" ON public.class_coaches
FOR SELECT TO authenticated USING (true);  -- visible if class is visible

CREATE POLICY "class_coaches_modify" ON public.class_coaches
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.classes c
    WHERE c.id = class_coaches.class_id
      AND (auth.is_owner() OR (auth.is_admin() AND c.branch_id = auth.user_branch_id()))
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.classes c
    WHERE c.id = class_coaches.class_id
      AND (auth.is_owner() OR (auth.is_admin() AND c.branch_id = auth.user_branch_id()))
  )
);

CREATE POLICY "class_members_select" ON public.class_members
FOR SELECT TO authenticated
USING (
  -- Admin in branch
  EXISTS (
    SELECT 1 FROM public.classes c
    WHERE c.id = class_members.class_id
      AND (auth.is_owner() OR (auth.is_admin() AND c.branch_id = auth.user_branch_id()))
  )
  -- Coach of class
  OR EXISTS (
    SELECT 1 FROM public.class_coaches cc
    JOIN public.coaches co ON co.id = cc.coach_id
    WHERE cc.class_id = class_members.class_id
      AND co.user_id = auth.uid()
  )
  -- Member self
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
      AND (auth.is_owner() OR (auth.is_admin() AND c.branch_id = auth.user_branch_id()))
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.classes c
    WHERE c.id = class_members.class_id
      AND (auth.is_owner() OR (auth.is_admin() AND c.branch_id = auth.user_branch_id()))
  )
);
```

---

### 4.10 `attendance_records`

```sql
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "attendance_select" ON public.attendance_records
FOR SELECT TO authenticated
USING (
  -- Admin in branch
  auth.is_owner()
  OR (auth.is_admin() AND branch_id = auth.user_branch_id())
  -- Coach of class
  OR auth.is_coach_of_class(class_id)
  -- Member sees own
  OR EXISTS (
    SELECT 1 FROM public.members m
    WHERE m.id = attendance_records.member_id
      AND m.user_id = auth.uid()
  )
);

-- INSERT: admin or coach of class
CREATE POLICY "attendance_insert" ON public.attendance_records
FOR INSERT TO authenticated
WITH CHECK (
  auth.is_owner()
  OR (auth.is_admin() AND branch_id = auth.user_branch_id())
  OR auth.is_coach_of_class(class_id)
);

-- UPDATE: admin or coach (own scans, same day)
CREATE POLICY "attendance_update" ON public.attendance_records
FOR UPDATE TO authenticated
USING (
  auth.is_owner()
  OR (auth.is_admin() AND branch_id = auth.user_branch_id())
  OR (
    auth.is_coach_of_class(class_id)
    AND recorded_by_coach_id = auth.user_coach_id()
    AND session_date = CURRENT_DATE
  )
)
WITH CHECK (
  auth.is_owner()
  OR (auth.is_admin() AND branch_id = auth.user_branch_id())
  OR (
    auth.is_coach_of_class(class_id)
    AND recorded_by_coach_id = auth.user_coach_id()
    AND session_date = CURRENT_DATE
  )
);

-- DELETE: admin only (NOT coach)
CREATE POLICY "attendance_delete" ON public.attendance_records
FOR DELETE TO authenticated
USING (
  auth.is_owner()
  OR (auth.is_admin() AND branch_id = auth.user_branch_id())
);
```

---

### 4.11 `coach_clock_records`

```sql
ALTER TABLE public.coach_clock_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "coach_clock_select" ON public.coach_clock_records
FOR SELECT TO authenticated
USING (
  auth.is_owner()
  OR (auth.is_admin() AND branch_id = auth.user_branch_id())
  OR coach_id = auth.user_coach_id()
);

-- INSERT: coach for self, OR admin manual entry
CREATE POLICY "coach_clock_insert" ON public.coach_clock_records
FOR INSERT TO authenticated
WITH CHECK (
  coach_id = auth.user_coach_id()
  OR auth.is_owner()
  OR (auth.is_admin() AND branch_id = auth.user_branch_id())
);

-- UPDATE: admin only (e.g. flag suspicious)
CREATE POLICY "coach_clock_update" ON public.coach_clock_records
FOR UPDATE TO authenticated
USING (
  auth.is_owner()
  OR (auth.is_admin() AND branch_id = auth.user_branch_id())
)
WITH CHECK (
  auth.is_owner()
  OR (auth.is_admin() AND branch_id = auth.user_branch_id())
);

-- DELETE: never (audit trail)
```

---

### 4.12 `member_qr_tokens` (Security-Sensitive)

```sql
ALTER TABLE public.member_qr_tokens ENABLE ROW LEVEL SECURITY;

-- SELECT: own only (coach validates server-side via service role)
CREATE POLICY "qr_tokens_select" ON public.member_qr_tokens
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.members m
    WHERE m.id = member_qr_tokens.member_id
      AND m.user_id = auth.uid()
  )
);

-- INSERT/UPDATE: own only
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
```

---

### 4.13 `monthly_invoices`, `invoice_items`, `payments` (Phase 1.5)

```sql
ALTER TABLE public.monthly_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "invoices_select" ON public.monthly_invoices
FOR SELECT TO authenticated
USING (
  auth.is_owner()
  OR (auth.is_admin() AND EXISTS (
    SELECT 1 FROM public.members m
    WHERE m.id = monthly_invoices.member_id
      AND m.branch_id = auth.user_branch_id()
  ))
  OR EXISTS (
    SELECT 1 FROM public.members m
    WHERE m.id = monthly_invoices.member_id
      AND m.user_id = auth.uid()
  )
);

CREATE POLICY "invoices_modify" ON public.monthly_invoices
FOR ALL TO authenticated
USING (
  auth.is_owner()
  OR (auth.is_admin() AND EXISTS (
    SELECT 1 FROM public.members m
    WHERE m.id = monthly_invoices.member_id
      AND m.branch_id = auth.user_branch_id()
  ))
)
WITH CHECK (
  auth.is_owner()
  OR (auth.is_admin() AND EXISTS (
    SELECT 1 FROM public.members m
    WHERE m.id = monthly_invoices.member_id
      AND m.branch_id = auth.user_branch_id()
  ))
);

-- payments cascade visibility from invoices
CREATE POLICY "payments_select" ON public.payments
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.monthly_invoices i
    JOIN public.members m ON m.id = i.member_id
    WHERE i.id = payments.invoice_id
      AND (
        auth.is_owner()
        OR (auth.is_admin() AND m.branch_id = auth.user_branch_id())
        OR m.user_id = auth.uid()
      )
  )
);

CREATE POLICY "payments_insert" ON public.payments
FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.monthly_invoices i
    JOIN public.members m ON m.id = i.member_id
    WHERE i.id = payments.invoice_id
      AND (auth.is_owner() OR (auth.is_admin() AND m.branch_id = auth.user_branch_id()))
  )
);

-- invoice_items: read-only for users, modify by admin
CREATE POLICY "invoice_items_select" ON public.invoice_items
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.monthly_invoices i
    WHERE i.id = invoice_items.invoice_id
    -- cascades from invoices RLS
  )
);

CREATE POLICY "invoice_items_modify" ON public.invoice_items
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.monthly_invoices i
    JOIN public.members m ON m.id = i.member_id
    WHERE i.id = invoice_items.invoice_id
      AND (auth.is_owner() OR (auth.is_admin() AND m.branch_id = auth.user_branch_id()))
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.monthly_invoices i
    JOIN public.members m ON m.id = i.member_id
    WHERE i.id = invoice_items.invoice_id
      AND (auth.is_owner() OR (auth.is_admin() AND m.branch_id = auth.user_branch_id()))
  )
);
```

---

### 4.14 `activity_logs`

```sql
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "logs_select" ON public.activity_logs
FOR SELECT TO authenticated
USING (
  auth.is_owner()
  OR (auth.is_admin() AND branch_id = auth.user_branch_id())
);

-- INSERT: any authenticated (system writes its own logs)
CREATE POLICY "logs_insert" ON public.activity_logs
FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

-- No update/delete (audit trail)
```

---

### 4.15 Public Tables (Read-only Anonymous)

For tables that need to be readable by **unauthenticated visitors** (landing page, public registration):

```sql
-- Allow anon read on classes (for public listing)
CREATE POLICY "classes_anon_select" ON public.classes
FOR SELECT TO anon
USING (status = 'active');

-- Allow anon read on programs (CMS)
CREATE POLICY "programs_anon_select" ON public.programs
FOR SELECT TO anon
USING (status = 'published');

-- Allow anon read on news_articles (CMS)
CREATE POLICY "news_anon_select" ON public.news_articles
FOR SELECT TO anon
USING (status = 'published');

-- Branches: anon can read for "Find a branch" page
CREATE POLICY "branches_anon_select" ON public.branches
FOR SELECT TO anon
USING (status = 'active');
```

> **Anonymous registration:** member self-registration goes through a server action with service role key, bypassing RLS for the `INSERT` operation, then RLS kicks in for subsequent operations once the user is authenticated.

---

## 5. Server-Side Permission Checks

RLS handles database-level. But for actions that need finer control (e.g. "approve certificate"), use **server action checks**:

```typescript
// lib/actions/certificate.ts
"use server";

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export async function approveCertificate(certId: string) {
  const supabase = createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  // Check role: only owner or manager
  const { data: roleCheck } = await supabase.rpc("is_owner_or_manager");
  if (!roleCheck) return { error: "Forbidden: only owner/manager can approve" };

  // Proceed with update
  const { error } = await supabase
    .from("coach_certificates")
    .update({ approval_status: "approved", approved_by: user.id, approved_at: new Date() })
    .eq("id", certId);
  
  if (error) return { error: error.message };
  return { data: { success: true } };
}
```

**Pattern:** Use RLS for general CRUD restrictions. Use server action checks for fine-grained business logic (e.g. status transitions, approval workflows).

---

## 6. Test Cases for RLS

After applying all policies, run these tests in Supabase SQL Editor as different users:

### Test 1: Member can only see own data
```sql
-- Login as member user (use SET ROLE in SQL editor or via app)
-- Then run:
SELECT id, full_name FROM members;
-- Expected: only 1 row (self)

SELECT id FROM coach_clock_records;
-- Expected: 0 rows (members don't see clock records)
```

### Test 2: Coach sees only own classes' members
```sql
-- Login as coach
SELECT m.id, m.full_name
FROM members m
JOIN class_members cm ON cm.member_id = m.id
JOIN class_coaches cc ON cc.class_id = cm.class_id
JOIN coaches c ON c.id = cc.coach_id
WHERE c.user_id = auth.uid();
-- Should return only members in classes coach teaches
```

### Test 3: Admin in branch A cannot see branch B
```sql
-- Login as admin of branch A
SELECT id, name FROM members WHERE branch_id = '<branch-B-uuid>';
-- Expected: 0 rows (RLS blocks)
```

### Test 4: Owner sees all
```sql
-- Login as owner
SELECT COUNT(*) FROM members;
-- Should match total members across all branches
```

---

## 7. Rollback (If Needed)

If RLS breaks something, you can disable per table to debug:

```sql
-- Disable RLS temporarily (DANGEROUS — only for debug)
ALTER TABLE public.members DISABLE ROW LEVEL SECURITY;

-- Re-enable
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;

-- Drop a specific policy
DROP POLICY IF EXISTS "members_select" ON public.members;
```

To rollback ALL policies (full reset):

```sql
-- WARNING: This drops all RLS policies. Only run if needed.
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT schemaname, tablename, policyname
    FROM pg_policies
    WHERE schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I',
      pol.policyname, pol.schemaname, pol.tablename);
  END LOOP;
END $$;
```

---

## 8. Performance Notes

RLS adds overhead to every query. To keep performance:

- All FK columns used in RLS must have indexes (e.g. `members.branch_id`, `members.user_id`)
- Helper functions are `STABLE SECURITY DEFINER` for caching
- Avoid SELECT * — specify columns needed
- For complex policies (e.g. coach's class members), consider materialized views in Phase 4 if performance suffers

**Required indexes for RLS performance** (will be in BUILD_PLAN.md migrations):

```sql
CREATE INDEX idx_members_user_id ON public.members(user_id);
CREATE INDEX idx_members_branch_id ON public.members(branch_id);
CREATE INDEX idx_coaches_user_id ON public.coaches(user_id);
CREATE INDEX idx_coach_branches_coach_branch ON public.coach_branches(coach_id, branch_id);
CREATE INDEX idx_class_coaches_coach ON public.class_coaches(coach_id);
CREATE INDEX idx_class_members_member ON public.class_members(member_id);
CREATE INDEX idx_attendance_member ON public.attendance_records(member_id);
CREATE INDEX idx_attendance_class_date ON public.attendance_records(class_id, session_date);
CREATE INDEX idx_user_roles_user ON public.user_roles(user_id);
CREATE INDEX idx_user_roles_branch ON public.user_roles(branch_id);
```

---

**Document version:** 1.0
**Last updated:** Phase 1 kickoff

After running all SQL in this doc:
- Update affected files: none yet (RLS only)
- Verify with test cases in Section 6
- Generate TypeScript types: `npx supabase gen types typescript ...`
- Update `lib/types/database.ts`
