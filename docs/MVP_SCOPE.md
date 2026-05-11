# MVP_SCOPE.md

> **This is the build target for Phase 1.**
> AI agent: only build what's listed here. Anything in BLUEPRINT.md not mentioned here is OUT OF SCOPE.

---

## 1. Phase 1 Definition

**Goal:** Launch a working swimming school management system for Next Swimming School's main branch (single-branch operational), with core daily operations digitized.

**Success criteria:**
- Owner can log in and access admin panel of default branch
- Admin can manage members, coaches, and classes via panel
- Members can register themselves, get approved, and log in
- Coaches can clock-in, scan QR, and mark attendance daily
- Members can see their QR code, attendance history, and dashboard
- All data persists correctly with proper access control (RLS)
- Mobile-responsive across all critical paths

**Phase 1 is NOT done until:**
- All Tier A acceptance criteria pass
- All Tier A flows tested end-to-end on mobile + desktop
- RLS policies verified with test users (regular member can't see other branch's data, etc.)
- No console errors in production build
- Deployed to Vercel and accessible publicly

---

## 2. Tier Breakdown

### Tier A — MUST be in Phase 1 (Core Operational Loop)
The minimum that makes the system useful daily.

### Tier B — Phase 1.5 (After Tier A is stable)
Important but not blocking core daily operations.

### Tier C — Phase 2 onwards
Nice-to-have, defer until Tier A+B is solid.

**AI agent rule:** Tier B work starts ONLY after Tier A is fully done and tested.

---

## 3. Tier A — Core Phase 1 Features

### 3.1 Auth System

**Story A1:** As a user, I want to log in with email and password, so that I can access the system based on my role.

**Acceptance Criteria:**
- [ ] Login page at `/login` accessible without auth
- [ ] Form has: email, password, "Lupa password?" link
- [ ] Email validated as valid format (Zod)
- [ ] On submit: invalid credentials show error toast in Indonesian
- [ ] On success: redirect by role (member → `/m/dashboard`, coach → `/c/dashboard`, admin/manager → `/a/dashboard`, owner → `/o/dashboard`)
- [ ] Session persists across page refreshes (Supabase cookies)
- [ ] Middleware refreshes session on every request
- [ ] Logged-in users visiting `/login` are redirected to their dashboard

**Story A2:** As a logged-in user, I want to log out, so that my session ends and another person can't access my account.

**Acceptance Criteria:**
- [ ] Logout button visible in user menu (header dropdown)
- [ ] On click: session cleared, redirect to `/login`
- [ ] Back button after logout doesn't restore protected pages

**Story A3:** As an admin, I want to reset a member's password manually, so that members who forgot can regain access without email flow.

**Acceptance Criteria:**
- [ ] Admin member detail page has "Reset Password" button
- [ ] Click → modal with new password input + confirm
- [ ] On submit: password updated via Supabase Admin API (server action with service role)
- [ ] New password sent to admin in modal (admin shares to member manually via WA)
- [ ] Action logged in `activity_logs`

> **Note:** Self-service "Lupa password?" via email is Tier C (Phase 2). Phase 1 = admin reset only.

---

### 3.2 First-Install Flow

**Story B1:** As a project owner, I want the system to auto-create a default branch when I first log in, so that I can start using the system without manual setup.

**Acceptance Criteria:**
- [ ] Owner account inserted manually via SQL (documented in BUILD_PLAN.md)
- [ ] On first owner login: check if any `branches` row exists
- [ ] If none: auto-create branch with name "Next Swimming School Pusat", `is_default = true`
- [ ] Owner auto-assigned as manager of this default branch
- [ ] Subsequent logins skip this check (idempotent)

---

### 3.3 Branch & User Foundation

**Story C1:** As an owner, I want my data scoped to my default branch automatically, so that I don't have to think about branch context in Phase 1.

**Acceptance Criteria:**
- [ ] All admin pages auto-scope to user's branch (via RLS)
- [ ] Owner sees only default branch data in admin panel (no branch switcher in Phase 1)
- [ ] Branch switcher hidden in Phase 1 (will appear in Phase 2 when 2nd branch exists)

> **Note:** Multi-branch coach assignment, owner helicopter view, and branch CRUD are Phase 2. Phase 1 operates as if single-branch.

---

### 3.4 Member Management (Admin Side)

**Story D1:** As an admin, I want to view all members in my branch, so that I can manage them.

**Acceptance Criteria:**
- [ ] `/a/member` shows table with: foto, nama, member_id_code, kelas yang diikuti, status, action (lihat detail)
- [ ] Pagination (20 per page)
- [ ] Search by name or member_id_code
- [ ] Filter by status (pending_payment, active, inactive)
- [ ] Empty state when no members yet ("Belum ada member. Tambah member untuk mulai.")
- [ ] Loading skeleton while data loads
- [ ] Mobile responsive (card layout instead of table on small screens)

**Story D2:** As an admin, I want to add a member manually, so that walk-in registrations can be entered.

**Acceptance Criteria:**
- [ ] `/a/member/baru` opens form with same fields as self-registration
- [ ] Required: nama lengkap, email, tanggal lahir, jenis kelamin, nomor HP, cabang (auto-set), password
- [ ] Optional: foto, nama panggilan, riwayat penyakit, alamat
- [ ] On submit: create auth user + member + member_profile in transaction
- [ ] Status auto-set to `active` (admin-created = trusted)
- [ ] Member auto-assigned to selected class(es)
- [ ] Generate `member_id_code` automatically (format: `NSS-{number-padded-4}-{year}`)
- [ ] On success: redirect to member detail page
- [ ] Validation errors show inline below each field

**Story D3:** As an admin, I want to view a member's detail, so that I can see all their information in one place.

**Acceptance Criteria:**
- [ ] `/a/member/[id]` shows tabs: Profil, Kelas, Absensi, Pembayaran, Log
- [ ] (Rapot tab is Phase 2, hidden in Phase 1)
- [ ] Profil tab: foto besar, semua field, tombol "Direct WA" yang buka `wa.me/{phone}`
- [ ] QR Code tab: tampilkan QR static member (berisi member_id), tombol Unduh PNG + Print
- [ ] Kelas tab: list kelas yang diikuti + add/remove kelas
- [ ] Absensi tab: history dengan filter date range
- [ ] Pembayaran tab: [TIER B — see 4.1]
- [ ] Log tab: audit trail aktivitas member
- [ ] Edit button per field (inline edit) atau full edit page

**Story D4:** As an admin, I want to edit a member's data, so that I can keep records accurate.

**Acceptance Criteria:**
- [ ] Edit form pre-populated with current data
- [ ] All fields editable except: member_id_code, email, joined_date
- [ ] On submit: update + log change in `activity_logs`
- [ ] Toast confirmation on success
- [ ] Cancel button returns without saving

**Story D5:** As an admin, I want to soft-delete a member, so that historical data (attendance, etc.) is preserved.

**Acceptance Criteria:**
- [ ] "Nonaktifkan Member" button on detail page
- [ ] Confirmation modal: "Yakin nonaktifkan {nama}? Data tidak akan terhapus tapi member tidak bisa login."
- [ ] On confirm: set `status = 'inactive'`, `deleted_at = NOW()`
- [ ] Member can't log in after this
- [ ] Member tetap muncul di history kelas, absensi, dll
- [ ] "Aktifkan Kembali" button visible on inactive members

---

### 3.5 Member Self-Registration

**Story E1:** As a prospective member, I want to register myself, so that I can start joining classes without contacting admin first.

**Acceptance Criteria:**
- [ ] `/daftar/member` accessible without login
- [ ] Multi-step form (3 steps with progress indicator):
  - Step 1: Data Member (foto upload, nama, panggilan, dob, gender, riwayat penyakit)
  - Step 2: Data Kontak (email, password, phone, phone_owner radio, parent_name optional, parent_phone optional, address)
  - Step 3: Pilih Cabang & Program (cabang dropdown, kelas multi-select with price visible, terms checkbox)
- [ ] Can navigate back without losing data (form state preserved)
- [ ] Email uniqueness checked before submit (live validation)
- [ ] Foto compressed to <200KB before upload
- [ ] On submit: create auth user (status = pending), member with `status = 'pending_payment'`, member_profile, class_members rows
- [ ] Confirmation page shows after submit
- [ ] Confirmation page: status info, "Kirim Bukti via WA" button (auto-generated message), bank info, login info ("setelah disetujui admin")
- [ ] User CAN'T log in until admin approves

**Story E2:** As an admin, I want to see pending registrations, so that I can verify and approve them.

**Acceptance Criteria:**
- [ ] `/a/member/registrasi` shows list of `status = 'pending_payment'` members
- [ ] Each row: foto, nama, tanggal daftar, kelas yang dipilih, total tagihan, action (Detail/Approve/Reject)
- [ ] Click Detail: see full registration data
- [ ] Approve: confirmation modal → set `status = 'active'` → email notification (Tier B)
- [ ] Reject: confirmation modal with reason input → soft delete the registration
- [ ] Empty state when no pending

> **Note:** Email notification on approve is Tier B. Phase 1: admin notifies via WA manually.

---

### 3.6 Coach Management (Admin Side)

**Story F1:** As an admin, I want to add a coach, so that they can be assigned to classes.

**Acceptance Criteria:**
- [ ] `/a/coach/baru` opens form
- [ ] Required: nama lengkap, email, password, tanggal lahir, jenis kelamin, phone, spesialisasi (multi-select)
- [ ] Optional: foto profil, nama panggilan, sertifikat (multiple, can add/remove dynamically)
- [ ] Per sertifikat: nama, foto, tahun terbit, berlaku sampai (date), checkbox "tidak ada batas waktu"
- [ ] Generate `coach_id_code` (format: `NSS-C{number}-{year}`)
- [ ] On submit: create auth user + coach + coach_profile + coach_certificates
- [ ] Auto-assign coach to default branch (Phase 1 single-branch)
- [ ] Sertifikat status: `pending_approval` (admin needs to approve in separate flow — Tier B)
- [ ] On success: redirect to coach detail

**Story F2:** As an admin, I want to view & edit coaches, so that I can manage them.

**Acceptance Criteria:**
- [ ] `/a/coach` list with same UX as members (search, filter, pagination, mobile responsive)
- [ ] `/a/coach/[id]` detail with tabs: Profil, Kelas yang Diajar, Sertifikat, Absensi
- [ ] Soft delete works same as member
- [ ] Sertifikat tab: list with approval_status badge, download button per certificate

> **Note:** Sertifikat approval flow is Tier B. Phase 1: status defaults to `pending_approval`, doesn't block coach from teaching.

---

### 3.7 Class Management (Admin Side)

**Story G1:** As an admin, I want to create a class, so that members can join it.

**Acceptance Criteria:**
- [ ] `/a/kelas/baru` opens form
- [ ] Required: nama kelas, age range (min, max), monthly_price, sessions_per_month, capacity, lokasi (default to branch lat/lng), schedule (recurring weekly: pick days + time)
- [ ] Schedule: multi-day selector (Sen-Min) with start_time + end_time per day
- [ ] Coach assignment: multi-select from active coaches
- [ ] On submit: create class + class_schedules + class_coaches in transaction
- [ ] Validation: capacity > 0, monthly_price >= 0, sessions_per_month > 0, end_time > start_time
- [ ] On success: redirect to class detail

**Story G2:** As an admin, I want to view & manage classes, so that I can keep them accurate.

**Acceptance Criteria:**
- [ ] `/a/kelas` list shows: nama, age range, jadwal ringkas (e.g. "Sen, Rab, Jum 16:00-17:00"), coach, member count / capacity, status
- [ ] `/a/kelas/[id]` detail shows: full info, list member di kelas (with avatar + name), list coach (with avatar + name)
- [ ] Edit class works similar to create
- [ ] Soft delete: confirm modal "Yakin nonaktifkan kelas? Member yang sedang diikuti tetap tercatat di history"
- [ ] Add member to class: search & select from members, validate capacity
- [ ] Remove member from class: confirm modal

---

### 3.8 Coach Daily Workflow

**Story H1:** As a coach, I want to see my day on dashboard, so that I know what to do.

**Acceptance Criteria:**
- [ ] `/c/dashboard` shows:
  - Greeting with name + foto
  - "Hari ini" section: list kelas hari ini sorted by time
  - Each class card: nama, jam, lokasi, jumlah member, status (belum/sedang/selesai)
  - Banner "Absen Masuk Hari Ini" jika ada kelas + belum clock-in
  - Banner "✓ Sudah absen" jika sudah clock-in
  - "Tidak ada kelas hari ini" jika tidak ada
- [ ] Mobile responsive (cards stack vertically)

**Story H2:** As a coach, I want to clock in for the day, so that the system records my work attendance.

**Acceptance Criteria:**
- [ ] Click "Absen Masuk Hari Ini" → opens `/c/clock-in`
- [ ] Page requests camera permission for selfie
- [ ] Page requests geolocation permission (highAccuracy: true)
- [ ] If permissions denied: show error with retry instructions
- [ ] Capture selfie via camera (preview before submit)
- [ ] On submit:
  - Compress selfie to <100KB
  - Upload to Supabase Storage `attendance-selfies/` (R2 in Phase 2+)
  - Calculate distance from branch lat/lng using Haversine
  - Insert `coach_clock_records` with all fields
  - Show result: "✓ Di lokasi (12m)" or "⚠ Jauh dari lokasi (450m)"
- [ ] Cannot clock-in twice on same day per branch
- [ ] If no class today: button doesn't appear (per blueprint)
- [ ] Action logged with IP + user_agent

**Story H3:** As a coach, I want to take attendance for my class, so that members are recorded as present.

**Acceptance Criteria:**
- [ ] `/c/absensi` shows list of today's classes (must clock-in first to access)
- [ ] Click class → `/c/absensi/[kelas_id]`
- [ ] Page has 2 tabs: "Scan QR" and "Manual Checklist"
- [ ] Scan QR tab:
  - Camera opens, scans QR codes continuously
  - On scan: read member_id from QR, validate member is active + enrolled in this class, insert attendance record
  - Show success toast: "✓ {nama} hadir"
  - Late detection: if `now > class_start + 15 min`, status = "late" with toast warning
  - Duplicate scan: ignored, show toast "Sudah tercatat hadir"
  - Invalid/unknown QR: show toast "QR tidak dikenali"
- [ ] Manual Checklist tab:
  - List all class members (regular + affiliate placeholder for Phase 2)
  - Per member: status dropdown (Hadir / Izin / Sakit / Alpha)
  - Default to existing record if already taken, else "Alpha"
  - Save button per row OR bulk save
- [ ] "Live count": "X dari Y member hadir"
- [ ] Multiple coaches can take attendance simultaneously without conflicts (insert-only, no race)
- [ ] "Selesai" button: marks session closed (informational, doesn't block edits)

> **Note:** Affiliate members appear in checklist in Phase 2 (after bulk import implemented). Phase 1: only regular members.

**Story H4:** As a coach, I want to see my classes and binaan members, so that I know who I'm teaching.

**Acceptance Criteria:**
- [ ] `/c/kelas` lists classes assigned to coach
- [ ] `/c/kelas/[id]` shows class detail + members (read-only access except attendance)
- [ ] `/c/member` lists all members across coach's classes
- [ ] `/c/member/[id]` shows member detail (read-only) + WA button + attendance history

**Story H5:** As a coach, I want my own QR code to be visible, so that I can verify identity if needed.

**Acceptance Criteria:**
- [ ] `/c/qr` shows coach QR code in fullscreen
- [ ] QR contains coach_id_code + signed token
- [ ] Same UX as member QR

> **Note:** Coach profile editing & sertifikat tambahan upload is Tier B/C. Phase 1: read-only profile.

---

### 3.9 Member Daily Workflow

**Story I1:** As a member, I want to see my dashboard, so that I know my upcoming classes and status.

**Acceptance Criteria:**
- [ ] `/m/dashboard` shows:
  - Greeting + nama + countdown to next class
  - "QR Code" card with prominent "Tampilkan QR" button
  - "Kelas berikutnya" card: nama, coach, jam, lokasi
  - "Stats bulan ini": kehadiran %, hadir/izin/sakit/alpha breakdown
  - "Coach saya" card: foto, nama, tombol WA
- [ ] Banner "Tagihan bulan ini belum dibayar" jika overdue (Tier B feature, hidden Phase 1)
- [ ] Mobile responsive

**Story I2:** As a member, I want to show my QR code, so that the coach can scan me in.

**Acceptance Criteria:**
- [ ] `/m/qr` opens fullscreen with QR
- [ ] QR is **static** — encodes `member_id` (UUID) directly, no rotating token
- [ ] QR never changes unless admin explicitly generates a new one
- [ ] Member can also carry a **printed** version (admin prints from detail page)
- [ ] Below QR: nama panggilan, member_id_code
- [ ] Brightness max attempted via Wake Lock API (screen stays on)
- [ ] "Tutup" button to exit
- [ ] Coach scan → reads member_id → server validates member is active + enrolled

**Story I3:** As a member, I want to see my attendance history, so that I can track my participation.

**Acceptance Criteria:**
- [ ] `/m/absensi` lists records sorted by date desc
- [ ] Per row: tanggal, jam, kelas, status (badge), coach yang catat
- [ ] Filter by date range
- [ ] Filter by class
- [ ] Empty state if no records yet
- [ ] Mobile responsive

**Story I4:** As a member, I want to see my classes and schedule, so that I know when to come.

**Acceptance Criteria:**
- [ ] `/m/jadwal` shows list of classes member is enrolled in
- [ ] Per class: nama, coach, hari/jam, lokasi
- [ ] Calendar view (Tier B/C): defer to Phase 1.5+
- [ ] Phase 1: simple list view is enough

**Story I5:** As a member, I want to see info about my coach, so that I can contact them.

**Acceptance Criteria:**
- [ ] `/m/coach` lists coaches across member's classes
- [ ] Per coach: foto, nama, spesialisasi, tombol "Hubungi via WA"
- [ ] WA button opens `wa.me/{coach_phone}`

---

### 3.10 Public Site (Minimal SEO-Ready)

**Story J1:** As a prospective member, I want to discover Next Swimming School online, so that I can decide to register.

**Acceptance Criteria for Phase 1:**
- [ ] Landing page `/` with sections: Hero, Why Next, Programs preview (3-4), CTA
- [ ] Server-rendered (SSR/SSG) for SEO
- [ ] Schema.org `LocalBusiness` markup
- [ ] OG tags + Twitter card
- [ ] `sitemap.xml` auto-generated
- [ ] `robots.txt` configured
- [ ] Meta description + title per page
- [ ] All images have alt text
- [ ] Lighthouse Performance > 80 on mobile
- [ ] Mobile responsive

> **Note:** Full landing (testimoni, FAQ, blog, etc.) is Tier C. Phase 1 = minimum viable landing.

---

## 4. Tier B — Phase 1.5 (Build After Tier A)

### 4.1 Monthly Billing & Payments

**Story K1:** As an admin, I want billing auto-generated monthly, so that I don't manually create invoices for each member.

**Acceptance Criteria:**
- [ ] Cron job (Supabase Edge Function or Vercel cron) runs at midnight on day 1 of each month
- [ ] For each `active` member with `payment_handling = 'individual'`:
  - Sum monthly_price of all enrolled classes
  - Create `monthly_invoices` row with status `unpaid`
  - Create `invoice_items` for each class
- [ ] Idempotent: rerun won't create duplicates
- [ ] `/a/finansial/tagihan-bulanan` shows current month + ability to manually trigger generate

**Story K2:** As an admin, I want to record payments, so that members are marked paid.

**Acceptance Criteria:**
- [ ] Payment list at `/a/finansial/pembayaran`
- [ ] Per-row action "Input Pembayaran"
- [ ] Modal: amount, payment date, upload bukti, notes
- [ ] On submit: update invoice status, insert payment record, upload proof to R2
- [ ] Member with overdue status get red badge auto-flagged at start of month

### 4.2 Email Notifications

**Story L1:** As a system, I want to send email on critical events, so that users are informed.

**Acceptance Criteria:**
- [ ] Resend integration setup
- [ ] Trigger emails on:
  - Account approved
  - Password reset by admin
  - Payment overdue reminder
- [ ] Email template (HTML) with brand consistency
- [ ] Indonesian copy
- [ ] Bounce handling (log + admin alert)

### 4.3 Activity Logs

**Story M1:** As an admin, I want to see all important actions logged, so that I can audit.

**Acceptance Criteria:**
- [ ] All CRUD on members, coaches, classes, payments logged in `activity_logs`
- [ ] `/a/log` shows filterable list
- [ ] Filter by user, action, resource type, date range
- [ ] Per row: who, what, when, on which resource
- [ ] Hard delete: keep for 1 year, then auto-purge (Tier C cron)

### 4.4 Sertifikat Approval Flow

**Story N1:** As an owner/manager, I want to approve coach certifications, so that we ensure quality control.

**Acceptance Criteria:**
- [ ] `/a/coach/sertifikat` lists all `pending_approval` certificates (manager/owner only)
- [ ] Per row: coach name, cert name, foto preview, year, valid until, notes input, Approve/Reject buttons
- [ ] Approve: status `approved`, log who & when
- [ ] Reject: status `rejected` with reason, notify coach (in-app)
- [ ] Coach sees status in `/c/profil`

### 4.5 CMS — Berita

**Story O1:** As an admin, I want to publish news articles, so that the public site has fresh content.

**Acceptance Criteria:**
- [ ] `/a/cms/berita` lists articles
- [ ] Create/edit form: title, slug (auto), cover image, content (rich text), publish status
- [ ] Public `/berita` shows published articles
- [ ] `/berita/[slug]` shows full article with SEO meta

---

## 5. Tier C — Phase 2 Onwards (OUT of Phase 1)

These are explicitly NOT in Phase 1 scope. AI agent must NOT build these in Phase 1:

- Edit profil with approval flow (member/coach request → admin approve)
- Approval Hub (`/a/approval`)
- Reminder Hub (`/a/reminder`) for WA blast
- Calendar view (master + per role)
- Lupa password self-service (email-based reset flow)
- Report Cards (full lifecycle + PDF generation)
- Semester management
- Member affiliation (school panel, bulk import)
- Multi-branch (owner panel, branch CRUD, coach multi-branch)
- Manager cabang panel (`/a/admin`, `/a/cabang-saya`)
- Events & Lomba module
- CMS — Programs, Landing, Sekolah
- Export periodic data (CSV/XLSX)
- Notification preferences
- Coach pengganti / izin management
- Lomba history & catatan waktu
- Member review for coach
- PWA (Phase 4)
- Push notifications

---

## 6. Non-Functional Requirements

### Performance
- LCP < 2.5s on mobile 4G
- Page transitions < 300ms
- Image lazy loading
- Database queries indexed properly

### Security
- All routes (except public) require authentication
- RLS policies on every table (see PERMISSION_MATRIX.md)
- No service role key on client side
- All user inputs validated server-side via Zod
- HTTPS only (Vercel default)
- Passwords minimum 8 chars, validated by Zod

### Browser Support
- Chrome/Edge latest 2 versions
- Safari iOS 14+
- Samsung Internet latest
- Firefox latest
- Mobile responsive: 360px minimum width

### Accessibility
- Semantic HTML
- Keyboard navigation works on all interactive elements
- Focus visible
- Form labels associated
- Color contrast WCAG AA
- (Full WCAG audit is Phase 4)

### Quality
- TypeScript strict mode, no `any`
- ESLint passes with no errors
- All Tier A flows manually tested on:
  - Desktop Chrome
  - Mobile Safari (iPhone)
  - Mobile Chrome (Android)

---

## 7. Definition of Done (per story)

A story is DONE when:
- [ ] All acceptance criteria checked
- [ ] Code passes ESLint + TypeScript check
- [ ] Tested on desktop + mobile viewport (responsive)
- [ ] Empty state, loading state, and error state implemented
- [ ] RLS verified (test with different role accounts)
- [ ] Toast/alert in Indonesian for user-facing messages
- [ ] No console errors or warnings
- [ ] Server actions return `ActionResult<T>` properly
- [ ] Database changes documented in migration SQL (if any)

---

## 8. Phase 1 Milestones (Mapped to BUILD_PLAN.md)

Phase 1 is broken into 6 milestones in BUILD_PLAN.md:

1. **M1: Foundation** — Project setup, Supabase setup, auth, layout
2. **M2: Branch + RBAC** — Default branch, roles, RLS foundation
3. **M3: Admin CRUD** — Members, Coaches, Classes management
4. **M4: Coach Daily Flow** — Dashboard, clock-in, attendance
5. **M5: Member Daily Flow** — Dashboard, QR, attendance history
6. **M6: Public Site + Polish** — Landing, registration, deployment

Each milestone has its own checkpoint where progress is verified before moving on.

---

**Document version:** 1.0
**Last updated:** Phase 1 kickoff
