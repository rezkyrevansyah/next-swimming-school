# UI_MEMBER.md

> **Per-page UI design instructions for Member Panel (`/m/*`).**
> Inherits foundation from `UI_DESIGN_SYSTEM.md`. Read that first.
>
> Pages covered: Dashboard, QR, Jadwal, Absensi, Coach, Profil, Notifikasi, Pengaturan

---

## Global Member Layout

### Mobile-First Approach (Member panel is mobile-priority)

#### Mobile (<1024px)

```
┌─────────────────────────────────┐
│ [Logo] Halo, Andi      [🔔][👤] │  <- top header 56px
├─────────────────────────────────┤
│                                 │
│  [Page content]                 │
│                                 │
│                                 │
│                                 │
│                                 │
├─────────────────────────────────┤
│ [🏠] [📅] [📋] [👥] [⚙]        │  <- bottom nav 64px
│ Home Jadwal Absen Coach Profil  │
└─────────────────────────────────┘
```

**Top Header (56px):**
- Background: white, border-bottom 1px `--neutral-200`
- Logo: 32px height left
- Greeting: text-label-md "Halo, {nama_panggilan}!" center-left
- Right icons: bell (notifications) + avatar (profile dropdown)
- Padding: 16px horizontal

**Bottom Nav (64px + safe-area):**
- Background: white, border-top 1px `--neutral-200`
- 5 tabs equally spaced
- Each tab: icon 24px + label text-label-xs
- Active tab: `--primary-600` icon + label
- Inactive: `--neutral-400` icon + label
- Active indicator: 3px line on top of active tab in `--accent-400` (4px width)

#### Desktop (≥1024px)

```
┌──────────────────────────────────────────────────────┐
│ [Logo]        [Beranda Jadwal Absen Coach]  [🔔][👤] │  <- header 72px
├──────────────────────────────────────────────────────┤
│                                                      │
│  [Page content max-width 1280px]                     │
│                                                      │
└──────────────────────────────────────────────────────┘
```

**Top Header (72px):**
- Same structure but horizontal nav center
- Active link: text `--primary-600` + underline 2px `--accent-400` offset -16px
- No bottom nav
- User dropdown on right with: Profil, Pengaturan, Notifikasi, Logout

---

## 1. Member Dashboard (`/m/dashboard`)

### Page Structure

```
┌─────────────────────────────────────────────────────────┐
│ Selamat datang kembali, Andi! 👋                        │  <- greeting card
│ Kelas berikutnya dalam 2 hari, 4 jam                    │
└─────────────────────────────────────────────────────────┘

┌──────────────────────────┐  ┌──────────────────────────┐
│ MY QR CODE               │  │ KELAS BERIKUTNYA         │
│                          │  │                          │
│  [QR Preview small 80px] │  │ Beginner Level           │
│                          │  │ Senin, 10 Mar • 16:00    │
│  [Tampilkan QR →]        │  │ Coach Budi               │
│  (xl accent button)      │  │ Kolam Pusat              │
│                          │  │                          │
│                          │  │ [Detail kelas →]         │
└──────────────────────────┘  └──────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ STATS BULAN INI                                         │
│                                                         │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐    │
│ │ HADIR    │ │ ATTENDANCE│ │ IZIN     │ │ ALPHA    │   │
│ │          │ │           │ │          │ │          │    │
│ │   12     │ │   94%     │ │    1     │ │    0     │    │
│ │          │ │           │ │          │ │          │    │
│ │ dari 13  │ │ rate      │ │ kali     │ │ kali     │    │
│ └──────────┘ └──────────┘ └──────────┘ └──────────┘    │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ COACH SAYA                                              │
│                                                         │
│ ┌──────┐  Coach Budi Santoso                            │
│ │Avatar│  Spesialis: Beginner, Anak-anak                │
│ │      │                                                │
│ └──────┘  [Hubungi via WhatsApp]                        │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ AKTIFITAS TERBARU                                       │
│                                                         │
│ ✓ Hadir di Kelas Beginner — 8 Mar, 16:00              │
│ ✓ Hadir di Kelas Beginner — 6 Mar, 16:00              │
│ ✓ Hadir di Kelas Beginner — 4 Mar, 16:00              │
│ ✕ Izin di Kelas Beginner — 1 Mar (sakit)              │
│                                                         │
│ [Lihat Semua →]                                         │
└─────────────────────────────────────────────────────────┘
```

### Component Specs

#### Greeting Card
- Background: gradient from `--primary-700` to `--primary-600` 135deg
- Subtle wave pattern overlay (decorative SVG, low opacity)
- Padding: 24px
- Radius: lg
- Heading: text-heading-xl white
- Subtitle: text-body-md `--neutral-200`
- Mobile: stacked, padding 20px

#### QR Code Quick Card
- Card: white, radius-lg, padding 24px, shadow-sm
- Label "MY QR CODE": text-label-xs uppercase color `--accent-500`
- Mini QR preview: 80px, on accent-50 bg square
- Big CTA button "Tampilkan QR": accent-400 bg, dark text, height 56px, full-width on mobile
- Hover: shadow-md
- Click → navigate to `/m/qr` with fullscreen mode

#### Next Class Card
- Card: white, radius-lg, padding 24px, shadow-sm
- Label "KELAS BERIKUTNYA": text-label-xs uppercase color `--accent-500`
- Class name: text-heading-md
- Date+time: text-body-md weight 600
- Coach: text-body-sm with avatar 24px inline
- Location: text-body-sm with MapPin icon
- "Detail kelas →": text-link primary-600, hover underline

#### Stats Cards (4 cards)

This is the **sport-tech signature** component. Use bold typography.

```
┌─────────────────────┐
│ HADIR        [↑]    │  <- label uppercase + trend indicator (optional)
│                     │
│  12                 │  <- HUGE number, weight 900, 48px
│                     │
│ dari 13 sesi        │  <- caption secondary
└─────────────────────┘
```

- Card: white, radius-lg, padding 24px, shadow-sm
- Label: text-label-xs uppercase `--neutral-500`
- Number: text 48px, weight 900, color `--neutral-800`, tabular-nums, letter-spacing -0.03em
- Caption: text-body-sm `--neutral-500`
- Optional: 4px left border `--accent-400` for highlighted metric (Attendance Rate)
- Mobile: 2 columns grid, padding 16px
- Trend indicator (optional): small badge top-right with ↑/↓ icon and percentage

#### Coach Card
- Card: white, radius-lg, padding 20px
- Avatar: 64px circle
- Name: text-heading-md
- Specialization: text-label-sm uppercase `--accent-500`
- WA button: outline accent, height 40px, with WhatsApp icon
- Mobile: stacked, full-width WA button

#### Activity Feed
- Card: white, radius-lg, padding 24px
- Section title: text-label-sm uppercase
- List items: padding 12px vertical, border-bottom `--neutral-100` (last no border)
- Item layout: status icon (16px) + text + date right-aligned
- Status icons:
  - Hadir: ✓ in `--success-500`
  - Late: ⌛ in `--warning-500`
  - Izin: ⏸ in `--info-500`
  - Sakit: 🤒 in `--neutral-500`
  - Alpha: ✕ in `--danger-500`
- "Lihat Semua →" link bottom

### Loading State
- Greeting card: skeleton 80px height
- Stats cards: 4 skeleton cards (or 2 on mobile)
- Other cards: shimmer skeletons

### Empty States

If member has no classes yet:
```
[Icon: Calendar 64px neutral-300]
Belum ada kelas yang diikuti
Hubungi admin untuk mulai bergabung dengan kelas
[Hubungi Admin via WA] (primary button)
```

If no attendance history yet (just joined):
```
[Icon: ClipboardCheck 48px neutral-300]
Belum ada riwayat absensi
Datang ke kelas pertama kamu untuk mulai!
```

---

## 2. Member QR Code (`/m/qr`)

### Fullscreen QR Mode

```
┌─────────────────────────────────────────┐
│ [×] Tutup                  [🔆 Brighten]│  <- header 56px black bg
├─────────────────────────────────────────┤
│                                         │
│                                         │
│                                         │
│      ┌───────────────────────┐          │
│      │                       │          │
│      │                       │          │
│      │     [QR CODE 280px]   │          │
│      │                       │          │
│      │                       │          │
│      └───────────────────────┘          │
│                                         │
│      ANDI PRATAMA                       │
│      NSS-0001-2025                      │
│      Kelas Beginner                     │
│                                         │
│      ⟳ Otomatis refresh tiap 30 detik  │
│      [Progress bar fill animating]      │
│                                         │
│                                         │
└─────────────────────────────────────────┘
```

### Specs

**Background:**
- Pure white (max contrast for QR)
- OR brand gradient (subtle): linear-gradient `--primary-50` to white

**Header (56px):**
- Black background (better for fullscreen feel)
- Close X icon left, white color
- Brightness toggle right (uses Wake Lock API to keep screen on)
- Tap close to exit fullscreen

**QR Code:**
- Size: 280px square (large for easy scan)
- White bg with 16px white padding inside (frame for QR)
- Subtle shadow: shadow-lg
- Use `qrcode.react` with high error correction level
- Token: rotates every 30 seconds via TanStack Query refetch

**Below QR:**
- Member name: text-display-sm weight 800 uppercase letter-spacing 0.04em
- Member ID: text-label-md `--neutral-500` mono font
- Active class: text-body-md `--neutral-600`

**Auto-refresh indicator:**
- Text "⟳ Otomatis refresh tiap 30 detik"
- Progress bar: 4px height, full-width 240px, `--accent-400` fill animating from 0 to 100% over 30 sec, then resets
- Pulse animation when refreshing

**Brightness:**
- Use `wake-lock` API where supported to prevent screen lock
- Button toggles brightness boost via JS (where supported)

**Mobile considerations:**
- Force portrait orientation (CSS `orientation: portrait`)
- Hide bottom nav and any chrome
- Swipe down to close (gesture)
- Take advantage of full screen height

**Token rotation logic:**
- On page mount: generate token, set 30s timer
- Every 30s: regenerate token, refresh QR
- Clean up on unmount

---

## 3. Member Jadwal (`/m/jadwal`)

Phase 1 = simple list view. Calendar view in Phase 2.

### Layout

```
┌─────────────────────────────────────────────────────────┐
│ Jadwal Saya                                             │  <- page title
│ Daftar kelas yang kamu ikuti                            │  <- subtitle
├─────────────────────────────────────────────────────────┤

[KELAS YANG DIIKUTI] (label uppercase)

┌─────────────────────────────────────────────────────────┐
│  [Color accent stripe left 4px]                         │
│  Kelas Beginner Level                                   │
│  📅 Sen, Rab, Jum • 🕐 16:00 - 17:00                    │
│  📍 Kolam Cabang Pusat                                  │
│  👤 Coach Budi Santoso                                  │
│                                                         │
│  6 sesi/bulan • Rp 2.000.000/bulan                     │
│                                                         │
│  [Detail Kelas]                                         │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  Kelas Intermediate                                     │
│  📅 Sel, Kam • 🕐 17:00 - 18:00                         │
│  📍 Kolam Cabang Pusat                                  │
│  👤 Coach Sari                                          │
│                                                         │
│  4 sesi/bulan • Rp 2.500.000/bulan                     │
│                                                         │
│  [Detail Kelas]                                         │
└─────────────────────────────────────────────────────────┘

[KELAS HARI INI] (if any)

┌─────────────────────────────────────────────────────────┐
│ ● Sedang berlangsung                                    │  <- live indicator
│ Kelas Beginner • 16:00 - 17:00                          │
│ Coach Budi Santoso                                      │
│ Kolam Cabang Pusat                                      │
└─────────────────────────────────────────────────────────┘

[KELAS BERIKUTNYA MINGGU INI]

[Mini cards listing upcoming sessions with date+time]
```

### Class Card Specs

- Card: white, radius-lg, padding 24px
- Left accent stripe 4px solid `--accent-400` (sport-tech signature)
- Hover: shadow-md
- Class name: text-heading-md
- Schedule line: icon 16px + text-body-md, color `--neutral-700`
- Coach inline with avatar 24px
- Bottom: price + sessions info, smaller text
- Action button: outline primary

### Today's Class Card (special)

If a class is happening today:
- Card: bg `--accent-50`, border 2px `--accent-300`
- "● Sedang berlangsung" with pulse animation if currently in time window
- Or "Akan dimulai dalam 30 menit" countdown if upcoming today

### Empty State

```
[Icon: Calendar 64px]
Belum ada kelas yang diikuti
Hubungi admin untuk bergabung dengan kelas pertama kamu
[Hubungi Admin via WA]
```

---

## 4. Member Absensi (`/m/absensi`)

### Layout

```
┌─────────────────────────────────────────────────────────┐
│ Riwayat Absensi                                         │
├─────────────────────────────────────────────────────────┤

[STATS RINGKASAN] (4 stat cards)
[Hadir 24] [Late 2] [Izin 1] [Alpha 0]

[FILTERS]
┌─────────────────────────────────────────────────────────┐
│ [📅 Maret 2025 ▾]  [Kelas: Semua ▾]  [Status: Semua ▾] │
└─────────────────────────────────────────────────────────┘

[ATTENDANCE LIST]

┌─────────────────────────────────────────────────────────┐
│ [Hadir]                                       08 Mar    │
│ Kelas Beginner • Coach Budi                  16:02 WIB  │
│ Status: Tepat waktu                                     │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ [Late]                                        06 Mar    │
│ Kelas Beginner • Coach Budi                  16:18 WIB  │
│ Status: Terlambat 18 menit                              │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ [Izin]                                        04 Mar    │
│ Kelas Beginner • Coach Budi                             │
│ Catatan: Sakit demam                                    │
└─────────────────────────────────────────────────────────┘

[Pagination if many records]
```

### Specs

#### Stats Summary
- 4 cards horizontal scroll on mobile, 4 columns desktop
- Smaller version of stat cards
- Uses semantic colors:
  - Hadir: success
  - Late: warning  
  - Izin: info
  - Alpha: danger

#### Filters
- Sticky below header on scroll
- Background: white, border-bottom
- Date picker: range or by month
- Dropdowns: shadcn select
- Mobile: chips that open bottom sheet for selection

#### Attendance Row Card
- Card: white, radius-md, padding 20px, border 1px `--neutral-200`
- Status badge: top-left, semantic color (Hadir green, Late yellow, etc.)
- Date: top-right, text-label-md weight 600
- Class info: middle, text-body-md
- Time/notes: bottom, text-body-sm `--neutral-500`
- Hover (clickable for detail modal): shadow-sm

#### Empty State

```
[Icon: ClipboardCheck 64px]
Belum ada riwayat absensi
Datang ke kelas pertamamu untuk mulai mencatat absensi
```

#### Filter empty state (no results match):
```
[Icon: SearchX 48px]
Tidak ada absensi sesuai filter
Coba ubah filter untuk melihat data lain
[Reset Filter]
```

---

## 5. Member Coach (`/m/coach`)

### Layout

```
┌─────────────────────────────────────────────────────────┐
│ Pelatih Saya                                            │
├─────────────────────────────────────────────────────────┤

[PELATIH AKTIF] (label)

┌─────────────────────────────────────────────────────────┐
│  ┌──────────┐                                           │
│  │ Avatar   │  Coach Budi Santoso                       │
│  │  120px   │  [BEGINNER COACH] [ANAK-ANAK]            │
│  │          │                                           │
│  └──────────┘  📅 Mengajar di: Kelas Beginner Level     │
│                                                         │
│  📍 NSS Pusat                                           │
│  📱 +62 812 3456 7890                                   │
│                                                         │
│  Pengalaman:                                            │
│  • Sertifikasi Pelatih Renang Indonesia                 │
│  • 8 tahun pengalaman                                   │
│  • Spesialis pemula & anak-anak                         │
│                                                         │
│  [Hubungi via WhatsApp →]  [Lihat Profil Lengkap]      │
└─────────────────────────────────────────────────────────┘

(Repeat card for each coach in member's classes)
```

### Specs

- Card: white, radius-xl, padding 32px, shadow-sm
- Avatar: 120px circle
- Name: text-heading-lg
- Specialization badges: pill-style accent badges
- Info lines: icon + text, gap 12px
- Experience list: bullet points body-md
- WA button: primary accent, with WhatsApp icon
- Profile link: ghost button

#### Mobile
- Stacked: avatar centered top, name below, info, then buttons
- Avatar 96px

---

## 6. Member Profil (`/m/profil`)

### Layout

```
┌─────────────────────────────────────────────────────────┐
│ Profil Saya                                             │
├─────────────────────────────────────────────────────────┤

┌─────────────────────────────────────────────────────────┐
│  ┌──────────┐                                           │
│  │ Avatar   │  Andi Pratama                             │
│  │ 120px    │  NSS-0001-2025                            │
│  │ [📷 edit]│  Kelas: Beginner, Intermediate            │
│  └──────────┘                                           │
│                                                         │
│  [Status: Aktif]                                        │
└─────────────────────────────────────────────────────────┘

[INFORMASI PRIBADI]                          [✏ Edit]

┌─────────────────────────────────────────────────────────┐
│ Nama Lengkap          Andi Pratama                      │
│ Nama Panggilan        Andi                              │
│ Tanggal Lahir         15 Mei 2010 (15 tahun)            │
│ Jenis Kelamin         Laki-laki                         │
│ Alamat                Jl. Mawar No. 5, Bekasi           │
└─────────────────────────────────────────────────────────┘

[INFORMASI KONTAK]                           [✏ Edit]

┌─────────────────────────────────────────────────────────┐
│ Email                 andi@email.com                    │
│ Nomor HP              +62 812 3456 7890 (Orang Tua)     │
│ Nama Orang Tua        Bapak Joko Pratama                │
│ Nomor Tambahan        +62 813 5678 9012                 │
└─────────────────────────────────────────────────────────┘

[INFORMASI MEDIS]

┌─────────────────────────────────────────────────────────┐
│ Riwayat Penyakit                                        │
│ Asma ringan (terkontrol). Tidak ada alergi makanan.    │
│                                                         │
│ Informasi dijaga kerahasiaannya 🔒                     │
└─────────────────────────────────────────────────────────┘
```

### Edit Mode (Phase 1: simple direct update with admin approval flag)

When clicking [✏ Edit]:
- Section becomes editable inline
- Save button + Cancel button at bottom
- On save: shows toast "Permintaan edit dikirim. Menunggu approval admin."
- (Note: Phase 1 simple, Phase 2 has full approval workflow)

### Profile Card

- Big card: white, radius-xl, padding 32px
- Avatar: 120px with camera icon overlay (photo edit, requires admin approve)
- Status badge: success (Aktif) or danger (Inactive)

### Info Sections

- Each section: card, padding 24px, radius-lg
- Section header: heading-md left + Edit icon right
- Content: 2-column grid (label-value pairs) or stacked on mobile
- Label: text-label-sm uppercase color `--neutral-500`
- Value: text-body-md weight 500 color `--neutral-800`

### Health Info

- Highlighted: bg `--neutral-50`, padding 24px
- Lock icon footer note about confidentiality

---

## 7. Member Notifikasi (`/m/notifikasi`)

### Layout

```
┌─────────────────────────────────────────────────────────┐
│ Notifikasi                              [Tandai semua] │
├─────────────────────────────────────────────────────────┤

[FILTER TABS]
[Semua (5)] [Belum dibaca (2)] [Penting]

[NOTIFICATION LIST]

┌─────────────────────────────────────────────────────────┐
│ ●  💰 Pembayaran Bulan Maret                            │  <- unread dot
│    Tagihan bulan Maret sudah jatuh tempo. Segera bayar  │
│    untuk hindari denda.                                 │
│    2 jam lalu                       [Lihat Detail →]    │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ ●  📋 Jadwal Berubah                                    │
│    Kelas Beginner besok dipindah jam 17:00 (dari 16:00) │
│    1 hari lalu                                          │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│    ✓ Pembayaran Diterima                                │  <- read (no dot)
│    Pembayaran bulan Februari diterima. Terima kasih!    │
│    1 minggu lalu                                        │
└─────────────────────────────────────────────────────────┘
```

### Specs

#### Notification Item
- Card: white, radius-md, padding 16px, border 1px `--neutral-200`
- Unread: bg `--primary-50`, blue dot left, weight 600 title
- Read: white bg, no dot, weight 400 title
- Icon emoji or Lucide icon left
- Title: text-body-md weight 600 (unread) / 500 (read)
- Body: text-body-sm `--neutral-600`
- Timestamp: text-body-xs `--neutral-400`
- Action link right: text-link primary

#### Tap behavior
- Tap to mark as read (instant)
- Tap action link → navigate to relevant page

#### Empty State
```
[Icon: Bell 64px]
Belum ada notifikasi
Notifikasi akan muncul di sini saat ada update
```

---

## 8. Member Pengaturan (`/m/pengaturan`)

### Layout

```
┌─────────────────────────────────────────────────────────┐
│ Pengaturan                                              │
├─────────────────────────────────────────────────────────┤

[KEAMANAN AKUN]

┌─────────────────────────────────────────────────────────┐
│ Ubah Password                                       [→] │
│ Terakhir diubah: 1 bulan lalu                           │
└─────────────────────────────────────────────────────────┘

[NOTIFIKASI]

┌─────────────────────────────────────────────────────────┐
│ Notifikasi In-app                       [Toggle ON]     │
│ Terima notifikasi langsung di aplikasi                  │
├─────────────────────────────────────────────────────────┤
│ Notifikasi Email                        [Toggle ON]     │
│ Terima email untuk hal penting                          │
├─────────────────────────────────────────────────────────┤
│ Reminder Kelas                          [Toggle ON]     │
│ Pengingat sebelum kelas dimulai                         │
└─────────────────────────────────────────────────────────┘

[PRIVASI]

┌─────────────────────────────────────────────────────────┐
│ Lihat Kebijakan Privasi                             [→] │
│ Lihat Syarat & Ketentuan                            [→] │
└─────────────────────────────────────────────────────────┘

[ZONA BAHAYA]

┌─────────────────────────────────────────────────────────┐
│ Keluar dari Akun                                        │
│ [Logout] (danger button)                                │
└─────────────────────────────────────────────────────────┘
```

### Specs

#### Setting Row
- Card section, padding 20px
- Title: text-body-md weight 600
- Description: text-body-sm `--neutral-500`
- Toggle: shadcn switch component, brand colored
- Arrow link: ChevronRight `--neutral-400`

#### Toggle States
- ON: bg `--primary-600`, white circle right
- OFF: bg `--neutral-300`, white circle left
- Hover: subtle scale 1.02
- Disabled: opacity 0.5

#### Change Password Modal

```
┌─────────────────────────────────────────┐
│ Ubah Password                       [×] │
├─────────────────────────────────────────┤
│                                         │
│ Password Lama *                         │
│ [_______________________________ 👁]    │
│                                         │
│ Password Baru *                         │
│ [_______________________________ 👁]    │
│ Min. 8 karakter, kombinasi huruf+angka │
│                                         │
│ Konfirmasi Password Baru *              │
│ [_______________________________ 👁]    │
│                                         │
│ [Batal] [Simpan Password Baru]          │
└─────────────────────────────────────────┘
```

- Standard form, validation inline
- Submit: server action calls Supabase Auth update password
- Success: toast "Password berhasil diubah"

#### Logout Confirmation

```
┌─────────────────────────────────────────┐
│ Yakin Ingin Keluar?                     │
├─────────────────────────────────────────┤
│ Kamu akan dikeluarkan dari aplikasi.   │
│ Login lagi dengan email dan password.  │
│                                         │
│ [Batal] [Ya, Keluar] (danger)           │
└─────────────────────────────────────────┘
```

---

## Common Patterns Across Member Panel

### Loading States
- Page header: skeleton
- Cards: shimmer skeletons matching layout
- Stats: skeleton numbers

### Error States
- Toast for action errors
- Inline error message for form errors
- Full-page error for critical (e.g. data fetch fail): "Gagal memuat data" + retry button

### Touch Targets
- All buttons min 44×44px on mobile
- Tab targets min 48×48px in bottom nav
- List item tap targets full-row clickable

### Pull to Refresh (Phase 2 PWA)
- Phase 1: skip
- Phase 2: native pull-to-refresh on dashboard, jadwal, absensi

### Offline Behavior (Phase 1)
- Show toast: "Tidak ada koneksi internet"
- Cached data still accessible (TanStack Query staleTime)
- QR page especially: should work offline (token signed offline)

### Responsiveness Notes
- All pages designed mobile-first
- Stat cards: 2 cols mobile, 4 cols desktop
- Member info: stacked mobile, 2-col grid desktop
- Action buttons: full-width mobile, auto-width desktop

---

**Document version:** 1.0
**Next:** see `UI_COACH.md` for coach panel pages.
