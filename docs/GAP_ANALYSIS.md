# Gap Analysis: Fitur yang Belum Ada

> Analisis berdasarkan blueprint v3 final, BUILD_PLAN_v2.md, dan catatan meeting.
> Dibandingkan dengan audit codebase aktual per 2026-05-11.

---

## ✅ Sudah Ada

| Area | Status |
|------|--------|
| Auth (login, logout, role redirect) | ✅ |
| DB schema (20+ tabel, RLS, migrations 001–011) | ✅ |
| Public: landing, program list, tentang, kontak | ✅ |
| Public: self-registration member | ✅ |
| Admin: dashboard, member CRUD, coach CRUD, kelas CRUD | ✅ |
| Admin: registrasi approval, absensi rekap, absensi manual, semester | ✅ |
| Coach: dashboard, clock-in, absensi hub + per-kelas, kelas list/detail, profil, rapot | ✅ |
| Member: dashboard, QR, jadwal, absensi, coach list, profil, rapot list/detail | ✅ |
| Owner: dashboard stub | ✅ |

---

## 🔴 Belum Ada

### 1. Public Site

| # | Halaman / Fitur | Blueprint Ref | Prioritas |
|---|-----------------|---------------|-----------|
| P1 | `/daftar/member/sukses` — halaman konfirmasi setelah submit + tombol WA kirim bukti transfer | §7.2 | 🔴 Launch |
| P2 | `app/sitemap.ts` + `app/robots.ts` | §7.1 | 🔴 Launch |
| P3 | Public footer di layout | BUILD_PLAN §M1.3 | 🔴 Launch |
| P4 | `/program/[slug]` — halaman detail per program | §6.A | 🟡 Penting |
| P5 | JSON-LD Schema.org (LocalBusiness, Course, FAQPage) di landing | §7.1 | 🟡 Penting |
| P6 | OG tags / meta description per halaman | §7.1 | 🟡 Penting |
| P7 | `/berita` + `/berita/[slug]` — halaman berita (butuh tabel `news_articles`) | §6.A | 🟢 Phase 2 |

---

### 2. Admin Panel (`/a/*`)

| # | Halaman / Fitur | Blueprint Ref | Prioritas |
|---|-----------------|---------------|-----------|
| A1 | **Tab kelas** di `/a/member/[id]` — lihat + add/remove member ke kelas | §7.9 | 🔴 Launch |
| A2 | **Tab kelas** di `/a/coach/[id]` — kelas yang diajar coach | §6.D | 🔴 Launch |
| A3 | `/a/absensi/coach` — rekap clock-in coach + flag suspicious | §6.D | 🔴 Launch |
| A4 | `/a/approval` — approval hub untuk request edit profil member/coach | §6.D | 🔴 Launch |
| A5 | `/a/log` — activity log viewer (tabel sudah ada di DB) | §6.D | 🟡 Penting |
| A6 | **Tab rapot** di `/a/member/[id]` — list rapot member | §7.9 | 🟡 Penting |
| A7 | **Tab absensi/clock-in** di `/a/coach/[id]` — history clock-in coach | §6.D | 🟡 Penting |
| A8 | **Tab sertifikat** di `/a/coach/[id]` — list + status approval | catatan meeting §55 | 🟡 Penting |
| A9 | `/a/coach/sertifikat` — halaman approval sertifikat coach (manager/owner) | §6.D | 🟡 Penting |
| A10 | `/a/rapot` + `/a/rapot/[id]` — admin view semua rapot siswa | §6.D, §7.9 | 🟡 Penting |
| A11 | `/a/reminder` — kirim WA reminder ke member (template + manual) | §6.D | 🟡 Penting |
| A12 | Dashboard lebih lengkap: attendance rate, kelas minggu ini, aktivitas terbaru | catatan meeting §2 | 🟡 Penting |
| A13 | `/a/member/import` — bulk import afiliasi via CSV/Excel | §7.10 | 🟢 Phase 2 |

---

### 3. Coach Panel (`/c/*`)

| # | Halaman / Fitur | Blueprint Ref | Prioritas |
|---|-----------------|---------------|-----------|
| C1 | `/c/member` — list semua member binaan coach | §6.C | 🔴 Launch |
| C2 | `/c/member/[id]` — detail member binaan + tombol WA + history absen | §6.C | 🔴 Launch |
| C3 | `/c/qr` — QR code coach fullscreen (dedicated page) | §6.C | 🟡 Penting |
| C4 | Upload sertifikat dari coach panel | catatan meeting §55 | 🟡 Penting |
| C5 | `/c/notifikasi` — inbox notifikasi | §6.C | 🟢 Phase 2 |
| C6 | `/c/pengaturan` — ubah password + notification preferences | §6.C | 🟢 Phase 2 |

---

### 4. Member Panel (`/m/*`)

| # | Halaman / Fitur | Blueprint Ref | Prioritas |
|---|-----------------|---------------|-----------|
| M1 | `/m/profil` — edit profil + request approval ke admin | §6.B, §7.9 | 🔴 Launch |
| M2 | Review/rating coach setelah rapot publish | §7.8, catatan meeting §57 | 🟢 Phase 2 |
| M3 | Banner pembayaran overdue di dashboard | §7.3 | 🟢 Phase 2 |
| M4 | `/m/notifikasi` — inbox notifikasi | §6.B | 🟢 Phase 2 |
| M5 | `/m/pengaturan` — ubah password + preferences | §6.B | 🟢 Phase 2 |

---

### 5. Owner Panel (`/o/*`)

Seluruh owner panel adalah **Phase 2**. Hanya stub `/o/dashboard` yang ada. Skip untuk sekarang.

---

### 6. DB / Migration yang Belum Ada

| Tabel | Dibutuhkan untuk | Prioritas |
|-------|------------------|-----------|
| `change_requests` | A4 (approval hub), M1 (edit profil) | 🔴 Launch |
| `news_articles` | P7 (berita) | 🟢 Phase 2 |
| `notifications` + `user_notification_preferences` | C5, M4 | 🟢 Phase 2 |
| `report_card_reviews` | M2 (review coach) | 🟢 Phase 2 |

---

## Urutan Pengerjaan yang Direkomendasikan

### Batch 1 — Tidak butuh migration baru
1. P3 — Public footer
2. P1 — `/daftar/member/sukses`
3. P2 — `sitemap.ts` + `robots.ts`
4. A3 — `/a/absensi/coach`
5. A2 + A1 — Tab kelas di coach detail + member detail
6. A5 — `/a/log`
7. C1 + C2 — `/c/member` + `/c/member/[id]`
8. C3 — `/c/qr` fullscreen

### Batch 2 — Butuh `change_requests` migration
1. Migration `012_change_requests.sql`
2. A4 — `/a/approval` hub
3. M1 — Edit profil member dengan approval flow

### Batch 3 — Fitur tambahan
1. A10 — `/a/rapot` admin view
2. A9 + A8 — Sertifikat coach (tab + halaman approval)
3. A11 — `/a/reminder`
4. A6 + A7 — Tab rapot + absensi di admin detail
5. P4 — `/program/[slug]`
6. P5 + P6 — SEO meta/OG

---

## File Kritis

| File | Aksi |
|------|------|
| `supabase/migrations/012_change_requests.sql` | BARU |
| `app/(public)/daftar/member/sukses/page.tsx` | BARU |
| `app/(public)/program/[slug]/page.tsx` | BARU |
| `app/(public)/layout.tsx` | UPDATE — tambah footer |
| `components/shared/public-footer.tsx` | BARU |
| `app/sitemap.ts` | BARU |
| `app/robots.ts` | BARU |
| `app/a/absensi/coach/page.tsx` | BARU |
| `app/a/approval/page.tsx` | BARU |
| `app/a/log/page.tsx` | BARU |
| `app/a/rapot/page.tsx` + `app/a/rapot/[id]/page.tsx` | BARU |
| `app/a/reminder/page.tsx` | BARU |
| `app/a/coach/sertifikat/page.tsx` | BARU |
| `app/a/member/[id]/page.tsx` | UPDATE — tab kelas + tab rapot |
| `app/a/coach/[id]/page.tsx` | UPDATE — tab kelas + tab sertifikat + tab absensi |
| `app/c/member/page.tsx` | BARU |
| `app/c/member/[id]/page.tsx` | BARU |
| `app/c/qr/page.tsx` | BARU |
| `app/m/profil/page.tsx` | UPDATE — tambah edit + approval flow |
