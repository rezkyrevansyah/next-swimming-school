# BUILD_PLAN.md

> **Step-by-step build order for AI agent.**
> Follow milestones in order. Don't skip ahead. Each milestone has a checkpoint to verify before moving on.

---

## Pre-Flight Checklist

Before M1 starts, confirm:

- [ ] Supabase project created (note URL + anon key + service role key)
- [ ] Vercel account ready
- [ ] Cloudflare account (for R2, Phase 2)
- [ ] Resend account (Phase 1.5)
- [ ] GitHub repo created
- [ ] All 4 docs reviewed: AGENT_CONTEXT, MVP_SCOPE, PERMISSION_MATRIX, BUILD_PLAN
- [ ] Owner email decided (for first-install)

---

## Milestone Overview

| ID | Milestone | Approx Duration |
|---|---|---|
| **M1** | Foundation | 1-2 weeks |
| **M2** | Database + RBAC + RLS | 1-2 weeks |
| **M3** | Admin CRUD (Members, Coaches, Classes) | 2-3 weeks |
| **M4** | Coach Daily Flow | 1-2 weeks |
| **M5** | Member Daily Flow | 1-2 weeks |
| **M6** | Public Site + Self-Registration + Polish | 1-2 weeks |
| **M7** | Phase 1 Hardening + Deploy | 1 week |

**Total Phase 1:** 8-14 weeks (solo, quality-focused).

> Tier B (1.5) starts after M7 sign-off.

---

# M1: Foundation

**Goal:** Project scaffolded, Supabase connected, auth working, base layouts ready.

## M1.1 Project Setup

### Tasks
- [ ] `npx create-next-app@latest next-swimming-school --typescript --tailwind --app --src-dir=false --eslint`
- [ ] `cd next-swimming-school && git init`
- [ ] Install required packages:
  ```bash
  npm install @supabase/supabase-js @supabase/ssr
  npm install react-hook-form @hookform/resolvers zod
  npm install @tanstack/react-query
  npm install zustand
  npm install browser-image-compression
  npm install date-fns
  npm install lucide-react
  npm install class-variance-authority clsx tailwind-merge
  ```
- [ ] Initialize shadcn: `npx shadcn@latest init`
- [ ] Setup folder structure per AGENT_CONTEXT.md Section 3
- [ ] Create `.env.local` and `.env.example` with Supabase keys
- [ ] Create `.gitignore` (ensure `.env.local` excluded)

### Files to create
- [ ] `utils/supabase/client.ts` (per AGENT_CONTEXT)
- [ ] `utils/supabase/server.ts` (per AGENT_CONTEXT)
- [ ] `utils/supabase/middleware.ts` (per AGENT_CONTEXT)
- [ ] `middleware.ts` (root)
- [ ] `lib/types/common.ts` — shared types (`ActionResult`, `PaginatedResult`)
- [ ] `lib/utils/cn.ts` — Tailwind class merger
- [ ] `lib/constants/index.ts` — constants per AGENT_CONTEXT Section 10

### Checkpoint M1.1
- [ ] `npm run dev` starts successfully
- [ ] Default Next.js page loads at localhost:3000
- [ ] Supabase client compiles without errors
- [ ] No console errors

---

## M1.2 Base Layout & Routing Skeleton

### Tasks
- [ ] Create route group folders (empty pages with placeholders):
  - `app/(public)/page.tsx` — landing placeholder
  - `app/(public)/layout.tsx` — public layout
  - `app/(auth)/login/page.tsx` — login placeholder
  - `app/m/dashboard/page.tsx` — member placeholder
  - `app/m/layout.tsx` — member layout
  - `app/c/dashboard/page.tsx` — coach placeholder
  - `app/c/layout.tsx` — coach layout
  - `app/a/dashboard/page.tsx` — admin placeholder
  - `app/a/layout.tsx` — admin layout
  - `app/o/dashboard/page.tsx` — owner placeholder (Phase 2 placeholder)
- [ ] Add basic shadcn components: `button`, `input`, `label`, `form`, `toast`, `card`, `dropdown-menu`, `avatar`, `badge`, `dialog`, `select`, `tabs`, `table`
- [ ] Create shared layout components:
  - `components/shared/site-header.tsx` (public)
  - `components/shared/admin-sidebar.tsx` (admin)
  - `components/shared/coach-bottom-nav.tsx` (mobile-first coach nav)
  - `components/shared/member-bottom-nav.tsx` (mobile-first member nav)
- [ ] Setup font (Inter or similar) in `app/layout.tsx`
- [ ] Setup TanStack Query provider in root layout
- [ ] Setup Toaster (shadcn `sonner`) in root layout

### Checkpoint M1.2
- [ ] All placeholder routes accessible (no 404)
- [ ] Layouts render correctly
- [ ] Mobile responsive baseline works
- [ ] No TypeScript errors

---

## M1.3 Auth — Login Flow

### Database change required: Yes

This is the very first schema. We'll set up the absolute minimum for auth to work.

> Run this in Supabase SQL Editor:

```sql
-- ============================================================================
-- M1.3 BASIC AUTH FOUNDATION
-- ============================================================================
-- Note: Supabase Auth users live in `auth.users` (managed automatically).
-- We extend with public.profiles, but this is created in M2.
-- For now, we just make sure auth is enabled (Supabase default).

-- Verify auth is enabled (no SQL needed; check Supabase Dashboard → Auth → Providers)
-- Enable "Email" provider with "Confirm email = OFF" for development
-- (will turn ON in production)

-- That's it for M1.3. Real schema starts in M2.
```

After running SQL: nothing yet (basic Supabase Auth works out-of-box).

### Tasks
- [ ] Create login page `app/(auth)/login/page.tsx`:
  - Form with email + password
  - Zod schema in `lib/schemas/auth.ts`
  - Server action in `lib/actions/auth.ts` calling `supabase.auth.signInWithPassword`
  - On success: redirect using `redirect()`
  - On failure: show error toast
- [ ] Create logout server action
- [ ] Add user dropdown in admin/coach/member headers with logout button
- [ ] Add redirect logic in middleware:
  - Unauthenticated user accessing `/m/*`, `/c/*`, `/a/*`, `/o/*` → redirect `/login`
  - Authenticated user accessing `/login` → redirect by role (after M2 implements roles)

### Checkpoint M1.3
- [ ] Manual test: create test user via Supabase Dashboard → Auth → Users
- [ ] Login at `/login` succeeds, redirects to `/m/dashboard` (default for now)
- [ ] Logout clears session
- [ ] Middleware blocks unauthenticated access to protected routes

---

# M2: Database + RBAC + RLS

**Goal:** Full database schema, roles, permissions, and RLS policies in place. First-install flow for owner works.

## M2.1 Core Schema (Auth + Branches + Roles)

### Database change required: Yes

> Run this in Supabase SQL Editor (in order):

```sql
-- ============================================================================
-- M2.1 - PART 1: ENUMS
-- ============================================================================

CREATE TYPE member_status AS ENUM (
  'pending_payment',
  'active',
  'inactive'
);

CREATE TYPE member_type AS ENUM (
  'regular',
  'affiliate'  -- Phase 2
);

CREATE TYPE payment_handling AS ENUM (
  'individual',
  'covered_by_school'  -- Phase 2
);

CREATE TYPE phone_owner AS ENUM (
  'self',
  'parent'
);

CREATE TYPE coach_status AS ENUM (
  'pending',
  'active',
  'inactive'
);

CREATE TYPE certificate_status AS ENUM (
  'pending_approval',
  'approved',
  'rejected'
);

CREATE TYPE class_status AS ENUM (
  'active',
  'inactive'
);

CREATE TYPE attendance_status AS ENUM (
  'present',
  'late',
  'permitted',
  'sick',
  'absent'
);

CREATE TYPE scan_method AS ENUM (
  'qr',
  'manual'
);

CREATE TYPE invoice_status AS ENUM (
  'unpaid',
  'paid',
  'partial'
);

CREATE TYPE branch_status AS ENUM (
  'active',
  'inactive'
);

CREATE TYPE article_status AS ENUM (
  'draft',
  'published',
  'archived'
);

-- ============================================================================
-- M2.1 - PART 2: BRANCHES
-- ============================================================================

CREATE TABLE public.branches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  address TEXT,
  location_lat DECIMAL(10, 7),
  location_lng DECIMAL(10, 7),
  contact_phone TEXT,
  contact_email TEXT,
  manager_id UUID,  -- FK added later (avoid circular)
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  status branch_status NOT NULL DEFAULT 'active',
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_branches_status ON public.branches(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_branches_default ON public.branches(is_default) WHERE is_default = TRUE;

-- ============================================================================
-- M2.1 - PART 3: ROLES & PERMISSIONS
-- ============================================================================

CREATE TABLE public.roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  level INT NOT NULL,  -- higher = more permission
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource TEXT NOT NULL,  -- e.g. 'members', 'classes'
  action TEXT NOT NULL,    -- e.g. 'create', 'read', 'update', 'delete'
  description TEXT,
  UNIQUE (resource, action)
);

CREATE TABLE public.role_permissions (
  role_id UUID REFERENCES public.roles(id) ON DELETE CASCADE,
  permission_id UUID REFERENCES public.permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE public.user_roles (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id UUID REFERENCES public.roles(id) ON DELETE CASCADE,
  branch_id UUID REFERENCES public.branches(id) ON DELETE CASCADE,
  -- branch_id NULL = global access (owner)
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, role_id, branch_id)
);

CREATE INDEX idx_user_roles_user ON public.user_roles(user_id);
CREATE INDEX idx_user_roles_branch ON public.user_roles(branch_id);

-- Now add FK from branches.manager_id
ALTER TABLE public.branches
  ADD CONSTRAINT fk_branches_manager
  FOREIGN KEY (manager_id) REFERENCES auth.users(id) ON DELETE SET NULL;

-- ============================================================================
-- M2.1 - PART 4: SEED ROLES
-- ============================================================================

INSERT INTO public.roles (name, description, level) VALUES
  ('owner', 'Full system access across all branches', 100),
  ('manager', 'Branch-level manager with admin oversight', 80),
  ('admin', 'Daily operations admin within a branch', 60),
  ('coach', 'Swimming coach with class access', 40),
  ('member', 'Swimming school student or parent', 20),
  ('school', 'Affiliated school read-only access (Phase 2)', 30);
```

After running SQL:
- Verify all tables exist via Table Editor
- Verify roles seeded: `SELECT * FROM public.roles;`
- No file/module changes yet
- Update TypeScript types: `npx supabase gen types typescript --project-id YOUR_ID > lib/types/database.ts`

### Rollback (if needed)
```sql
DROP TABLE IF EXISTS public.user_roles CASCADE;
DROP TABLE IF EXISTS public.role_permissions CASCADE;
DROP TABLE IF EXISTS public.permissions CASCADE;
DROP TABLE IF EXISTS public.roles CASCADE;
ALTER TABLE public.branches DROP CONSTRAINT IF EXISTS fk_branches_manager;
DROP TABLE IF EXISTS public.branches CASCADE;
DROP TYPE IF EXISTS member_status, member_type, payment_handling, phone_owner,
                    coach_status, certificate_status, class_status,
                    attendance_status, scan_method, invoice_status,
                    branch_status, article_status CASCADE;
```

---

## M2.2 Members & Coaches Schema

### Database change required: Yes

> Run this in Supabase SQL Editor:

```sql
-- ============================================================================
-- M2.2 - MEMBERS, COACHES, SCHOOLS
-- ============================================================================

-- SCHOOLS (Phase 2 use, but table created now for FK)
CREATE TABLE public.schools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id UUID NOT NULL REFERENCES public.branches(id) ON DELETE RESTRICT,
  name TEXT NOT NULL,
  contact_person TEXT,
  contact_phone TEXT,
  address TEXT,
  school_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_schools_branch ON public.schools(branch_id);

-- MEMBERS
CREATE TABLE public.members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL,
  -- NULL allowed for affiliate members without account (Phase 2)
  branch_id UUID NOT NULL REFERENCES public.branches(id) ON DELETE RESTRICT,
  member_id_code TEXT NOT NULL,
  type member_type NOT NULL DEFAULT 'regular',
  school_id UUID REFERENCES public.schools(id) ON DELETE SET NULL,
  payment_handling payment_handling NOT NULL DEFAULT 'individual',
  has_account BOOLEAN NOT NULL DEFAULT TRUE,
  status member_status NOT NULL DEFAULT 'pending_payment',
  joined_date DATE NOT NULL DEFAULT CURRENT_DATE,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT unique_member_code_per_branch UNIQUE (branch_id, member_id_code),
  CONSTRAINT affiliate_must_have_school CHECK (
    type != 'affiliate' OR school_id IS NOT NULL
  ),
  CONSTRAINT affiliate_payment_check CHECK (
    type != 'affiliate' OR payment_handling = 'covered_by_school'
  )
);

CREATE INDEX idx_members_user ON public.members(user_id);
CREATE INDEX idx_members_branch ON public.members(branch_id);
CREATE INDEX idx_members_status ON public.members(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_members_type ON public.members(type);

CREATE TABLE public.member_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID UNIQUE NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  nickname TEXT,
  dob DATE NOT NULL,
  gender TEXT CHECK (gender IN ('male', 'female')),
  photo_url TEXT,
  phone TEXT,
  phone_owner phone_owner NOT NULL DEFAULT 'self',
  parent_name TEXT,
  parent_phone TEXT,
  address TEXT,
  health_history TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.member_qr_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  token TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_qr_tokens_token ON public.member_qr_tokens(token);
CREATE INDEX idx_qr_tokens_member ON public.member_qr_tokens(member_id);
CREATE INDEX idx_qr_tokens_expiry ON public.member_qr_tokens(expires_at);

-- COACHES
CREATE TABLE public.coaches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  coach_id_code TEXT NOT NULL UNIQUE,
  status coach_status NOT NULL DEFAULT 'active',
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_coaches_user ON public.coaches(user_id);

CREATE TABLE public.coach_branches (
  coach_id UUID NOT NULL REFERENCES public.coaches(id) ON DELETE CASCADE,
  branch_id UUID NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
  is_primary BOOLEAN NOT NULL DEFAULT FALSE,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (coach_id, branch_id)
);

CREATE INDEX idx_coach_branches_branch ON public.coach_branches(branch_id);
CREATE INDEX idx_coach_branches_primary ON public.coach_branches(coach_id) WHERE is_primary = TRUE;

CREATE TABLE public.coach_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id UUID UNIQUE NOT NULL REFERENCES public.coaches(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  nickname TEXT,
  dob DATE,
  gender TEXT CHECK (gender IN ('male', 'female')),
  photo_url TEXT,
  phone TEXT,
  specializations TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.coach_certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id UUID NOT NULL REFERENCES public.coaches(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  photo_url TEXT,
  issued_year INT,
  valid_until DATE,
  no_expiry BOOLEAN NOT NULL DEFAULT FALSE,
  approval_status certificate_status NOT NULL DEFAULT 'pending_approval',
  approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,
  approval_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT valid_year CHECK (issued_year IS NULL OR (issued_year >= 1970 AND issued_year <= EXTRACT(YEAR FROM NOW())::INT + 1))
);

CREATE INDEX idx_certs_coach ON public.coach_certificates(coach_id);
CREATE INDEX idx_certs_status ON public.coach_certificates(approval_status);
```

After running SQL:
- Verify via Table Editor
- Update TypeScript types: regenerate via supabase CLI
- No file/module updates yet

### Rollback
```sql
DROP TABLE IF EXISTS public.coach_certificates CASCADE;
DROP TABLE IF EXISTS public.coach_profiles CASCADE;
DROP TABLE IF EXISTS public.coach_branches CASCADE;
DROP TABLE IF EXISTS public.coaches CASCADE;
DROP TABLE IF EXISTS public.member_qr_tokens CASCADE;
DROP TABLE IF EXISTS public.member_profiles CASCADE;
DROP TABLE IF EXISTS public.members CASCADE;
DROP TABLE IF EXISTS public.schools CASCADE;
```

---

## M2.3 Classes, Attendance, Misc Schema

### Database change required: Yes

> Run this in Supabase SQL Editor:

```sql
-- ============================================================================
-- M2.3 - CLASSES, ATTENDANCE, AUXILIARIES
-- ============================================================================

-- CLASSES
CREATE TABLE public.classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id UUID NOT NULL REFERENCES public.branches(id) ON DELETE RESTRICT,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  age_range_min INT,
  age_range_max INT,
  monthly_price DECIMAL(12, 2) NOT NULL DEFAULT 0,
  sessions_per_month INT NOT NULL DEFAULT 4,
  capacity INT NOT NULL DEFAULT 10,
  location_lat DECIMAL(10, 7),
  location_lng DECIMAL(10, 7),
  location_name TEXT,
  status class_status NOT NULL DEFAULT 'active',
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT positive_price CHECK (monthly_price >= 0),
  CONSTRAINT positive_capacity CHECK (capacity > 0),
  CONSTRAINT positive_sessions CHECK (sessions_per_month > 0),
  CONSTRAINT valid_age_range CHECK (
    age_range_min IS NULL OR age_range_max IS NULL OR age_range_min <= age_range_max
  ),
  CONSTRAINT unique_slug_per_branch UNIQUE (branch_id, slug)
);

CREATE INDEX idx_classes_branch ON public.classes(branch_id);
CREATE INDEX idx_classes_status ON public.classes(status) WHERE deleted_at IS NULL;

CREATE TABLE public.class_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  CONSTRAINT valid_time_range CHECK (end_time > start_time)
);

CREATE INDEX idx_schedules_class ON public.class_schedules(class_id);
CREATE INDEX idx_schedules_dow ON public.class_schedules(day_of_week);

CREATE TABLE public.class_coaches (
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  coach_id UUID NOT NULL REFERENCES public.coaches(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (class_id, coach_id)
);

CREATE INDEX idx_class_coaches_coach ON public.class_coaches(coach_id);

CREATE TABLE public.class_members (
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'enrolled' CHECK (status IN ('enrolled', 'completed', 'withdrawn')),
  PRIMARY KEY (class_id, member_id)
);

CREATE INDEX idx_class_members_member ON public.class_members(member_id);

-- ATTENDANCE
CREATE TABLE public.attendance_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE RESTRICT,
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE RESTRICT,
  branch_id UUID NOT NULL REFERENCES public.branches(id) ON DELETE RESTRICT,
  session_date DATE NOT NULL,
  status attendance_status NOT NULL,
  recorded_by_coach_id UUID REFERENCES public.coaches(id) ON DELETE SET NULL,
  scanned_at TIMESTAMPTZ,
  scan_method scan_method NOT NULL DEFAULT 'manual',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Prevent duplicate records for same member+class+date
  CONSTRAINT unique_attendance UNIQUE (member_id, class_id, session_date)
);

CREATE INDEX idx_attendance_member ON public.attendance_records(member_id);
CREATE INDEX idx_attendance_class_date ON public.attendance_records(class_id, session_date);
CREATE INDEX idx_attendance_branch ON public.attendance_records(branch_id);
CREATE INDEX idx_attendance_date ON public.attendance_records(session_date);

CREATE TABLE public.coach_clock_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id UUID NOT NULL REFERENCES public.coaches(id) ON DELETE RESTRICT,
  branch_id UUID NOT NULL REFERENCES public.branches(id) ON DELETE RESTRICT,
  clock_in_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  clock_in_selfie_url TEXT,
  clock_in_lat DECIMAL(10, 7),
  clock_in_lng DECIMAL(10, 7),
  clock_in_distance_m DECIMAL(10, 2),
  clock_in_accuracy DECIMAL(10, 2),
  ip_address INET,
  user_agent TEXT,
  suspicious_flag BOOLEAN NOT NULL DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- One clock-in per coach per branch per day
  CONSTRAINT unique_clock_per_day UNIQUE (coach_id, branch_id, (clock_in_at::DATE)),
  CONSTRAINT positive_distance CHECK (clock_in_distance_m IS NULL OR clock_in_distance_m >= 0)
);

CREATE INDEX idx_clock_coach ON public.coach_clock_records(coach_id);
CREATE INDEX idx_clock_branch_date ON public.coach_clock_records(branch_id, clock_in_at);

-- AUXILIARIES
CREATE TABLE public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  branch_id UUID REFERENCES public.branches(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_logs_user ON public.activity_logs(user_id);
CREATE INDEX idx_logs_branch ON public.activity_logs(branch_id);
CREATE INDEX idx_logs_resource ON public.activity_logs(resource_type, resource_id);
CREATE INDEX idx_logs_created ON public.activity_logs(created_at DESC);

-- Update timestamp trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Apply to tables that have updated_at
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.branches
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.members
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.member_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.coaches
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.coach_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.coach_certificates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.classes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.attendance_records
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.schools
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
```

After running SQL:
- Update TypeScript types
- All tables now exist; ready for RLS in M2.4

### Rollback
```sql
DROP TABLE IF EXISTS public.activity_logs CASCADE;
DROP TABLE IF EXISTS public.coach_clock_records CASCADE;
DROP TABLE IF EXISTS public.attendance_records CASCADE;
DROP TABLE IF EXISTS public.class_members CASCADE;
DROP TABLE IF EXISTS public.class_coaches CASCADE;
DROP TABLE IF EXISTS public.class_schedules CASCADE;
DROP TABLE IF EXISTS public.classes CASCADE;
DROP FUNCTION IF EXISTS public.update_updated_at CASCADE;
```

---

## M2.4 RLS Helper Functions + Policies

### Database change required: Yes

Run all SQL from `PERMISSION_MATRIX.md` Section 3 and Section 4 in order:

1. Run Section 3 (Helper Functions) entirely
2. Run Section 4 (RLS Policies) for each table from 4.1 through 4.14
3. Run Section 4.15 (Public Tables / Anon)
4. Run Section 8 (Performance Indexes)

After running:
- Test RLS using Section 6 test queries from PERMISSION_MATRIX.md
- Generate types: `npx supabase gen types typescript --project-id YOUR_ID > lib/types/database.ts`
- Update env vars: ensure `SUPABASE_SERVICE_ROLE_KEY` is set (server-only) for bypass cases

### Files to update
- [ ] Add helper TypeScript types in `lib/types/database.ts` (auto-gen)
- [ ] Create `lib/utils/permissions.ts` — typed wrappers for role checks if needed

---

## M2.5 First-Install Flow (Owner Bootstrap)

### Database change required: Yes (one-time SQL)

> Run this in Supabase SQL Editor ONCE, after creating owner via Auth Dashboard:

```sql
-- ============================================================================
-- M2.5 - OWNER BOOTSTRAP
-- ============================================================================
-- Step 1: Manually create owner user via Supabase Dashboard → Authentication → Users → Add user
--   Email: [owner email]
--   Password: [secure password]
--   Confirm email: yes (auto-confirm)
-- Note the resulting user UUID.

-- Step 2: Insert owner role
DO $$
DECLARE
  owner_user_id UUID := '[PASTE_OWNER_UUID_HERE]';
  owner_role_id UUID;
BEGIN
  SELECT id INTO owner_role_id FROM public.roles WHERE name = 'owner';
  
  INSERT INTO public.user_roles (user_id, role_id, branch_id)
  VALUES (owner_user_id, owner_role_id, NULL);  -- NULL branch = global
  
  -- Step 3: Create default branch
  INSERT INTO public.branches (name, slug, is_default, manager_id)
  VALUES ('Next Swimming School Pusat', 'pusat', TRUE, owner_user_id);
END $$;

-- Verify
SELECT u.email, r.name AS role, b.name AS branch
FROM auth.users u
LEFT JOIN public.user_roles ur ON ur.user_id = u.id
LEFT JOIN public.roles r ON r.id = ur.role_id
LEFT JOIN public.branches b ON b.id = ur.branch_id
WHERE u.email = '[OWNER_EMAIL]';
```

After running SQL:
- Owner can now log in
- Default branch exists
- Update files: implement role-based redirect after login (see M2.6)

### Rollback
```sql
DELETE FROM public.user_roles WHERE user_id = '[OWNER_UUID]';
DELETE FROM public.branches WHERE slug = 'pusat';
-- Then delete user via Auth Dashboard
```

---

## M2.6 Role-Based Redirect After Login

### Tasks
- [ ] Create `lib/utils/auth-helpers.ts`:
  - `getCurrentUserRole()` server function
  - `getRoleRedirectPath(role)` returns dashboard path per role
- [ ] Update login server action: after success, fetch role and redirect
- [ ] Update middleware: redirect logged-in user from `/login` to their dashboard
- [ ] Add unauthorized page `app/unauthorized/page.tsx` for role mismatches

### Checkpoint M2
- [ ] Owner logs in → goes to `/o/dashboard` (or `/a/dashboard` if owner has no separate panel yet)
- [ ] All schemas exist with RLS enabled
- [ ] RLS test queries from PERMISSION_MATRIX pass
- [ ] No TypeScript errors after type regeneration

---

# M3: Admin CRUD (Members, Coaches, Classes)

**Goal:** Admin can manage members, coaches, and classes via panel UI.

## M3.1 Admin Layout & Navigation

### Tasks
- [ ] Build admin layout with sidebar:
  - Dashboard, Member, Coach, Kelas, (placeholders for Phase 2: Absensi, Rapot, Finansial, etc.)
  - User dropdown with logout
  - Branch indicator (Phase 1: shows "Cabang Pusat")
  - Mobile: hamburger menu
- [ ] Build empty admin dashboard with placeholder cards (real stats in M5)

## M3.2 Member Management

### Tasks
- [ ] Create Zod schemas in `lib/schemas/member.ts`:
  - `memberCreateSchema`
  - `memberUpdateSchema`
  - `memberFilterSchema`
- [ ] Server actions in `lib/actions/member.ts`:
  - `createMember(data)` — creates auth user + member + profile in transaction
  - `updateMember(id, data)`
  - `softDeleteMember(id)` — sets deleted_at + status='inactive'
  - `restoreMember(id)`
  - `resetMemberPassword(id, newPassword)` — admin manual reset
- [ ] Helper: `generateMemberCode(branchId)` — generates `NSS-XXXX-YYYY`
- [ ] Build pages:
  - `/a/member` — table list with search, filter, pagination (use TanStack Query)
  - `/a/member/baru` — multi-step form
  - `/a/member/[id]` — detail with tabs (Profil, Kelas, Absensi, Log)
  - Inline edit OR separate edit page
- [ ] Components:
  - `components/admin/member/member-table.tsx`
  - `components/admin/member/member-form.tsx`
  - `components/admin/member/member-detail-tabs.tsx`
- [ ] Mobile responsive: cards on mobile, table on desktop

### Acceptance Criteria
Verify Story D1-D5 from MVP_SCOPE.md.

## M3.3 Coach Management

### Tasks
- [ ] Zod schemas: `lib/schemas/coach.ts`
- [ ] Server actions in `lib/actions/coach.ts`:
  - `createCoach(data)` — creates auth user + coach + profile + branch assignment + certificates
  - `updateCoach(id, data)`
  - `softDeleteCoach(id)`
  - `addCertificate(coachId, data)`
  - `updateCertificate(id, data)`
  - `removeCertificate(id)`
- [ ] Helper: `generateCoachCode(branchId)` — `NSS-CXXX-YYYY`
- [ ] File upload helper for photos & certificates (Supabase Storage in Phase 1)
- [ ] Build pages:
  - `/a/coach` — list
  - `/a/coach/baru` — form with dynamic certificate fields
  - `/a/coach/[id]` — detail with tabs (Profil, Kelas, Sertifikat, Absensi)
- [ ] In Phase 1, sertifikat shows in tab but no approval flow yet

### Acceptance Criteria
Verify Story F1-F2 from MVP_SCOPE.md.

## M3.4 Class Management

### Tasks
- [ ] Zod schemas: `lib/schemas/class.ts`
- [ ] Server actions in `lib/actions/class.ts`:
  - `createClass(data)` — creates class + schedules + coaches in transaction
  - `updateClass(id, data)`
  - `softDeleteClass(id)`
  - `enrollMember(classId, memberId)` — checks capacity
  - `unenrollMember(classId, memberId)`
  - `assignCoach(classId, coachId)`
  - `unassignCoach(classId, coachId)`
- [ ] Build pages:
  - `/a/kelas` — list
  - `/a/kelas/baru` — form with day/time picker
  - `/a/kelas/[id]` — detail showing members + coaches
- [ ] Components:
  - `components/admin/class/schedule-picker.tsx` — multi-day + time
  - `components/admin/class/coach-selector.tsx`
  - `components/admin/class/member-roster.tsx`

### Acceptance Criteria
Verify Story G1-G2 from MVP_SCOPE.md.

### Checkpoint M3
- [ ] Admin can create, view, edit, soft-delete members
- [ ] Admin can create, view, edit, soft-delete coaches with certificates
- [ ] Admin can create, view, edit, soft-delete classes with schedule + coach + member assignment
- [ ] All CRUD actions log to activity_logs
- [ ] Mobile responsive on all pages
- [ ] RLS verified: admin sees only own branch data

---

# M4: Coach Daily Flow

**Goal:** Coach can log in, clock-in, take attendance via QR scan or manual checklist.

## M4.1 Coach Layout & Dashboard

### Tasks
- [ ] Build coach layout (mobile-first with bottom nav):
  - Dashboard, Absensi, Kelas, Member, Profil
  - Settings menu in header
- [ ] Build dashboard `/c/dashboard`:
  - Greeting card
  - "Hari Ini" section showing today's classes (sorted by time)
  - Clock-in banner (per Story H1)
  - Show "Tidak ada kelas" if empty

### Acceptance Criteria
Verify Story H1 from MVP_SCOPE.md.

## M4.2 Coach Clock-In

### Tasks
- [ ] Build `/c/clock-in` page:
  - Camera component using `getUserMedia` (front camera)
  - Capture button → preview → confirm
  - Geolocation request
  - On submit: compress selfie, upload to Storage, calculate distance via Haversine
- [ ] Server action `clockInCoach(data)`:
  - Validate: has class today in this branch, not already clocked in
  - Insert `coach_clock_records` row
  - Log to activity_logs
- [ ] Helper: `lib/utils/haversine.ts`
- [ ] Component: `components/coach/clock-in/camera-capture.tsx`
- [ ] Component: `components/coach/clock-in/result-display.tsx` (label + distance)

### Acceptance Criteria
Verify Story H2 from MVP_SCOPE.md.

## M4.3 QR Code Token System

### Database change required: Yes (RPC for QR validation)

> Run this in Supabase SQL Editor:

```sql
-- ============================================================================
-- M4.3 - QR TOKEN VALIDATION RPC
-- ============================================================================

CREATE OR REPLACE FUNCTION public.validate_qr_token(input_token TEXT)
RETURNS TABLE (
  member_id UUID,
  member_name TEXT,
  member_code TEXT,
  is_valid BOOLEAN,
  error_message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  token_record RECORD;
BEGIN
  SELECT mqt.member_id, mqt.expires_at
  INTO token_record
  FROM public.member_qr_tokens mqt
  WHERE mqt.token = input_token
  ORDER BY mqt.created_at DESC
  LIMIT 1;
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT NULL::UUID, NULL::TEXT, NULL::TEXT, FALSE, 'Token tidak ditemukan'::TEXT;
    RETURN;
  END IF;
  
  IF token_record.expires_at < NOW() THEN
    RETURN QUERY SELECT NULL::UUID, NULL::TEXT, NULL::TEXT, FALSE, 'Token expired'::TEXT;
    RETURN;
  END IF;
  
  RETURN QUERY
  SELECT 
    m.id,
    mp.full_name,
    m.member_id_code,
    TRUE,
    NULL::TEXT
  FROM public.members m
  JOIN public.member_profiles mp ON mp.member_id = m.id
  WHERE m.id = token_record.member_id
    AND m.status = 'active'
    AND m.deleted_at IS NULL;
END;
$$;

-- Grant execute to authenticated users (coach calls this)
GRANT EXECUTE ON FUNCTION public.validate_qr_token TO authenticated;
```

### Tasks
- [ ] Server action `generateQrToken(memberId)`:
  - Creates random token (UUID + signed)
  - Insert into `member_qr_tokens` with expires_at = NOW() + 30 sec
  - Return token to client
- [ ] Member page `/m/qr` displays QR (use `qrcode.react` library):
  - Auto-refresh token every 30s via TanStack Query
  - Fullscreen mode
- [ ] Coach scan → calls `validate_qr_token` RPC

## M4.4 Coach Attendance Flow

### Tasks
- [ ] Build `/c/absensi` (today's classes for clock-in coach)
- [ ] Build `/c/absensi/[kelas_id]`:
  - Tab "Scan QR" with camera scanner (use `@yudiel/react-qr-scanner` or `html5-qrcode`)
  - Tab "Manual Checklist" with member list + status dropdown
  - Live count display
- [ ] Server action `recordAttendanceByQr(token, classId)`:
  - Validate token via RPC
  - Check member is enrolled in class
  - Determine status (present/late based on timing)
  - Upsert into `attendance_records`
- [ ] Server action `recordAttendanceManual(memberId, classId, status, date)`
- [ ] Client component: `components/coach/attendance/qr-scanner.tsx`
- [ ] Client component: `components/coach/attendance/checklist-row.tsx`

### Acceptance Criteria
Verify Story H3-H5 from MVP_SCOPE.md.

### Checkpoint M4
- [ ] Coach can clock-in with selfie + GPS
- [ ] Coach can scan member QR and mark present
- [ ] Coach can manually mark Hadir/Izin/Sakit/Alpha
- [ ] Multiple coaches can take attendance simultaneously without errors
- [ ] Mobile responsive (primary use case)

---

# M5: Member Daily Flow

**Goal:** Member can log in, see dashboard, show QR, view attendance history.

## M5.1 Member Layout & Dashboard

### Tasks
- [ ] Build member layout (mobile-first bottom nav):
  - Dashboard, Jadwal, Absensi, Coach, Profil
- [ ] Build `/m/dashboard`:
  - Greeting + countdown to next class
  - Prominent "Tampilkan QR" CTA
  - Kelas berikutnya card
  - Stats bulan ini (calculated from attendance_records)
  - Coach saya card with WA button

### Acceptance Criteria
Verify Story I1 from MVP_SCOPE.md.

## M5.2 Member QR Display

### Tasks
- [ ] Build `/m/qr` page (fullscreen):
  - QR code with rotating token (refresh every 30s)
  - Member info below QR
  - Brightness max attempt (Wake Lock API for screen-on)
  - Close button
- [ ] Use `qrcode.react` library

### Acceptance Criteria
Verify Story I2 from MVP_SCOPE.md.

## M5.3 Member Attendance History

### Tasks
- [ ] Build `/m/absensi`:
  - List with filters (date range, class)
  - Show stats card on top
- [ ] Server query: `getMemberAttendance(filters)` with TanStack Query

### Acceptance Criteria
Verify Story I3-I5 from MVP_SCOPE.md.

## M5.4 Member Schedule & Coach Pages

### Tasks
- [ ] `/m/jadwal` — list of enrolled classes
- [ ] `/m/coach` — list of coaches across enrolled classes with WA buttons
- [ ] `/m/profil` — view own profile (read-only Phase 1)

### Checkpoint M5
- [ ] Member sees relevant data only (RLS verified)
- [ ] QR display works on mobile
- [ ] Attendance history paginated and filterable
- [ ] All pages mobile responsive

---

# M6: Public Site + Self-Registration

**Goal:** Public-facing landing + self-registration flow + minimal SEO.

## M6.1 Public Layout

### Tasks
- [ ] Build public site header with logo, nav (Beranda, Program, Berita, Tentang, Kontak), CTA "Daftar"
- [ ] Build public footer (contact, social, copyright)

## M6.2 Landing Page

### Tasks
- [ ] Build `/` (Phase 1 minimum sections per Story J1):
  - Hero with CTA
  - "Why Next" section (3-4 cards)
  - Programs preview (3-4 cards from `programs` table)
  - CTA section
  - Footer
- [ ] Setup metadata in `app/layout.tsx`:
  - Default title, description
  - OG tags
  - Twitter card
- [ ] Add `app/sitemap.ts` (Next.js auto-sitemap)
- [ ] Add `app/robots.ts`
- [ ] Add Schema.org JSON-LD for `LocalBusiness`
- [ ] Optimize images: use `next/image` with sizes

### Acceptance Criteria
- [ ] Lighthouse mobile Performance > 80
- [ ] Verify sitemap.xml loads
- [ ] Verify Schema markup with Google Rich Results test

## M6.3 Other Public Pages (Minimal)

### Tasks
- [ ] `/program` — list active classes with details (uses anon RLS)
- [ ] `/program/[slug]` — class detail
- [ ] `/tentang` — static page (placeholder content)
- [ ] `/kontak` — static page with branch contact info

> **Phase 1 simplification:** `/berita` is Tier B. Skip in Phase 1.

## M6.4 Self-Registration Flow

### Tasks
- [ ] Build `/daftar/member` multi-step form (Story E1):
  - Step 1: data member
  - Step 2: data kontak
  - Step 3: pilih cabang & kelas
- [ ] Use React Hook Form with multi-step state (preserve on back/forward)
- [ ] Foto compression before upload
- [ ] Server action `registerMember(data)`:
  - Use service role (bypasses RLS for INSERT)
  - Create auth user (Supabase Admin API)
  - Insert member, member_profile, class_members rows in transaction
  - Generate member_id_code
  - Return success with member info
- [ ] Build `/daftar/member/sukses` confirmation page:
  - Status info
  - WA button with auto-generated message
  - Bank info
  - Link to login

### Acceptance Criteria
Verify Story E1-E2 from MVP_SCOPE.md.

## M6.5 Admin Approval for Pending Registrations

### Tasks
- [ ] Build `/a/member/registrasi`:
  - List `pending_payment` members
  - Click → review detail
  - Approve button → set status='active', log action
  - Reject button → soft delete with reason
- [ ] Server actions: `approveMember(id)`, `rejectMember(id, reason)`

### Checkpoint M6
- [ ] Public site accessible without login
- [ ] Member self-registration works end-to-end
- [ ] Admin can approve pending registrations
- [ ] After approval, member can log in
- [ ] SEO basics verified (sitemap, robots, schema)

---

# M7: Phase 1 Hardening + Deploy

**Goal:** Polish, fix bugs, deploy to Vercel.

## M7.1 End-to-End Testing

### Manual test scenarios (run all before deploy)
- [ ] Owner login → dashboard
- [ ] Admin creates member → member receives credentials → member logs in
- [ ] Self-registration → admin approves → member logs in
- [ ] Admin creates coach → coach logs in
- [ ] Admin creates class → assigns coach + members
- [ ] Coach clock-in → take attendance via QR + manual
- [ ] Member shows QR → coach scans → record created
- [ ] Member views attendance history
- [ ] Soft delete member → can't log in
- [ ] Restore member → can log in again
- [ ] All RLS test queries pass (PERMISSION_MATRIX Section 6)

## M7.2 Polish

### Tasks
- [ ] Add loading skeletons to all data-fetching pages
- [ ] Add empty states with helpful messages
- [ ] Add proper error boundaries
- [ ] Verify Indonesian text everywhere user-facing
- [ ] Check mobile responsive on:
  - iPhone SE (375px)
  - iPhone 14 Pro (393px)
  - Samsung Galaxy (360px)
  - Tablet (768px)
  - Desktop (1280px+)
- [ ] Lighthouse audit: Performance, Accessibility, SEO each > 80
- [ ] Run ESLint, fix all errors
- [ ] Run TypeScript check, no errors
- [ ] Verify `npm run build` succeeds

## M7.3 Deploy to Vercel

### Tasks
- [ ] Push to GitHub
- [ ] Connect Vercel to GitHub repo
- [ ] Add env vars in Vercel:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `NEXT_PUBLIC_APP_URL`
- [ ] Deploy
- [ ] Setup custom domain (if available)
- [ ] Update Supabase Auth redirect URLs to production domain
- [ ] Verify all flows work in production
- [ ] Setup Supabase auto-backup (Dashboard → Database → Backups, enable daily)

## M7.4 Documentation

### Tasks
- [ ] Update README.md with:
  - Project description
  - Local dev setup instructions
  - Deploy instructions
  - Link to docs folder
- [ ] Document any deviations from blueprint
- [ ] Note known limitations / Phase 2 deferrals

### Phase 1 Done When:
- [ ] All M1-M7 checkpoints passed
- [ ] All Tier A acceptance criteria from MVP_SCOPE met
- [ ] Production deployed and accessible
- [ ] Owner has reviewed and signed off
- [ ] Backup strategy in place

---

## Post-Phase 1: Tier B (Phase 1.5) Preview

After M7 sign-off, the next milestones (Tier B from MVP_SCOPE) start. Order:

1. Monthly billing & payments (M8)
2. Email notifications via Resend (M9)
3. Activity log UI (M10)
4. Sertifikat approval flow (M11)
5. CMS Berita (M12)

Each follows the same pattern: SQL migration → server actions → UI → checkpoint.

---

## Anti-Patterns to Avoid

The AI agent MUST NOT:

- ❌ Skip RLS policies "to make development faster"
- ❌ Use service role key on client side
- ❌ Hardcode user IDs or branch IDs in code
- ❌ Disable TypeScript strict mode
- ❌ Use `any` type without explicit justification comment
- ❌ Build features from blueprint that aren't in MVP_SCOPE Tier A
- ❌ Combine multiple unrelated DB changes into one migration
- ❌ Modify RLS policies without testing with multiple roles
- ❌ Catch errors silently
- ❌ Forget to update TypeScript types after schema changes
- ❌ Build features without acceptance criteria checked
- ❌ Skip mobile responsive verification

---

## Common Patterns Reference

When in doubt, look at AGENT_CONTEXT.md Section 7 for patterns:
- Auth-aware Server Component
- File Upload Helper
- RLS-aware Query
- Form with React Hook Form + Zod + Server Action

---

**Document version:** 1.0
**Last updated:** Phase 1 kickoff
**Build status:** Not started → M1 ready to begin
