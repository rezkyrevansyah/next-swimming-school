# Gap Analysis — Next Swimming School

> Audit terakhir: **2026-05-12** · Codebase aktual vs Blueprint v3 Final + Catatan Meeting
> Total route aktif: **65 halaman** (build clean, 0 error)

---

## ✅ Sudah Selesai

### Auth & Infrastruktur
| Fitur | Catatan |
|-------|---------|
| Auth: login, logout, role redirect | ✅ |
| DB schema (20+ tabel, RLS, migrations 001–015) | ✅ 015 = finance tables |
| `sitemap.ts` + `robots.ts` | ✅ |
| Activity log (tabel + halaman `/a/log`) | ✅ |
| Change request system (migration 014) | ✅ |
| Finance tables (migration 015: `monthly_invoices`, `invoice_items`, `payments`) | ✅ |

### Public Site
| Route | Status |
|-------|--------|
| `/` — Landing page (SEO, Schema.org, OG) | ✅ |
| `/program` — List program | ✅ |
| `/program/[slug]` — Detail program | ✅ |
| `/tentang`, `/kontak` | ✅ |
| `/daftar/member` — Multi-step registrasi | ✅ |
| `/daftar/member/sukses` — Konfirmasi + tombol WA | ✅ |
| `/login`, `/lupa-password`, `/reset-password` | ✅ |
| Public footer | ✅ |

### Admin Panel `/a/*`
| Route / Fitur | Status |
|---------------|--------|
| `/a/dashboard` — 4 stat cards + kelas hari ini + absensi terbaru | ✅ |
| `/a/member` — List + filter | ✅ |
| `/a/member/baru` | ✅ |
| `/a/member/registrasi` — Approval pendaftaran | ✅ |
| `/a/member/[id]` — Tabs: Profil, Kelas, Rapot, **Absensi**, Pembayaran, QR, Bahaya | ✅ Tab absensi baru |
| `/a/coach` — List | ✅ |
| `/a/coach/baru` | ✅ |
| `/a/coach/sertifikat` — Approval sertifikat | ✅ |
| `/a/coach/[id]` — Tabs: Profil, Kelas, Sertifikat, Absensi, Bahaya | ✅ |
| `/a/kelas`, `/a/kelas/baru`, `/a/kelas/[id]` | ✅ |
| `/a/absensi` — Rekap member | ✅ |
| `/a/absensi/manual` | ✅ |
| `/a/absensi/coach` — Rekap clock-in + toggle suspicious | ✅ |
| `/a/semester` | ✅ |
| `/a/admin` — Kelola admin cabang | ✅ |
| `/a/approval` — Hub approval profil member/coach | ✅ |
| `/a/rapot` — List semua rapot (+ tombol notif WA) | ✅ |
| `/a/rapot/[id]` — Detail rapot | ✅ |
| `/a/rapot/notifikasi` — List rapot published + kirim WA ke ortu | ✅ Baru |
| `/a/reminder` — Hub kirim WA reminder ke member | ✅ |
| `/a/log` — Activity log | ✅ |
| `/a/finansial` — Dashboard tagihan + list invoice | ✅ |
| `/a/finansial/generate` — Generate tagihan bulanan | ✅ |
| `/a/finansial/[invoice_id]` — Detail invoice + input pembayaran | ✅ |
| `/a/cabang`, `/a/cabang/[id]` (owner only) | ✅ |

### Coach Panel `/c/*`
| Route | Status |
|-------|--------|
| `/c/dashboard` | ✅ |
| `/c/clock-in` — Selfie + GPS | ✅ |
| `/c/absensi`, `/c/absensi/[kelas_id]` — Scan QR + checklist | ✅ |
| `/c/kelas`, `/c/kelas/[id]` | ✅ |
| `/c/member`, `/c/member/[id]` — List + detail member binaan | ✅ |
| `/c/rapot`, `/c/rapot/[member_id]` — Input rapot | ✅ |
| `/c/profil` — View + **Edit form** + change_request | ✅ |
| `/c/qr` — QR code coach fullscreen | ✅ |
| `/c/pengaturan` — Ubah password | ✅ |

### Member Panel `/m/*`
| Route | Status |
|-------|--------|
| `/m/dashboard` — + **banner tagihan overdue** | ✅ Banner baru |
| `/m/qr` | ✅ |
| `/m/jadwal` | ✅ |
| `/m/absensi` | ✅ |
| `/m/rapot`, `/m/rapot/[id]` | ✅ |
| `/m/coach` | ✅ |
| `/m/profil` — View + Edit + approval flow | ✅ |
| `/m/pembayaran` — List tagihan member | ✅ Baru |
| `/m/pengaturan` — Ubah password | ✅ |

### Owner Panel `/o/*`
| Route | Status |
|-------|--------|
| `/o/dashboard` — Helicopter view multi-cabang | ✅ |
| `/o/cabang`, `/o/cabang/baru`, `/o/cabang/[id]` | ✅ |
| `/o/log` — Activity log semua cabang | ✅ |

---

## 🔴 Belum Ada — Butuh Migrasi Baru

| # | Fitur | Tabel Baru | Blueprint Ref | Prioritas |
|---|-------|-----------|---------------|-----------|
| **N1** | `/m/notifikasi` + `/c/notifikasi` — Inbox notifikasi in-app | `notifications`, `user_notification_preferences` | §11 | 🟡 Phase 2 |
| **N2** | Review/rating coach setelah rapot publish (member → coach) | `report_card_reviews` | §7.8, catatan §57 | 🟡 Phase 2 |
| **N3** | `/berita` + `/berita/[slug]` — Berita publik + CMS admin | `news_articles` | §6.A | 🟡 Phase 2 |
| **N4** | `/a/event`, `/a/event/[id]`, `/m/lomba`, `/c/lomba` — Event & lomba | `events`, `event_participants` | §6.D, catatan §62 | 🟡 Phase 2 |
| **N5** | `/a/calendar` — Master calendar (kelas + event) | Depends N4 | §6.D | 🟢 Phase 3 |
| **N6** | `/o/finansial` — Konsolidasi finansial multi-cabang | Depends migration 015 | §6.F | 🟢 Phase 3 |
| **N7** | School Panel `/s/*` — View rapot murid afiliasi | `schools` (table mungkin sudah ada) | §6.G | 🟢 Phase 3 |

---

## 🟡 Belum Ada — Tidak Butuh Migrasi Baru

| # | Fitur | Catatan | Prioritas |
|---|-------|---------|-----------|
| **X1** | `/a/member/import` — Bulk import CSV/Excel afiliasi | Data sudah ada di schema, perlu UI + parser | 🟡 Phase 2 |
| **X2** | `/a/coach/izin` — Manage izin coach + assign pengganti | Catatan meeting §68-69 | 🟡 Phase 2 |
| **X3** | `/a/rapot/timeline` — Setting deadline input rapot per semester | Extend tabel `semesters` (kolom `report_input_start/end` sudah ada) | 🟡 Phase 2 |
| **X4** | `/a/export` — Export CSV/Excel di halaman list | Catatan meeting (ekstra), data sudah ada | 🟢 Phase 3 |
| **X5** | OG meta di `/tentang`, `/kontak` (sudah ada di `/`, `/program`) | Minimal tambah `export const metadata` | 🟢 Phase 3 |
| **X6** | PDF rapot auto-generated | `@react-pdf/renderer` via API route, perlu design template | 🟢 Phase 3 |
| **X7** | PWA — manifest, service worker, install prompt | Phase 4, setelah semua fitur stabil | 🟢 Phase 4 |

---

## 🔵 Perlu Dicek / Potensi Bug

| Issue | Detail | Urgensi |
|-------|---------|---------|
| `/a/cabang` sidebar | Saat ini muncul di nav semua admin — seharusnya hanya owner/manager | 🔴 Cek akses guard |
| Tab absensi `/a/member/[id]` | Baru ditambahkan, limit 50 record — perlu pagination jika member sudah lama | 🟡 Monitor |
| `m/pembayaran` RLS | Member lihat invoice sendiri — pastikan RLS policy `monthly_invoices` sudah cover `member.user_id` → `member.id` join | 🔴 Cek RLS |
| Banner tagihan di `/m/dashboard` | Query `monthly_invoices` by `member.id` — jika member `payment_handling = covered_by_school` akan return empty (benar), tapi tidak perlu query sama sekali | 🟡 Optimasi |
| `c/profil` change_request | Form edit ada, tapi perlu verifikasi flow approval muncul di `/a/approval` dengan benar | 🟡 Verifikasi |

---

## Ringkasan Status

| Kategori | Total | Selesai | Sisa |
|----------|-------|---------|------|
| Public site | 8 | 8 | 0 ✅ |
| Admin panel | 25 | 25 | 0 ✅ |
| Coach panel | 9 | 9 | 0 ✅ |
| Member panel | 9 | 9 | 0 ✅ |
| Owner panel | 4 | 4 | 0 ✅ |
| **Fitur Phase 2/3 (butuh migrasi)** | 7 | 0 | **7** |
| **Fitur Phase 2/3 (tanpa migrasi)** | 7 | 0 | **7** |
| **TOTAL** | **69** | **55** | **14** |

---

## Urutan Pengerjaan Selanjutnya

### Phase 2A — Fitur Operasional Penting (Tanpa Migrasi)
1. **X2** — `/a/coach/izin` — manage izin + pengganti (catatan meeting prioritas)
2. **X3** — `/a/rapot/timeline` — deadline input rapot per semester
3. **X1** — `/a/member/import` — bulk import CSV afiliasi
4. **X4** — Export CSV/Excel

### Phase 2B — Fitur Engagement (Butuh Migrasi)
1. **N1** — Notifikasi in-app (migration: `notifications`)
2. **N2** — Review coach post-rapot (migration: `report_card_reviews`)
3. **N3** — CMS Berita (migration: `news_articles`)
4. **N4** — Event & Lomba (migration: `events`, `event_participants`)

### Phase 3 — Multi-Branch & School
1. **N5** — Calendar
2. **N6** — Owner finansial
3. **N7** — School Panel

### Phase 4 — PWA
- **X7** — PWA (manifest, service worker, push notification)
- **X6** — PDF rapot
