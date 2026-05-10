# UI_ADMIN.md

> **Per-page UI design instructions for Admin Panel (`/a/*`).**
> Inherits foundation from `UI_DESIGN_SYSTEM.md`. Read that first.
>
> Admin panel = **desktop-first** (admins use computer for daily ops). Mobile responsive secondary.
>
> Pages covered: Dashboard, Member (list + detail + form + registrasi), Coach (list + detail + form), Class (list + detail + form), Absensi (list + manual), Approval Hub.
>
> Phase 1 covers Tier A. Tier B pages (Finansial, CMS, Reminder) referenced briefly.

---

## Global Admin Layout

### Desktop (Primary, ≥1024px)

```
┌──────────────────────────────────────────────────────────────────┐
│ [Logo]                            [Search]  [🔔]  [👤 Admin ▾]   │  <- top header 64px
├──────────┬───────────────────────────────────────────────────────┤
│          │                                                       │
│ [Sidebar]│  [Page content]                                       │
│ 240px    │                                                       │
│          │  Max-width: 1280px                                    │
│ - Beranda│                                                       │
│ - Member │                                                       │
│ - Coach  │                                                       │
│ - Kelas  │                                                       │
│ - Absen  │                                                       │
│ - ...    │                                                       │
│          │                                                       │
└──────────┴───────────────────────────────────────────────────────┘
```

### Sidebar

**Spec:**
- Width: 240px fixed, collapsible to 64px
- Background: white, border-right `--neutral-200`
- Padding: 16px
- Logo top: 32px height with branch indicator below
- Nav items: full-width clickable, padding 12px 16px, gap 12px (icon + label)
- Active item: bg `--primary-50`, text `--primary-700`, with 4px left border `--accent-400`
- Hover: bg `--neutral-100`
- Icons: 20px Lucide
- User section bottom: avatar + name + role badge + dropdown

### Sidebar Menu Structure (Phase 1)

```
[Branch Indicator: NSS Pusat]

OPERASIONAL
- 🏠 Dashboard
- 👥 Member
- 🏊 Coach
- 📅 Kelas
- ✓ Absensi
- 📋 Approval

(Tier B / Phase 2)
PEMBAYARAN
- 💰 Finansial
- 📄 Tagihan Bulanan

KONTEN
- 📰 Berita
- 🎓 Program

PENGATURAN
- 👤 Admin Cabang
- 🔐 Role & Akses
- 📊 Activity Log
```

### Top Header (64px)

- Background: white, border-bottom 1px `--neutral-200`
- Logo space taken by sidebar — header just has utilities
- Global search: input width 320px, with cmd+K shortcut hint
- Notifications bell with red dot if unread
- User dropdown right: avatar + name + chevron
- Padding: 24px horizontal

### Mobile (<1024px)

- Sidebar becomes drawer (slide from left), triggered by hamburger
- Top header: hamburger left, logo center, bell + avatar right
- Desktop layouts adapt to mobile-friendly stacks

---

## 1. Admin Dashboard (`/a/dashboard`)

### Layout

```
┌─────────────────────────────────────────────────────────────┐
│ Dashboard                                                   │
│ Selamat datang, [Admin Name]                                │
└─────────────────────────────────────────────────────────────┘

[STATS GRID — 4 cards]

┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ MEMBER AKTIF │ │ COACH AKTIF  │ │ KELAS MINGGU │ │ ATTENDANCE   │
│        [↑12%]│ │              │ │ INI          │ │ RATE         │
│              │ │              │ │              │ │              │
│  248         │ │  18          │ │  24          │ │  92%         │
│              │ │              │ │              │ │              │
│ +24 vs lalu  │ │ 2 baru       │ │ 4 hari ini   │ │ +5% bulan ini│
└──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘

[2-COLUMN LAYOUT BELOW]

┌──────────────────────────┐  ┌─────────────────────────────────┐
│ AKTIFITAS TERBARU        │  │ KELAS HARI INI                  │
│                          │  │                                 │
│ ● Andi P. mendaftar      │  │ 16:00 - Beginner Level          │
│   2 menit lalu           │  │ Coach Budi • 12 member          │
│                          │  │ ● Sedang berlangsung            │
│ ● Pembayaran Sari D.     │  │                                 │
│   diterima               │  │ 17:00 - Intermediate            │
│   1 jam lalu             │  │ Coach Sari • 8 member           │
│                          │  │ Akan dimulai dalam 30 menit     │
│ ● Coach Budi clock-in    │  │                                 │
│   2 jam lalu             │  │ 18:00 - Advanced                │
│                          │  │ Coach Budi • 6 member           │
│ [Lihat Semua →]          │  │                                 │
└──────────────────────────┘  │ [Lihat Calendar Lengkap]        │
                              └─────────────────────────────────┘

[ALERTS SECTION]

┌─────────────────────────────────────────────────────────────┐
│ ⚠ Pending Approval                                          │
│                                                             │
│ • 3 registrasi member menunggu approval                     │
│ • 2 sertifikat coach menunggu approval                      │
│ • 1 edit profil menunggu approval                           │
│                                                             │
│ [Buka Approval Hub →]                                       │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ 💰 Pembayaran Overdue (Tier B)                              │
│                                                             │
│ 5 member belum bayar tagihan bulan ini.                     │
│                                                             │
│ [Lihat Detail →]                                            │
└─────────────────────────────────────────────────────────────┘

[CHART SECTION]

┌─────────────────────────────────────────────────────────────┐
│ TREN KEHADIRAN 6 BULAN TERAKHIR                             │
│                                                             │
│ [Line chart attendance % over time]                         │
│                                                             │
│ [Bar chart member growth per program]                       │
└─────────────────────────────────────────────────────────────┘
```

### Specs

#### Stat Cards
- Same sport-tech pattern from design system
- Trend indicator (↑↓): top-right pill badge with arrow + percentage
- Trend up: success badge, ArrowUp icon
- Trend down: danger badge, ArrowDown icon
- Big number: text 48px weight 900 tabular-nums

#### Activity Feed
- Card: white, radius-lg, padding 24px
- Title: text-label-md uppercase
- Item: avatar 32px + text + timestamp
- Hover: bg `--neutral-50`
- Tap → relevant detail page

#### Today's Classes Card
- Card with timeline of classes
- Each class: time prominent + class name + status indicator
- Live class: pulsing dot, accent color
- Upcoming: countdown text
- Past: muted with check icon

#### Alert Cards
- Border-left 4px semantic color
- Icon left, content middle, action right
- Variants: warning (yellow), info (blue), danger (red)
- Padding: 20px

#### Charts
- Use Recharts or Chart.js
- Line chart: smooth curves, `--primary-600` line, `--primary-100` fill area
- Bar chart: bars `--accent-400`, hover state `--accent-500`
- Tooltip: dark bg, white text, radius-md
- X/Y axis: `--neutral-400` lines, `--neutral-600` labels

### Mobile Layout

- Stats: 2x2 grid
- 2-column layout becomes stacked
- Charts: horizontal scroll or stacked

### Quick Actions

Floating button bottom-right (mobile) or in header (desktop):
- "+ Tambah Cepat" dropdown menu
- Options: Tambah Member, Tambah Coach, Tambah Kelas

---

## 2. Member List (`/a/member`)

### Layout

```
┌─────────────────────────────────────────────────────────────┐
│ Member                                          [+ Tambah]  │
│ 248 member aktif                                            │
└─────────────────────────────────────────────────────────────┘

[FILTER BAR]

┌─────────────────────────────────────────────────────────────┐
│ [🔍 Cari nama atau ID...]  [Status ▾] [Kelas ▾] [Type ▾]   │
│                                                             │
│ Filter aktif: Status: Aktif × Kelas: Beginner ×             │
│                                                             │
│                          [Reset Filter] [Export ▾]          │
└─────────────────────────────────────────────────────────────┘

[BULK ACTIONS BAR (when items selected)]

┌─────────────────────────────────────────────────────────────┐
│ ☑ 5 member terpilih                                         │
│ [Send WA] [Tandai Inactive] [Export]      [Batalkan]        │
└─────────────────────────────────────────────────────────────┘

[TABLE]

┌──┬─────────────────────────────────────────────────────────┐
│☐ │ Foto  Nama          ID      Kelas   Status   Bayar  ⋯ │
├──┼─────────────────────────────────────────────────────────┤
│☐ │ [A]   Andi Pratama  NSS-001 Beginner [Aktif] [Lunas] ⋯│
│  │       andi@email.com                                    │
├──┼─────────────────────────────────────────────────────────┤
│☐ │ [S]   Sari Dewi     NSS-002 Beginner [Aktif] [Lunas] ⋯│
│  │       sari@email.com                                    │
├──┼─────────────────────────────────────────────────────────┤
│☐ │ [B]   Budi H.       NSS-003 Interm.  [Aktif] [⚠Telat]⋯│
│  │       budi@email.com                                    │
└──┴─────────────────────────────────────────────────────────┘

[Pagination: ← 1 2 3 ... 12 → | 20 per page ▾]
```

### Specs

#### Header
- Page title: text-display-sm
- Subtitle: text-body-md `--neutral-500`
- "+ Tambah" button: primary, top-right

#### Filter Bar
- Search input: full-width on mobile, max 320px desktop, with search icon prefix
- Filter dropdowns: shadcn select, gap 8px
- Active filters: shown as removable pills below
- Right side: Reset + Export dropdown

#### Table
- White bg, radius-lg, shadow-sm
- Header row: bg `--neutral-50`, text-label-sm uppercase, sortable columns
- Data row: padding 16px, border-bottom `--neutral-100` (last no border)
- Hover row: bg `--neutral-50`
- Avatar column: 40px circle
- Name + email: stacked, name body-md weight 600, email body-sm `--neutral-500`
- Status badges: standard semantic
- Action menu: ⋯ icon → dropdown (Lihat, Edit, Reset Password, Nonaktifkan)
- Mobile: table becomes card layout (stacked), no checkbox

#### Pagination
- Bottom of table
- Page numbers + arrows
- Page size selector right
- "Menampilkan 1-20 dari 248" text left

### Mobile Layout

Table → Card layout:
```
┌─────────────────────────────────────────┐
│ [☐] [A] Andi Pratama          [⋯]      │
│      NSS-001-2025 • Beginner            │
│      [Aktif] [Lunas]                    │
└─────────────────────────────────────────┘
```

### Empty States

#### No members yet (just installed):
```
[Icon: Users 64px]
Belum ada member
Tambah member pertama untuk mulai mengelola sekolah renang
[+ Tambah Member] (primary xl)
```

#### Filter returns empty:
```
[Icon: SearchX 48px]
Tidak ada member yang cocok
Coba ubah filter atau reset
[Reset Filter]
```

### Loading

Skeleton table rows while data loads. Shimmer effect.

---

## 3. Member Form (`/a/member/baru` and Edit)

### Layout

```
┌─────────────────────────────────────────────────────────────┐
│ [← Kembali ke Member]                                       │
│ Tambah Member Baru                                          │
└─────────────────────────────────────────────────────────────┘

[CARD: 2-column form, max-width 1024px]

┌──────────────────────────────┬────────────────────────────┐
│ Informasi Member             │ Foto Profil                │
│                              │                            │
│ Nama Lengkap *               │ [Avatar 160px upload]      │
│ [_______________________]    │ [📷 Pilih Foto]            │
│                              │                            │
│ Nama Panggilan               │ Max 2MB, JPG/PNG           │
│ [_______________________]    │                            │
│                              │ Member ID akan otomatis    │
│ Tanggal Lahir *              │ generated:                 │
│ [Date picker]                │ NSS-XXXX-2025              │
│                              │                            │
│ Jenis Kelamin *              │                            │
│ ( ) Laki-laki ( ) Perempuan  │                            │
│                              │                            │
│ Riwayat Penyakit             │                            │
│ [Textarea]                   │                            │
└──────────────────────────────┴────────────────────────────┘

[CARD: Kontak]

┌─────────────────────────────────────────────────────────────┐
│ Informasi Kontak                                            │
│                                                             │
│ Email *               Password *                            │
│ [___________]         [___________]                         │
│                                                             │
│ Nomor HP Utama *      Pemilik Nomor *                       │
│ [___________]         ( ) Diri ( ) Orang Tua                │
│                                                             │
│ [If parent]                                                 │
│ Nama Orang Tua *      Nomor Tambahan                        │
│ [___________]         [___________]                         │
│                                                             │
│ Alamat                                                      │
│ [Textarea]                                                  │
└─────────────────────────────────────────────────────────────┘

[CARD: Kelas]

┌─────────────────────────────────────────────────────────────┐
│ Pilih Kelas                                                 │
│                                                             │
│ [☑ Kelas Beginner Level - Rp 2.000.000/bulan]              │
│   Sen, Rab, Jum 16:00-17:00 • Coach Budi                    │
│                                                             │
│ [☐ Kelas Intermediate - Rp 2.500.000/bulan]                │
│   Sel, Kam 17:00-18:00 • Coach Sari                         │
│                                                             │
│ Total Bulanan: Rp 2.000.000                                 │
└─────────────────────────────────────────────────────────────┘

[CARD: Status]

┌─────────────────────────────────────────────────────────────┐
│ Status Member                                               │
│                                                             │
│ ( ) Aktif (sudah bayar)                                     │
│ ( ) Pending Pembayaran                                      │
│                                                             │
│ Kalau aktif: catat juga pembayaran pertamanya nanti         │
│ di tab Pembayaran                                           │
└─────────────────────────────────────────────────────────────┘

[FORM ACTIONS — sticky bottom on mobile]

┌─────────────────────────────────────────────────────────────┐
│              [Batal]  [Simpan Member]                       │
└─────────────────────────────────────────────────────────────┘
```

### Specs

#### Form Card
- White bg, radius-lg, padding 32px desktop / 24px mobile, shadow-sm
- Section title: text-heading-md
- Fields: standard from design system
- 2-column grid where natural (related fields)
- Required asterisk: red color `--danger-500`
- Helper text: text-body-sm `--neutral-500` below input

#### Avatar Upload
- Circle 160px, dashed border `--neutral-300` when empty
- Camera icon in center
- After upload: preview, edit overlay icon
- Compress before upload (browser-image-compression)
- Show file size + dimensions after upload

#### Form Validation
- Inline validation on blur
- Error: red border + red text below
- Email uniqueness checked async on blur

#### Submit States
- Default: "Simpan Member" primary button
- Loading: spinner + "Menyimpan..."
- Success: redirect to member detail with success toast
- Error: toast at top with error message, fields don't clear

#### Mobile
- Single column layout
- Sticky action bar bottom
- Sections collapsible (accordion) for long forms

---

## 4. Member Detail (`/a/member/[id]`)

### Layout (Tabs)

```
┌─────────────────────────────────────────────────────────────┐
│ [← Member]            Andi Pratama (NSS-001-2025)           │
│                       [Edit] [Reset Password] [Hubungi WA] │
└─────────────────────────────────────────────────────────────┘

[PROFILE HEADER CARD]

┌─────────────────────────────────────────────────────────────┐
│ ┌─────┐                                                     │
│ │     │  Andi Pratama                                       │
│ │ 96px│  NSS-001-2025 • L • 15 tahun                        │
│ │     │  [Aktif] [Lunas Maret]                              │
│ └─────┘                                                     │
│                                                             │
│ 📧 andi@email.com                                           │
│ 📱 +62 812 3456 7890 (Orang Tua)                            │
│ 📅 Bergabung: 1 Jan 2025 (3 bulan)                          │
└─────────────────────────────────────────────────────────────┘

[TABS]

[Profil] [Kelas (2)] [Absensi] [Pembayaran] [Log]

[TAB CONTENT]
```

### Tab: Profil

```
[INFORMASI PRIBADI]
[2-column display of all fields]

[INFORMASI KONTAK]
[2-column display]

[RIWAYAT PENYAKIT]
[Highlighted card with text]

[ACTIONS BAR]
[Edit Profil] [Nonaktifkan Member] (danger ghost)
```

### Tab: Kelas

```
┌─────────────────────────────────────────────────────────────┐
│ Kelas Beginner Level                              [Hapus]   │
│ Sen, Rab, Jum 16:00-17:00 • Coach Budi                      │
│ Bergabung sejak: 1 Feb 2025                                 │
└─────────────────────────────────────────────────────────────┘

[+ Tambah ke Kelas Lain]

(modal opens with class selector)
```

### Tab: Absensi

Embedded mini version of attendance history with:
- Filter by date range
- Stats summary (top)
- List of records
- Edit/delete per record (admin power)

### Tab: Pembayaran (Tier B)

- List monthly invoices
- Status badge per invoice
- Action: input pembayaran, lihat bukti

### Tab: Log

```
┌─────────────────────────────────────────────────────────────┐
│ Aktivitas Member                                            │
├─────────────────────────────────────────────────────────────┤
│ ● Profil diedit oleh Admin Sari                             │
│   8 Mar 2025, 14:23                                         │
│   Field: phone, address                                     │
├─────────────────────────────────────────────────────────────┤
│ ● Hadir di Kelas Beginner                                   │
│   8 Mar 2025, 16:02                                         │
│   Scanned by: Coach Budi                                    │
├─────────────────────────────────────────────────────────────┤
│ ● Pembayaran Maret diterima                                 │
│   1 Mar 2025, 10:15                                         │
│   Recorded by: Admin Sari                                   │
└─────────────────────────────────────────────────────────────┘
```

---

## 5. Member Registration Pending (`/a/member/registrasi`)

```
┌─────────────────────────────────────────────────────────────┐
│ Pendaftaran Menunggu Approval                               │
│ 3 pendaftar pending                                         │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ ┌──┐                                                        │
│ │A │ Andi Pratama                                           │
│ └──┘ andi@email.com • Daftar 2 jam lalu                     │
│                                                             │
│      Kelas yang dipilih:                                    │
│      • Kelas Beginner - Rp 2.000.000                        │
│                                                             │
│      Total: Rp 2.000.000                                    │
│                                                             │
│      [Lihat Detail] [Approve] [Reject]                     │
└─────────────────────────────────────────────────────────────┘

(more cards)
```

### Approve Action

Modal:
```
┌─────────────────────────────────────────┐
│ Approve Pendaftaran                 [×] │
├─────────────────────────────────────────┤
│ Apakah pembayaran sudah diterima?       │
│                                         │
│ ☑ Saya sudah menerima bukti pembayaran  │
│   sebesar Rp 2.000.000                  │
│                                         │
│ Catatan (optional)                      │
│ [Textarea]                              │
│                                         │
│ Setelah approve:                        │
│ • Status member menjadi Aktif           │
│ • Email konfirmasi dikirim              │
│ • Member bisa login                     │
│                                         │
│ [Batal] [Approve & Aktifkan]            │
└─────────────────────────────────────────┘
```

### Reject Action

Modal:
```
┌─────────────────────────────────────────┐
│ Reject Pendaftaran                  [×] │
├─────────────────────────────────────────┤
│ Yakin reject pendaftaran ini?           │
│                                         │
│ Alasan *                                │
│ [Textarea]                              │
│                                         │
│ Reject: data akan dihapus permanen.     │
│                                         │
│ [Batal] [Ya, Reject] (danger)           │
└─────────────────────────────────────────┘
```

---

## 6. Coach List (`/a/coach`)

Mirror of Member List but for coaches. Same patterns.

Differences:
- Show specialization tags
- Show certificate status indicator
- Show clock-in record badge (last 7 days)

---

## 7. Coach Form (`/a/coach/baru` and Edit)

Similar to Member Form but with additional sections:

### Spesialisasi Section

```
┌─────────────────────────────────────────────────────────────┐
│ Spesialisasi                                                │
│                                                             │
│ [Beginner ×] [Anak-anak ×] [Gaya Bebas ×]  + Tambah        │
│                                                             │
│ Quick add: [Beginner] [Intermediate] [Advanced]            │
│            [Anak-anak] [Remaja] [Dewasa]                   │
│            [Gaya Bebas] [Gaya Dada] [Gaya Punggung]        │
└─────────────────────────────────────────────────────────────┘
```

- Tag input component
- Click tag to remove
- Suggestions below for quick add

### Sertifikat Section (Dynamic)

```
┌─────────────────────────────────────────────────────────────┐
│ Sertifikat                                  [+ Tambah]      │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ Sertifikat 1                                  [Hapus]   ││
│ │                                                         ││
│ │ Nama Sertifikat *                                       ││
│ │ [_______________________]                               ││
│ │                                                         ││
│ │ Foto Sertifikat *                                       ││
│ │ [Upload area dashed border]                             ││
│ │                                                         ││
│ │ Tahun Terbit *      Berlaku Sampai                      ││
│ │ [2018]              [2026-12-31] ☐ Tidak ada batas      ││
│ │                                                         ││
│ └─────────────────────────────────────────────────────────┘│
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ Sertifikat 2                                  [Hapus]   ││
│ │ ...                                                     ││
│ └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

- Add/remove cards dynamically (React Hook Form useFieldArray)
- File upload per certificate
- Certificate status auto: "pending_approval" until manager/owner approves

---

## 8. Class List (`/a/kelas`)

```
┌─────────────────────────────────────────────────────────────┐
│ Kelas                                       [+ Tambah Kelas]│
│ 8 kelas aktif                                               │
└─────────────────────────────────────────────────────────────┘

[Filter: Semua / Aktif / Inactive | Search]

[GRID — 2-3 columns desktop, 1 column mobile]

┌─────────────────────────────────────────────────────────────┐
│  Kelas Beginner Level                                       │
│  Usia 4-7 tahun                                             │
│                                                             │
│  📅 Sen, Rab, Jum 16:00-17:00                               │
│  📍 Kolam Pusat • Kapasitas 15                              │
│  👥 12 / 15 member  [Hampir Penuh]                          │
│                                                             │
│  Coach: Budi Santoso, Sari Dewi                             │
│                                                             │
│  Rp 2.000.000/bulan                                         │
│                                                             │
│  [Lihat Detail] [Edit]                                      │
└─────────────────────────────────────────────────────────────┘
```

### Capacity Indicator

- Empty: bg `--neutral-100`, text `--neutral-500`, "Tersedia"
- Filling (<70%): bg `--success-100`, text `--success-700`
- Hampir Penuh (70-99%): bg `--warning-100`, text `--warning-700`
- Penuh (100%): bg `--danger-100`, text `--danger-700`

---

## 9. Class Form (`/a/kelas/baru` and Edit)

### Layout

```
[CARD: Informasi Dasar]

┌─────────────────────────────────────────────────────────────┐
│ Nama Kelas *                  Slug (auto)                   │
│ [Beginner Level]              [beginner-level]              │
│                                                             │
│ Deskripsi                                                   │
│ [Textarea]                                                  │
│                                                             │
│ Usia Min - Max                                              │
│ [4]    [7]                                                  │
│                                                             │
│ Kapasitas *                                                 │
│ [15]                                                        │
└─────────────────────────────────────────────────────────────┘

[CARD: Pricing]

┌─────────────────────────────────────────────────────────────┐
│ Harga per Bulan *             Sesi per Bulan *              │
│ Rp [2.000.000]                [6]                           │
│                                                             │
│ Total per sesi: Rp 333.333 (auto-calculated)                │
└─────────────────────────────────────────────────────────────┘

[CARD: Schedule]

┌─────────────────────────────────────────────────────────────┐
│ Jadwal Mingguan *                                           │
│                                                             │
│ ☑ Senin    [16:00] - [17:00]   [×]                         │
│ ☐ Selasa                                                    │
│ ☑ Rabu     [16:00] - [17:00]   [×]                         │
│ ☐ Kamis                                                     │
│ ☑ Jumat    [16:00] - [17:00]   [×]                         │
│ ☐ Sabtu                                                     │
│ ☐ Minggu                                                    │
│                                                             │
│ Tip: Centang hari, lalu set jam mulai dan selesai           │
└─────────────────────────────────────────────────────────────┘

[CARD: Lokasi]

┌─────────────────────────────────────────────────────────────┐
│ Lokasi Kelas                                                │
│                                                             │
│ ☑ Gunakan lokasi cabang utama (Kolam Pusat)                 │
│   ☐ Override dengan lokasi lain                             │
│                                                             │
│ Nama Lokasi (jika override)                                 │
│ [_______________________]                                   │
│                                                             │
│ Koordinat GPS (jika override)                               │
│ Lat: [______] Lng: [______]                                 │
│ [📍 Pick on Map]                                            │
└─────────────────────────────────────────────────────────────┘

[CARD: Coach]

┌─────────────────────────────────────────────────────────────┐
│ Coach yang Mengajar *                                       │
│                                                             │
│ [Multi-select with avatars]                                 │
│ ☑ Coach Budi Santoso                                        │
│ ☑ Coach Sari Dewi                                           │
│ ☐ Coach Andi                                                │
│                                                             │
│ Tip: Pilih lebih dari 1 untuk team teaching                 │
└─────────────────────────────────────────────────────────────┘

[ACTIONS]
[Batal] [Simpan Kelas]
```

### Schedule Picker Component

- Each day: checkbox + (when checked) time pickers
- When checked: show time input (start) + dash + time input (end)
- Validation: end must > start
- "+" icon if want multiple time slots same day (advanced, Phase 2)

---

## 10. Class Detail (`/a/kelas/[id]`)

```
[Header: Class name + Edit + Delete buttons]

[STATS]
[12 / 15 member] [2 coach] [6 sesi/bulan] [Rp 2.000.000/bulan]

[TABS: Info / Member / Coach / Schedule]

[TAB: Info]
All class fields displayed read-only

[TAB: Member]
List of enrolled members + add/remove buttons
"+Tambah Member" → modal with member search & select

[TAB: Coach]
List of assigned coaches + add/remove
Per coach: name, last clock-in, total sessions taught

[TAB: Schedule]
Weekly recurring schedule visualization
Calendar mini view showing this week's sessions
```

---

## 11. Attendance List (`/a/absensi`)

```
[Header: Rekap Absensi]

[Stats: Total sesi bulan ini, attendance rate avg, total members tracked]

[FILTERS]
[Date range picker] [Class filter] [Member filter] [Status filter]

[Export Button: CSV/XLSX (Tier B)]

[TABLE]

┌──────────────┬──────────┬──────────┬─────────┬────────┬─────────┐
│ Tanggal/Jam  │ Member   │ Kelas    │ Status  │ Coach  │ Action  │
├──────────────┼──────────┼──────────┼─────────┼────────┼─────────┤
│ 8 Mar 16:02  │ Andi P.  │ Beginner │ Hadir   │ Budi   │ ⋯       │
│ 8 Mar 16:18  │ Sari D.  │ Beginner │ Late    │ Budi   │ ⋯       │
│ 8 Mar -      │ Budi H.  │ Beginner │ Izin    │ Budi   │ ⋯       │
│ 8 Mar -      │ Dewi L.  │ Beginner │ Alpha   │ Budi   │ ⋯       │
└──────────────┴──────────┴──────────┴─────────┴────────┴─────────┘

Pagination
```

### Action Menu (per row)
- View Detail
- Edit Status
- Delete (with confirm modal)

---

## 12. Manual Attendance (`/a/absensi/manual`)

For inputting izin/sakit on behalf of member.

```
┌─────────────────────────────────────────────────────────────┐
│ Input Absensi Manual                                        │
│ Untuk member yang izin/sakit di luar sistem                 │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ Pilih Member *                                              │
│ [Search & select member]                                    │
│                                                             │
│ Pilih Kelas *                                               │
│ [Dropdown of member's classes]                              │
│                                                             │
│ Tanggal Sesi *                                              │
│ [Date picker, must be valid session date]                   │
│                                                             │
│ Status *                                                    │
│ ( ) Hadir                                                   │
│ ( ) Hadir Telat                                             │
│ ( ) Izin                                                    │
│ ( ) Sakit                                                   │
│ ( ) Alpha                                                   │
│                                                             │
│ Catatan                                                     │
│ [Textarea: alasan, info tambahan, dll]                      │
│                                                             │
│ [Batal] [Simpan Absensi]                                    │
└─────────────────────────────────────────────────────────────┘
```

---

## 13. Coach Clock-in History (`/a/absensi/coach`)

```
[Header: Riwayat Clock-In Coach]

[Filters: Date range, Coach filter, Suspicious flag filter]

[TABLE]

┌──────────────┬──────────┬─────────────┬──────────┬────────┐
│ Waktu        │ Coach    │ Lokasi      │ Jarak    │ Action │
├──────────────┼──────────┼─────────────┼──────────┼────────┤
│ 8 Mar 14:23  │ Budi     │ Pusat       │ 12m ✓    │ ⋯      │
│ 8 Mar 15:45  │ Sari     │ Pusat       │ 145m ⚠   │ ⋯      │
│ 7 Mar 14:18  │ Budi     │ Pusat       │ 8m ✓     │ ⋯      │
└──────────────┴──────────┴─────────────┴──────────┴────────┘
```

### Distance Indicators
- ≤ 30m: green check ✓
- 30-100m: amber warning ⚠
- > 100m: red flag 🚩

### Action Menu
- View detail (opens modal with selfie photo, full GPS info, IP, user agent)
- Flag as suspicious
- Unflag suspicious
- Delete (admin only, with reason)

### Detail Modal

```
┌─────────────────────────────────────────┐
│ Detail Clock-In                     [×] │
├─────────────────────────────────────────┤
│ [Selfie photo 240px]                    │
│                                         │
│ Coach: Budi Santoso                     │
│ Waktu: 8 Mar 2025, 14:23 WIB            │
│ Cabang: NSS Pusat                       │
│                                         │
│ Lokasi:                                 │
│   Lat: -6.234567                        │
│   Lng: 106.987654                       │
│   Akurasi: 8 meter                      │
│   Jarak ke kolam: 12 meter ✓            │
│                                         │
│ [Map preview showing location dots]     │
│                                         │
│ IP: 103.xxx.xxx.xxx                     │
│ User Agent: Chrome on Android 13        │
│                                         │
│ ⚠ Flag sebagai suspicious               │
│ [Toggle]                                │
│                                         │
│ [Tutup]                                 │
└─────────────────────────────────────────┘
```

---

## 14. Approval Hub (`/a/approval`)

```
┌─────────────────────────────────────────────────────────────┐
│ Approval                                                    │
│ Hub untuk semua permintaan yang butuh persetujuan           │
└─────────────────────────────────────────────────────────────┘

[TABS]
[Registrasi Member (3)] [Sertifikat Coach (2)] [Edit Profil (1)]

[TAB CONTENT — list with action buttons]
```

Mirror of registrasi member pattern across categories.

---

## Common Admin Patterns

### Confirmation Modals

For all destructive actions:
```
┌─────────────────────────────────────────┐
│ Konfirmasi Hapus                    [×] │
├─────────────────────────────────────────┤
│                                         │
│ [Warning icon 48px in danger]           │
│                                         │
│ Yakin Nonaktifkan Member?               │
│                                         │
│ {Member Name} akan tidak bisa login,    │
│ tapi data attendance dan rapot akan     │
│ tetap tersimpan untuk history.          │
│                                         │
│ [Batal] [Ya, Nonaktifkan] (danger)      │
└─────────────────────────────────────────┘
```

### Toast Notifications

For action feedback:
- Success: "Member berhasil ditambahkan" (auto-dismiss 4 sec)
- Error: "Gagal menyimpan. Coba lagi." (auto-dismiss 6 sec, with X to close)
- Loading: "Menyimpan..." (sticky until complete)

### Bulk Actions

When admin selects multiple rows:
- Sticky bar at top of table appears
- Shows count + action buttons
- Cancel button to deselect

### Quick Filter Chips

After filter applied, show as removable pills:
```
Filter aktif: [Status: Aktif ×] [Kelas: Beginner ×] [Reset Semua]
```

### Export Patterns

Export button (Tier B):
```
[Export ▾]
├ Export to CSV
├ Export to XLSX  
└ Export to PDF (per filter)
```

### Empty States

Always provide constructive empty states:
- Icon (64px, neutral-300)
- Title (heading-md)
- Description (body-md neutral-600)
- Primary action button to resolve

### Loading States

- Page header: instant (no skeleton)
- Tables: skeleton rows (5-10 rows)
- Cards: skeleton content matching final
- Avoid full-page spinners

### Error Pages

For data fetch failures:
```
[Icon: ServerCrash 64px]
Gagal Memuat Data
Terjadi kesalahan di server. Tim kami sudah dapat notifikasi.
[Refresh] [Kembali ke Dashboard]
```

---

## Mobile Responsive Strategy

Admin panel desktop-first, but must work on tablet (768px+) at minimum.

### Breakpoint Behaviors

**Desktop (≥1024px):**
- Full sidebar visible
- Multi-column forms
- Full-width tables

**Tablet (768-1023px):**
- Sidebar collapsible
- Forms 2-column → 1-column
- Tables horizontal scroll OR convert to card list
- Bottom nav optional

**Mobile (<768px):**
- Sidebar = drawer (hamburger trigger)
- All forms single column
- Tables → card layout
- Sticky action bars
- Modal → bottom sheet

### Critical Mobile Adjustments

1. Tables → cards on mobile (already mentioned)
2. Multi-step forms → keep step navigation visible
3. Action menus (⋯) → bottom sheet on mobile
4. Date pickers → native HTML on mobile
5. File upload → single tap to camera or gallery

---

## Performance Targets

- Page load (admin dashboard): < 2 sec on 4G
- Table render with 100 rows: < 500ms
- Search filter: instant (debounced 300ms)
- Form submit: < 1 sec response

---

## Accessibility Notes

- All tables: proper `<th>` with scope
- Forms: labels associated with inputs
- Action buttons in tables: aria-label describing the action
- Keyboard nav: Tab through table rows, Enter to open detail
- Confirm modals: Escape to close, focus trap

---

**Document version:** 1.0

This completes the UI documentation suite for Phase 1 + Tier B preview. Refer back to:
- `UI_DESIGN_SYSTEM.md` for tokens and base components
- `UI_PUBLIC.md` for public site
- `UI_MEMBER.md` for member panel
- `UI_COACH.md` for coach panel
- `UI_ADMIN.md` for admin panel (this file)

Owner Panel and School Panel UI specs to be added in Phase 2 documentation.
