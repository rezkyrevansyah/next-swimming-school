# Elaborasi Desain: Landing Page, Login & Register

Dokumen ini menganalisis referensi desain dari `Creative Document Design/` dan mengelaborasinya
dengan kondisi codebase aktual, struktur database, dan kebutuhan proyek.

Terakhir diperbarui: 2026-05-13

---

## 1. Design System Referensi

Referensi menggunakan design system yang konsisten dan sudah matang. Inilah token yang harus diadopsi:

### Color Palette
| Token | Hex | Penggunaan |
|---|---|---|
| `primary-900` | `#0A2547` | Background hero, footer, CTA section |
| `primary-700` | `#174A93` | Gradient mid |
| `primary-600` | `#1E5DB8` | Warna primer utama (button, link, active state) |
| `primary-50` | `#EEF5FF` | Background card aktif, icon bg |
| `accent-400` | `#22D3EE` | Highlight, CTA utama, nomor statistik |
| `accent-500` | `#06B6D4` | Label section uppercase |
| `neutral-900` | `#0F172A` | Teks heading utama |
| `neutral-800` | `#1E293B` | Teks body |
| `neutral-600` | `#475569` | Teks sekunder, deskripsi |
| `neutral-50` | `#F8FAFC` | Background section alternating |
| `neutral-200` | `#E2E8F0` | Border, divider |

### Typography
- **Heading font:** `Plus Jakarta Sans` — weight 700/800/900
- **Body font:** `Inter` — weight 400/500/600
- Letter spacing heading: `-0.03em` sampai `-0.04em` (ketat, modern)
- Section label uppercase: `font-size: 11px`, `font-weight: 800`, `letter-spacing: 0.12em`

### Border Radius & Spacing
- Card kecil: `border-radius: 24px`
- Button: `border-radius: 12–14px`
- Icon container: `border-radius: 14px`
- Padding section: `96px 24px` (desktop), lebih kecil di mobile
- Box shadow card: `0 4px 12px rgba(15,23,42,0.06)`

---

## 2. Landing Page

### 2.1 Sections Referensi vs Yang Ada Sekarang

| Section | Di Referensi | Di Codebase Saat Ini | Aksi |
|---|---|---|---|
| Hero | ✅ Full (foto + overlay + headline + stats + CTA) | ✅ Ada, tapi minimal | Upgrade desain |
| Trust Bar | ✅ 4 stats besar di bawah hero | ❌ Tidak ada | Tambah |
| Why Next | ✅ Grid 6 cards dengan icon | ❌ Tidak ada | Tambah |
| Programs Preview | ✅ 3 kartu dengan foto, harga, jadwal | ✅ Ada (3 program text-based) | Upgrade ke card + foto |
| How It Works | ✅ 3 langkah dengan angka besar | ❌ Tidak ada | Tambah |
| Coach Highlights | ✅ Grid foto coach dengan nama & spesialisasi | ❌ Tidak ada | Tambah (data dari DB) |
| FAQ | ✅ Accordion 8 pertanyaan | ✅ Ada (FAQ Section) | Upgrade ke style referensi |
| Final CTA | ✅ Dark navy card dengan dua tombol | ✅ Ada tapi sederhana | Upgrade |
| Header | ✅ Sticky + scroll-aware + mobile drawer | ✅ Ada | Upgrade desain |
| Footer | ✅ 4-kolom: brand, menu, program, kontak | ✅ Ada | Upgrade desain |

### 2.2 Elaborasi Setiap Section

---

#### Section 1: Hero

**Referensi:**
- Background foto kolam renang full-screen dengan overlay gradient navy ke biru
- Accent glow radial `rgba(34,211,238,0.08)` di pojok kanan atas
- Label pill "Swimming Excellence" dengan border cyan tipis
- Headline bold: *"Berenang Lebih Baik, Dimulai dari Sini."* — kata kedua warna `#22D3EE`
- Body text 18px
- 2 CTA button: "Daftar Sekarang" (filled cyan) + "Lihat Program" (outline glass)
- Stats row di bawah divider: 500+ Member, 20+ Coach, 3 Cabang, 4.9 ★

**Adaptasi ke project:**
- Stats diambil dari DB secara dinamis (live count dari tabel `members`, `coaches`, `branches`)
- Link "Daftar Sekarang" → `/daftar/member`
- Link "Lihat Program" → `/program`
- Rating (4.9★) bisa hardcode dulu atau ambil dari `report_card_reviews` average

**Kondisi saat ini:** Hero ada tapi desain jauh lebih sederhana (tidak ada foto, tidak ada gradient overlay, stats hardcode). Perlu full rebuild section ini.

---

#### Section 2: Trust Bar

**Referensi:**
- Background putih, border bottom `#E2E8F0`
- 4 stat: `500+` Member Aktif, `20+` Coach Bersertifikat, `3` Cabang, `10+` Tahun Pengalaman
- Angka besar `font-size: 48px`, warna `#1E5DB8`
- Label uppercase kecil `#64748B`
- Animasi fade-in saat masuk viewport (IntersectionObserver)

**Adaptasi ke project:**
- Angka bisa dinamis: `count(members)`, `count(coaches)`, `count(branches)`, dan `10+` hardcode
- Karena ini public page (no auth), query pakai `supabase` tanpa RLS restriction khusus, atau bisa pakai server component + `"use cache"`

**Kondisi saat ini:** Tidak ada. Tambah setelah Hero.

---

#### Section 3: Why Next (Kenapa Memilih Kami)

**Referensi:**
- Background `#F8FAFC`
- Label section: "Kenapa Next?"
- Heading: "Lebih dari Sekadar Belajar Berenang"
- Grid 6 card dengan icon lucide, 1 card per keunggulan:
  1. Coach Bersertifikasi
  2. Kurikulum Terstruktur
  3. Kelas Kecil & Personal (maks. 8 murid)
  4. Fasilitas Modern
  5. Tracking Progress (dashboard member)
  6. Komunitas Suportif
- Card style: `border-radius: 24px`, icon di kotak `#EEF5FF` dengan icon biru

**Adaptasi ke project:**
- Konten bisa hardcode (marketing copy, tidak perlu DB)
- Poin "Tracking Progress" jadi selling point unik karena sistem digital sudah ada
- Poin "Kelas Kecil" bisa otomatis ambil dari `classes.capacity` (min capacity) untuk validasi
- Bisa dikelola via CMS (`landing_sections`) di Phase 3 — untuk sekarang hardcode

---

#### Section 4: Programs Preview

**Referensi:**
- Background putih
- Header row: judul kiri + link "Lihat Semua →" kanan
- Grid 3 kartu dengan:
  - Foto (aspect ratio 16:9) + overlay gradient bawah + badge usia di kiri atas
  - Nama program, deskripsi singkat
  - Divider tipis
  - Jadwal (teks kecil abu) + Harga/bln (biru bold) + button "Detail →"
- Hover effect pada gambar (transform scale)

**Adaptasi ke project:**
- Data dari tabel `classes` + `class_schedules`:
  ```
  classes: name, age_range_min, age_range_max, monthly_price, status
  class_schedules: day_of_week, start_time, end_time
  ```
- Filter: `status = 'active'` dan `branch_id = default branch`
- Foto kelas: saat ini belum ada field foto di `classes` — perlu tambah kolom `cover_url` ke tabel `classes`, atau pakai foto hardcode per kategori
- Jadwal: format dari `class_schedules` → "Sen, Rab, Jum · 15:00–16:00"
- Harga: `monthly_price` dari `classes`
- Link detail: `/program/[slug]` (perlu kolom `slug` di `classes`)

**Gap DB yang perlu ditangani:**
- Tambah `cover_url text` ke tabel `classes`
- Tambah `slug text unique` ke tabel `classes`

---

#### Section 5: How It Works (3 Langkah)

**Referensi:**
- Background `#F8FAFC`
- Label: "Gampang Saja"
- Heading: "Mulai Berenang dalam 3 Langkah"
- 3 kolom dengan nomor besar cyan (`#22D3EE`) di atas — 01, 02, 03
- Arrow connector antara langkah (desktop only)
- CTA button di bawah

**Adaptasi ke project:**
- Langkah 1: "Daftar Online" → isi form di `/daftar/member`
- Langkah 2: "Konfirmasi Pembayaran" → kirim bukti transfer via WA
- Langkah 3: "Mulai Berenang" → datang ke kolam, tunjukkan QR code
- Flow ini sudah sesuai dengan `members.status: pending_payment → active`
- Konten hardcode, tidak perlu DB

---

#### Section 6: Coach Highlights

**Referensi:**
- Background putih
- Grid 3 kartu foto coach: aspect ratio 4:3, foto, nama, role/spesialisasi
- Border radius 24px, shadow subtle

**Adaptasi ke project:**
- Data dari tabel `coaches` + `coach_profiles` + `coach_branches`:
  ```sql
  SELECT cp.full_name, cp.photo_url, cp.specializations, cb.branch_id
  FROM coaches c
  JOIN coach_profiles cp ON cp.coach_id = c.id
  JOIN coach_branches cb ON cb.coach_id = c.id
  WHERE c.status = 'active'
  LIMIT 3  -- atau 4-6 sesuai kebutuhan
  ```
- Foto dari `coach_profiles.photo_url` (Supabase Storage: `avatars/`)
- Spesialisasi dari `coach_profiles.specializations[]`
- Tambah field opsional: `is_featured boolean` ke `coach_profiles` untuk memilih coach yang ditampilkan di landing page

**Gap DB:**
- Tambah `is_featured boolean default false` ke `coach_profiles`

---

#### Section 7: FAQ

**Referensi:**
- Background `#F8FAFC`
- Accordion dengan border radius 24px, shadow
- Toggle dengan icon Plus/X
- Pertanyaan yang relevan sudah ada di referensi (8 item)

**Adaptasi ke project:**
- Konten hardcode untuk sekarang
- Di Phase 3 bisa masuk ke CMS (`landing_sections` tabel) agar admin bisa edit via `/a/cms/landing`
- Pertanyaan yang relevan dengan sistem:
  - "Bagaimana sistem absensinya?" → QR code scan
  - "Bagaimana cara melihat perkembangan anak?" → dashboard member online
  - "Kapan rapot dibagikan?" → setiap semester

---

#### Section 8: Final CTA

**Referensi:**
- Background gradient navy `#0A2547` → `#174A93` dalam card rounded `32px`
- Accent orb radial di pojok kanan dan kiri
- Label "Bergabung Sekarang"
- 2 tombol: "Daftar Sekarang" (filled cyan) + "Hubungi Kami" (outline putih)

**Adaptasi ke project:**
- "Daftar Sekarang" → `/daftar/member`
- "Hubungi Kami" → `/kontak` atau WA deep link
- Tidak perlu DB

---

### 2.3 Header (Navbar)

**Referensi:**
- Sticky, scroll-aware: transparan saat atas → putih + shadow + border saat scroll > 60px
- Logo: icon `Waves` dalam kotak gradient navy-biru + teks "Next Swimming" + "School" cyan
- Nav links dengan active underline cyan pendek di bawah
- CTA: "Masuk" (outlined) + "Daftar Sekarang" (filled biru)
- Mobile: hamburger → slide-in drawer dari kanan (80% width, max 320px)

**Adaptasi ke project:**
- Nav links: Beranda (`/`), Program (`/program`), Tentang (`/tentang`), Kontak (`/kontak`)
- "Masuk" → `/login`
- "Daftar Sekarang" → `/daftar/member`
- Tidak perlu DB

**Kondisi saat ini:** Header ada tapi desain jauh lebih sederhana. Mobile drawer belum ada. Perlu upgrade.

---

### 2.4 Footer

**Referensi:**
- Background `#0A2547` (navy gelap)
- 4 kolom: Brand + tagline + sosmed, Menu, Program, Kontak (alamat, WA, email, jam operasional)
- Bottom bar `#06182F` — copyright + Kebijakan Privasi + Syarat & Ketentuan

**Adaptasi ke project:**
- Alamat, nomor WA, email: data dari tabel `branches` (cabang utama / default)
  ```
  branches: address, contact_phone, contact_email
  ```
- Jam operasional: hardcode atau tambah field `operating_hours` ke `branches`
- Sosmed link: hardcode atau tambah tabel `branch_social_links`
- Program list: ambil dari `classes` atau hardcode nama kategori

---

## 3. Login Page

### 3.1 Struktur Referensi

- **Layout:** Split screen — kiri hero foto (desktop only), kanan form login
- **Kiri:** Foto kolam + overlay navy, logo, tagline, trust pills
- **Kanan:** Logo mobile, heading "Selamat Datang Kembali 👋", form email+password, error banner, "Lupa password?", tombol submit dengan spinner

### 3.2 Fitur Yang Perlu Diperhatikan

**"Lupa Password?" — Alur di Referensi:**
- Buka modal overlay (bukan halaman baru)
- Isi modal: teks penjelasan + tombol "Hubungi Admin via WA"
- WA deep link dengan pesan: "Halo, saya lupa password akun Next Swimming School"
- Note kecil: "Phase 2: self-service reset via email"

**Adaptasi ke project:**
- Codebase sudah punya `/lupa-password` halaman terpisah
- Bisa tetap pakai halaman terpisah OR switch ke modal seperti referensi
- **Rekomendasi:** Ikuti modal referensi — lebih seamless, tidak navigasi keluar dari login
- WA number: ambil dari `branches` (cabang utama) `contact_phone`

**Error state:**
- Banner merah dengan dot indicator — lebih visual dari text error biasa
- Pesan: "Email atau password salah. Silakan coba lagi."

**Submit button loading:**
- Spinner inline + teks "Memproses..."
- `backgroundColor` berubah ke `#5F9BFA` saat loading

### 3.3 Perbedaan Dengan Implementasi Saat Ini

| Aspek | Referensi | Saat Ini |
|---|---|---|
| Layout | Split screen hero kiri + form kanan | Form centered saja |
| Lupa password | Modal dengan WA link | Halaman `/lupa-password` terpisah |
| Error state | Banner merah dengan dot | Belum dicek |
| Trust signals | Pills "⭐ 4.9", "✓ 20+ Coach" di hero kiri | Tidak ada |
| Animasi | Spinner loading | Belum dicek |

---

## 4. Register Page

### 4.1 Struktur Referensi

- Multi-step form: **3 langkah**
  - Step 1: Data Member
  - Step 2: Data Kontak
  - Step 3: Pilih Program
- Progress bar di atas dengan lingkaran numbered + label + connector
- Single card, form berganti konten sesuai step
- Success screen setelah submit

### 4.2 Elaborasi Per Step

#### Step 1 — Data Member
| Field | DB Column | Catatan |
|---|---|---|
| Nama Lengkap* | `member_profiles.full_name` | |
| Nama Panggilan | `member_profiles.nickname` | |
| Tanggal Lahir* | `member_profiles.dob` | Hitung umur otomatis |
| Jenis Kelamin* | `member_profiles.gender` | Radio: Laki-laki / Perempuan |
| Riwayat Penyakit | `member_profiles.health_history` | Textarea, opsional |

#### Step 2 — Data Kontak
| Field | DB Column | Catatan |
|---|---|---|
| Email* | `users.email` (Supabase Auth) | Untuk login |
| Password* | Supabase Auth | Min. 8 karakter |
| Nomor HP* | `member_profiles.phone` | |
| Pemilik Nomor | `member_profiles.phone_owner` | Radio: sendiri / orang tua |
| Nama Orang Tua | `member_profiles.parent_name` | Muncul jika pilih "orang tua" |
| No. HP Orang Tua | `member_profiles.parent_phone` | Opsional |
| Alamat | `member_profiles.address` | Textarea |

#### Step 3 — Pilih Program
| Field | DB Column | Catatan |
|---|---|---|
| Pilih Cabang* | `members.branch_id` | Select dari tabel `branches` |
| Pilih Kelas | `class_members.class_id` | Multi-select dari `classes` |
| Total Bulanan | Kalkulasi | `SUM(monthly_price)` dari kelas terpilih |
| Syarat & Ketentuan | — | Checkbox wajib diceklis |

**Adaptasi ke DB:**
- Data `branches` diambil dari tabel `branches` (nama + slug)
- Data kelas diambil dari `classes` WHERE `branch_id = selected_branch_id` AND `status = 'active'`
  - Tampilkan: `name`, `class_schedules` (jadwal), `monthly_price`
- Setelah pilih cabang → fetch kelas yang tersedia di cabang tersebut (conditional fetch)

### 4.3 Success Screen

**Referensi:**
- Icon checkmark besar `#22D3EE`
- Heading "Pendaftaran Berhasil! 🎉"
- Detail summary: nama, email, kelas terpilih, total, rekening bank
- 2 tombol: "Kirim Bukti via WhatsApp" (filled cyan) + "Kembali ke Beranda" (outlined)
- Note italic: setelah admin verifikasi, email konfirmasi dikirim

**Adaptasi ke project:**
- WA deep link: ambil `contact_phone` dari cabang yang dipilih
- Nomor rekening: hardcode atau tambah field `bank_account_info text` ke tabel `branches`
- Status member setelah submit: `members.status = 'pending_payment'`
- Flow admin: pendaftar muncul di `/a/member/registrasi` untuk di-approve

### 4.4 Perbedaan Dengan Implementasi Saat Ini

| Aspek | Referensi | Saat Ini |
|---|---|---|
| Progress indicator | Visual stepper dengan circle + connector | Belum dicek, kemungkinan ada |
| Pilih cabang | Select dari DB | Sudah ada (hardcode / DB) |
| Pilih kelas | Multi-select card klikable dengan harga | Kemungkinan ada tapi perlu cek style |
| Total kalkulasi | Real-time di step 3 | Perlu dicek |
| Success screen | Full screen dengan rekening + WA link | Sudah ada `/sukses` page |
| Kondisional field | Orang tua / sendiri toggle | Perlu dicek implementasi |

---

## 5. Gap Database yang Perlu Ditambah

Untuk mendukung landing page yang hidup (data-driven):

| Tabel | Kolom Baru | Tipe | Keperluan |
|---|---|---|---|
| `classes` | `cover_url` | `text` | Foto kelas di Programs Preview |
| `classes` | `slug` | `text unique` | URL `/program/[slug]` |
| `classes` | `description` | `text` | Deskripsi singkat untuk preview |
| `coach_profiles` | `is_featured` | `boolean default false` | Pilih coach tampil di landing |
| `branches` | `bank_account_info` | `text` | Nomor rekening di success register |
| `branches` | `operating_hours` | `text` | Jam operasional di footer |

---

## 6. Prioritas Implementasi

### Segera (Landing Page + Auth UX — Phase 1 polish)

1. **Upgrade Header** — sticky scroll-aware + mobile drawer
2. **Upgrade Hero section** — foto + overlay + stats dinamis dari DB
3. **Tambah Trust Bar** — 4 angka besar
4. **Upgrade Programs Preview** — card dengan foto (cover_url dari DB)
5. **Tambah Why Next** — 6 card keunggulan (hardcode)
6. **Tambah How It Works** — 3 langkah (hardcode)
7. **Tambah Coach Highlights** — dari DB, filter `is_featured = true`
8. **Upgrade FAQ** — accordion style referensi
9. **Upgrade Final CTA** — navy card dengan dua tombol
10. **Upgrade Footer** — 4 kolom dengan data kontak dari DB
11. **Upgrade Login** — split screen + modal forgot password (WA link)

### Phase 2
12. **Register** — pastikan multi-step sesuai flow referensi + pilih kelas dari DB per cabang
13. **Coach Highlights** — tambah kolom `is_featured` ke `coach_profiles`

### Phase 3 (CMS)
14. **FAQ & Why Next** — bisa diedit admin via `/a/cms/landing`
15. **Berita terbaru** — section berita dari `news_articles` (jika sudah ada konten)

---

## 7. Catatan Teknis

### Halaman Landing = Server Component + `"use cache"`
Landing page idealnya di-render server-side dengan caching agresif:
```ts
// Di page.tsx landing
import { unstable_cacheLife as cacheLife } from "next/cache";
"use cache";
cacheLife("hours"); // revalidate setiap 1 jam
```
Data stats (member count, coach count) tidak perlu real-time — cukup update per jam.

### Font Google Fonts
Perlu tambah `Plus Jakarta Sans` ke `app/layout.tsx`:
```ts
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
const plusJakarta = Plus_Jakarta_Sans({ subsets: ["latin"], weight: ["600","700","800","900"] });
```

### Foto dari Supabase Storage
Coach foto menggunakan `supabase.storage.from("avatars").getPublicUrl(path)`.
Untuk program/kelas, foto dari bucket yang sama atau `cms-media/`.

### Animation
Referensi pakai `IntersectionObserver` di client. Di Next.js App Router, section-section ini
bisa tetap server component dengan animasi via Tailwind `animate-` class atau
CSS `@keyframes` sederhana — tidak butuh full client component.
