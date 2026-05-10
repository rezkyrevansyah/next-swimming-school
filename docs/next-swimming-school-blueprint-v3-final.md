# Next Swimming School — Project Blueprint (v3 Final)

Dokumen rancangan final web app sekolah renang multi-cabang untuk Next Swimming School.

---

## 1. Executive Summary

**Next Swimming School Web App** adalah sistem manajemen sekolah renang berbasis web yang dirancang untuk mengelola operasional Next Swimming School secara terpusat, rapi, dan scalable. Sistem ini akan menjadi **single source of truth** untuk data member, coach, kelas, jadwal, absensi, rapot, pembayaran, komunikasi, dan perkembangan siswa.

Sistem dirancang sejak awal dengan pendekatan **multi-branch architecture** — sehingga ketika Next Swimming School membuka cabang baru, **tidak perlu membangun aplikasi baru**, hanya perlu setup data cabang melalui owner panel. Owner dapat melihat seluruh data lintas cabang melalui **helicopter view**, sementara admin/manager cabang hanya melihat data cabangnya sendiri.

Aplikasi pada Phase 1-3 akan dibangun sebagai **web responsive yang mobile-friendly**, sehingga coach dan member dapat mengakses dari HP melalui browser tanpa hambatan. Pada **Phase 4**, aplikasi akan ditingkatkan menjadi **PWA (Progressive Web App)** sehingga bisa di-install di home screen HP dan diakses seperti aplikasi mobile native — tanpa perlu membangun aplikasi Android/iOS terpisah. Coach dapat melakukan absensi, scan QR member, melihat kelas, dan menginput rapot langsung dari HP. Member/orang tua dapat melihat jadwal, QR code, absensi, rapot, pembayaran, dan notifikasi dari web app.

## 2. Product Vision

Membuat sistem digital sekolah renang yang **modern, profesional, mudah digunakan**, dan menjadi keunggulan kompetitif Next Swimming School di Indonesia.

Target akhirnya bukan hanya membuat aplikasi operasional, tetapi juga membangun citra bahwa Next Swimming School adalah sekolah renang yang **lebih terstruktur, transparan, dan terpercaya** dibanding kompetitor — kemungkinan menjadi sekolah renang pertama di Indonesia dengan sistem management end-to-end yang terintegrasi.

## 3. Strategic Goals

| Goal | Indikator Sukses |
|---|---|
| Operasional terdigitalisasi | 100% absensi, rapot, dan pembayaran tercatat di sistem |
| SEO leadership | Landing page rangking #1 Google untuk keyword "sekolah renang [kota]" |
| Multi-branch readiness | Sistem siap menampung cabang ke-2 dan seterusnya tanpa rebuild |
| Coach efficiency | Coach bisa absensi 1 kelas dalam <2 menit dari HP |
| Parent engagement | Orang tua bisa pantau perkembangan anak secara real-time |
| Brand premium | UI/UX yang setara aplikasi-aplikasi premium di kategori sport-tech |

---

## 4. Tech Stack Final

| Layer | Pilihan |
|---|---|
| Frontend | Next.js 15 (App Router, React 19) + TypeScript + Tailwind + shadcn/ui |
| Database & Auth | Supabase (Postgres + Row Level Security + Auth) |
| Storage primer | Supabase Storage (foto profil, sertifikat, rapot, CMS) |
| Storage volume tinggi | Cloudflare R2 (selfie clock-in, bukti pembayaran) |
| PDF | @react-pdf/renderer (server-side via API route) |
| Email | Resend (free 3000/bulan, 100/hari) |
| Hosting | Vercel |
| Forms | React Hook Form + Zod |
| State server | TanStack Query |
| State client | Zustand |
| WhatsApp | wa.me deep link dengan auto-generated message |
| Image compression | browser-image-compression (client-side sebelum upload) |
| PWA (Phase 4) | @serwist/next atau next-pwa |

**Pendekatan responsive:**
- Phase 1-3: Web responsive mobile-first (Tailwind breakpoints, touch-friendly UI)
- Phase 4: Upgrade ke PWA (manifest, service worker, install prompt, offline fallback)

---

## 5. Role & Permission Model

### Hierarki Role

```
Owner (1 orang, manual insert ke DB, no UI CRUD)
└─ Akses: SEMUA cabang, helicopter view, CRUD cabang
   - Auto-default branch saat first install
   - Bisa final-approve sertifikat (terutama saat belum ada manager cabang)
   ↓
Manager Cabang (1 per cabang, di-assign owner)
└─ Akses: Owner-level tapi terbatas ke cabang sendiri
   - CRUD admin cabang, coach, member, kelas
   - View finansial cabang
   - Final-approve sertifikat coach di cabangnya
   ↓
Admin Cabang (multiple per cabang, di-create manager)
└─ Akses: Operasional harian
   - CRUD member, coach (add saja), kelas, absensi, rapot
   - Approve registrasi member, edit profil
   - TIDAK bisa: CRUD admin, edit setting cabang, approve sertifikat
   ↓
Coach
└─ Akses: Coach panel, multi-cabang dengan branch switcher
   ↓
Member (Reguler)
└─ Akses: Member panel, login dengan akun pribadi
   ↓
School (Sekolah Afiliasi)
└─ Akses: View-only, fokus rapot murid mereka
```

### Catatan Akses

- **Coach didaftarkan oleh admin saja** (tidak ada `/daftar/coach` di public site)
- **Member afiliasi tidak punya akun login** (data diakses via School Panel)
- **Approval sertifikat by branch hierarchy:** Owner OR manager cabang (whoever applicable)
- **Phase 1 launch:** owner punya 1 default branch yang auto-created saat first login
- **Multi-branch architecture:** Bukan multi-tenant — semua cabang adalah bagian dari 1 organisasi (Next Swimming School), dengan data terpisah per cabang via `branch_id`

---

## 6. Sitemap Final

### A. Public Site (no login)
```
/                          Landing page (SEO-optimized)
/program                   List program/kelas
/program/[slug]            Detail program
/berita                    List berita (CMS)
/berita/[slug]             Detail berita
/tentang                   Tentang Next Swimming School
/kontak                    Kontak & lokasi cabang
/daftar/member             Form registrasi member (multi-step)
/login                     Login (semua role)
/lupa-password             Reset password
```

### B. Member Panel `/m/*`
```
/m/dashboard               Overview, reminder, kelas mendatang
/m/qr                      QR code fullscreen mode (rotating token)
/m/jadwal                  Calendar kelas yang diikuti
/m/absensi                 History absensi + filter date
/m/rapot                   List rapot per semester
/m/rapot/[id]              Detail rapot + download PDF
/m/lomba                   History lomba & catatan waktu
/m/coach                   Info coach + tombol WA
/m/profil                  Lihat & edit profil (edit perlu approval)
/m/notifikasi              Inbox notifikasi
/m/pengaturan              Ubah password + notification preferences
```

### C. Coach Panel `/c/*`

**Branch switcher di header** (khusus coach yang assigned ke multi-cabang)

```
/c/dashboard               Overview kelas hari ini di cabang aktif
/c/absensi                 Hub absensi (pilih kelas)
/c/absensi/[kelas_id]      Halaman absen aktif (scan QR + checklist)
/c/clock-in                Coach absen kerja (selfie + GPS, per cabang)
/c/kelas                   List kelas yang diajar di cabang aktif
/c/kelas/[id]              Detail kelas + list member binaan
/c/member                  List semua member binaan (multi-cabang aggregated)
/c/member/[id]             Detail member + tombol WA + history absen
/c/rapot                   List siswa yang perlu/sudah dirapot
/c/rapot/[member_id]       Form input/edit rapot
/c/lomba                   Input hasil lomba member
/c/qr                      QR code coach
/c/profil                  Profil coach + sertifikat (multi-branch info)
/c/notifikasi              Inbox
/c/pengaturan              Ubah password + notification preferences
```

### D. Admin Panel `/a/*`
```
/a/dashboard               Overview cabang
/a/calendar                Master calendar (semua kelas, event, lomba)

# Member
/a/member                  List member (filter by type: regular/affiliate)
/a/member/[id]             Detail member (tabs)
/a/member/registrasi       List pendaftar yang menunggu approval
/a/member/import           Bulk import via Excel/CSV (untuk afiliasi)

# Coach
/a/coach                   List coach
/a/coach/[id]              Detail coach (tabs: profil, kelas, sertifikat, absensi)
/a/coach/sertifikat        Approval sertifikat (manager/owner only)
/a/coach/izin              Manage coach yang izin + assign pengganti

# Class
/a/kelas                   List kelas
/a/kelas/[id]              Detail kelas + member + coach
/a/kelas/baru              Form bikin kelas baru

# Attendance
/a/absensi                 Rekap absensi semua member
/a/absensi/[id]            Detail absensi (bisa edit/delete)
/a/absensi/manual          Input absensi manual (izin/sakit/atas nama coach)
/a/absensi/coach           History clock-in coach + flag suspicious

# Report Card
/a/rapot                   List rapot semua siswa
/a/rapot/[id]              Detail rapot
/a/rapot/timeline          Setting timeline pembagian rapot
/a/rapot/notifikasi        List rapot yang sudah keluar

# Finance (REGULAR MEMBERS ONLY — afiliasi tidak masuk)
/a/finansial               Dashboard finansial cabang
/a/finansial/tagihan-bulanan   Generate & manage tagihan bulanan
/a/finansial/pembayaran    History pembayaran
/a/finansial/laporan       Generate laporan keuangan

# Events
/a/event                   List event/lomba (muncul di calendar member juga)
/a/event/[id]              Detail event + peserta

# CMS
/a/cms/berita              Kelola berita
/a/cms/program             Kelola program (yang muncul di public)
/a/cms/landing             Edit konten landing page
/a/cms/sekolah             Kelola sekolah afiliasi (CRUD school)

# Approvals
/a/approval                Hub approval (registrasi, edit profil, sertifikat)

# Reminder
/a/reminder                Kirim WA reminder ke member (template & manual)

# Semester
/a/semester                Setting periode semester aktif

# Settings
/a/role                    CRUD role & permission (manager/owner only)
/a/user                    CRUD user (manager only untuk admin cabang)
/a/log                     Activity log
/a/export                  Export data periodik (CSV/XLSX)
```

### E. Manager Cabang
Manager pakai admin panel dengan akses tambahan:
```
/a/admin                   CRUD admin cabang (manager-only)
/a/cabang-saya             Setting cabang ini (lokasi, kontak, dll)
+ akses ke /a/coach/sertifikat (final approval)
+ akses ke /a/role
```

### F. Owner Panel `/o/*`
```
/o/dashboard               Helicopter view semua cabang
/o/cabang                  CRUD cabang + assign manager
/o/cabang/[id]             Drill down detail per cabang
/o/finansial               Financial konsolidasi multi-cabang
/o/coach                   All coaches across branches + assignment
/o/laporan                 Laporan multi-cabang
/o/log                     Log aktivitas semua admin
/o/export                  Export multi-cabang
+ Branch switcher di header → masuk admin mode cabang manapun
```

### G. School Panel `/s/*` (Afiliasi)
Fokus utama: **akses rapot murid afiliasi**.
```
/s/dashboard               Overview murid sekolah ini
/s/member                  List murid afiliasi sekolah ini
/s/member/[id]             Detail (read-only): profil, absensi, rapot
/s/rapot                   List rapot semua murid afiliasi (download bulk)
/s/rapot/[id]              Detail rapot + download PDF (priority feature)
/s/laporan                 Laporan periodik attendance
```

---

## 7. Detail Halaman Kritis

### 7.1 Landing Page
Sections (urutan): Hero → Trust bar → Why Next → Programs preview → How it works → Testimoni → Coach highlights → Berita terbaru → Lokasi cabang → FAQ → CTA + footer

SEO essentials: SSR/SSG, Schema.org (LocalBusiness/Course/FAQPage), OG/Twitter cards, sitemap.xml, robots.txt, meta per page, image alt, Core Web Vitals.

### 7.2 Registrasi Member (Multi-step)

**Step 1 — Data Member:**
- Foto profil (compress to <200KB)
- Nama lengkap, nama panggilan, tanggal lahir, jenis kelamin
- Riwayat penyakit (textarea, optional)

**Step 2 — Data Kontak:**
- Email (untuk login)
- Nomor HP utama → radio: nomor sendiri / nomor orang tua
- Jika anak: nama orang tua, nomor orang tua tambahan
- Alamat

**Step 3 — Pilih Cabang & Program:**
- Pilih cabang
- Pilih program/kelas yang diminati (multi-select dengan harga & jadwal)
- Password & konfirmasi

**Setelah submit:**
- Status `pending_payment`
- Halaman konfirmasi: tombol "Kirim Bukti Pembayaran via WhatsApp"
- Auto-generated message
- Info rekening pembayaran

### 7.3 Member Dashboard
Cards:
1. Greeting + countdown ke kelas berikutnya
2. QR Code preview + tombol "Tampilkan QR"
3. Kelas berikutnya
4. Stats bulan ini (kehadiran %, hadir/izin/sakit/alpha)
5. Reminder aktif
6. Coach saya (foto + nama + tombol WA)
7. Progress ke rapot berikutnya
8. **Banner pembayaran (kalau overdue):** "Tagihan bulan ini belum dibayar" + tombol kirim bukti via WA

### 7.4 Member QR
- Fullscreen mode dengan brightness max
- QR besar di tengah dengan rotating JWT token (refresh tiap 30 detik)
- Nama member, ID, kelas aktif
- **Mobile-optimized:** fullscreen API, prevent screen lock saat aktif

### 7.5 Coach Dashboard

**Branch switcher di header** (kalau multi-cabang).

**Skenario A — Ada kelas hari ini di cabang aktif:**
- Banner: "Kamu punya 3 kelas hari ini di [Cabang Aktif]"
- Belum clock-in di cabang ini → tombol "Absen Masuk Hari Ini"
- Sudah clock-in → badge "✓ Sudah absen 14:23 — Jarak: 12m"
- List kelas hari ini dengan status

**Skenario B — Tidak ada kelas hari ini di cabang aktif:**
- Banner: "Tidak ada kelas dijadwalkan hari ini di cabang ini"
- Tombol clock-in tidak muncul

**Skenario C — Coach multi-cabang, ada kelas di cabang lain:**
- Banner notice: "Kamu juga ada kelas di [Cabang B] hari ini → Switch cabang"
- Tombol switch cabang

### 7.6 Coach Clock-in (Per Cabang)

- Tombol "Absen Masuk" → buka kamera selfie
- Ambil foto + GPS (highAccuracy)
- Hitung jarak ke koordinat cabang aktif (Haversine)
- Log: branch_id, koordinat, accuracy, timestamp, IP, user agent
- Tampilkan label: "✓ Di lokasi (12m)" / "⚠ Jauh dari lokasi (450m)"
- Submit → record disimpan
- **Sekali per hari per cabang**

**Fallback:** Jika coach tidak bisa clock-in (HP rusak, dll), admin bisa input absen kerja coach manual via `/a/absensi/manual`.

### 7.7 Halaman Absensi Aktif (Coach)

Header: nama kelas, jam, lokasi, list coach lain.

**Tab Scan QR:**
- Buka kamera, scan QR member
- Otomatis ✓ hadir + nama + waktu scan
- Late: scan > 15 menit setelah jam mulai → status "Hadir Telat"

**Tab Manual Checklist:**
- List semua member kelas (termasuk afiliasi tanpa akun)
- Per member: status (Hadir / Izin / Sakit / Alpha)

**Edge cases:**
- Multi-coach: pakai realtime + insert row baru (zero race condition)
- Coach pengganti: dapat akses absen kelas tsb di tanggal ybs
- Member afiliasi: hanya muncul di tab Manual Checklist
- Koneksi drop saat scan: data buffered di local state, retry submit otomatis (Phase 4: offline-first via service worker)

### 7.8 Input Rapot

Sections:
1. Info auto: foto, nama, kelas, periode, attendance rate
2. Skill Assessment (1-5 stars per skill, custom skill bisa ditambah)
3. Goals Achieved (free-form bullet)
4. Catatan Coach (narasi)
5. Skill Level Overall (Beginner → Expert)
6. Status (Naik kelas / Lanjut / Remedial)

Tombol: Simpan Draft / Submit Rapot.
Setelah submit: PDF auto-generated, notif ke member, muncul di hub admin.
Timeline enforcement: lewat deadline → input auto-disabled (admin bisa override).

### 7.9 Admin Member Detail (Tabs)
- **Profil:** semua data + foto + QR (download) + tombol WA
- **Tipe Member:** badge regular/affiliate, link ke sekolah jika afiliasi
- **Kelas:** list + add/remove
- **Absensi:** history + filter + edit/delete
- **Rapot:** list per semester + PDF
- **Lomba:** history + admin bisa input
- **Pembayaran:** [HIDDEN untuk afiliasi] history + input baru
- **Log:** aktivitas terkait member

### 7.10 Admin Bulk Import (Afiliasi)

1. Download template CSV/XLSX
2. Sekolah/admin isi data, upload
3. Validasi (cek duplikat email, format)
4. Preview sebelum commit
5. Konfirmasi → semua row jadi member dengan:
   - `type = 'affiliate'`
   - `payment_handling = 'covered_by_school'`
   - `status = 'active'` (langsung tanpa pending payment)
   - `has_account = false` (TIDAK generate akun login)
   - `school_id = X`
6. Sekolah akses data muridnya via School Panel

### 7.11 Admin Tagihan Bulanan (Regular Members Only)

- Pilih bulan (default bulan aktif)
- List **member regular saja** (filter `payment_handling = 'individual'`)
- Stats: total tagihan, terbayar, outstanding
- Tombol "Generate Tagihan Bulan Ini" (otomatis tanggal 1)
- Member yang belum bayar → flag merah otomatis tanggal 1
- Bulk: kirim reminder WA
- Per-row: input pembayaran (upload bukti dari R2), view bukti

### 7.12 Owner Dashboard

Top metrics konsolidasi semua cabang.
Per-cabang comparison (bar charts + table).
Drill down cabang → admin mode cabang tsb.
Notifikasi: approval pending, anomaly cabang.

### 7.13 School Panel (Priority: Rapot)

**`/s/dashboard`:**
- Total murid afiliasi sekolah ini
- Attendance avg bulan ini
- Rapot tersedia (count)
- Kelas yang diikuti

**`/s/rapot`:**
- List semua rapot murid afiliasi sekolah ini
- Filter by semester, kelas
- Bulk download PDF (zip)
- Per-row: view detail + download PDF

**`/s/member/[id]`:**
- View-only: profil, absensi, rapot history

---

## 8. User Flows

### Flow 1: Member Reguler Registration → Active
1. Member isi `/daftar/member` (3 step)
2. Submit → status `pending_payment`
3. Klik tombol WA → kirim bukti transfer
4. Admin verifikasi, approve, input pembayaran
5. Status `active` → email kirim → bisa login

### Flow 2: Member Afiliasi Bulk Import
1. Sekolah kasih list murid ke admin Next
2. Admin download template, isi/format data
3. Upload di `/a/member/import`
4. Validasi + preview
5. Commit → 50 member created (afiliasi, no payment, no account)
6. Sekolah akses rapot murid via School Panel

### Flow 3: Coach Daily Attendance (Multi-Branch)
1. Coach login → dashboard cabang default
2. Lihat ada kelas hari ini di cabang ini
3. Clock-in cabang ini → selfie + GPS → label jarak
4. Masuk halaman absensi kelas
5. Scan QR member regular atau checklist manual (afiliasi)
6. Akhir kelas → "Selesai"
7. Sore: switch ke cabang lain (jika ada kelas)
8. Clock-in lagi di cabang B → ulangi

### Flow 4: Report Card Lifecycle
1. Admin set semester + deadline rapot
2. Window terbuka → coach dapat akses input
3. Coach isi rapot per siswa (regular + afiliasi)
4. Submit → PDF auto-generated, notif admin
5. Admin kirim WA reminder ke ortu (member regular)
6. **Member regular:** buka rapot, download PDF, kasih review
7. **Member afiliasi:** sekolah akses via School Panel, download PDF
8. Deadline lewat → input auto-disabled

### Flow 5: Member Regular Daily Use
1. Login → dashboard
2. Lihat banner: tagihan bulan ini sudah/belum bayar
3. Datang ke kolam → buka `/m/qr` fullscreen
4. Coach scan → otomatis hadir
5. Pulang → cek `/m/absensi`
6. Akhir semester → notif rapot keluar → review coach

### Flow 6: Owner Multi-Branch (Phase 2+)
1. Login → `/o/dashboard` helicopter view
2. Lihat KPI konsolidasi
3. Drill down cabang anomaly
4. Switch ke admin mode cabang tsb
5. Kalau perlu cabang baru → CRUD via `/o/cabang` → assign manager

### Flow 7: First Install (Phase 1)
1. Owner login pertama kali (akun di-insert manual ke DB)
2. Sistem auto-create default branch "Next Swimming School Pusat"
3. Owner langsung punya akses admin panel cabang utama
4. Owner setup data awal: kelas, program, coach
5. Mulai operasional

---

## 9. Database Schema

### Auth & Branches
```
branches
- id, name, slug, address
- location_lat, location_lng (default lokasi cabang)
- contact_phone, contact_email
- manager_id (nullable, FK ke users)
- is_default (boolean, true untuk cabang pertama auto-created)
- status, created_at

users (extends Supabase auth)
- id, email, encrypted_password (managed by Supabase)
- full_name, phone (basic profile)

user_roles
- user_id, role_id, branch_id (NULL untuk owner = global access)

roles
- id, name (owner | manager | admin | coach | member | school)
- level (untuk hierarchy enforcement)

permissions, role_permissions (RBAC granular)
```

### Members
```
members
- id (UUID), user_id (nullable untuk afiliasi tanpa akun)
- branch_id (cabang utama member)
- member_id_code (e.g. "NSS-001-2025")
- type: 'regular' | 'affiliate'
- school_id (nullable, untuk afiliasi)
- payment_handling: 'individual' | 'covered_by_school'
- has_account: boolean
- status: 'pending_payment' | 'active' | 'inactive'
- joined_date

member_profiles
- member_id, full_name, nickname, dob, gender
- photo_url (Supabase: avatars/)
- phone, phone_owner ('self' | 'parent')
- parent_name, parent_phone
- address, health_history

member_qr_tokens (rotating)
- member_id, token, expires_at
```

### Coaches (Multi-Branch)
```
coaches
- id, user_id, coach_id_code, status

coach_branches (M2M)
- coach_id, branch_id, is_primary, assigned_at

coach_profiles
- coach_id, full_name, nickname, dob
- photo_url, phone, specializations[]

coach_certificates
- coach_id, name, photo_url (Supabase: certificates/)
- issued_year, valid_until, no_expiry
- approval_status, approved_by, approved_at
- approval_notes
```

### Schools (Afiliasi)
```
schools
- id, name, contact_person, contact_phone
- address, branch_id (cabang yang berafiliasi)
- school_user_id (account untuk login School Panel)
```

### Classes
```
classes
- id, branch_id, name, slug
- age_range_min, age_range_max
- monthly_price, sessions_per_month
- capacity
- location_lat, location_lng (override branch default)
- location_name, status

class_schedules
- class_id, day_of_week (0-6)
- start_time, end_time

class_coaches (M2M)
- class_id, coach_id

class_members (M2M)
- class_id, member_id, joined_at, status
```

### Attendance
```
attendance_records
- id, member_id, class_id, session_date
- status: 'present' | 'late' | 'permitted' | 'sick' | 'absent'
- recorded_by_coach_id, scanned_at
- scan_method: 'qr' | 'manual'
- notes, branch_id

coach_clock_records (per cabang)
- coach_id, branch_id, clock_in_at
- clock_in_selfie_url (R2: attendance-selfies/)
- clock_in_lat, clock_in_lng
- clock_in_distance_m (Haversine to branch/class location)
- clock_in_accuracy, ip_address, user_agent
- suspicious_flag (boolean — admin manual flag)
```

### Report Cards
```
semesters
- id, branch_id, name (e.g. "Semester 1 2025")
- start_date, end_date
- report_input_start, report_input_end (deadline)

report_cards
- id, member_id, semester_id, coach_id
- status: 'draft' | 'submitted'
- skill_level_overall, status_recommendation
- narrative
- pdf_url (generated, cached di Supabase: report-pdfs/)

report_card_skills
- report_card_id, skill_name, rating (1-5)

report_card_goals
- report_card_id, goal_text, order

report_card_reviews (member regular only)
- report_card_id, member_id, rating (1-5), comment
```

### Finance (Regular Members Only)
```
monthly_invoices
- id, member_id, period_month (e.g. "2025-01")
- total_amount, status: 'unpaid' | 'paid' | 'partial'
- generated_at
- IGNORE: members.payment_handling = 'covered_by_school'

invoice_items
- invoice_id, class_id, amount

payments
- invoice_id, amount, paid_at
- proof_url (R2: payment-proofs/)
- recorded_by, notes
```

### Events & Competitions
```
events
- id, branch_id (nullable untuk multi-branch event)
- name, type ('lomba' | 'event' | 'workshop')
- date, location, description
- visible_in_calendar (boolean)

event_participants
- event_id, member_id, result_time, position, notes
```

### Misc
```
activity_logs
- user_id, branch_id, action, resource_type, resource_id
- metadata (jsonb), created_at

change_requests
- user_id, type ('member_profile' | 'coach_profile')
- payload_json, status, reviewed_by, reviewed_at

notifications
- user_id, type, title, message, link
- channel: 'in_app' | 'email' | 'both'
- read_at, created_at, sent_email_at

user_notification_preferences
- user_id, category, channel preference

news_articles
- branch_id (nullable global), title, slug, content
- cover_url, published_at, status

programs
- branch_id, name, slug, description
- cover_url, price, duration, age_range

landing_sections
- type, content_json, order, status
```

---

## 10. Storage Strategy

### Supabase Storage Buckets (1GB free tier)
- `avatars/` — foto profil member & coach (compressed <200KB)
- `certificates/` — sertifikat coach (compressed <500KB)
- `report-photos/` — foto siswa di rapot
- `report-pdfs/` — generated rapot PDF (cached)
- `cms-media/` — gambar berita & program (public)

### Cloudflare R2 Buckets (10GB free tier)
- `attendance-selfies/` — selfie clock-in (compressed <100KB)
- `payment-proofs/` — bukti pembayaran (compressed <300KB)

### Upload Helper Pattern
```typescript
// lib/storage.ts
type AssetType = 
  | 'avatar' | 'certificate' | 'report_photo' | 'report_pdf' | 'cms_media'  // Supabase
  | 'attendance_selfie' | 'payment_proof';  // R2

export async function uploadFile(file: File, type: AssetType, ownerId: string) {
  const compressed = await compressImage(file, COMPRESSION_RULES[type]);
  
  if (R2_TYPES.includes(type)) {
    return uploadToR2(compressed, type, ownerId);
  }
  return uploadToSupabase(compressed, type, ownerId);
}

export async function getSignedUrl(path: string, type: AssetType) {
  // Auto-detect provider, generate appropriate signed URL
}
```

### Compression Rules
- avatar: 800x800, max 200KB
- certificate: preserve quality, max 500KB
- attendance_selfie: 600x600, max 100KB
- payment_proof: max 300KB

---

## 11. Notification System

### Channel Mapping

**Dual channel (in-app + email):**
- Akun aktif (setelah admin approve registrasi)
- Rapot keluar (member regular)
- Pembayaran jatuh tempo reminder
- Reset password
- Coach: registrasi & sertifikat di-approve

**In-app only:**
- Reminder kelas besok
- Coach selesai input rapot (notif ke admin)
- Edit profil di-approve/reject
- Notifikasi event/lomba upcoming
- Coach baru ditugaskan ke kelas
- Branch switcher coach: "Kamu ada kelas di cabang lain"

User bisa override per kategori di `/m/pengaturan` atau `/c/pengaturan`.

### Komunikasi Strategy

Sistem komunikasi terdiri dari **3 channel**:
1. **In-app notification** — semua user, real-time
2. **Email** — via Resend, untuk kategori penting
3. **WhatsApp deep link** — admin generate link reminder, di-klik manual untuk kirim

WhatsApp blast otomatis (via WA Business API berbayar) **tidak masuk scope** — admin yang trigger manual via reminder hub.

---

## 12. Roadmap Pengembangan

### Phase 1 — MVP Single Branch (Core Operational)
**Tujuan:** Bisa launch 1 cabang Next Swimming School pusat.

- Auth + RBAC dasar (5 role)
- First-install flow: auto-create default branch
- Public landing page (SEO ready, mobile responsive)
- Registrasi member regular self-service
- Admin: CRUD member, coach (admin add only), kelas
- Coach: clock-in (single branch), scan QR, manual checklist
- Member regular: dashboard, QR, jadwal, history absen
- Tagihan bulanan + input pembayaran manual
- Member overdue auto-flag tanggal 1
- CMS basic: berita & program
- **Mobile-first responsive design** (semua halaman accessible & usable di HP)

### Phase 2 — Rapot, Afiliasi, Multi-Branch
**Tujuan:** Sekolah afiliasi bisa dilayani + ekspansi cabang.

- Setting semester + timeline rapot
- Coach input rapot + auto PDF
- Member view rapot + review
- Bulk import CSV/XLSX (member afiliasi)
- School Panel (fokus rapot)
- Owner dashboard (helicopter view)
- Manager cabang panel + setting cabang
- Multi-branch coach (branch switcher, M2M assignment)
- Approval hub
- Activity logs

### Phase 3 — Event, Reminder, Polish
- Event/lomba module + calendar integration
- Reminder hub (WA blast manual + template)
- Notifikasi system (in-app + email via Resend)
- User notification preferences
- Export periodic data (CSV/XLSX)
- Mobile optimization deep dive (touch targets, gesture, performance)

### Phase 4 — PWA & Growth
**Tujuan:** Aplikasi bisa di-install di HP, akses seperti aplikasi mobile.

- **PWA setup:**
  - Web App Manifest (`manifest.json`) — icon, theme, splash screen
  - Service Worker (via @serwist/next atau next-pwa)
  - Install prompt banner ("Add to Home Screen")
  - Offline fallback (cache static assets, basic dashboard)
  - Background sync untuk absensi (auto-retry kalau koneksi drop)
- **Push notification** (where supported — iOS 16.4+, all Android)
- Analytics dashboard advanced
- Sertifikat expiry auto-reminder
- Bulk operations (mass message, bulk export)
- Performance audit + caching strategy
- Backup automation script

---

## 13. Decisions Log

Keputusan kunci yang sudah disepakati:

| Topik | Keputusan |
|---|---|
| Multi-cabang | Single DB, branch_id di setiap tabel (multi-branch, BUKAN multi-tenant) |
| Self-registration | Member regular self-service via WA. Coach: admin-only |
| Absensi | Coach scan QR member + checklist manual untuk afiliasi |
| Pembayaran | Manual recording, tagihan auto-generate awal bulan, regular only |
| Rapot | Free-form text + skill rating 1-5 + goals achieved |
| GPS | Haversine + log + label warning, no anti-fake-strict |
| Coach clock-in | Per cabang per hari (multi-branch support) |
| Owner | 1 orang, manual insert ke DB, no UI CRUD |
| Manager cabang | Owner-level scoped to branch |
| Member afiliasi | Tidak punya akun, no payment tracking, akses via sekolah |
| School Panel | Fokus utama: rapot murid |
| Approval sertifikat | Owner OR manager cabang (by branch) |
| Coach multi-cabang | Yes, dengan branch switcher |
| Member multi-cabang | Tidak (jarang terjadi, abaikan) |
| Member overdue | Auto-flag tanggal 1 (tidak ada grace period) |
| Setup awal | Owner punya 1 default branch saat first install |
| Storage | Hybrid: Supabase + Cloudflare R2 |
| Notifikasi | In-app + Email (Resend), selektif by category |
| Komunikasi | WA deep link + reminder hub + notif (no WA blast otomatis) |
| Backup | Manual periodic export |
| Cancel kelas | Manual, no special flow |
| Mobile experience | Responsive Phase 1-3, PWA Phase 4 |
| Branding & UI design | Document terpisah (design system di file lain) |

---

## 14. Open Items (Saat Implementasi)

Hal-hal kecil yang tidak menghambat blueprint tapi perlu diputuskan saat coding:

1. **QR token expiry exact** — 30 detik atau 60 detik?
2. **Late threshold** — 15 menit setelah jam mulai? (current default)
3. **Image compression quality** — exact bytes per type sudah disebutkan, tinggal eksekusi
4. **PDF rapot template design** — perlu desain visual yang detail (bisa di design system file)
5. **WA template messages** — perlu draft untuk semua skenario
6. **Email template (Resend)** — perlu design HTML email
7. **Calendar library** — react-big-calendar / FullCalendar / custom?
8. **QR scanner library** — html5-qrcode / @yudiel/react-qr-scanner?
9. **Default kelas member afiliasi** — apakah perlu otomatis assign ke 1 kelas spesifik per sekolah?
10. **Sertifikat expired** — apakah coach masih bisa ngajar atau diblock otomatis?
11. **PWA icon set** — perlu disiapkan saat masuk Phase 4 (multiple sizes untuk iOS & Android)

Hal-hal ini bisa dijawab saat implementasi tanpa menggantung blueprint.

---

## 15. Strategic Goals — Indikator Sukses

| Goal | KPI | Target |
|---|---|---|
| Operasional terdigitalisasi | % absensi via sistem | >95% (sisa 5% manual fallback) |
| SEO leadership | Ranking landing page | Top 3 untuk "sekolah renang [kota]" dalam 6 bulan |
| Multi-branch readiness | Setup cabang baru | <1 hari (data only, no code) |
| Coach efficiency | Waktu absensi 1 kelas | <2 menit di HP |
| Parent engagement | DAU member | >60% member aktif login per minggu |
| Brand premium | NPS / kepuasan user | >50 (industry standard >30 sudah bagus) |

---

**Status:** Blueprint v3 siap untuk:
- Disampaikan ke client untuk approval scope
- Dijadikan dasar estimasi timeline & cost
- Mulai Phase 1 development
- Pengembangan dokumen pendamping (design system, ERD detail, wireframe, PDF rapot template) di file terpisah
