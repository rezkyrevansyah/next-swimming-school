# BUILD_PLAN.md — v2 (Revised & Comprehensive)

> **Step-by-step build order for AI agent.**
> Follow milestones in order. Don't skip ahead. Each milestone has a checkpoint to verify before moving on.
>
> **HOW TO USE THIS DOCUMENT:**
> Before starting any task, always read:
> 1. `AGENT_CONTEXT.md` — folder structure, tech stack, coding patterns
> 2. `MVP_SCOPE.md` — what is in/out of Phase 1 Tier A
> 3. `PERMISSION_MATRIX.md` — RLS policies before touching any DB
> 4. `UI_DESIGN_SYSTEM.md` — design tokens and base components (READ FIRST before any UI work)
> 5. Per-panel UI docs:
>    - `UI_PUBLIC.md` — for public site + auth pages
>    - `UI_ADMIN.md` — for admin panel (`/a/*`) — desktop-first
>    - `UI_COACH.md` — for coach panel (`/c/*`) — mobile-first
>    - `UI_MEMBER.md` — for member panel (`/m/*`) — mobile-first
>
> **Reference these files constantly.** They contain exact wireframes, specs, component behaviors, and acceptance criteria.

---

## Pre-Flight Checklist

Before M1 starts, confirm:

- [ ] Supabase project created (note URL + anon key + service role key)
- [ ] Vercel account ready
- [ ] GitHub repo created
- [ ] All docs reviewed: `AGENT_CONTEXT.md`, `MVP_SCOPE.md`, `PERMISSION_MATRIX.md`, `BUILD_PLAN.md`, `UI_DESIGN_SYSTEM.md`
- [ ] Owner email decided (for first-install SQL)
- [ ] Node.js 20+ installed locally
- [ ] Supabase CLI installed locally (`npm install -g supabase`)

---

## Milestone Overview

| ID | Milestone | Key UI Files | Approx Duration |
|---|---|---|---|
| **M1** | Foundation — Setup, Auth, Base Layouts | `UI_DESIGN_SYSTEM.md`, `UI_PUBLIC.md` | 1–2 weeks |
| **M2** | Database + RBAC + RLS | `PERMISSION_MATRIX.md` | 1–2 weeks |
| **M3** | Admin Panel — Dashboard + Member CRUD | `UI_ADMIN.md` §1–5 | 2–3 weeks |
| **M4** | Admin Panel — Coach + Class CRUD + Absensi | `UI_ADMIN.md` §6–13 | 1–2 weeks |
| **M5** | Admin Panel — Approval Hub + Rapot (Admin view) | `UI_ADMIN.md` §14 | 1 week |
| **M6** | Coach Panel — Full Daily Flow | `UI_COACH.md` | 1–2 weeks |
| **M7** | Member Panel — Full Daily Flow | `UI_MEMBER.md` | 1–2 weeks |
| **M8** | Public Site + Self-Registration | `UI_PUBLIC.md` | 1–2 weeks |
| **M9** | Phase 1 Hardening + Deploy | All | 1 week |

**Total Phase 1:** 10–17 weeks (solo, quality-focused).

> Tier B (Phase 1.5) starts after M9 sign-off. See bottom of this file.

---

# M1: Foundation

**Goal:** Project scaffolded, Supabase connected, auth working, all base layouts skeleton ready, design system tokens installed.

**Reference files:** `AGENT_CONTEXT.md` (Section 3 folder structure, Section 4 Supabase patterns), `UI_DESIGN_SYSTEM.md` (tokens, typography, components).

---

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
  npm install qrcode.react
  npm install @yudiel/react-qr-scanner
  npm install recharts
  npm install next-themes
  ```
- [ ] Initialize shadcn: `npx shadcn@latest init`
- [ ] Add shadcn components:
  ```bash
  npx shadcn@latest add button input label form toast card dropdown-menu avatar badge dialog select tabs table checkbox radio-group textarea switch separator skeleton progress alert-dialog sonner
  ```
- [ ] Setup folder structure per `AGENT_CONTEXT.md` Section 3 (exact folders)
- [ ] Create `.env.local` and `.env.example` with all required keys
- [ ] Create `.gitignore` (ensure `.env.local` excluded)

### Files to create
- [ ] `utils/supabase/client.ts` — browser client (per `AGENT_CONTEXT.md` Section 4)
- [ ] `utils/supabase/server.ts` — server client
- [ ] `utils/supabase/middleware.ts` — session refresh
- [ ] `middleware.ts` (root) — route protection
- [ ] `lib/types/common.ts` — `ActionResult<T>`, `PaginatedResult<T>` (per `AGENT_CONTEXT.md` Section 6)
- [ ] `lib/utils/cn.ts` — Tailwind class merger
- [ ] `lib/constants/index.ts` — app-wide constants (roles, statuses, etc.)

### Checkpoint M1.1
- [ ] `npm run dev` starts successfully
- [ ] Default Next.js page loads at localhost:3000
- [ ] Supabase client compiles without errors
- [ ] No TypeScript errors

---

## M1.2 Design System Setup

> **Read `UI_DESIGN_SYSTEM.md` entirely before this step.**

### Tasks
- [ ] Apply CSS custom properties (design tokens) to `app/globals.css`:
  - All `--primary-*` color variables (50–950)
  - All `--neutral-*` variables
  - All `--accent-*` variables (water/teal palette)
  - All `--success-*`, `--warning-*`, `--danger-*`, `--info-*` semantic variables
  - Typography scale variables: `--text-display-*`, `--text-heading-*`, `--text-body-*`, `--text-label-*`
  - Spacing, radius, shadow tokens
- [ ] Configure Tailwind to extend with these tokens in `tailwind.config.ts`
- [ ] Install font: Inter (variable weight) via `next/font/google` in `app/layout.tsx`
- [ ] Create base UI components from design system:
  - `components/shared/stat-card.tsx` — sport-tech stat card with big number, trend indicator
  - `components/shared/status-badge.tsx` — semantic status badges (Aktif, Pending, Alpha, Hadir, etc.)
  - `components/shared/empty-state.tsx` — icon + title + description + optional action button
  - `components/shared/page-header.tsx` — page title + subtitle + action button slot
  - `components/shared/data-table.tsx` — reusable table wrapper with sort, pagination
  - `components/shared/confirm-modal.tsx` — destructive action confirmation dialog
  - `components/shared/skeleton-table.tsx` — shimmer skeleton for table rows
  - `components/shared/skeleton-card.tsx` — shimmer skeleton for cards

### Checkpoint M1.2
- [ ] All CSS tokens accessible in dev tools
- [ ] Stat card component renders with correct design system fonts/colors
- [ ] shadcn components render without errors

---

## M1.3 Base Layout & Routing Skeleton

> **Read `UI_ADMIN.md` (Global Admin Layout), `UI_COACH.md` (Global Coach Layout), `UI_MEMBER.md` (Global Member Layout), `UI_PUBLIC.md` (Global Public Layout) for exact wireframes.**

### Tasks

#### Route structure (create placeholder pages for all routes)
- [ ] `app/(public)/layout.tsx` — public layout with sticky header + footer
- [ ] `app/(public)/page.tsx` — landing placeholder
- [ ] `app/(public)/program/page.tsx`
- [ ] `app/(public)/program/[slug]/page.tsx`
- [ ] `app/(public)/tentang/page.tsx`
- [ ] `app/(public)/kontak/page.tsx`
- [ ] `app/(public)/daftar/member/page.tsx`
- [ ] `app/(public)/daftar/member/sukses/page.tsx`
- [ ] `app/(auth)/login/page.tsx` — login placeholder
- [ ] `app/(auth)/layout.tsx`
- [ ] `app/m/layout.tsx` — member layout
- [ ] `app/m/dashboard/page.tsx`
- [ ] `app/m/qr/page.tsx`
- [ ] `app/m/jadwal/page.tsx`
- [ ] `app/m/absensi/page.tsx`
- [ ] `app/m/coach/page.tsx`
- [ ] `app/m/profil/page.tsx`
- [ ] `app/m/notifikasi/page.tsx`
- [ ] `app/m/pengaturan/page.tsx`
- [ ] `app/c/layout.tsx` — coach layout
- [ ] `app/c/dashboard/page.tsx`
- [ ] `app/c/clock-in/page.tsx`
- [ ] `app/c/absensi/page.tsx`
- [ ] `app/c/absensi/[kelas_id]/page.tsx`
- [ ] `app/c/kelas/page.tsx`
- [ ] `app/c/kelas/[id]/page.tsx`
- [ ] `app/c/member/page.tsx`
- [ ] `app/c/member/[id]/page.tsx`
- [ ] `app/c/qr/page.tsx`
- [ ] `app/c/profil/page.tsx`
- [ ] `app/c/notifikasi/page.tsx`
- [ ] `app/c/pengaturan/page.tsx`
- [ ] `app/a/layout.tsx` — admin layout
- [ ] `app/a/dashboard/page.tsx`
- [ ] `app/a/member/page.tsx`
- [ ] `app/a/member/baru/page.tsx`
- [ ] `app/a/member/[id]/page.tsx`
- [ ] `app/a/member/registrasi/page.tsx`
- [ ] `app/a/coach/page.tsx`
- [ ] `app/a/coach/baru/page.tsx`
- [ ] `app/a/coach/[id]/page.tsx`
- [ ] `app/a/kelas/page.tsx`
- [ ] `app/a/kelas/baru/page.tsx`
- [ ] `app/a/kelas/[id]/page.tsx`
- [ ] `app/a/absensi/page.tsx`
- [ ] `app/a/absensi/manual/page.tsx`
- [ ] `app/a/absensi/coach/page.tsx`
- [ ] `app/a/approval/page.tsx`
- [ ] `app/a/log/page.tsx` (Tier B placeholder)
- [ ] `app/o/dashboard/page.tsx` — owner placeholder (Phase 2)
- [ ] `app/unauthorized/page.tsx`

#### Layout components
- [ ] `components/shared/public-header.tsx` — sticky nav per `UI_PUBLIC.md`
- [ ] `components/shared/public-footer.tsx` — dark footer per `UI_PUBLIC.md`
- [ ] `components/admin/admin-sidebar.tsx` — 240px sidebar with collapsible, per `UI_ADMIN.md` Global Layout
  - Branch indicator chip
  - Nav sections: OPERASIONAL, (Tier B: PEMBAYARAN, KONTEN), PENGATURAN
  - Active item: left 4px `--accent-400` border, bg `--primary-50`
  - User dropdown bottom: avatar + name + role badge + logout
  - Mobile: drawer mode (hamburger trigger)
- [ ] `components/admin/admin-header.tsx` — 64px top bar (search + bell + user)
- [ ] `components/coach/coach-bottom-nav.tsx` — 5-tab bottom nav per `UI_COACH.md`
  - Tabs: Beranda, Absensi (⚡ emphasis), Kelas, Member, Profil
  - Active tab: `--primary-600` icon + 3px `--accent-400` top indicator
- [ ] `components/coach/coach-header.tsx` — 56px mobile top header
- [ ] `components/member/member-bottom-nav.tsx` — 5-tab bottom nav per `UI_MEMBER.md`
  - Tabs: Home, Jadwal, Absen, Coach, Profil
- [ ] `components/member/member-header.tsx` — 56px mobile top header

#### Global setup
- [ ] Setup TanStack Query provider in `app/layout.tsx`
- [ ] Setup Toaster (shadcn `sonner`) in root layout
- [ ] Setup ThemeProvider if dark mode desired (Phase 2 — skip for now)

### Checkpoint M1.3
- [ ] All placeholder routes accessible (no 404)
- [ ] Admin sidebar renders correctly on desktop
- [ ] Coach bottom nav renders correctly on mobile
- [ ] Member bottom nav renders correctly on mobile
- [ ] Public header/footer render correctly
- [ ] No TypeScript errors

---

## M1.4 Auth — Login Flow

### Database change required: Yes (minimal — just enable Supabase Auth)

> In Supabase Dashboard → Auth → Providers: enable Email, set "Confirm email = OFF" for dev.

### Tasks
- [ ] Create Zod schema: `lib/schemas/auth.ts`
  - `loginSchema`: email (valid format), password (min 8 chars)
- [ ] Create server action: `lib/actions/auth.ts`
  - `login(data)` → calls `supabase.auth.signInWithPassword`, returns `ActionResult`
  - `logout()` → calls `supabase.auth.signOut`, redirects to `/login`
- [ ] Build login page `app/(auth)/login/page.tsx` per `UI_PUBLIC.md` Login section:
  - NSS logo top
  - Form: email, password (with eye toggle), "Lupa Password?" link (Phase C — shows toast "Hubungi admin")
  - Submit button with loading state
  - Error toast on failure (Indonesian text)
  - On success: redirect to appropriate dashboard by role
- [ ] Add middleware route protection in `middleware.ts`:
  - Unauthenticated → `/login`
  - Authenticated on `/login` → redirect by role (after M2 role detection implemented)
- [ ] Add logout button in admin header user dropdown
- [ ] Add logout in coach/member profile dropdown

### Checkpoint M1.4
- [ ] Create test user via Supabase Dashboard → Auth → Add User
- [ ] Login at `/login` with test user → success → redirects
- [ ] Logout clears session
- [ ] Middleware blocks unauthenticated access to `/m/*`, `/c/*`, `/a/*`
- [ ] Invalid credentials show error toast in Indonesian

---

# M2: Database + RBAC + RLS

**Goal:** Full database schema, roles, RLS policies. Owner bootstrapped.

**Reference files:** `PERMISSION_MATRIX.md` (ALL sections), `AGENT_CONTEXT.md` Section 5 (schema overview).

---

## M2.1 Core Schema — Enums + Branches + Roles

### Database change required: Yes

> Run in Supabase SQL Editor → New Query:

```sql
-- ============================================================================
-- M2.1 - PART 1: ENUMS
-- ============================================================================
CREATE TYPE member_status AS ENUM ('pending_payment','active','inactive');
CREATE TYPE member_type AS ENUM ('regular','affiliate');
CREATE TYPE payment_handling AS ENUM ('individual','covered_by_school');
CREATE TYPE phone_owner AS ENUM ('self','parent');
CREATE TYPE coach_status AS ENUM ('pending','active','inactive');
CREATE TYPE certificate_status AS ENUM ('pending_approval','approved','rejected');
CREATE TYPE class_status AS ENUM ('active','inactive');
CREATE TYPE attendance_status AS ENUM ('present','late','permitted','sick','absent');
CREATE TYPE scan_method AS ENUM ('qr','manual');
CREATE TYPE invoice_status AS ENUM ('unpaid','paid','partial');
CREATE TYPE branch_status AS ENUM ('active','inactive');
CREATE TYPE article_status AS ENUM ('draft','published','archived');
CREATE TYPE change_request_status AS ENUM ('pending','approved','rejected');
CREATE TYPE change_request_type AS ENUM ('profile_edit','photo_change','class_join','class_leave');

-- ============================================================================
-- M2.1 - PART 2: BRANCHES
-- ============================================================================
CREATE TABLE public.branches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  address TEXT,
  location_lat DECIMAL(10,7),
  location_lng DECIMAL(10,7),
  gps_radius_m INT NOT NULL DEFAULT 100,
  contact_phone TEXT,
  contact_email TEXT,
  manager_id UUID,
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
  level INT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource TEXT NOT NULL,
  action TEXT NOT NULL,
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
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, role_id, COALESCE(branch_id, '00000000-0000-0000-0000-000000000000'::UUID))
);
CREATE INDEX idx_user_roles_user ON public.user_roles(user_id);
CREATE INDEX idx_user_roles_branch ON public.user_roles(branch_id);

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
  ('school', 'Affiliated school read-only access (Phase 2)', 30),
  ('member', 'Swimming school student or parent', 20);
```

After running SQL:
- Verify all tables in Table Editor
- `SELECT * FROM public.roles;` — should show 6 rows
- Generate TS types: `npx supabase gen types typescript --project-id YOUR_ID > lib/types/database.ts`

### Rollback
```sql
DROP TABLE IF EXISTS public.user_roles CASCADE;
DROP TABLE IF EXISTS public.role_permissions CASCADE;
DROP TABLE IF EXISTS public.permissions CASCADE;
DROP TABLE IF EXISTS public.roles CASCADE;
ALTER TABLE public.branches DROP CONSTRAINT IF EXISTS fk_branches_manager;
DROP TABLE IF EXISTS public.branches CASCADE;
DROP TYPE IF EXISTS member_status, member_type, payment_handling, phone_owner,
  coach_status, certificate_status, class_status, attendance_status,
  scan_method, invoice_status, branch_status, article_status,
  change_request_status, change_request_type CASCADE;
```

---

## M2.2 Members & Coaches Schema

### Database change required: Yes

```sql
-- ============================================================================
-- M2.2 - SCHOOLS (Phase 2 use, FK placeholder)
-- ============================================================================
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

-- ============================================================================
-- MEMBERS
-- ============================================================================
CREATE TABLE public.members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL,
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
  CONSTRAINT unique_member_code_per_branch UNIQUE (branch_id, member_id_code),
  CONSTRAINT affiliate_must_have_school CHECK (type != 'affiliate' OR school_id IS NOT NULL),
  CONSTRAINT affiliate_payment_check CHECK (type != 'affiliate' OR payment_handling = 'covered_by_school')
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
  gender TEXT CHECK (gender IN ('male','female')),
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
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_qr_tokens_token ON public.member_qr_tokens(token);
CREATE INDEX idx_qr_tokens_member ON public.member_qr_tokens(member_id);
CREATE INDEX idx_qr_tokens_expiry ON public.member_qr_tokens(expires_at);

-- ============================================================================
-- COACHES
-- ============================================================================
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

CREATE TABLE public.coach_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id UUID UNIQUE NOT NULL REFERENCES public.coaches(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  nickname TEXT,
  dob DATE,
  gender TEXT CHECK (gender IN ('male','female')),
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
  status certificate_status NOT NULL DEFAULT 'pending_approval',
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_certs_coach ON public.coach_certificates(coach_id);
CREATE INDEX idx_certs_status ON public.coach_certificates(status);

-- ============================================================================
-- CHANGE REQUESTS (profile edit approval flow)
-- ============================================================================
CREATE TABLE public.change_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  branch_id UUID NOT NULL REFERENCES public.branches(id) ON DELETE RESTRICT,
  type change_request_type NOT NULL,
  payload JSONB NOT NULL,           -- { field: value } pairs being changed
  current_values JSONB,             -- snapshot of current values for comparison
  status change_request_status NOT NULL DEFAULT 'pending',
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_change_requests_requester ON public.change_requests(requester_user_id);
CREATE INDEX idx_change_requests_status ON public.change_requests(status);
CREATE INDEX idx_change_requests_branch ON public.change_requests(branch_id);
```

After running: verify tables, regenerate TS types.

---

## M2.3 Classes, Attendance, Rapot, Notifications Schema

### Database change required: Yes

```sql
-- ============================================================================
-- M2.3 - CLASSES
-- ============================================================================
CREATE TABLE public.classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id UUID NOT NULL REFERENCES public.branches(id) ON DELETE RESTRICT,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  age_range_min INT,
  age_range_max INT,
  monthly_price DECIMAL(12,2) NOT NULL DEFAULT 0,
  sessions_per_month INT NOT NULL DEFAULT 4,
  capacity INT NOT NULL DEFAULT 10,
  location_lat DECIMAL(10,7),
  location_lng DECIMAL(10,7),
  location_name TEXT,
  status class_status NOT NULL DEFAULT 'active',
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT positive_price CHECK (monthly_price >= 0),
  CONSTRAINT positive_capacity CHECK (capacity > 0),
  CONSTRAINT positive_sessions CHECK (sessions_per_month > 0),
  CONSTRAINT valid_age_range CHECK (age_range_min IS NULL OR age_range_max IS NULL OR age_range_min <= age_range_max),
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
  status TEXT NOT NULL DEFAULT 'enrolled' CHECK (status IN ('enrolled','completed','withdrawn')),
  PRIMARY KEY (class_id, member_id)
);
CREATE INDEX idx_class_members_member ON public.class_members(member_id);

-- ============================================================================
-- ATTENDANCE
-- ============================================================================
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
  clock_in_lat DECIMAL(10,7),
  clock_in_lng DECIMAL(10,7),
  clock_in_distance_m DECIMAL(10,2),
  clock_in_accuracy DECIMAL(10,2),
  ip_address INET,
  user_agent TEXT,
  suspicious_flag BOOLEAN NOT NULL DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_clock_per_day UNIQUE (coach_id, branch_id, (clock_in_at::DATE)),
  CONSTRAINT positive_distance CHECK (clock_in_distance_m IS NULL OR clock_in_distance_m >= 0)
);
CREATE INDEX idx_clock_coach ON public.coach_clock_records(coach_id);
CREATE INDEX idx_clock_branch_date ON public.coach_clock_records(branch_id, clock_in_at);

-- ============================================================================
-- SEMESTERS (for rapot scheduling)
-- ============================================================================
CREATE TABLE public.semesters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id UUID NOT NULL REFERENCES public.branches(id) ON DELETE RESTRICT,
  name TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  report_input_deadline DATE,
  is_active BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT valid_semester_range CHECK (end_date > start_date),
  CONSTRAINT valid_deadline CHECK (report_input_deadline IS NULL OR (report_input_deadline >= start_date AND report_input_deadline <= end_date))
);
CREATE INDEX idx_semesters_branch ON public.semesters(branch_id);
CREATE INDEX idx_semesters_active ON public.semesters(is_active) WHERE is_active = TRUE;

-- ============================================================================
-- REPORT CARDS (Rapot)
-- ============================================================================
CREATE TABLE public.report_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE RESTRICT,
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE RESTRICT,
  coach_id UUID NOT NULL REFERENCES public.coaches(id) ON DELETE RESTRICT,
  semester_id UUID NOT NULL REFERENCES public.semesters(id) ON DELETE RESTRICT,
  branch_id UUID NOT NULL REFERENCES public.branches(id) ON DELETE RESTRICT,
  -- Attendance summary
  total_sessions INT NOT NULL DEFAULT 0,
  sessions_present INT NOT NULL DEFAULT 0,
  sessions_late INT NOT NULL DEFAULT 0,
  sessions_permitted INT NOT NULL DEFAULT 0,
  sessions_sick INT NOT NULL DEFAULT 0,
  sessions_absent INT NOT NULL DEFAULT 0,
  attendance_rate DECIMAL(5,2) GENERATED ALWAYS AS (
    CASE WHEN total_sessions > 0
    THEN ROUND((sessions_present::DECIMAL / total_sessions) * 100, 2)
    ELSE 0 END
  ) STORED,
  -- Skill assessment
  skill_level TEXT,                 -- e.g. 'Beginner', 'Intermediate', 'Advanced'
  technique_notes TEXT,
  strength_notes TEXT,
  improvement_notes TEXT,
  goal_achieved BOOLEAN DEFAULT FALSE,
  goal_notes TEXT,
  -- Overall
  overall_grade TEXT,              -- e.g. 'A', 'B+', 'Sangat Baik', 'Baik'
  coach_notes TEXT,                -- general notes from coach
  -- Status
  is_published BOOLEAN NOT NULL DEFAULT FALSE,
  published_at TIMESTAMPTZ,
  pdf_url TEXT,                    -- generated PDF stored here (Phase 2)
  -- Review from parent/member
  review_rating INT CHECK (review_rating BETWEEN 1 AND 5),
  review_text TEXT,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_report_per_semester UNIQUE (member_id, class_id, semester_id)
);
CREATE INDEX idx_rapot_member ON public.report_cards(member_id);
CREATE INDEX idx_rapot_coach ON public.report_cards(coach_id);
CREATE INDEX idx_rapot_semester ON public.report_cards(semester_id);
CREATE INDEX idx_rapot_published ON public.report_cards(is_published) WHERE is_published = TRUE;

-- ============================================================================
-- ACTIVITY LOGS
-- ============================================================================
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

-- ============================================================================
-- IN-APP NOTIFICATIONS
-- ============================================================================
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  branch_id UUID REFERENCES public.branches(id) ON DELETE SET NULL,
  type TEXT NOT NULL,               -- 'rapot_ready', 'approval_result', 'reminder', etc.
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  action_url TEXT,                  -- deep link inside the app
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_notifications_user ON public.notifications(user_id);
CREATE INDEX idx_notifications_unread ON public.notifications(user_id, is_read) WHERE is_read = FALSE;

-- ============================================================================
-- updated_at TRIGGER
-- ============================================================================
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$;

-- Apply trigger to all tables with updated_at
DO $$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'branches','members','member_profiles','coaches','coach_profiles',
    'coach_certificates','classes','attendance_records','schools',
    'change_requests','semesters','report_cards'
  ] LOOP
    EXECUTE format('CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();', t);
  END LOOP;
END; $$;
```

After running: verify all tables exist, regenerate TS types.

---

## M2.4 RLS Policies

### Database change required: Yes

> Run all SQL from `PERMISSION_MATRIX.md`:
> 1. Section 3 — Helper Functions (entire section, run first)
> 2. Section 4 — RLS Policies, tables 4.1 through 4.14
> 3. Section 4.15 — Public Tables / Anon access
> 4. Section 8 — Performance Indexes

After running:
- Test every RLS scenario from `PERMISSION_MATRIX.md` Section 6 test queries
- Confirm: member can't see other members' data, coach can't see other branches
- Regenerate TS types

### Files to create
- [ ] `lib/types/database.ts` — auto-generated from supabase CLI
- [ ] `lib/utils/permissions.ts` — typed role-check helpers (`isAdmin()`, `isCoach()`, `isOwner()`)

---

## M2.5 QR Token RPC

### Database change required: Yes

```sql
-- QR Token validation function (called by coach during scan)
CREATE OR REPLACE FUNCTION public.validate_qr_token(input_token TEXT)
RETURNS TABLE (
  member_id UUID, member_name TEXT, member_code TEXT,
  is_valid BOOLEAN, error_message TEXT
)
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE token_record RECORD;
BEGIN
  SELECT mqt.member_id, mqt.expires_at INTO token_record
  FROM public.member_qr_tokens mqt
  WHERE mqt.token = input_token
  ORDER BY mqt.created_at DESC LIMIT 1;

  IF NOT FOUND THEN
    RETURN QUERY SELECT NULL::UUID, NULL::TEXT, NULL::TEXT, FALSE, 'Token tidak ditemukan'::TEXT;
    RETURN;
  END IF;

  IF token_record.expires_at < NOW() THEN
    RETURN QUERY SELECT NULL::UUID, NULL::TEXT, NULL::TEXT, FALSE, 'QR sudah expired, minta member refresh'::TEXT;
    RETURN;
  END IF;

  RETURN QUERY
  SELECT m.id, mp.full_name, m.member_id_code, TRUE, NULL::TEXT
  FROM public.members m
  JOIN public.member_profiles mp ON mp.member_id = m.id
  WHERE m.id = token_record.member_id
    AND m.status = 'active'
    AND m.deleted_at IS NULL;
END; $$;

GRANT EXECUTE ON FUNCTION public.validate_qr_token TO authenticated;

-- QR Token generation helper (called by member to get fresh token)
CREATE OR REPLACE FUNCTION public.generate_qr_token(p_member_id UUID)
RETURNS TEXT
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_token TEXT;
BEGIN
  -- Only allow member to generate their own token
  IF NOT EXISTS (
    SELECT 1 FROM public.members
    WHERE id = p_member_id AND user_id = auth.uid() AND deleted_at IS NULL
  ) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  v_token := encode(gen_random_bytes(32), 'hex');

  -- Delete old tokens for this member
  DELETE FROM public.member_qr_tokens WHERE member_id = p_member_id;

  INSERT INTO public.member_qr_tokens (member_id, token, expires_at)
  VALUES (p_member_id, v_token, NOW() + INTERVAL '30 seconds');

  RETURN v_token;
END; $$;

GRANT EXECUTE ON FUNCTION public.generate_qr_token TO authenticated;
```

---

## M2.6 Owner Bootstrap + Role-Based Redirect

### Database change required: Yes (one-time SQL after creating owner in Auth Dashboard)

```sql
-- STEP 1: Create owner user via Supabase Dashboard → Auth → Users → Add User
-- Note the UUID, then run:

DO $$
DECLARE
  owner_user_id UUID := '[PASTE_OWNER_UUID_HERE]';
  owner_role_id UUID;
  branch_id UUID;
BEGIN
  SELECT id INTO owner_role_id FROM public.roles WHERE name = 'owner';

  INSERT INTO public.user_roles (user_id, role_id, branch_id)
  VALUES (owner_user_id, owner_role_id, NULL);

  INSERT INTO public.branches (name, slug, is_default, manager_id, gps_radius_m)
  VALUES ('Next Swimming School Pusat', 'pusat', TRUE, owner_user_id, 100)
  RETURNING id INTO branch_id;

  RAISE NOTICE 'Owner bootstrapped. Branch ID: %', branch_id;
END $$;

-- Verify:
SELECT u.email, r.name AS role, b.name AS branch
FROM auth.users u
LEFT JOIN public.user_roles ur ON ur.user_id = u.id
LEFT JOIN public.roles r ON r.id = ur.role_id
LEFT JOIN public.branches b ON b.id = ur.branch_id
WHERE u.email = '[OWNER_EMAIL]';
```

### Files to create/update
- [ ] `lib/utils/auth-helpers.ts`:
  - `getCurrentUserRole(supabase)` — queries `user_roles` + `roles` for current user
  - `getRoleRedirectPath(role)` → returns `/m/dashboard`, `/c/dashboard`, `/a/dashboard`, `/o/dashboard`
  - `getCurrentBranchId(supabase)` — returns branch_id for current session
- [ ] Update `lib/actions/auth.ts` `login()` → after sign-in, fetch role, redirect to correct dashboard
- [ ] Update `middleware.ts` → if logged in on `/login`, redirect by role
- [ ] `app/unauthorized/page.tsx` — "Akses Ditolak" page with back button

### Checkpoint M2
- [ ] Owner logs in → goes to `/o/dashboard` (stub)
- [ ] All schema tables exist, RLS enabled on all
- [ ] RLS test queries from `PERMISSION_MATRIX.md` Section 6 all pass
- [ ] TS types regenerated, no errors

---

# M3: Admin Panel — Dashboard + Member Management

**Goal:** Admin dashboard is functional with real data. Full member CRUD works.

**Reference files:** `UI_ADMIN.md` Sections 1–5, `MVP_SCOPE.md` Stories D1–D5.

> **Design rule:** Admin panel is desktop-first. Read `UI_ADMIN.md` Global Admin Layout before starting.

---

## M3.1 Admin Layout & Navigation (Real Implementation)

### Tasks
- [ ] Build `components/admin/admin-sidebar.tsx` fully per `UI_ADMIN.md`:
  - Width: 240px fixed, collapsible to 64px with icon-only mode
  - `--neutral-200` border-right
  - Branch indicator chip top (shows branch name)
  - Nav groups: OPERASIONAL (Dashboard, Member, Coach, Kelas, Absensi, Approval), (Tier B: PEMBAYARAN, KONTEN), PENGATURAN
  - Active state: bg `--primary-50`, text `--primary-700`, 4px left border `--accent-400`
  - Hover: bg `--neutral-100`
  - User section bottom: avatar 32px + name + role badge + dropdown (Profil, Logout)
  - Mobile: drawer via shadcn Sheet, hamburger in header triggers
- [ ] Build `components/admin/admin-header.tsx`:
  - Height: 64px, white bg, 1px border-bottom `--neutral-200`
  - Global search input 320px with Cmd+K hint (Phase 2 — Phase 1: decorative only)
  - Notifications bell (badge with count — Phase 1: static)
  - User dropdown right: avatar + name + chevron
- [ ] Hook up layout: `app/a/layout.tsx` renders sidebar + header + `{children}`
- [ ] Build empty admin dashboard `/a/dashboard` with placeholder cards (real data in M3.2)

---

## M3.2 Admin Dashboard — Real Stats

### Tasks
- [ ] Build server query `lib/queries/admin.ts`:
  - `getDashboardStats(branchId)` — counts active members, active coaches, classes this week, attendance rate this month
  - `getRecentActivity(branchId, limit)` — last N activity_logs
  - `getTodaysClasses(branchId)` — classes scheduled for today
  - `getPendingApprovals(branchId)` — counts pending registrations, pending cert approvals, pending profile changes
- [ ] Build `/a/dashboard` page per `UI_ADMIN.md` Section 1:
  - 4 stat cards: Member Aktif (with trend), Coach Aktif, Kelas Minggu Ini, Attendance Rate
  - 2-column: Recent Activity feed (left) + Today's Classes (right)
  - Alert cards: Pending Approvals, (Tier B: Pembayaran Overdue placeholder)
  - Charts: Attendance trend 6 bulan (Recharts LineChart), Member growth by program (BarChart)
  - Quick Actions: "+ Tambah Cepat" FAB → dropdown (Tambah Member, Tambah Coach, Tambah Kelas)
- [ ] Components:
  - `components/admin/dashboard/stats-grid.tsx` — 4 sport-tech stat cards
  - `components/admin/dashboard/activity-feed.tsx` — timeline list
  - `components/admin/dashboard/todays-classes.tsx` — class timeline cards with live indicator
  - `components/admin/dashboard/alert-cards.tsx` — pending approval warnings
  - `components/admin/dashboard/attendance-chart.tsx` — Recharts wrapper

---

## M3.3 Member Management

### Tasks

#### Schemas & Actions
- [ ] `lib/schemas/member.ts`:
  - `memberCreateSchema` — all fields with validation
  - `memberUpdateSchema` — partial, same fields
  - `memberFilterSchema` — status, type, class_id, search, page, per_page
  - `attendanceEditSchema` — edit a single attendance record
- [ ] `lib/actions/member.ts`:
  - `createMember(data)` — creates auth user + member + profile + class enrollments in transaction via service role
  - `updateMember(id, data)` — updates member + profile
  - `softDeleteMember(id)` — sets deleted_at + status='inactive', revokes auth session
  - `restoreMember(id)` — clears deleted_at + restores status
  - `resetMemberPassword(id, newPassword)` — Supabase Admin API, log action
  - `approveMember(id)` — sets status='active', logs
  - `rejectMember(id, reason)` — sets deleted_at + logs
  - `getMemberList(branchId, filters)` — paginated, RLS-aware
  - `getMemberDetail(id)` — full detail with profile, classes, attendance summary
  - `editAttendanceRecord(id, data)` — admin can correct
  - `deleteAttendanceRecord(id)` — soft delete with reason
- [ ] Helper: `lib/utils/member-code.ts` → `generateMemberCode(branchId, year)` → `NSS-0001-2025`

#### Pages & Components
- [ ] **Member List** `/a/member` per `UI_ADMIN.md` Section 2:
  - Filter bar: search (name/ID), Status (Aktif/Pending/Inactive), Kelas, Type (Reguler/Afiliasi)
  - Active filter pills below filter bar with X to remove
  - Bulk actions bar (shown when rows checked): Send WA, Tandai Inactive, Export
  - Table columns: ☐ Foto Nama/Email ID Kelas Status Bayar ⋯
  - Row action menu: Lihat Detail, Edit, Reset Password, Nonaktifkan/Aktifkan
  - Pagination: page numbers + page size selector
  - Mobile: card layout (stacked)
  - Loading: skeleton table rows (5-10 rows)
  - Empty states: "Belum ada member" / "Tidak ada yang cocok dengan filter"
  - Component: `components/admin/member/member-table.tsx`
  - Component: `components/admin/member/member-filter-bar.tsx`

- [ ] **Member Form** `/a/member/baru` and `/a/member/[id]/edit` per `UI_ADMIN.md` Section 3:
  - Card 1: Informasi Member (nama lengkap, panggilan, DOB, gender, riwayat penyakit)
  - Card 2: Foto Profil (circle upload 160px, compress before upload, preview after)
  - Card 3: Informasi Kontak (email, password, nomor HP, pilih pemilik nomor, if parent → nama & nomor ortu, alamat)
  - Card 4: Pilih Kelas (checklist with schedule + coach preview, auto-calc total monthly)
  - Card 5: Status Member (Aktif / Pending Pembayaran radio)
  - Sticky action bar mobile (Batal + Simpan)
  - Multi-step on mobile (sections collapsible accordion)
  - Email uniqueness async check on blur
  - Member ID shown as auto-generated preview
  - Component: `components/admin/member/member-form.tsx`
  - Sub-component: `components/admin/member/class-selector.tsx` (checklist with class details)

- [ ] **Member Detail** `/a/member/[id]` per `UI_ADMIN.md` Section 4:
  - Profile header card: avatar 96px, name, ID + gender + age, status badges, email, phone, joined date
  - Actions: Edit, Reset Password, Hubungi WA (opens wa.me), Nonaktifkan/Aktifkan
  - Tabs: Profil | Kelas | Absensi | Log
  - **Tab Profil:** 2-column display all fields, health history card, edit + deactivate actions
  - **Tab Kelas (count badge):** List enrolled classes with "Hapus" per class, "+ Tambah ke Kelas Lain" → modal search
  - **Tab Absensi:** Date range filter + stats summary cards (Hadir, Late, Izin, Sakit, Alpha, Rate) + attendance list with edit/delete per record
  - **Tab Log:** Activity log for this member (all actions, who did what, timestamp)
  - QR Code section: shows downloadable QR per `UI_ADMIN.md` member detail
  - Component: `components/admin/member/member-detail-tabs.tsx`

- [ ] **Pending Registration List** `/a/member/registrasi` per `UI_ADMIN.md` Section 5:
  - Card list: avatar + name + email + waktu daftar + kelas + total
  - Actions per card: Lihat Detail, Approve (modal with checkbox confirm), Reject (modal with reason)
  - Approve modal: shows amount, requires checkbox "sudah menerima bukti bayar", notes field
  - Reject modal: reason required, warning about permanent delete

### Acceptance Criteria
Verify all from `MVP_SCOPE.md` Stories D1–D5 (Member CRUD), A3 (password reset).

---

# M4: Admin Panel — Coach + Class + Absensi

**Goal:** Admin can manage coaches, classes, and view/edit all attendance records.

**Reference files:** `UI_ADMIN.md` Sections 6–13, `MVP_SCOPE.md` Stories F1–F2, G1–G2.

---

## M4.1 Coach Management

### Tasks
- [ ] `lib/schemas/coach.ts`: create + update + filter schemas
- [ ] `lib/actions/coach.ts`:
  - `createCoach(data)` — auth user + coach + profile + branch assignment + certificates in transaction
  - `updateCoach(id, data)` — profile + specializations
  - `softDeleteCoach(id)` — deleted_at + status='inactive'
  - `addCertificate(coachId, data)` — upload photo to storage, insert cert with `pending_approval`
  - `removeCertificate(id)` — soft delete if pending; cannot delete approved
  - `getCoachList(branchId, filters)` — paginated with certificate status
  - `getCoachDetail(id)` — full detail with profile, certs, clock-in history, classes
- [ ] Helper: `lib/utils/coach-code.ts` → `generateCoachCode(branchId)` → `NSS-C001-2025`
- [ ] File upload helper: `lib/utils/storage.ts` → `uploadFile(bucket, path, file)` via Supabase Storage

#### Pages & Components per `UI_ADMIN.md` Sections 6–7:
- [ ] **Coach List** `/a/coach` — mirror of member list with differences:
  - Additional columns: Spesialisasi (tags), Sertifikat status dot, Last clock-in badge
  - Component: `components/admin/coach/coach-table.tsx`
- [ ] **Coach Form** `/a/coach/baru` and edit:
  - Same structure as member form + 2 extra sections:
  - **Spesialisasi section:** tag input with quick-add suggestions (Beginner, Intermediate, Advanced, Anak-anak, Remaja, Dewasa, Gaya Bebas, Gaya Dada, Gaya Punggung)
  - **Sertifikat section:** dynamic field array (useFieldArray), per cert: nama, foto upload, tahun terbit, berlaku sampai, checkbox "tidak ada batas waktu", status auto `pending_approval`
  - Add/remove cert cards dynamically
  - Component: `components/admin/coach/coach-form.tsx`
  - Sub-component: `components/admin/coach/specialization-input.tsx` (tag input)
  - Sub-component: `components/admin/coach/certificate-field-array.tsx` (dynamic sections)
- [ ] **Coach Detail** `/a/coach/[id]`:
  - Profile header: avatar, name, coach ID, status
  - Tabs: Profil | Kelas yang Diajar | Sertifikat | Riwayat Clock-In
  - **Tab Profil:** all fields read-only, spesialisasi tags, edit action
  - **Tab Kelas:** classes assigned to coach with enroll count, assign/unassign button
  - **Tab Sertifikat:** list all certs with status badges (Approved green, Pending amber, Rejected red), foto thumbnail, Lihat Foto modal. Note: approval flow in Approval Hub (M5)
  - **Tab Riwayat Clock-In:** last 30 records, distance indicator (≤30m ✓, 30-100m ⚠, >100m 🚩), link to view selfie modal
  - Component: `components/admin/coach/coach-detail-tabs.tsx`
  - Sub-component: `components/admin/coach/clock-in-history-tab.tsx`

---

## M4.2 Class Management

### Tasks
- [ ] `lib/schemas/class.ts`
- [ ] `lib/actions/class.ts`:
  - `createClass(data)` — class + schedules + coach assignments in transaction
  - `updateClass(id, data)` — update class + replace schedules atomically
  - `softDeleteClass(id)` — deleted_at, warns if members enrolled
  - `enrollMember(classId, memberId)` — check capacity first
  - `unenrollMember(classId, memberId)` — withdraw from class
  - `assignCoach(classId, coachId)` — add to class_coaches
  - `unassignCoach(classId, coachId)` — remove from class_coaches (warn if only coach)
  - `getClassList(branchId, filters)` — paginated with capacity usage
  - `getClassDetail(id)` — full with members + coaches + schedules
- [ ] Helper: `lib/utils/class-slug.ts` → `generateClassSlug(name)` → `beginner-level`

#### Pages & Components per `UI_ADMIN.md` Sections 8–10:
- [ ] **Class List** `/a/kelas`:
  - Grid layout (2-3 cols desktop, 1 col mobile), not table
  - Card per class: name, age range, schedule summary, location, capacity indicator (color-coded), coaches, price
  - Capacity indicator: Tersedia (neutral), Filling (green), Hampir Penuh (amber), Penuh (red)
  - Filter: Semua / Aktif / Inactive + search
  - Component: `components/admin/class/class-card.tsx`
- [ ] **Class Form** `/a/kelas/baru` and edit per `UI_ADMIN.md` Section 9:
  - Card 1: Informasi Dasar (nama, slug auto, deskripsi, usia min-max, kapasitas)
  - Card 2: Pricing (harga/bulan, sesi/bulan, auto-calc per-sesi)
  - Card 3: Schedule — weekly day picker: each day = checkbox + (when checked) start-time + end-time inputs
  - Card 4: Lokasi — toggle "gunakan lokasi cabang utama" vs override dengan koordinat GPS (lat/lng)
  - Card 5: Coach — multi-select with avatars
  - Validation: end_time > start_time per day
  - Component: `components/admin/class/class-form.tsx`
  - Sub-component: `components/admin/class/schedule-picker.tsx` (day + time pairs)
  - Sub-component: `components/admin/class/coach-selector.tsx` (multi-select)
- [ ] **Class Detail** `/a/kelas/[id]` per `UI_ADMIN.md` Section 10:
  - Stats row: enrolled/capacity, coach count, sessions/month, price/month
  - Tabs: Info | Member | Coach | Jadwal
  - **Tab Info:** all class fields read-only
  - **Tab Member:** roster with enroll count, "+ Tambah Member" → search modal (shows members not yet in class), remove with confirm
  - **Tab Coach:** assigned coaches, last clock-in, total sessions, add/remove
  - **Tab Jadwal:** weekly schedule visual, mini calendar this week
  - Component: `components/admin/class/class-detail-tabs.tsx`
  - Sub-component: `components/admin/class/member-roster.tsx` (list + add modal)

---

## M4.3 Attendance Management (Admin)

### Tasks
- [ ] `lib/actions/attendance.ts`:
  - `getAttendanceList(branchId, filters)` — paginated, filterable by date/class/member/status
  - `getAttendanceStats(branchId, filters)` — aggregated stats
  - `editAttendanceRecord(id, data)` — update status/notes
  - `deleteAttendanceRecord(id)` — hard delete with admin log
  - `createManualAttendance(data)` — admin inputs izin/sakit
  - `getCoachClockInList(branchId, filters)` — paginated clock-in records
  - `flagClockIn(id, suspicious)` — toggle suspicious flag
  - `deleteClockIn(id, reason)` — admin delete with reason
- [ ] Build pages per `UI_ADMIN.md` Sections 11–13:

- [ ] **Attendance List** `/a/absensi` per §11:
  - Stats row top: Total sesi, attendance rate avg, total members tracked
  - Filters: Date range picker + Class + Member + Status
  - Export button (Tier B — show as disabled with tooltip for now)
  - Table: Tanggal/Jam | Member | Kelas | Status | Coach | ⋯ action
  - Row action: Lihat Detail, Edit Status (modal), Delete (confirm modal)
  - Component: `components/admin/attendance/attendance-table.tsx`
  - Component: `components/admin/attendance/attendance-filter.tsx`

- [ ] **Manual Attendance** `/a/absensi/manual` per §12:
  - Form: Pilih Member (search-select), Pilih Kelas (filtered to member's classes), Tanggal Sesi (date, validated as valid session date), Status radio (Hadir/Late/Izin/Sakit/Alpha), Catatan
  - Validation: date must be a scheduled session date for that class
  - Server action: `createManualAttendance()`
  - Component: `components/admin/attendance/manual-attendance-form.tsx`

- [ ] **Coach Clock-In History** `/a/absensi/coach` per §13:
  - Filters: Date range, Coach, Suspicious flag only
  - Table: Waktu | Coach | Lokasi | Jarak | Flag | ⋯
  - Distance indicator color: ≤30m green ✓, 30-100m amber ⚠, >100m red 🚩
  - Action menu: Lihat Detail (modal with selfie + GPS + IP), Flag/Unflag suspicious, Delete
  - Detail modal: selfie photo 240px + all GPS data + map preview + user agent + toggle suspicious
  - Component: `components/admin/attendance/clock-in-table.tsx`
  - Component: `components/admin/attendance/clock-in-detail-modal.tsx`

### Checkpoint M3 + M4
- [ ] Admin can CRUD members, coaches, classes
- [ ] Attendance viewed, manually inputted, edited, deleted
- [ ] Coach clock-in history visible with suspicious flag
- [ ] All CRUD actions logged to `activity_logs`
- [ ] RLS verified: admin sees only own branch data
- [ ] Mobile responsive all pages (table → card on mobile)

---

# M5: Admin Panel — Approval Hub + Semester + Rapot (Admin View)

**Goal:** Admin can approve/reject all pending items. Semester setup done. Admin can view submitted rapot.

**Reference files:** `UI_ADMIN.md` Section 14, `MVP_SCOPE.md` (Tier B: Story N1).

> **Note:** Rapot INPUT is done by coach (M6). Admin VIEW is in this milestone.

---

## M5.1 Approval Hub

### Tasks
- [ ] `lib/actions/approval.ts`:
  - `getPendingRegistrations(branchId)` — pending_payment members
  - `getPendingCertificates(branchId)` — pending_approval certs (manager/owner only)
  - `getPendingChangeRequests(branchId)` — pending profile changes
  - `approveRegistration(id, notes)` → status='active', log, trigger notification
  - `rejectRegistration(id, reason)` → soft delete, log
  - `approveCertificate(id)` → status='approved', log, notify coach
  - `rejectCertificate(id, reason)` → status='rejected', reason, log, notify coach
  - `approveChangeRequest(id)` → apply payload changes to profile, log, notify user
  - `rejectChangeRequest(id, reason)` → status='rejected', log, notify user

- [ ] Build `/a/approval` per `UI_ADMIN.md` Section 14:
  - Tabs: Registrasi Member (count) | Sertifikat Coach (count) | Edit Profil (count)
  - Counts shown in tab badges (dynamic)
  - **Tab Registrasi:** card list per pending member — avatar, name, email, waktu daftar, kelas + total, actions: Lihat Detail | Approve | Reject
    - Approve modal: confirm checkbox "sudah terima bukti bayar Rp X.XXX", notes optional, actions listed
    - Reject modal: reason required, warning permanent delete
  - **Tab Sertifikat:** card list — coach name, cert name, foto thumbnail, year + validity, notes field, Approve + Reject
    - Reject: requires reason
  - **Tab Edit Profil:** card list — user name, role, fields being changed (show old → new), Approve + Reject
  - Empty state per tab: "[Icon] Tidak ada permintaan pending"
  - Component: `components/admin/approval/approval-hub-tabs.tsx`
  - Component: `components/admin/approval/registration-approval-card.tsx`
  - Component: `components/admin/approval/cert-approval-card.tsx`
  - Component: `components/admin/approval/profile-change-card.tsx`

---

## M5.2 Semester Management

### Tasks
- [ ] `lib/actions/semester.ts`:
  - `createSemester(branchId, data)` — name, start_date, end_date, report_input_deadline
  - `updateSemester(id, data)`
  - `setActiveSemester(id)` — sets this semester as active, deactivates others
  - `getSemesters(branchId)` — list all semesters for branch
- [ ] Build semester management UI (inline in admin settings or dedicated page `/a/pengaturan/semester`):
  - List semesters: name, date range, deadline, active indicator, actions (Edit, Aktifkan)
  - Create/edit form: nama, tanggal mulai, tanggal akhir, deadline input nilai (rapot)
  - Active semester prominently highlighted
  - Warning: changing active semester affects rapot input access
  - Component: `components/admin/semester/semester-manager.tsx`

---

## M5.3 Rapot — Admin View

> Coach inputs rapot in M6. Here admin views submitted rapot and manages notification to parents.

### Tasks
- [ ] `lib/actions/rapot.ts` (admin side):
  - `getAllRapot(branchId, semesterId, filters)` — list all report cards
  - `getRapotDetail(id)` — full report card
  - `notifyRapotReady(memberId)` — creates notification + logs (WA direct link to parent)
  - `getPublishedRapot(semesterId)` — list of published rapot (for bulk notify)

- [ ] Build rapot admin view pages:
  - **Rapot List** `/a/rapot`:
    - Filter: Semester (dropdown), Kelas, Coach, Status (Draft/Published)
    - Table: Nama Siswa | Umur | Kelas | Attendance Rate | Skill Level | Goal Achieved | Status | Actions
    - Row action: Lihat Detail, Notify via WA (opens wa.me with pre-filled message)
    - Bulk action: "Kirim notif WA ke semua yang belum dinotif"
    - Export button (Tier B — show as disabled)
    - Component: `components/admin/rapot/rapot-table.tsx`
  - **Rapot Detail** `/a/rapot/[id]` (read-only view):
    - Profile header: foto siswa, nama, ID, kelas, semester
    - Attendance summary cards (Hadir, Late, Izin, Sakit, Alpha, Rate %)
    - Skill assessment section: level, technique notes, strength, improvement
    - Goal section: achieved toggle + notes
    - Coach notes
    - Overall grade
    - If published: show review rating + text from member/parent (if submitted)
    - Action: "Notif WA ke Orang Tua" (direct WA link)
    - Phase 2: "Lihat PDF" button (when PDF generation implemented)
    - Component: `components/admin/rapot/rapot-detail-view.tsx`

### Checkpoint M5
- [ ] Approval hub shows correct pending counts per tab
- [ ] Approve/reject flows work for all 3 categories
- [ ] Notifications created on approval/rejection
- [ ] Semester can be created and activated
- [ ] Rapot list shows coach-submitted rapot
- [ ] Admin can direct-WA parent when rapot published

---

# M6: Coach Panel — Full Daily Flow

**Goal:** Coach can do everything they need daily: clock-in, take attendance, manage rapot.

**Reference files:** `UI_COACH.md` (ALL sections), `MVP_SCOPE.md` Stories H1–H5.

> **Design rule:** Coach panel is MOBILE-FIRST. Design for phone use. Read `UI_COACH.md` entirely before coding.

---

## M6.1 Coach Layout (Real Implementation)

### Tasks
- [ ] Implement `app/c/layout.tsx` with:
  - Mobile: `coach-header.tsx` (56px) + content + `coach-bottom-nav.tsx` (64px + safe area)
  - Desktop: sidebar layout same content
  - Bottom nav: Beranda | Absensi ⚡ | Kelas | Member | Profil
- [ ] Realtime subscription setup: `lib/utils/realtime.ts` — attendance channel for multi-coach sync

---

## M6.2 Coach Dashboard

### Tasks
- [ ] `lib/queries/coach.ts`:
  - `getCoachDashboardData(coachId, branchId)` — today's classes, clock-in status, stats
  - `getTodaysClassesForCoach(coachId, branchId)` — classes today sorted by time

- [ ] Build `/c/dashboard` per `UI_COACH.md` Section 1 (3 scenarios):
  - **Scenario A — Has classes, not clocked in:**
    - Big banner card: gradient primary, "KAMU ADA X KELAS HARI INI", "Belum absen masuk hari ini", big accent CTA "📷 Absen Masuk Sekarang"
    - Class cards below with "Mulai Absensi" button DISABLED (greyed out)
    - Stats: Total Member, Hadir 0, Absensi Tertunda N
  - **Scenario B — Already clocked in:**
    - Success banner: green bg, "✅ SUDAH ABSEN MASUK", time + distance, "Lihat Detail"
    - Class cards with "Mulai Absensi" button ENABLED
  - **Scenario C — No classes today:**
    - Empty illustration, "Tidak Ada Kelas Hari Ini", next class info
  - Clock-in CTA button navigates to `/c/clock-in`
  - Component: `components/coach/dashboard/clock-in-banner.tsx`
  - Component: `components/coach/dashboard/todays-class-card.tsx`

---

## M6.3 Coach Clock-In (Selfie + GPS)

### Tasks
- [ ] `lib/actions/coach-attendance.ts`:
  - `clockInCoach(coachId, branchId, selfieUrl, lat, lng, distance, accuracy, ipAddr, userAgent)` — inserts clock record
  - `getCoachClockInStatus(coachId, branchId)` — today's clock-in or null
- [ ] `lib/utils/haversine.ts` — Haversine formula for GPS distance calculation
- [ ] `lib/utils/storage.ts` → `uploadSelfie(coachId, file)` — upload to `coach-selfies` bucket

- [ ] Build `/c/clock-in` per `UI_COACH.md` Section 2 (4 steps):
  - **Step 1 — Permission Request:** icon, "Izinkan Akses Kamera & Lokasi", privacy reassurance bullets, "Izinkan Akses" button
  - **Step 2 — Camera Capture:** live camera via `getUserMedia` (front cam), face guide overlay, circle capture button, "Gunakan foto ini" / "Ambil ulang"
  - **Step 3 — GPS Verification:** spinner "Mendapatkan lokasi...", shows distance to branch, green/amber/red indicator, confirm button
  - **Step 4 — Success:** big check animation, time recorded, distance, "Kembali ke Dashboard"
  - GPS protection: compare coords to branch `location_lat/lng + gps_radius_m`
  - Suspicious flag auto-set if distance > `gps_radius_m * 3`
  - Compress selfie before upload: `browser-image-compression`
  - Component: `components/coach/clock-in/camera-capture.tsx` (getUserMedia wrapper)
  - Component: `components/coach/clock-in/gps-verifier.tsx` (Geolocation API + distance calc)
  - Component: `components/coach/clock-in/clock-in-result.tsx` (success state)

---

## M6.4 Coach Attendance Flow

### Tasks
- [ ] `lib/actions/attendance.ts` (coach side):
  - `recordAttendanceByQr(token, classId, coachId)` — validate QR via RPC, check enrollment, upsert record
  - `recordAttendanceManual(memberId, classId, status, date, notes, coachId)` — upsert record
  - `getClassAttendanceSession(classId, date)` — current session attendance data
  - `getCoachClasses(coachId, branchId)` — classes assigned to coach
- [ ] Realtime subscription for multi-coach: subscribe to `attendance_records` for `classId + session_date`, update UI when another coach marks a member

- [ ] Build `/c/absensi` per `UI_COACH.md` Section 3:
  - List of classes coach has today (post clock-in)
  - If not clocked in: all sessions disabled with "Absen masuk dulu"
  - Tap class → navigate to `/c/absensi/[kelas_id]`

- [ ] Build `/c/absensi/[kelas_id]` per `UI_COACH.md` Section 4 (2 tabs):
  - **Header:** class name, date, member count, progress (N/M hadir)
  - Multi-coach indicator: "Mengajar bersama: [Coach X] 🟢 Live"
  - **Tab 1 — Scan QR:**
    - Scanner viewport: 1:1 ratio, `--primary-600` corner guides (TL TR BL BR only, not full border)
    - QR detection: flash + check animation on success
    - Scan result toast: green (Hadir ✓), orange (Late ⌛), blue (sudah tercatat), red (invalid)
    - Live list below: recently scanned members, slide-in animation
    - Wake Lock API to keep screen on during scan
    - Vibration API on successful scan
  - **Tab 2 — Manual Checklist:**
    - Search member input
    - Filter: Semua / Belum diabsen / Sudah hadir
    - Member card rows: avatar, name, ID + age
    - Status badge per member (right side): already marked shows current status, unmarked shows "Pilih ▾"
    - Tap "Pilih" or existing status → bottom sheet (mobile) / dropdown (desktop) with status options
    - Status options: Hadir, Hadir Telat, Izin, Sakit, Alpha + Catatan field
    - Optimistic UI: update UI instantly, save in background
    - Swipe-left quick mark Hadir, swipe-right quick mark Alpha (Phase 2)
    - Bulk: "Tandai sisanya sebagai Alpha" ghost danger button
  - Sticky bottom action bar: "Selesai Mengajar" (confirm modal warns unmarked → Alpha)
  - Component: `components/coach/attendance/qr-scanner.tsx` (qr-scanner library wrapper)
  - Component: `components/coach/attendance/checklist-member-row.tsx`
  - Component: `components/coach/attendance/status-picker.tsx` (bottom sheet / dropdown)
  - Component: `components/coach/attendance/attendance-progress.tsx` (header progress)

---

## M6.5 Coach Classes & Members

### Tasks per `UI_COACH.md` Sections 5–6:
- [ ] **Coach Kelas** `/c/kelas`:
  - List of classes coach teaches
  - Filter: Semua / Aktif Hari Ini / Mendatang
  - Class card: name, schedule, location, member count, attendance rate this month
  - Component: `components/coach/class/class-list.tsx`
- [ ] **Coach Kelas Detail** `/c/kelas/[id]`:
  - Stats: member count, avg attendance, sessions/month
  - Tabs: Member | Jadwal | Performa
  - Member tab: list with attendance rate + last attended + WA button
  - Jadwal tab: calendar view this month (simple month grid)
  - Performa tab: stats cards, top performers, trend (Phase 2)
- [ ] **Coach Member** `/c/member` — aggregated across all classes:
  - Search + filter by class
  - Member card rows: avatar, name, ID, class tag, attendance rate, last attended, WA button
- [ ] **Coach Member Detail** `/c/member/[id]`:
  - Profile header: avatar 96px, name, ID, age
  - Stats: attendance rate, total sessions, membership since
  - Tabs: Profil (read-only subset) | Riwayat Absensi (last 10) | (Catatan — Phase 2)
  - Quick actions: Hubungi WA, Lihat QR Member

---

## M6.6 Coach Rapot (Input)

### Tasks
- [ ] `lib/actions/rapot.ts` (coach side):
  - `getCoachRapotList(coachId, semesterId)` — report cards for coach's members
  - `upsertRapotDraft(data)` — create/update draft rapot
  - `publishRapot(id)` — set is_published=true (only if semester deadline not passed)
  - `checkSemesterDeadline(semesterId)` — returns if input is still allowed
  - `getRapotForCoach(id, coachId)` — single rapot (must be coach's member)

- [ ] Build `/c/rapot` rapot list for coach:
  - Shows active semester info (dates + deadline)
  - List: member name, kelas, foto, status (Draft/Published/Belum diisi)
  - Deadline countdown prominent: "Input nilai ditutup dalam X hari"
  - If deadline passed: locked badge, no edit
  - Filter: Semua / Belum diisi / Draft / Published
  - Tap → rapot form
  - Component: `components/coach/rapot/rapot-list.tsx`

- [ ] Build rapot form `/c/rapot/[member_id]`:
  - Header: foto siswa (from member profile), nama, kelas, semester
  - **Bagian 1 — Rekap Absensi (auto-calculated):**
    - Cards: Hadir, Late, Izin, Sakit, Alpha, Attendance Rate — auto-filled from attendance_records for this semester
    - Non-editable display (data from DB)
  - **Bagian 2 — Penilaian Skill:**
    - Skill Level: select (Pemula / Berkembang / Mahir / Sangat Mahir)
    - Catatan Teknik: textarea
    - Kekuatan: textarea (e.g. "Gaya bebas sudah baik")
    - Area Peningkatan: textarea
  - **Bagian 3 — Goal:**
    - Goal Tercapai: toggle yes/no
    - Catatan Goal: textarea
  - **Bagian 4 — Penilaian Umum:**
    - Overall Grade: select (A, A-, B+, B, B-, C, dll) or text input
    - Catatan Coach: textarea (general notes to parent)
  - Actions: "Simpan Draft" + "Terbitkan Rapot"
  - Terbitkan: confirm modal "Setelah diterbitkan, member/orang tua bisa melihat rapot ini."
  - Locked view if deadline passed or already published (read-only)
  - Component: `components/coach/rapot/rapot-form.tsx`
  - Sub-component: `components/coach/rapot/attendance-summary-section.tsx`
  - Sub-component: `components/coach/rapot/skill-assessment-section.tsx`
  - Sub-component: `components/coach/rapot/goal-section.tsx`

---

## M6.7 Coach Profile, QR, Notifications, Settings

Per `UI_COACH.md` Sections 7–10:
- [ ] **Coach QR** `/c/qr` — fullscreen QR with coach token (same fullscreen pattern as member QR)
- [ ] **Coach Profil** `/c/profil`:
  - Avatar 120px, name, coach code
  - Read-only info: personal, spesialisasi tags, branches assigned, sertifikat list with status badges
  - "Lihat Foto" cert modal
  - Career stats: total classes, total members, joined since
  - Edit mode: phone/address/photo → submit creates change_request (approval flow)
  - "+Tambah Sertifikat" → opens cert form (creates pending_approval cert)
- [ ] **Coach Notifikasi** `/c/notifikasi` — same pattern as member (assignment changes, cert approved/rejected, admin announcements)
- [ ] **Coach Pengaturan** `/c/pengaturan` — change password, notification prefs, logout

### Checkpoint M6
- [ ] Coach can clock-in with selfie + GPS, distance calculated from branch coords
- [ ] Coach can scan member QR → attendance recorded, not duplicated
- [ ] Multiple coaches in same class don't overwrite each other (realtime sync)
- [ ] Coach can input rapot per member (within deadline)
- [ ] Published rapot triggers notification to member/parent
- [ ] Mobile responsive everything (primary use case)
- [ ] No screen lock during QR scan (Wake Lock API)

---

# M7: Member Panel — Full Daily Flow

**Goal:** Member can do everything they need: view QR, check attendance, see rapot, review coach.

**Reference files:** `UI_MEMBER.md` (ALL sections), `MVP_SCOPE.md` Stories I1–I5.

> **Design rule:** Member panel is MOBILE-FIRST. Read `UI_MEMBER.md` entirely before coding.

---

## M7.1 Member Layout (Real Implementation)

### Tasks
- [ ] Implement `app/m/layout.tsx`:
  - Mobile: `member-header.tsx` (56px, greeting + bell + avatar) + content + `member-bottom-nav.tsx` (64px + safe area)
  - Desktop: top horizontal nav (Beranda, Jadwal, Absen, Coach, Profil) + header
- [ ] Bottom nav: Home | Jadwal | Absen | Coach | Profil

---

## M7.2 Member Dashboard

### Tasks
- [ ] `lib/queries/member.ts`:
  - `getMemberDashboardData(memberId)` — next class, stats this month, coaches, recent activity
  - `getMemberStats(memberId, month)` — hadir/late/izin/sakit/alpha counts + rate

- [ ] Build `/m/dashboard` per `UI_MEMBER.md` Section 1:
  - Greeting card: gradient primary, "Selamat datang kembali, {panggilan}! 👋", countdown to next class
  - 2-col row: QR Quick Card (mini QR preview + big "Tampilkan QR" CTA) + Next Class Card (class name, date+time, coach, location)
  - Stats grid (4 cards): Hadir / Attendance Rate / Izin / Alpha for current month — with big numbers (sport-tech)
  - Coach card: avatar 64px + name + specialization + "Hubungi via WhatsApp" button
  - Activity Feed: last 5 attendance records with status icons, "Lihat Semua →" link
  - Rapot notification banner (if coach published rapot this semester): "📋 Rapot kamu sudah keluar! [Lihat Rapot]"
  - Empty state if no classes yet: "Belum ada kelas yang diikuti" + WA admin button
  - Component: `components/member/dashboard/qr-quick-card.tsx`
  - Component: `components/member/dashboard/next-class-card.tsx`
  - Component: `components/member/dashboard/member-stats-grid.tsx`
  - Component: `components/member/dashboard/coach-card.tsx`
  - Component: `components/member/dashboard/activity-feed.tsx`
  - Component: `components/member/dashboard/rapot-ready-banner.tsx`

---

## M7.3 Member QR Display

### Tasks per `UI_MEMBER.md` Section 2:
- [ ] `lib/actions/qr.ts`:
  - `generateMemberQrToken(memberId)` — calls `generate_qr_token` RPC
- [ ] Build `/m/qr` fullscreen page:
  - Black header: close X (left), brightness toggle (right)
  - White content: centered QR code 280px (`qrcode.react`, high error correction)
  - Below QR: NAMA MEMBER (uppercase, weight 800), ID (mono), active class name
  - Auto-refresh every 30s: TanStack Query `refetchInterval: 30000`, regenerate token, re-render QR
  - Progress bar: 4px, accent fill animating 0→100% over 30s, resets on refresh
  - Text "⟳ Otomatis refresh tiap 30 detik"
  - Wake Lock API: screen stays on while page open
  - Force portrait, hide bottom nav, full-screen feel
  - Swipe down to close
  - Offline: QR still shows last token with "Refresh diperlukan koneksi" notice
  - Component: `components/member/qr/qr-display.tsx`
  - Component: `components/member/qr/refresh-progress.tsx`

---

## M7.4 Member Schedule (Jadwal)

Per `UI_MEMBER.md` Section 3:
- [ ] Build `/m/jadwal`:
  - "KELAS YANG DIIKUTI" section: class cards with left accent stripe 4px `--accent-400`
  - Per card: class name, schedule (days + times), location, coach with avatar, sessions/month, price
  - "KELAS HARI INI" section (if any): highlighted card with pulse indicator "Sedang berlangsung" / "Akan dimulai dalam X menit"
  - "KELAS BERIKUTNYA MINGGU INI": mini cards upcoming sessions
  - Empty state if no classes
  - Phase 1: list view. Phase 2: calendar view.
  - Component: `components/member/schedule/class-card.tsx`
  - Component: `components/member/schedule/today-class-card.tsx`

---

## M7.5 Member Attendance History

Per `UI_MEMBER.md` Section 4:
- [ ] Build `/m/absensi`:
  - Stats summary: 4 cards (Hadir, Late, Izin, Alpha)
  - Filters: month picker + Kelas dropdown + Status dropdown
  - Attendance list: cards per record — status badge (top-left), date (top-right), class + coach (middle), time/notes (bottom)
  - Status colors: Hadir green, Late amber, Izin blue, Sakit neutral, Alpha red
  - Pagination
  - Empty + filter empty states

---

## M7.6 Member Coach Page

Per `UI_MEMBER.md` Section 5:
- [ ] Build `/m/coach`:
  - "PELATIH AKTIF" label
  - Coach card per coach in member's classes: avatar 120px, name, specialization badges, classes they teach, phone, experience/certs summary
  - "Hubungi via WhatsApp →" button (primary accent)
  - "Lihat Profil Lengkap" ghost button → opens read-only coach detail modal

---

## M7.7 Member Profile + Edit Request

Per `UI_MEMBER.md` Section 6:
- [ ] Build `/m/profil`:
  - Profile card: avatar 120px (with camera icon overlay), name, ID, classes, status badge
  - Informasi Pribadi section: 2-col label-value, edit icon → inline edit → approval request on save
  - Informasi Kontak section: same pattern
  - Informasi Medis: health history, confidentiality note
  - Edit flow: section becomes editable → save → toast "Permintaan edit dikirim, menunggu approval admin" → creates `change_request` row
- [ ] `lib/actions/member.ts` → `requestProfileChange(userId, payload)` — creates change_request

---

## M7.8 Member Rapot View + Coach Review

Per `UI_MEMBER.md` and meeting notes:
- [ ] `lib/actions/rapot.ts` (member side):
  - `getMemberRapot(memberId, semesterId)` — returns published rapot only
  - `submitCoachReview(rapotId, rating, text)` — 1-5 stars + text
- [ ] Build `/m/rapot` rapot list page:
  - Per semester section header
  - Rapot card per class: class name, semester, coach, overall grade, attendance rate, status
  - Tap → rapot detail
- [ ] Build `/m/rapot/[id]` rapot detail:
  - Header: foto siswa, nama, kelas, semester, coach name
  - Attendance summary cards (read-only, same layout as coach form)
  - Skill assessment: level badge, technique/strength/improvement notes
  - Goal: achieved indicator + notes
  - Coach notes highlighted section
  - Overall grade prominent display
  - **Review Coach section** (appears only if rapot published + not yet reviewed):
    - "Berikan penilaian untuk Coach {name}"
    - Star rating: 1-5 stars (tap to select)
    - Ulasan text: textarea optional
    - "Kirim Ulasan" button
    - After submit: shows submitted review (read-only)
  - Phase 2: "Unduh Rapot PDF" button
  - Component: `components/member/rapot/rapot-detail.tsx`
  - Component: `components/member/rapot/coach-review-form.tsx`

---

## M7.9 Member Notifications + Settings

Per `UI_MEMBER.md` Sections 7–8:
- [ ] Build `/m/notifikasi`:
  - Filter tabs: Semua | Belum dibaca | Penting
  - Notification cards: unread (blue bg, bold title, dot), read (white, normal)
  - Tap → mark as read + navigate to action_url
  - "Tandai semua dibaca" button top-right
  - Empty state: "Belum ada notifikasi"
  - `lib/actions/notifications.ts`: `getNotifications(userId)`, `markAsRead(id)`, `markAllAsRead(userId)`
- [ ] Build `/m/pengaturan`:
  - KEAMANAN AKUN: Ubah Password → modal (old + new + confirm, server action via Supabase Auth)
  - NOTIFIKASI: toggles for In-app, Email, Reminder Kelas (store in user preferences JSONB or separate table)
  - PRIVASI: links to kebijakan privasi, syarat & ketentuan
  - ZONA BAHAYA: Logout (confirm modal)

### Checkpoint M7
- [ ] Member sees relevant data only (RLS verified with test accounts)
- [ ] QR display works on mobile, refreshes every 30s
- [ ] Attendance history paginated + filterable
- [ ] Published rapot visible, can submit review
- [ ] Profile edit request creates change_request for admin approval
- [ ] All pages mobile responsive

---

# M8: Public Site + Self-Registration

**Goal:** Public-facing landing page, program pages, self-registration flow, minimal SEO.

**Reference files:** `UI_PUBLIC.md` (ALL sections), `MVP_SCOPE.md` Story J1, E1–E2.

---

## M8.1 Public Layout (Real Implementation)

### Tasks
- [ ] Build `components/shared/public-header.tsx` per `UI_PUBLIC.md`:
  - 72px desktop / 64px mobile
  - Logo left, nav center (Beranda · Program · Berita · Tentang · Kontak), "Daftar Sekarang" CTA right
  - Mobile: hamburger → full-width slide-in drawer
  - Transparent at top (over hero), solid white + shadow after 80px scroll
  - Active link: underline 2px `--water-500`
- [ ] Build `components/shared/public-footer.tsx`:
  - Dark bg `--primary-900`
  - 4-col: Logo+tagline / Quick Links / Kontak / Sosial Media
  - Copyright strip `--primary-950`

---

## M8.2 Landing Page

> **Critical:** Read `UI_PUBLIC.md` Section 1 Creative Brief FULLY. The AI must NOT produce a generic layout.

### Tasks
- [ ] Build `/` landing page per `UI_PUBLIC.md` required sections:
  - **Section 1 — Hero:** `<h1>` tag, headline, subheadline, 2 CTAs (Daftar/Lihat Program), trust signal, swimming photography
  - **Section 2 — Trust Numbers:** 500+ Member, 20+ Coach, 3 Cabang, 10+ Tahun — sport-tech big number style
  - **Section 3 — Why Choose NSS:** 4 differentiators (certified coaches, modern system, structured curriculum, all levels)
  - **Section 4 — Programs:** 3-4 active class cards from `classes` table (SSG/ISR), each with name, age range, schedule, price, CTA
  - **Section 5 — How It Works:** step-by-step joining flow (Daftar → Approval → Login → Renang)
  - **Section 6 — Testimonials:** 3 member/parent testimonials (Phase 1: static content)
  - **Section 7 — Coach Spotlight:** 2-3 featured coaches with photo, specialization, cert badges
  - **Section 8 — Events/Lomba:** if any events in DB; else: show "akan datang" placeholder
  - **Section 9 — Contact & Location:** address, phone, WA CTA, Google Maps embed or static map
  - **Section 10 — Footer CTA:** "Siap Bergabung?" + Daftar Sekarang button
- [ ] Server-side rendering (ISR with revalidate 3600)
- [ ] SEO: `<title>`, `<meta description>`, OG tags, Twitter card in `generateMetadata()`
- [ ] Schema.org `LocalBusiness` JSON-LD
- [ ] `app/sitemap.ts` — auto-sitemap (public pages + program slugs)
- [ ] `app/robots.ts` — allow all, disallow `/a/*`, `/m/*`, `/c/*`
- [ ] All images: `next/image` with sizes + alt text
- [ ] Component: `components/public/hero-section.tsx`
- [ ] Component: `components/public/trust-numbers.tsx`
- [ ] Component: `components/public/programs-preview.tsx`
- [ ] Component: `components/public/how-it-works.tsx`
- [ ] Component: `components/public/testimonials.tsx`
- [ ] Component: `components/public/coach-spotlight.tsx`
- [ ] Component: `components/public/contact-section.tsx`

### Acceptance Criteria
- [ ] Lighthouse mobile Performance > 80
- [ ] All 10 sections present and content complete
- [ ] sitemap.xml accessible
- [ ] Schema.org markup passes Google Rich Results test
- [ ] OG tags visible in social share preview

---

## M8.3 Other Public Pages

Per `UI_PUBLIC.md`:
- [ ] `/program` — list all active classes (ISR, anon RLS), filter by age range, cards with full detail
- [ ] `/program/[slug]` — class detail: full description, schedule, age range, capacity, coaches, price, CTA register
- [ ] `/tentang` — static page: story NSS, vision/mission, team photo placeholder
- [ ] `/kontak` — static: address, phone, WA link, email, opening hours, map embed
- [ ] Per-page SEO: `generateMetadata()` with unique title + description

---

## M8.4 Self-Registration Flow

Per `UI_PUBLIC.md` Section 7, `MVP_SCOPE.md` Stories E1–E2:

### Tasks
- [ ] Build `/daftar/member` multi-step form:
  - **Step 1 — Data Siswa:** nama lengkap, panggilan, DOB, gender, riwayat penyakit, foto (upload + compress)
  - **Step 2 — Data Kontak:** email, password, nomor HP, pilih pemilik nomor (sendiri/orang tua), if ortu → nama ortu + nomor ortu, alamat
  - **Step 3 — Pilih Kelas:** checklist kelas available (from `classes` table), with schedule + coach + price
  - Progress bar/steps indicator top
  - Back/Next navigation, preserve state on back
  - Final review screen before submit
  - Mobile-friendly single column
- [ ] Server action `lib/actions/member.ts` → `registerMember(data)`:
  - Use `SUPABASE_SERVICE_ROLE_KEY` (server only — bypasses RLS for initial insert)
  - Create auth user (Supabase Admin API)
  - Insert `members` (status=`pending_payment`), `member_profiles`, `class_members` rows in DB transaction
  - Generate `member_id_code`
  - Return success with member info for confirmation page
- [ ] Build `/daftar/member/sukses` confirmation page:
  - Status: "Pendaftaran Berhasil! Menunggu Verifikasi 🎉"
  - WA button: `wa.me/{admin_wa}?text=Halo, saya {nama}, sudah daftar NSS dengan ID {code}. Berikut bukti transfer: [attachment]`
  - Bank transfer info (hardcoded from constants for Phase 1)
  - What's next: step by step until approval
  - Link to login
  - Component: `components/public/registration-success.tsx`
- [ ] Component: `components/public/register-form.tsx` (multi-step form container)
- [ ] Sub-component: `components/public/register-steps/step-student-data.tsx`
- [ ] Sub-component: `components/public/register-steps/step-contact-data.tsx`
- [ ] Sub-component: `components/public/register-steps/step-class-select.tsx`

### Checkpoint M8
- [ ] Landing page all 10 sections present
- [ ] Lighthouse mobile Performance > 80
- [ ] Self-registration creates pending_payment member
- [ ] Admin can see in `/a/member/registrasi`, approve → member can login
- [ ] Program pages server-rendered (no flash of empty)

---

# M9: Phase 1 Hardening + Deploy

**Goal:** Polish, E2E test, deploy to Vercel, verify production.

---

## M9.1 End-to-End Manual Test Scenarios

Run ALL before deploy:

#### Auth
- [ ] Login with owner → redirect to `/o/dashboard`
- [ ] Login with admin → redirect to `/a/dashboard`
- [ ] Login with coach → redirect to `/c/dashboard`
- [ ] Login with member → redirect to `/m/dashboard`
- [ ] Logout → session cleared, back button doesn't restore

#### Admin Flows
- [ ] Create member via admin form → member receives credentials → member logs in
- [ ] Self-registration → admin sees in `/a/member/registrasi` → approve → member logs in
- [ ] Create coach with certificates → coach logs in
- [ ] Create class with schedule + coaches + members assigned
- [ ] Admin resets member password → member logs in with new password
- [ ] Edit member attendance record → change shows in member dashboard
- [ ] Delete attendance record → gone from both admin and member view
- [ ] Manual attendance input for izin/sakit → shows in member absensi

#### Coach Flows
- [ ] Coach clock-in with selfie + GPS → record created, distance calculated
- [ ] Coach sees today's classes on dashboard
- [ ] Coach scans member QR → attendance record created
- [ ] Coach manual checklist → mark multiple statuses, notes saved
- [ ] Multiple coaches same class simultaneously → no data overwrite (realtime test)
- [ ] Coach inputs rapot for a member → saves as draft
- [ ] Coach publishes rapot → notification sent to member
- [ ] Rapot input blocked after semester deadline

#### Member Flows
- [ ] Member shows QR → fullscreen, token rotates every 30s
- [ ] Coach scans member QR → member's absensi updated
- [ ] Member sees attendance history with correct stats
- [ ] Member views published rapot
- [ ] Member submits coach review after seeing rapot
- [ ] Member requests profile edit → admin sees in Approval Hub → approve → profile updated

#### Approval Flows
- [ ] Admin approval hub: correct counts per tab
- [ ] Approve registration → member status active
- [ ] Reject registration → member data removed
- [ ] Approve cert → coach sees approved status
- [ ] Reject cert with reason → coach sees rejection reason

#### RLS Verification
- [ ] Member A cannot see Member B's data
- [ ] Coach sees only their branch's members
- [ ] Admin Branch A cannot see Branch B data (test if 2 branches exist)
- [ ] All RLS test queries from `PERMISSION_MATRIX.md` Section 6 pass

---

## M9.2 Polish

### Tasks
- [ ] Add loading skeletons to ALL data-fetching pages (no raw spinners)
- [ ] Add empty states with helpful messages + action CTA on all pages
- [ ] Add error boundaries on all layout files
- [ ] Verify all user-facing text is in Indonesian (no English UI strings)
- [ ] Check mobile responsive on:
  - iPhone SE (375px)
  - iPhone 14 Pro (393px)
  - Samsung Galaxy S series (360px)
  - iPad (768px)
  - Desktop (1280px+, 1440px+)
- [ ] Admin panel desktop breakpoints per `UI_ADMIN.md` Mobile Responsive Strategy
- [ ] Coach/Member panel mobile-first per their respective UI docs
- [ ] Lighthouse audit: Performance > 80, Accessibility > 80, SEO > 90 on landing + all role dashboards
- [ ] Run `npm run lint` → fix ALL errors
- [ ] Run `npx tsc --noEmit` → fix ALL TypeScript errors
- [ ] `npm run build` succeeds without errors
- [ ] Check console in dev — no warnings or errors

---

## M9.3 Deploy to Vercel

### Tasks
- [ ] Push to GitHub (ensure `.env.local` NOT committed)
- [ ] Connect Vercel to GitHub repo
- [ ] Add env vars in Vercel project settings:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `NEXT_PUBLIC_APP_URL` (production URL)
  - `NEXT_PUBLIC_ADMIN_WA_NUMBER` (for registration WA link)
- [ ] Deploy (Vercel auto-builds on push to main)
- [ ] Setup custom domain if available
- [ ] Update Supabase Auth redirect URLs → production domain (Dashboard → Auth → URL Configuration)
- [ ] Update Supabase CORS allowed origins → production domain
- [ ] Verify all flows in production with fresh test accounts
- [ ] Enable Supabase auto-backup (Dashboard → Database → Backups → enable daily)

---

## M9.4 Documentation Update

### Tasks
- [ ] Update `README.md`:
  - Project description
  - Local dev setup (env vars + Supabase setup + npm install)
  - Deploy instructions
  - Test accounts for demo
- [ ] Document any deviations from blueprint
- [ ] Note known Phase 2 deferrals

### Phase 1 Done When:
- [ ] All M1–M9 checkpoints passed
- [ ] All Tier A acceptance criteria from `MVP_SCOPE.md` checked
- [ ] Production deployed and accessible
- [ ] Owner has reviewed and signed off
- [ ] Daily backup enabled

---

# Post-Phase 1: Tier B (Phase 1.5) Preview

After M9 sign-off, Tier B starts. Order:

| ID | Feature | Key Files |
|---|---|---|
| **M10** | Monthly Billing & Invoices | New schema + `/a/finansial/*` |
| **M11** | Email Notifications via Resend | `lib/email/` + templates |
| **M12** | Activity Logs UI (`/a/log`) | Existing `activity_logs` table |
| **M13** | Sertifikat Approval UI (polish) | Already partially in Approval Hub |
| **M14** | CMS Berita (`/a/cms/berita` + `/berita`) | New `articles` table + rich text editor |
| **M15** | Export CSV/XLSX | All list pages with data |
| **M16** | Calendar Views | Admin calendar, member jadwal calendar |
| **M17** | WA Reminder Hub (`/a/reminder`) | Manual WA blast to members |
| **M18** | Report Card PDF Generation | `@react-pdf/renderer` + Supabase Storage |

Each Tier B milestone follows same pattern: **SQL migration → server actions → UI → checkpoint**.

---

# Tier C — Phase 2 (Out of Phase 1 Scope)

Do NOT build these in Phase 1. AI agent must refuse if asked:

- Multi-branch management (Owner panel, branch CRUD, branch switcher)
- Coach pengganti / izin management (substitute coach flow)
- Events & Lomba module (competition history, catatan waktu)
- Member affiliation (school panel, bulk Excel import)
- Push notifications (PWA, Phase 4)
- Self-service "Lupa password?" via email
- Offline mode (service worker, Phase 4)
- Coach multi-branch (teach at multiple branches)
- Analytics dashboard (advanced charts, Phase 3)
- Parent portal (separate from member, Phase 3)

---

# Anti-Patterns — AI Agent MUST NOT

- ❌ Skip RLS policies "to make development faster"
- ❌ Use service role key on client side or in browser-accessible code
- ❌ Hardcode user IDs, branch IDs, or UUIDs in application code
- ❌ Disable TypeScript strict mode
- ❌ Use `any` type without justification comment
- ❌ Build Tier B/C features during Phase 1
- ❌ Combine multiple unrelated DB changes into one migration file
- ❌ Modify RLS policies without testing with multiple role accounts
- ❌ Catch errors silently (all errors must surface as toast or ActionResult error)
- ❌ Forget to regenerate TS types after any schema change
- ❌ Build UI without checking the corresponding UI doc first (UI_ADMIN, UI_COACH, UI_MEMBER, UI_PUBLIC)
- ❌ Skip mobile responsive verification (Coach + Member panels MUST work on 375px)
- ❌ Create loading states that are full-page spinners (use skeleton shimmer instead)
- ❌ Forget to log all CRUD actions to `activity_logs`
- ❌ Build the rapot PDF in Phase 1 (Phase 2 feature — just store text data for now)
- ❌ Allow coach to input rapot after semester deadline
- ❌ Allow multiple clock-in records per coach per day per branch

---

# Common Patterns Reference

When in doubt about code patterns, check `AGENT_CONTEXT.md`:
- Section 7: Server Action pattern (`ActionResult<T>`)
- Section 7: Auth-aware Server Component pattern
- Section 7: File Upload Helper
- Section 7: RLS-aware Query
- Section 7: Form with RHF + Zod + Server Action

When in doubt about UI, check the corresponding UI doc for that panel.

When in doubt about permissions, check `PERMISSION_MATRIX.md`.

When in doubt about scope, check `MVP_SCOPE.md`.

---

**Document version:** 2.0 (Revised — Comprehensive)
**Last updated:** May 2026
**Changes from v1.0:**
- Added M3–M5 split (Admin panel broken into 3 dedicated milestones)
- Added missing schema tables: `semesters`, `report_cards`, `change_requests`, `notifications`
- Added missing RPC: `generate_qr_token`
- Added detailed page-by-page task breakdown referencing exact UI doc sections
- Added Rapot flow (M5.3 admin view, M6.6 coach input, M7.8 member view + review)
- Added Approval Hub full flow (M5.1)
- Added Semester management (M5.2)
- Added Notifications system (schema + member page + coach page)
- Added Change Request system for profile edit approval
- Added full Coach Panel breakdown (M6.1–M6.7)
- Added full Member Panel breakdown (M7.1–M7.9)
- Added Landing Page creative brief reference (M8.2)
- Expanded all checkpoints with specific test scenarios
- Added Tier B milestone table preview
- Clarified all UI doc cross-references per milestone
