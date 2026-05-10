# UI_PUBLIC.md

> **Per-page UI design instructions for public site + auth pages.**
> Inherits foundation from `UI_DESIGN_SYSTEM.md`. Read that first.
>
> Pages covered: Landing, Program List, Program Detail, Tentang, Kontak, Daftar Member, Login
>
> **v2 change:** Landing page is now a creative brief (content-first, layout is free).
> Other functional pages (form, login, program list/detail) remain layout-specified.

---

## Global Public Layout

### Public Header (Sticky, all public pages)

Height: 72px desktop / 64px mobile.

- Logo left: 40px height desktop, 32px mobile
- Nav center/left: Beranda · Program · Berita · Tentang · Kontak
- CTA right: "Daftar Sekarang" (primary button, size md)
- Mobile: hamburger → full-width slide-in drawer from right
- Behavior: transparent at page top (when over hero), solid white + shadow-sm after scrolling 80px

Active nav link: underline 2px `--water-500`, offset -4px from text, color `--primary-800`.

### Public Footer

- Background: `--primary-900`
- 4-column desktop, stacked mobile: Logo+tagline / Quick Links / Kontak / Social media
- Tagline: "Sekolah renang modern untuk semua level."
- Copyright strip: `--primary-950`, text-body-sm
- Social icon hover: white → `--water-400`

---

## 1. Landing Page (`/`)

**SEO goal:** Rank #1 for "sekolah renang [kota]".
**Conversion goal:** Visitor clicks "Daftar Sekarang" or "Lihat Program".

---

### Creative Brief

> **To the AI implementing this page:**
>
> The sections and content below are **fixed requirements** — every section must exist and every piece of information listed must be present. What is intentionally left open is the *visual design, layout arrangement, spacing, creative components, and interaction style*.
>
> **Do not produce a predictable layout.** Avoid:
> - Hero image + centered overlay text (too generic)
> - 3-icon feature grid with equal-height cards
> - Cookie-cutter SaaS landing page structure
> - "Powered By" logo strip (irrelevant here)
>
> **Think about:**
> - How can water, movement, and sport inspire the visual metaphor?
> - What layout choices would make a parent stop scrolling?
> - How can the sport-tech aesthetic (bold numbers, energy, momentum) be expressed in layout — not just color?
> - What would make this page feel premium and unique vs every other school's website?
>
> Use the design system tokens (`--primary-900`, `--neutral-50`, Inter bold, etc.) but apply them with imagination.
> Reference energy: Strava, Nike Run Club. Reference craft: Forshift, Stripe. Not a template — a statement.
>
> **After building,** verify: all 10 sections below are present, all content items are visible, SEO metadata is set.

---

### Required Sections & Content

Each section heading below = a mandatory page section. Content items inside = must be present. Visual treatment = AI's creative decision.

---

#### Section 1 — Hero / First Impression

Communicates: "This is the swimming school I want to join."

Required content:
- **Headline:** "Berenang Lebih Baik, Dimulai dari Sini." (or a confident variation)
- **Subheadline:** One sentence about structured curriculum + certified coaches + all levels
- **Primary CTA:** "Daftar Sekarang" → `/daftar/member`
- **Secondary CTA:** "Lihat Program" → `/program`
- **At least one trust signal visible** without scrolling (a stat, a badge, a review star — AI decides format)
- **Real swimming photography** — swimmer in motion, overhead pool, coach teaching moment

SEO requirement: this section contains the `<h1>` tag.

---

#### Section 2 — Trust Numbers

Communicates: "They're established and real."

Required stats (use these numbers — they are placeholder, but design around them):
- **500+** Member Aktif
- **20+** Coach Bersertifikasi
- **3** Cabang
- **10+** Tahun Pengalaman

Each stat needs a number + label. How they're arranged is open.

---

#### Section 3 — Why Next Swimming School

Communicates: "Here's what makes us different from every other pool."

Required points (include all 6 or pick the most impactful 4):
1. **Coach Bersertifikasi** — Semua pelatih bersertifikasi resmi nasional
2. **Kurikulum Terstruktur** — Program dari level pemula hingga atlet kompetitif
3. **Kelas Kecil, Perhatian Maksimal** — Rasio coach:murid ideal untuk perkembangan optimal
4. **Fasilitas Modern** — Kolam berstandar dan terawat
5. **Tracking Progress Digital** — Orang tua dan murid bisa pantau perkembangan lewat aplikasi
6. **Untuk Semua Usia** — Program tersedia dari anak usia 4 tahun hingga dewasa

Section heading: "Lebih dari Sekadar Belajar Berenang" (or variation).

---

#### Section 4 — Program Preview

Communicates: "There's a class for me, and I can see what it costs."

Required: 3 program cards minimum, each containing:
- Program name (e.g. Kelas Beginner, Kelas Intermediate, Kelas Atlet)
- Age range label (e.g. "Usia 4–7")
- Sessions per month (e.g. "6 sesi/bulan")
- Price (e.g. "Rp 2.000.000/bulan")
- One-line description
- "Lihat Detail" or "Daftar Kelas" link

Required: "Lihat Semua Program →" link below the cards, routes to `/program`.

---

#### Section 5 — How To Join

Communicates: "Mendaftar itu mudah, 3 langkah saja."

Required: exactly 3 steps in this order:
1. **Isi Formulir** — Daftar online, isi data diri, dan pilih kelas yang sesuai
2. **Konfirmasi Pembayaran** — Kirim bukti transfer via WhatsApp ke admin kami
3. **Mulai Berenang** — Akun aktif, datang ke kolam, tunjukkan QR code ke coach

Section heading: "Mulai Berenang dalam 3 Langkah" (or variation).

---

#### Section 6 — Coach Highlights *(optional for Phase 1)*

Communicates: "Pelatih kami nyata, berpengalaman, dan bisa dipercaya."

If included: 3–4 coach profiles with photo, name, specialization, brief bio (2 lines max).
If deferred: skip — mark with TODO comment in code.

---

#### Section 7 — Testimonials

Communicates: "Orang lain sudah puas, saya bisa percaya ini."

Required: 2 testimonial quotes minimum.

Sample content:
- "Anak saya yang sebelumnya takut air, sekarang sudah bisa berenang 50m sendiri. Pelatihnya sabar dan sistemnya rapi." — *Ibu Dewi, orang tua murid Beginner*
- "Progressnya bisa dipantau dari HP. Nilai rapot setiap semester juga jelas dan terstruktur." — *Reza, member Intermediate*

Render as carousel, grid, or highlighted quote block — AI decides.

---

#### Section 8 — Lokasi Cabang

Communicates: "Mereka ada di dekat saya."

Required:
- Branch name: Next Swimming School Pusat
- Address: [placeholder address]
- Contact/phone number
- Map embed (Google Maps) or visual location indicator
- "Lihat di Google Maps →" link

For Phase 1 with 1 branch: single-location layout is fine.

---

#### Section 9 — FAQ

Communicates: "Semua pertanyaan saya sudah terjawab."

Required: all 8 questions below in accordion format (expand/collapse):

1. Berapa biaya pendaftaran dan kelas per bulan?
2. Anak saya belum bisa berenang sama sekali, apakah bisa langsung daftar?
3. Apa yang perlu dibawa untuk kelas pertama?
4. Bagaimana sistem pembayaran bulanannya?
5. Bisakah pindah jadwal jika saya berhalangan hadir?
6. Apakah tersedia coach perempuan?
7. Berapa lama waktu yang dibutuhkan sampai bisa berenang dengan baik?
8. Bagaimana cara memantau perkembangan anak saya?

SEO requirement: render FAQ section with `FAQPage` Schema.org JSON-LD.

---

#### Section 10 — Final CTA

Communicates: "Satu dorongan terakhir untuk mendaftar sekarang."

Required content:
- Headline: "Siap Memulai Perjalanan Berenangmu?" (or variation)
- Body: "Bergabung dengan ratusan member yang sudah merasakan manfaatnya."
- Primary CTA: "Daftar Sekarang" → `/daftar/member`
- Secondary CTA: "Hubungi Kami" → `/kontak` or WA

---

### Technical Requirements (Non-Negotiable)

```typescript
// app/(public)/page.tsx
export const metadata: Metadata = {
  title: "Next Swimming School — Sekolah Renang Modern & Terstruktur",
  description: "Belajar berenang bersama coach bersertifikasi dengan kurikulum terstruktur. Tersedia untuk anak dan dewasa. Daftar sekarang.",
  openGraph: {
    title: "Next Swimming School",
    description: "...",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
  },
};
```

- Rendered as **SSG** (static generation)
- `LocalBusiness` Schema.org JSON-LD in `<head>`
- `FAQPage` Schema.org JSON-LD in FAQ section
- Included in `app/sitemap.ts`
- All images via `next/image`, above-fold with `priority`
- Lighthouse mobile Performance > 80

---

## 2. Program List (`/program`)

### Page Header

Compact hero, 280–320px height.
Background: `--primary-900` or brand gradient.
- Title: "Program Kami" (display-md white)
- Subtitle: "Pilih program yang sesuai dengan level dan tujuanmu" (body-lg, neutral-200)

### Filter Bar (sticky below header on scroll)

```
[All] [Anak-anak] [Remaja] [Dewasa] [Atlet]          [Harga ▾]
```

- Pill active: `--primary-600` bg, white text
- Pill default: `--neutral-100` bg, `--neutral-700` text
- Bar bg: white, border-bottom `--neutral-200`, padding 16px vertical
- Sort dropdown right: shadcn Select

### Program Grid

3 columns desktop → 2 columns tablet → 1 column mobile.

Each card:
- Image (16:9) with age-range badge (top-left, `--primary-900` bg, white text)
- Program name (heading-md)
- One-line tagline (body-sm, neutral-500, 2-line clamp)
- Schedule chips (small pills, e.g. "Sen" "Rab" "Jum")
- Price (heading-md, weight 700, `--primary-600`)
- "Daftar Kelas Ini →" (outline button)
- Hover: shadow-lg, translateY(-4px), image scale 1.04

### Empty State

```
[SearchX icon, 64px]
Tidak ada program di kategori ini.
Coba filter lain atau lihat semua program.
[Lihat Semua] (primary)
```

---

## 3. Program Detail (`/program/[slug]`)

### Hero

Full-bleed photo (16:9 or 21:9). Overlay: `rgba(11,31,58,0.72)`.

Bottom-left on overlay:
- Age badge (pill): "USIA 4–7 TAHUN"
- Title: display-lg, white
- Tagline: body-lg, neutral-200

### 2-Column Layout (Desktop)

**Main column (60%):**

**Tentang Kelas Ini** (heading-lg + 2–3 paragraphs)

**Apa yang Akan Dipelajari** (heading-lg + checkmark list):
- Checkmark icon: CheckCircle2, 18px, `--success-500`
- Items: body-md, `--neutral-700`

**Jadwal Kelas** (heading-lg + table rows: day + time)

**Pelatih** (heading-lg + 1–2 coach mini-cards: avatar 48px + name + specialization)

**Sticky Sidebar (40%):**

```
Rp 2.000.000
/bulan

✓ 6 sesi per bulan
✓ Coach bersertifikasi
✓ Kelas maks 15 murid
✓ Progress tracking digital

[Daftar Kelas Ini]   (primary, xl, full-width)
[Tanya via WhatsApp] (outline, xl, full-width, WA icon)
```

- Card: white, radius-xl, padding 32px, shadow-md, sticky
- Price: text-display-sm weight 800, `--primary-600`
- Check icons: `--success-500`

**Mobile:** Sidebar = sticky bottom bar (just price + Daftar button). Tap to expand full details.

---

## 4. Tentang (`/tentang`)

Phase 1 = static content, no CMS dependency.

Sections:
1. Compact hero 280px: "Tentang Next Swimming School"
2. Story (alternating image + text, 50/50 desktop, stacked mobile)
3. Values — 3 cards: Keunggulan / Disiplin / Kesenangan
4. CTA banner

Max-width 1024px, section padding 80px vertical desktop.

---

## 5. Kontak (`/kontak`)

### Layout (2-column desktop, stacked mobile)

**Left — Info:**

Each row: Lucide icon (24px, `--primary-600`) + label + value.

- `MapPin` — Alamat [full address]
- `Phone` — [nomor] + "Hubungi via WhatsApp" (outline primary, WA icon)
- `Mail` — info@nextswimmingschool.com
- `Clock` — Senin–Sabtu, 06:00–21:00

No contact form (WA is primary channel per product decision).

**Right — Map:**

Google Maps embed or Leaflet. 16:9 ratio, radius-lg.

---

## 6. Daftar Member (`/daftar/member`)

Functional form — clean, unambiguous, no creative deviation.

### Page Shell

- Minimal header: back arrow left, logo centered, empty right
- Background: `--neutral-50`
- Form card: centered, max-width 640px, white, radius-xl, padding 40px desktop / 24px mobile, shadow-sm

### Step Progress Indicator

```
●━━━━━━━━━━━━━○━━━━━━━━━━━━━○
Data Diri       Kontak          Pilih Kelas
```

- Completed: `--primary-600` circle + checkmark
- Active: `--primary-600` circle + white dot
- Pending: `--neutral-300` circle
- Connector: 2px, `--primary-600` if passed, `--neutral-200` if pending
- Labels: text-label-sm below

### Step 1: Data Diri

- **Foto Profil** (upload, circle 120px, optional)
  - Empty: dashed border `--neutral-300`, camera icon, "Tap untuk upload"
  - Uploading: shimmer
  - Done: preview + edit overlay icon
  - Compress to <200KB before upload
- **Nama Lengkap** * (text)
- **Nama Panggilan** (text)
- **Tanggal Lahir** * (date picker)
- **Jenis Kelamin** * (radio: Laki-laki / Perempuan)
- **Riwayat Penyakit** (textarea, optional, helper: "Informasi ini dijaga kerahasiaannya 🔒")

Action: "Lanjut →" (primary, full-width)

### Step 2: Data Kontak

- **Email** * — async uniqueness check on blur
- **Password** * — show/hide toggle, min 8 chars, strength indicator
- **Konfirmasi Password** *
- **Nomor HP Utama** *
- **Pemilik Nomor** * (radio: "Nomor sendiri" / "Nomor orang tua/wali")
- IF "orang tua" selected → show: Nama Orang Tua *, Nomor Tambahan
- **Alamat** (textarea, optional)

Actions: "← Kembali" (ghost) + "Lanjut →" (primary)

### Step 3: Pilih Cabang & Kelas

**Cabang:** dropdown (auto-selected Phase 1 single branch)

**Kelas — selectable cards:**

```
┌──────────────────────────────────────────────────┐
│ [☑] Kelas Beginner Level                         │  selected: 2px border primary-600, bg primary-50
│     Usia 4–7 th • Sen, Rab, Jum 16:00–17:00     │
│     6 sesi/bulan           Rp 2.000.000/bulan    │
└──────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────┐
│ [☐] Kelas Intermediate                           │  default: 1px border neutral-200, bg white
│     Usia 8–13 th • Sel, Kam 17:00–18:00          │
│     4 sesi/bulan           Rp 2.500.000/bulan    │
└──────────────────────────────────────────────────┘
```

**Live total** (updates as selection changes):
```
Total Bulanan: Rp 2.000.000
```

**Terms:** checkbox "Saya menyetujui Syarat & Ketentuan" (required to enable submit)

Actions: "← Kembali" (ghost) + "Daftar Sekarang →" (primary, disabled until terms checked)

### Confirmation Page (`/daftar/member/sukses`)

```
[CheckCircle2 icon: 96px, success-500, on success-50 circle 144px bg]

Pendaftaran Berhasil! 🎉

(body-lg, center, neutral-700)
Kami sudah menerima pendaftaran kamu.
Langkah berikutnya: kirim bukti pembayaran ke admin via WhatsApp.

┌────────────────────────────────────────┐
│ Detail Pendaftaran                     │
│ ─────────────────────────────────────  │
│ Nama          Andi Pratama             │
│ Email         andi@email.com           │
│ Kelas         Beginner, Intermediate   │
│ Total         Rp 4.500.000/bulan       │
│                                        │
│ Transfer ke:                           │
│ BCA 1234567890                         │
│ a.n. Next Swimming School              │
└────────────────────────────────────────┘

[Kirim Bukti Pembayaran via WhatsApp →]  (primary xl, full-width)

[Cek Status Pendaftaran]  (ghost, smaller)

(body-sm, neutral-500, italic, center)
Setelah admin konfirmasi, kamu akan dapat email dan bisa langsung login.
```

- WA deep link: `wa.me/{admin_phone}?text={url_encoded_auto_message}`
- Auto-message includes: nama, email, kelas, total

---

## 7. Login (`/login`)

### Layout

100vh, 2-column desktop split.

**Left (50%, desktop only):**
- Action swimming photo, full-height, object-cover
- Overlay: `rgba(11,31,58,0.72)`
- Bottom-left tagline (white, padding 64px):
  - "Berenang Lebih Baik," — display-md weight 800
  - "Dimulai dari Sini." — display-md weight 400 (lighter contrast)

**Right (50% desktop / 100% mobile):**

Vertically + horizontally centered content, max-width 420px.

```
[Logo, 48px height]

Selamat Datang Kembali
(heading-xl, primary-800)

Email *
[______________________________]

Password *
[__________________________ 👁]
                    Lupa password? →

[Masuk]  (primary, xl, full-width)

───────── atau ─────────

Belum punya akun? [Daftar Sekarang]
```

**Mobile:** Left photo hidden. Logo center-top. Form full-width with 32px horizontal padding.

### Form States

| State | What happens |
|---|---|
| Default | Empty fields, button enabled |
| Submitting | Button: spinner + "Memproses...", disabled |
| Error | Toast "Email atau password salah". Fields brief red border (3s). |
| Success | Check animation → redirect to role-based dashboard |

### Lupa Password Modal

Opens on link click:
```
┌──────────────────────────────────────────┐
│ Lupa Password?                       [×] │
├──────────────────────────────────────────┤
│ Hubungi admin untuk reset password kamu. │
│ Admin akan memberikan password baru via  │
│ WhatsApp.                                │
│                                          │
│ [Hubungi Admin via WhatsApp]             │
│                                          │
│ Phase 2: akan tersedia reset via email   │
└──────────────────────────────────────────┘
```

---

## Common Patterns

### Loading

- No full-page spinner
- Hero: layout skeleton with shimmer
- Cards: skeleton matching final card dimensions
- Form: button spinner for async actions

### Error Pages

**404:**
- Swimming-related illustration or big "404"
- "Halaman tidak ditemukan"
- "Sepertinya kamu tersesat. Yuk balik ke beranda."
- [Kembali ke Beranda] (primary)

**500:**
- "Ada gangguan di sisi kami"
- "Tim kami sudah dapat notifikasi. Coba lagi dalam beberapa menit."
- [Refresh] [Kembali ke Beranda]

### Mobile Rules

- Minimum width: 360px
- Touch targets: min 44×44px
- Input font-size: 16px (prevent iOS zoom)
- Display text scales down on mobile (display-xl → display-md)
- 3-col grids → 1 col mobile
- Sticky sidebars → sticky bottom bar mobile
- Nav hamburger < 1024px

### SEO Checklist

Per page:
- [ ] Unique `<title>`
- [ ] Unique `<meta description>` 150–160 chars
- [ ] OG image configured
- [ ] Canonical URL
- [ ] Logical h1 → h2 → h3 hierarchy
- [ ] All images with alt text
- [ ] Schema.org JSON-LD (type per page)
- [ ] Listed in `sitemap.ts`

---

**Document version:** 2.0
**Change from v1:** Landing page now creative brief (not layout-spec). All functional pages unchanged.
**Next:** `UI_MEMBER.md`, `UI_COACH.md`, `UI_ADMIN.md` for in-app panels.
