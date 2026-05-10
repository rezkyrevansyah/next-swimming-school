# AGENT_CONTEXT.md

> **Read this FIRST before any coding task.**
> This is the orientation document for AI agents working on Next Swimming School Web App.

---

## 1. Project Overview

**Next Swimming School Web App** is a multi-branch swimming school management system. Single source of truth for members, coaches, classes, attendance, report cards, and payments. Built with Next.js + Supabase + TypeScript, deployed on Vercel.

**Key constraints:**
- Zero-budget: prioritize free-tier services
- Mobile-friendly responsive web (PWA later in Phase 4)
- Multi-branch architecture from day 1 (single org, multiple branches)
- Solo developer, no hard deadline, **quality > speed**

**Document hierarchy:**
1. `BLUEPRINT.md` — full product blueprint (master document, scope reference)
2. `MVP_SCOPE.md` — what's in/out of Phase 1 (your build target)
3. `PERMISSION_MATRIX.md` — RBAC + RLS policies (database security)
4. `BUILD_PLAN.md` — step-by-step build order (your todo list)
5. `AGENT_CONTEXT.md` — this file (orientation + conventions)

---

## 2. Tech Stack (Exact Versions)

| Layer | Choice | Notes |
|---|---|---|
| Framework | Next.js 15 (App Router, latest stable) | Use `app/` directory, NOT `pages/` |
| Language | TypeScript 5.x (strict mode) | No `any` unless explicitly justified |
| React | React 19 | Server Components by default |
| Styling | Tailwind CSS 4.x + shadcn/ui | Use shadcn primitives, customize via Tailwind |
| Database | Supabase (Postgres 15+) | RLS enabled on all tables |
| Auth | Supabase Auth (email + password) | Native flow, no custom adapter |
| Storage primary | Supabase Storage | 1GB free tier |
| Storage volume | Cloudflare R2 | 10GB free tier (Phase 2+) |
| Forms | React Hook Form + Zod | Schema-first validation |
| Server state | TanStack Query v5 | Caching + mutations |
| Client state | Zustand | Only when local state insufficient |
| PDF | @react-pdf/renderer | Server-side via API route (Phase 2) |
| Email | Resend | Free 3000/month, Phase 1.5+ |
| Image compression | browser-image-compression | Client-side before upload |
| Hosting | Vercel | Free tier |

---

## 3. Folder Structure (MUST FOLLOW)

```
next-swimming-school/
├── app/                           # Next.js App Router
│   ├── (public)/                  # Public site routes (no auth)
│   │   ├── page.tsx               # Landing
│   │   ├── program/
│   │   ├── berita/
│   │   ├── tentang/
│   │   ├── kontak/
│   │   └── daftar/member/
│   ├── (auth)/                    # Auth pages
│   │   ├── login/
│   │   └── lupa-password/
│   ├── m/                         # Member panel
│   ├── c/                         # Coach panel
│   ├── a/                         # Admin panel
│   ├── o/                         # Owner panel
│   ├── s/                         # School panel (Phase 2)
│   ├── api/                       # API routes (only when needed)
│   └── layout.tsx
├── components/
│   ├── ui/                        # shadcn components
│   ├── shared/                    # Cross-panel components
│   ├── member/
│   ├── coach/
│   ├── admin/
│   └── owner/
├── lib/
│   ├── actions/                   # Server actions (per resource)
│   │   ├── member.ts
│   │   ├── coach.ts
│   │   └── ...
│   ├── queries/                   # TanStack Query hooks
│   ├── schemas/                   # Zod schemas (per resource)
│   ├── types/                     # TypeScript types (per resource)
│   ├── utils/                     # Pure utility functions
│   └── constants/
├── utils/
│   └── supabase/                  # Supabase clients (DO NOT MOVE)
│       ├── client.ts              # Browser client
│       ├── server.ts              # Server client
│       └── middleware.ts          # Session refresh
├── middleware.ts                  # Root middleware (Supabase session)
├── public/
├── docs/                          # Project documentation
│   ├── BLUEPRINT.md
│   ├── MVP_SCOPE.md
│   ├── PERMISSION_MATRIX.md
│   ├── BUILD_PLAN.md
│   └── AGENT_CONTEXT.md
├── supabase/
│   ├── migrations/                # SQL migration files
│   └── seed/                      # Seed data SQL
├── .env.local                     # Environment variables (NEVER commit)
└── .env.example                   # Template (DO commit)
```

**Rules:**
- Server actions go in `lib/actions/{resource}.ts`, NOT `app/api/`
- API routes (`app/api/`) only for: webhooks, file uploads, PDF generation
- One Zod schema file per resource in `lib/schemas/`
- Database access ONLY via Supabase clients in `utils/supabase/`

---

## 4. Supabase Connect Framework

**Required packages (install once at project init):**
```bash
npm install @supabase/supabase-js @supabase/ssr
```

### `utils/supabase/client.ts`
```typescript
import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export const createClient = () =>
  createBrowserClient(
    supabaseUrl!,
    supabaseKey!,
  );
```

### `utils/supabase/server.ts`
```typescript
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export const createClient = (cookieStore: Awaited<ReturnType<typeof cookies>>) => {
  return createServerClient(
    supabaseUrl!,
    supabaseKey!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from Server Component — safe to ignore
            // Middleware refreshes the session
          }
        },
      },
    },
  );
};
```

### `utils/supabase/middleware.ts`
```typescript
import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabase = createServerClient(
    supabaseUrl!,
    supabaseKey!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => 
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    },
  );

  await supabase.auth.getUser();

  return supabaseResponse;
}
```

### Root `middleware.ts`
```typescript
import { type NextRequest } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
```

### `.env.example`
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=eyJxxx
SUPABASE_SERVICE_ROLE_KEY=eyJxxx
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 5. Database Change Workflow (CRITICAL)

**ALL database changes MUST follow this workflow:**

1. AI agent NEVER explains a database change conceptually only — must provide ready-to-run SQL.
2. SQL scripts must be safe to run manually in Supabase SQL Editor.
3. Destructive changes (`DROP TABLE`, `DROP COLUMN`, mass updates) require explicit warning.
4. Provide rollback SQL when realistic.
5. After SQL, list which files/modules need updating.

### Mandatory format when proposing database changes:

```
Database change required: Yes

Run this in Supabase SQL Editor:

```sql
-- SQL script here
-- with comments explaining each step
```

After running SQL:
- Update affected files/modules: [list]
- Verify RLS behavior: [test queries]
- Test happy path and failure path: [scenarios]
- Update TypeScript types: [files to regen]
```

### Rollback format (when applicable):

```
Rollback (if needed):

```sql
-- Reverse SQL here
```
```

---

## 6. Code Conventions

### Naming
- **Files:** `kebab-case.ts` (e.g. `member-form.tsx`, `class-list.ts`)
- **Components:** `PascalCase` (e.g. `MemberForm`, `ClassList`)
- **Functions:** `camelCase` (e.g. `getMemberById`, `formatPhoneNumber`)
- **Constants:** `UPPER_SNAKE_CASE` (e.g. `MAX_FILE_SIZE`, `LATE_THRESHOLD_MINUTES`)
- **Types/Interfaces:** `PascalCase` (e.g. `Member`, `ClassSchedule`)
- **Database tables:** `snake_case` plural (e.g. `members`, `attendance_records`)
- **Database columns:** `snake_case` (e.g. `created_at`, `branch_id`)
- **Enums:** `snake_case` values (e.g. `'pending_payment'`, `'active'`)

### Imports order
```typescript
// 1. External packages
import { useState } from "react";
import { z } from "zod";

// 2. Internal absolute (utils, lib)
import { createClient } from "@/utils/supabase/client";
import { memberSchema } from "@/lib/schemas/member";

// 3. Components
import { Button } from "@/components/ui/button";
import { MemberForm } from "@/components/member/member-form";

// 4. Types
import type { Member } from "@/lib/types/member";

// 5. Relative imports (last resort)
import { localHelper } from "./helpers";
```

### Server Actions Pattern
```typescript
// lib/actions/member.ts
"use server";

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { memberSchema } from "@/lib/schemas/member";
import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/lib/types/common";

export async function createMember(
  formData: FormData
): Promise<ActionResult<Member>> {
  // 1. Auth check
  const supabase = createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  // 2. Validate input
  const parsed = memberSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: "Invalid input", fieldErrors: parsed.error.flatten() };
  }

  // 3. Permission check (via RLS — Supabase will enforce)
  // 4. Mutation
  const { data, error } = await supabase
    .from("members")
    .insert(parsed.data)
    .select()
    .single();

  if (error) return { error: error.message };

  // 5. Revalidate
  revalidatePath("/a/member");
  return { data };
}
```

### TypeScript: Generate Types from Database

After every schema change, regenerate types:
```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > lib/types/database.ts
```

### Error Handling
- Use `ActionResult<T>` pattern for server actions: `{ data?: T; error?: string; fieldErrors?: ... }`
- Never throw in server actions — always return error
- Throw only in queries (let TanStack Query handle)
- User-facing errors in Indonesian, dev errors in English

---

## 7. Common Patterns

### Auth-aware Server Component
```typescript
// app/m/dashboard/page.tsx
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function MemberDashboard() {
  const supabase = createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) redirect("/login");
  
  // Fetch user's role + member data
  // RLS will automatically filter by user
  const { data: member } = await supabase
    .from("members")
    .select("*, member_profiles(*)")
    .eq("user_id", user.id)
    .single();
  
  return <Dashboard member={member} />;
}
```

### File Upload Helper
```typescript
// lib/utils/storage.ts
import imageCompression from "browser-image-compression";
import { createClient } from "@/utils/supabase/client";

type AssetType = "avatar" | "certificate" | "report_photo" 
              | "cms_media" | "attendance_selfie" | "payment_proof";

const COMPRESSION_RULES: Record<AssetType, { maxSizeMB: number; maxDim: number }> = {
  avatar: { maxSizeMB: 0.2, maxDim: 800 },
  certificate: { maxSizeMB: 0.5, maxDim: 1600 },
  report_photo: { maxSizeMB: 0.3, maxDim: 1000 },
  cms_media: { maxSizeMB: 0.5, maxDim: 1600 },
  attendance_selfie: { maxSizeMB: 0.1, maxDim: 600 },
  payment_proof: { maxSizeMB: 0.3, maxDim: 1200 },
};

const SUPABASE_TYPES: AssetType[] = ["avatar", "certificate", "report_photo", "cms_media"];
const R2_TYPES: AssetType[] = ["attendance_selfie", "payment_proof"];

export async function uploadFile(
  file: File,
  type: AssetType,
  ownerId: string
): Promise<{ url: string; path: string } | { error: string }> {
  const rules = COMPRESSION_RULES[type];
  const compressed = await imageCompression(file, {
    maxSizeMB: rules.maxSizeMB,
    maxWidthOrHeight: rules.maxDim,
  });

  if (SUPABASE_TYPES.includes(type)) {
    return uploadToSupabase(compressed, type, ownerId);
  }
  // R2 upload via API route (Phase 2+)
  return uploadToR2(compressed, type, ownerId);
}
```

### RLS-aware Query (always check returns)
```typescript
const { data, error } = await supabase
  .from("members")
  .select("*")
  .eq("branch_id", branchId);

if (error) {
  // Could be RLS violation or actual error — log + handle
  console.error("Query failed:", error);
  return { error: "Gagal memuat data member" };
}

// data is filtered by RLS automatically
return { data };
```

### Form with React Hook Form + Zod + Server Action
```typescript
// components/member/member-form.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { memberSchema, type MemberInput } from "@/lib/schemas/member";
import { createMember } from "@/lib/actions/member";

export function MemberForm() {
  const form = useForm<MemberInput>({
    resolver: zodResolver(memberSchema),
  });

  async function onSubmit(values: MemberInput) {
    const formData = new FormData();
    Object.entries(values).forEach(([k, v]) => formData.append(k, v as string));
    
    const result = await createMember(formData);
    if (result.error) {
      // Show error
      return;
    }
    // Success
  }

  return <form onSubmit={form.handleSubmit(onSubmit)}>...</form>;
}
```

---

## 8. Decision Boundaries (When to Ask vs Decide)

**Decide yourself:**
- Library version (use latest stable)
- Code organization within established structure
- Variable names (follow conventions)
- Loading/error states (use shadcn patterns)
- Toast messages wording (concise Indonesian)

**ASK BEFORE proceeding:**
- Adding new dependency not in tech stack
- Changing folder structure
- Adding new database table not in MVP_SCOPE
- Changing RLS policy from PERMISSION_MATRIX
- Adding new role or permission
- Bypassing RLS via service role key (security implication)
- Modifying middleware behavior
- Adding API route (most things should be server actions)

---

## 9. Quality Bar (Quality > Speed)

Project owner explicitly chose **quality > speed**. This means:

✅ DO:
- Add proper TypeScript types (no `any` shortcuts)
- Add Zod validation on all user inputs
- Add proper error handling with user-friendly messages
- Add loading states & skeleton screens
- Add empty states with helpful messages
- Test happy path AND failure path before declaring done
- Add brief comments for non-obvious business logic
- Keep components small (split when > 200 lines)
- Use semantic HTML for accessibility
- Test on mobile viewport before declaring done

❌ DON'T:
- Skip validation "to ship faster"
- Use `// @ts-ignore` to bypass type errors
- Catch errors silently (always log or show)
- Hardcode strings that should be constants
- Mix concerns (UI + data fetching + business logic in one file)
- Copy-paste code blocks (extract to utility)
- Skip testing on mobile
- Push code with linting errors

---

## 10. Quick Reference

### Where to look for what:
- Product scope & vision → `BLUEPRINT.md`
- What to build NOW → `MVP_SCOPE.md`
- Who can do what → `PERMISSION_MATRIX.md`
- Build order & checklist → `BUILD_PLAN.md`
- Conventions & patterns → this file

### Common commands:
```bash
# Install
npm install

# Dev
npm run dev

# Generate Supabase types
npx supabase gen types typescript --project-id YOUR_ID > lib/types/database.ts

# Run linter
npm run lint

# Build
npm run build
```

### Key constants (define in `lib/constants/`):
```typescript
export const LATE_THRESHOLD_MINUTES = 15;
export const QR_TOKEN_EXPIRY_SECONDS = 30;
export const MAX_FILE_SIZE_MB = 5;
export const SESSION_TIMEOUT_MINUTES = 60;
export const PASSWORD_MIN_LENGTH = 8;
```

---

**Last updated:** Phase 1 kickoff
**Owner:** [Your name]
**Maintainer:** AI agent should update this file when conventions change.
