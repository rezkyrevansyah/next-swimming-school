# UI_COACH.md

> **Per-page UI design instructions for Coach Panel (`/c/*`).**
> Inherits foundation from `UI_DESIGN_SYSTEM.md`. Read that first.
>
> Pages covered: Dashboard, Clock-in, Absensi (hub + active), Kelas, Member, QR, Profil, Notifikasi, Pengaturan
>
> **Coach panel is MOBILE-FIRST priority.** Coach uses HP daily for absensi.

---

## Global Coach Layout

### Mobile (Primary, <1024px)

```
┌─────────────────────────────────┐
│ [Logo] Halo, Coach     [🔔][👤] │  <- top header 56px
├─────────────────────────────────┤
│                                 │
│  [Page content]                 │
│                                 │
├─────────────────────────────────┤
│ [🏠] [✓] [📋] [👥] [⚙]         │  <- bottom nav 64px
│ Home Absensi Kelas Member Profil│
└─────────────────────────────────┘
```

### Bottom Nav Items
1. Beranda (Dashboard) — `LayoutDashboard`
2. Absensi — `ClipboardCheck` ⚡ (most-used, slight emphasis)
3. Kelas — `BookOpen`
4. Member — `Users`
5. Profil — `User`

**Active tab:** `--primary-600` icon + label, with 3px `--accent-400` indicator on top.

### Branch Switcher (For multi-branch coach — Phase 2)
- Phase 1: not visible (single branch)
- Phase 2: dropdown in header showing current branch with chevron

### Desktop (≥1024px)

Sidebar layout (240px fixed) + main content. Same content but with sidebar nav instead of bottom nav.

---

## 1. Coach Dashboard (`/c/dashboard`)

### Three Scenarios

#### Scenario A: Has Classes Today, Not Yet Clocked In

```
┌─────────────────────────────────────────────────────────┐
│  ⚡ KAMU ADA 3 KELAS HARI INI                           │  <- big banner
│                                                         │
│  Belum absen masuk hari ini                             │
│                                                         │
│  [📷 Absen Masuk Sekarang] (xl accent button)           │
└─────────────────────────────────────────────────────────┘

[KELAS HARI INI]

┌─────────────────────────────────────────────────────────┐
│  16:00 - 17:00            [Akan dimulai 2 jam lagi]    │
│  Kelas Beginner Level                                   │
│  📍 Kolam Pusat • 12 member                             │
│  [Mulai Absensi] (disabled until clock-in)              │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  17:00 - 18:00                                          │
│  Kelas Intermediate                                     │
│  📍 Kolam Pusat • 8 member                              │
│  [Mulai Absensi]                                        │
└─────────────────────────────────────────────────────────┘

[STATS HARI INI]
[Total Member 32] [Hadir 0] [Absensi Tertunda 32]
```

#### Scenario B: Already Clocked In Today

```
┌─────────────────────────────────────────────────────────┐
│  ✅ SUDAH ABSEN MASUK                                   │
│                                                         │
│  Tercatat: 14:23 WIB • Jarak: 12 meter dari kolam       │
│  [Lihat Detail Absensi]                                 │
└─────────────────────────────────────────────────────────┘

(rest same as above, with [Mulai Absensi] now enabled)
```

#### Scenario C: No Classes Today

```
┌─────────────────────────────────────────────────────────┐
│              [Big illustration: relaxing icon]          │
│                                                         │
│              Tidak Ada Kelas Hari Ini                   │
│                                                         │
│              Selamat istirahat! 🌴                      │
│                                                         │
│              Kelas berikutnya: Senin, 10 Mar             │
└─────────────────────────────────────────────────────────┘
```

### Specs

#### Big Banner Card (Clock-In CTA)
- Background: gradient `--primary-700` to `--primary-600` 135deg
- Subtle accent overlay top-right
- Padding: 28px
- Radius: lg
- Top text: text-label-md uppercase white "KAMU ADA 3 KELAS HARI INI" with energy
- Body: text-body-md `--neutral-200`
- CTA: accent-400 button, height 56px, weight 700, with Camera icon

**Already clocked in variant:**
- Background: `--success-50` bg
- Check icon: 32px in `--success-600`
- Border: 2px `--success-300`
- Text: `--success-800`

#### Today's Class Card
- Card: white, radius-lg, padding 20px
- Time label: text-display-sm weight 800, color `--primary-600`, tabular-nums
- Class name: text-heading-md
- Meta line: location + member count, body-sm
- Status badge: top-right showing "Akan dimulai X jam" / "Sedang berlangsung" / "Selesai"
- "Mulai Absensi" button: primary, full-width on mobile, auto on desktop
- Disabled state: bg `--neutral-100`, text `--neutral-400`, cursor not-allowed

#### Status Badges (top-right of class card)
- "Akan dimulai dalam X jam": bg `--neutral-100`, text `--neutral-600`
- "Sedang berlangsung": bg `--success-100`, text `--success-700` + pulsing dot
- "Selesai": bg `--neutral-100`, text `--neutral-500`, with check icon

#### Stats Cards (bottom)
- Same sport-tech stat card pattern from design system
- 3 cards: Total Member, Hadir, Absensi Tertunda
- Mobile: horizontal scroll or 2x2 grid

#### Empty State (no classes)
- Center-aligned content
- Big illustration or icon (96px) — relaxed swimmer or beach umbrella
- Heading: text-display-sm
- Body: text-body-lg neutral-600 with emoji 🌴
- Next class info: smaller text below

---

## 2. Coach Clock-In (`/c/clock-in`)

### Camera + GPS Capture Flow

#### Step 1: Permission Request

```
┌─────────────────────────────────────────────────────────┐
│ [← Kembali]                              Absen Masuk    │
├─────────────────────────────────────────────────────────┤
│                                                         │
│            [Camera icon big 96px primary]               │
│                                                         │
│            Izinkan Akses Kamera & Lokasi                │
│            (heading-lg)                                 │
│                                                         │
│            Kami butuh akses kamera untuk selfie         │
│            dan lokasi untuk verifikasi kehadiran        │
│            di kolam renang.                             │
│            (body-md neutral-600)                        │
│                                                         │
│            ✓ Selfie tidak akan disebarluaskan           │
│            ✓ Lokasi hanya untuk verifikasi              │
│            ✓ Data kamu aman                             │
│                                                         │
│            [Izinkan Akses]                              │
└─────────────────────────────────────────────────────────┘
```

#### Step 2: Camera Capture

```
┌─────────────────────────────────────────────────────────┐
│ [× Batal]                              Selfie Absen     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│       ┌───────────────────────────────────┐             │
│       │                                   │             │
│       │                                   │             │
│       │     [Camera live preview]         │             │
│       │                                   │             │
│       │     [Face guide overlay]          │             │
│       │                                   │             │
│       │                                   │             │
│       └───────────────────────────────────┘             │
│                                                         │
│            Posisikan wajah di dalam frame               │
│                                                         │
│       📍 Mendapatkan lokasi... (loading)                │
│                                                         │
│              [Ambil Foto] (round 80px)                  │
└─────────────────────────────────────────────────────────┘
```

**Specs:**
- Camera preview: 1:1 ratio, full-width on mobile, max 480px desktop
- Face guide: subtle dashed circle overlay center, 70% size
- Background outside camera: black or `--neutral-900`
- Capture button: round 80px, white bg, with circle inset (camera button style)
- Geolocation status: shown above button with location pin icon
- Cancel button (top): X icon white on dark

#### Step 3: Preview & Confirm

```
┌─────────────────────────────────────────────────────────┐
│ [← Ambil Ulang]                       Konfirmasi       │
├─────────────────────────────────────────────────────────┤
│                                                         │
│       ┌───────────────────────────────────┐             │
│       │     [Selfie preview]              │             │
│       └───────────────────────────────────┘             │
│                                                         │
│       📍 Lokasi: Kolam Pusat                            │
│       🎯 Jarak: 12 meter (dari titik kolam)             │
│       🕐 Waktu: 14:23 WIB                               │
│                                                         │
│       [✓ Submit Absensi]                                │
│       [↻ Ambil Ulang]                                   │
└─────────────────────────────────────────────────────────┘
```

**Distance label states:**
- ≤ 30m: `✓ Di lokasi (12m)` — green badge
- > 30m: `⚠ Jauh dari lokasi (450m)` — orange/warning badge
- No GPS: `⚠ Lokasi tidak terdeteksi` — gray badge

#### Step 4: Success State

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│            [Big checkmark animated 96px]                │
│                                                         │
│            Absensi Berhasil!                            │
│            (display-md)                                 │
│                                                         │
│            14:23 WIB • 12m dari kolam                   │
│                                                         │
│            Selamat mengajar, Coach! 💪                  │
│                                                         │
│            [Mulai Absensi Member →]                     │
│            (xl primary button)                          │
└─────────────────────────────────────────────────────────┘
```

**Specs:**
- Center-aligned
- Checkmark: 96px, color `--success-500`, with subtle bg `--success-100` circle 144px
- Animation: check-mark draw-in animation (CSS or Lottie)
- After 2 sec: auto-redirect to `/c/absensi` OR show button to navigate

### Error States

#### Permission Denied
```
[Icon: ShieldOff 64px danger]
Akses Kamera/Lokasi Ditolak
Untuk absen, kamu harus izinkan akses kamera dan lokasi.
[Buka Pengaturan Browser] (link)
[Coba Lagi]
```

#### Too Far From Location (Phase 1: warning, not block)
```
⚠ Kamu terlihat 450m dari kolam.
Pastikan kamu di lokasi kolam yang benar.

[Tetap Submit] [Coba Ambil Lagi]
```

(Phase 1: still allow submit with warning flag. Admin reviews suspicious entries.)

#### Already Clocked In Today (per branch)
```
[Icon: CheckCircle 64px success]
Sudah Absen Masuk Hari Ini
Kamu sudah absen pada 14:23 WIB.
[Lihat Detail] [Kembali]
```

---

## 3. Coach Absensi Hub (`/c/absensi`)

### Today's Classes Selector

```
┌─────────────────────────────────────────────────────────┐
│ Absensi Member                                          │
│ Pilih kelas untuk mulai absensi                         │
├─────────────────────────────────────────────────────────┤

[FILTER: HARI INI / MINGGU INI / BULAN INI]

[KELAS HARI INI]

┌─────────────────────────────────────────────────────────┐
│  ● Sedang Berlangsung                                   │  <- live pulsing
│                                                         │
│  16:00 - 17:00                                          │
│  Kelas Beginner Level                                   │
│  📍 Kolam Pusat • 12 member                             │
│                                                         │
│  Hadir: 8 / 12                                          │
│  [████████████░░░░] 67%                                 │  <- progress bar
│                                                         │
│  [Lanjut Absensi →] (primary button)                    │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  Belum Dimulai                                          │
│                                                         │
│  17:00 - 18:00                                          │
│  Kelas Intermediate                                     │
│  📍 Kolam Pusat • 8 member                              │
│                                                         │
│  [Mulai Absensi] (outline button)                       │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  ✓ Selesai • 100% Hadir                                 │
│                                                         │
│  10:00 - 11:00                                          │
│  Kelas Pagi Beginner                                    │
│  📍 Kolam Pusat • 6 member                              │
│                                                         │
│  6/6 hadir, 0 izin, 0 alpha                             │
│  [Lihat Rincian]                                        │
└─────────────────────────────────────────────────────────┘
```

### Specs

- Filter chips: pill style, sticky top
- Class card states (3 visual styles):
  - **Sedang berlangsung**: border 2px `--success-400`, live pulsing dot, accent button
  - **Belum dimulai**: standard card, outline button
  - **Selesai**: bg `--neutral-50`, success icon, ghost view button
- Progress bar (for active class): 8px height, `--primary-100` track, `--accent-400` fill
- Hover: shadow-md

### Empty State (No clock-in yet)

```
[Icon: ShieldAlert 48px warning]
Kamu Belum Absen Masuk
Absen masuk dulu sebelum mulai mencatat absensi member.
[Absen Masuk Sekarang] (xl accent button)
```

---

## 4. Coach Active Attendance (`/c/absensi/[kelas_id]`)

The most important page in the coach panel. Used during live class.

### Layout

```
┌─────────────────────────────────────────────────────────┐
│ [← Kembali]   Kelas Beginner   [⋮]                      │  <- header
├─────────────────────────────────────────────────────────┤
│                                                         │
│ ● Sedang Berlangsung • 16:00 - 17:00 • Kolam Pusat     │  <- meta strip
│                                                         │
│ Hadir: 8 / 12                                           │
│ [██████████░░░░░░░░] 67%                                │  <- live progress
│                                                         │
├─────────────────────────────────────────────────────────┤
│ [Scan QR] [Manual Checklist]                            │  <- tabs
├─────────────────────────────────────────────────────────┤
                                                          
[TAB CONTENT - SEE BELOW]
                                                          
├─────────────────────────────────────────────────────────┤
│ [Selesai Mengajar]                                      │  <- bottom action
└─────────────────────────────────────────────────────────┘
```

### Tab 1: Scan QR

```
┌─────────────────────────────────────────────────────────┐
│       ┌───────────────────────────────────┐             │
│       │                                   │             │
│       │     [Camera scanner viewport]     │             │
│       │                                   │             │
│       │     [QR detection square overlay] │             │
│       │                                   │             │
│       └───────────────────────────────────┘             │
│                                                         │
│       Arahkan kamera ke QR member                       │
│                                                         │
│       [Sentuh untuk fokus]                              │
│                                                         │
└─────────────────────────────────────────────────────────┘

[BARU SAJA DIABSENSI]

┌─────────────────────────────────────────────────────────┐
│ ✓ Andi Pratama (NSS-0001) • Hadir • 16:02 WIB          │  <- success row
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ ✓ Sari Dewi (NSS-0007) • Hadir • 16:01 WIB             │
└─────────────────────────────────────────────────────────┘
```

#### Specs

- Scanner viewport: 1:1 ratio, max 480px width on desktop
- Border: 4px `--primary-600` corner indicators (TL, TR, BL, BR), not full border
- Detection state: when QR detected, brief flash + check animation
- Success row: animate-fade-in, slides down stack as more scans happen
- After scan: optional brief vibration on mobile (Vibration API)

#### Scan Result Toast

When scan succeeds:
- Toast top: green bg, "✓ Andi Pratama hadir tercatat", auto-dismiss 2 sec
- Late: orange bg, "⌛ Andi Pratama hadir telat (18 menit)"
- Already scanned: blue bg, "ℹ Andi Pratama sudah tercatat"
- Invalid QR: red bg, "✕ QR tidak valid atau expired"

### Tab 2: Manual Checklist

```
[Search: 🔍 Cari member]

[Filter: Semua / Belum diabsen / Sudah hadir]

┌─────────────────────────────────────────────────────────┐
│ ┌──┐                                                    │
│ │A │ Andi Pratama                       [✓ Hadir]      │  <- already marked
│ └──┘ NSS-0001-2025 • L • 15 thn                         │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ ┌──┐                                                    │
│ │S │ Sari Dewi                          [Pilih ▾]      │  <- not marked yet
│ └──┘ NSS-0002-2025 • P • 12 thn                         │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ ┌──┐                                                    │
│ │B │ Budi Hartono                       [⌛ Late]      │
│ └──┘ NSS-0003-2025 • L • 14 thn                         │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ ┌──┐                                                    │
│ │D │ Dewi Lestari                       [⏸ Izin]      │
│ └──┘ NSS-0004-2025 • P • 13 thn                         │
└─────────────────────────────────────────────────────────┘

[Tampilkan 12 member lainnya]

[BULK ACTIONS]
[Tandai sisanya sebagai Alpha] (ghost button danger)
```

#### Member Row Specs

- Card: white, padding 16px, border 1px `--neutral-200`, radius-md
- Avatar: 40px circle
- Name: text-body-md weight 600
- Info: text-body-xs `--neutral-500`
- Right side: status badge OR action dropdown
- Tap row → opens action sheet on mobile

#### Status Action Picker

When tap on "Pilih" or current status:

Mobile (bottom sheet):
```
┌─────────────────────────────────────────┐
│ Tandai Status                       [×] │
├─────────────────────────────────────────┤
│ [✓] Hadir                               │
│ [⌛] Hadir Telat                         │
│ [⏸] Izin                                │
│ [🤒] Sakit                              │
│ [✕] Alpha                               │
│                                         │
│ Catatan (optional)                      │
│ [Textarea]                              │
│                                         │
│ [Simpan]                                │
└─────────────────────────────────────────┘
```

Desktop: dropdown menu inline.

#### Status Badge Colors
- Hadir: `--success-100` bg, `--success-700` text
- Late: `--warning-100` bg, `--warning-700` text
- Izin: `--info-100` bg, `--info-700` text
- Sakit: `--neutral-100` bg, `--neutral-700` text
- Alpha: `--danger-100` bg, `--danger-700` text

### Bottom Action Bar

Sticky bottom (above mobile nav):
- Background: white, border-top `--neutral-200`, shadow inverted (top shadow)
- Padding: 12px
- Button: "Selesai Mengajar" — outline, full-width on mobile
- Confirms with modal: "Yakin selesai? Member belum diabsen akan ditandai Alpha otomatis."

### Multi-Coach Indicator

If team teaching with multiple coaches:
- Top of page shows: "Mengajar bersama: [Coach Sari] [Coach Budi]"
- Live indicator if other coach is also active in this session
- Realtime updates: when another coach scans, attendance count updates immediately

---

## 5. Coach Kelas (`/c/kelas`)

### List View

```
┌─────────────────────────────────────────────────────────┐
│ Kelas yang Saya Ajar                                    │
├─────────────────────────────────────────────────────────┤

[FILTER: Semua / Aktif Hari Ini / Mendatang]

┌─────────────────────────────────────────────────────────┐
│  Kelas Beginner Level                                   │
│  📅 Sen, Rab, Jum • 🕐 16:00 - 17:00                    │
│  📍 Kolam Pusat • 👥 12 / 15 member                     │
│                                                         │
│  Total absensi bulan ini: 24 sesi (94% rate)           │
│                                                         │
│  [Lihat Detail]                                         │
└─────────────────────────────────────────────────────────┘
```

Standard class card pattern. See member jadwal for similar.

### Detail View `/c/kelas/[id]`

```
[Header with class name, schedule, location]

[STATS]
[12 Member] [Avg Attendance 94%] [24 Sessions/month]

[TABS: Member / Jadwal / Performa]

[TAB: Member]
List of all enrolled members with:
- Avatar, name, age
- Attendance rate this month (%)
- Last attended date
- Quick action: WA, view detail

[TAB: Jadwal]
Calendar view showing recent + upcoming sessions

[TAB: Performa]
Stats overview, top performers, attendance trends
```

---

## 6. Coach Member (`/c/member`)

Aggregated list across all classes coach teaches.

```
┌─────────────────────────────────────────────────────────┐
│ Member Binaan Saya                                      │
│ 32 member dari 3 kelas                                  │
├─────────────────────────────────────────────────────────┤

[Search: 🔍 Cari nama atau ID]
[Filter: Semua Kelas ▾]

┌─────────────────────────────────────────────────────────┐
│ ┌──┐                                                    │
│ │A │ Andi Pratama                              [WA]    │
│ └──┘ NSS-0001-2025 • Beginner • Attendance 94%          │
│      Terakhir hadir: 8 Mar                              │
└─────────────────────────────────────────────────────────┘

(more rows)
```

### Member Detail `/c/member/[id]`

```
[Profile Header: Avatar 96px, Name, ID, Age]

[Stats: Attendance Rate, Total Sessions, Membership since]

[TABS: Profil / Riwayat Absensi / Catatan]

[TAB: Profil]
Read-only view of member info (relevant subset)
- Nama, Tanggal lahir, Jenis kelamin
- Kelas yang diikuti
- Kontak (parent/self)
- Riwayat penyakit (relevant for safety)
- Quick actions: [Hubungi via WA] [Lihat QR Member]

[TAB: Riwayat Absensi]
Last 10 attendance records with date, status, time

[TAB: Catatan]
Phase 2: notes coach can write about member
Phase 1: skip or read-only
```

---

## 7. Coach QR (`/c/qr`)

Same fullscreen pattern as member QR but for coach identification.

```
[Same fullscreen layout]

[QR with coach token]
COACH BUDI SANTOSO
NSS-C001-2025
Spesialis: Beginner, Anak-anak
```

Coach QR has different purpose: rare verification scenarios, optional show.

---

## 8. Coach Profil (`/c/profil`)

### Layout

```
[Profile header with avatar 120px, name, code]

[INFORMASI PRIBADI]
- Nama lengkap, panggilan, dob, gender, phone
- Email, alamat

[SPESIALISASI]
- Tags: Beginner, Anak-anak, Gaya Bebas

[CABANG MENGAJAR]
- List branches assigned to this coach (Phase 1: 1 branch)
- Phase 2: multi-branch with primary indicator

[SERTIFIKAT]
┌─────────────────────────────────────────────────────────┐
│ ✓ Sertifikasi Pelatih Renang Indonesia                  │
│   Diterbitkan 2018 • Berlaku hingga 2026                │
│   [Lihat Foto]                                          │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ ✓ FINA Coaching Level 2                                 │
│   Diterbitkan 2020 • Tidak ada batas waktu              │
│   [Lihat Foto]                                          │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ ⏳ CPR Certification                                     │
│   Diterbitkan 2023 • Status: Menunggu approval          │
│   [Lihat Foto]                                          │
└─────────────────────────────────────────────────────────┘

[+ Tambah Sertifikat] (ghost button — Phase 2 feature)

[STATS KARIR]
- Total kelas diajar: 12
- Total member binaan: 156
- Bergabung sejak: Jan 2020
```

### Specs

- Sertifikat row card: padding 20px, border 1px `--neutral-200`
- Status icon left:
  - Approved (green check): bg `--success-50`, text `--success-700`
  - Pending: bg `--warning-50`, text `--warning-700`, with clock icon
  - Rejected: bg `--danger-50`, text `--danger-700`
- "Lihat Foto" opens modal with full-size cert image

### Edit Mode

Phase 1: limited edit (request approval flow):
- Phone, address, photo can be requested for edit
- Submit goes to admin approval queue
- Other fields require admin to change

---

## 9. Coach Notifikasi (`/c/notifikasi`)

Same pattern as Member Notifikasi but with coach-relevant items:
- Class assignment changes
- Sertifikat approved/rejected
- Member request to join class
- Schedule changes
- Admin announcements

---

## 10. Coach Pengaturan (`/c/pengaturan`)

Same pattern as Member Pengaturan:
- Change password
- Notification preferences
- Privacy
- Logout

Plus:
- Branch preference (if multi-branch, Phase 2)
- Language preference (Phase 4)

---

## Coach-Specific Patterns

### Live Indicators (Sport-Tech Signature)

Used heavily in coach panel:

```html
<span class="inline-flex items-center gap-2">
  <span class="relative flex h-2 w-2">
    <span class="animate-ping absolute inset-0 rounded-full bg-success-500 opacity-75"></span>
    <span class="relative rounded-full h-2 w-2 bg-success-500"></span>
  </span>
  <span class="text-label-sm text-success-700">Sedang Berlangsung</span>
</span>
```

Used for: active class, currently scanning, live attendance count.

### Big Numbers Stats

Coach dashboard heavily uses big stat numbers (sport-tech aesthetic):
- "12 / 15" attendance count
- "94%" attendance rate
- Numbers always tabular-nums, weight 900

### Quick Actions FAB (Floating Action Button)

On `/c/absensi/[id]` Tab Manual mode:
- Floating button bottom-right
- Round 56px, `--accent-400` bg, white camera icon
- Opens scan QR mode quickly (jump back to scan tab)
- Hidden when on scan tab

### Optimistic UI Updates

When coach taps a status:
- UI updates instantly (optimistic)
- Server saves in background
- If fails: toast error + revert UI
- Reduces perceived latency on slow mobile data

### Realtime Updates

Multiple coaches editing same class:
- Use Supabase realtime subscription
- When another coach marks a member, UI updates without refresh
- Visual indicator: brief flash on the row that changed

### Mobile-Critical Optimizations

1. **Camera permission preserve** — once granted, persist to localStorage so re-prompt isn't needed
2. **Auto-focus inputs** when navigating to forms
3. **Large tap targets** — 48×48px minimum for any action button
4. **Sticky bottom action bars** — primary action always reachable on long pages
5. **Pull-to-refresh** on dashboard (Phase 2 PWA)
6. **Wake lock** during scan QR session — prevent screen lock mid-scan
7. **Vibration feedback** on successful scan (Vibration API)
8. **Network-aware** — show "offline mode" banner when disconnected, cache attendance locally

### Touch Gestures

- Swipe left on member row in checklist: quick "Hadir" mark
- Swipe right: quick "Alpha" mark
- Long press: open context menu
- Pull down: refresh list
- (Phase 2 PWA features)

---

**Document version:** 1.0
**Next:** see `UI_ADMIN.md` for admin panel pages.
