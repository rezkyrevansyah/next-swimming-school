# Performance Guide — Yoonjaespace

Dokumen ini menjelaskan **mengapa project ini terasa cepat dan responsif** — navigasi sat-set, tidak ada blank screen, loading state langsung muncul. Semua konsep di sini diambil langsung dari kode project ini dan bisa diterapkan ke project Next.js lainnya.

---

## Formula Performa

> **Cepat bukan berarti tidak ada loading — cepat berarti user tidak pernah menunggu tanpa tahu apa yang terjadi.**

Ada 7 pilar yang bekerja bersama:

1. **Server Components** — data di-fetch di server, bukan di browser
2. **Parallel Fetching** — semua query jalan serentak, bukan satu per satu
3. **Caching Dua Lapis** — data master di-cache agar tidak bolak-balik ke database
4. **Loading UI Instan** — skeleton + progress bar muncul sebelum data datang
5. **Lean Database Queries** — hanya kolom yang dibutuhkan yang diambil
6. **PWA & Image Optimization** — aset di-cache di browser, gambar dalam format modern
7. **Perceived Performance** — animasi 180ms yang membuat transisi terasa smooth

---

## Pilar 1: Server Components & Data Fetching

### Konsep

Next.js App Router memiliki dua jenis komponen:
- **Server Component** — render di server, data di-fetch sebelum HTML dikirim ke browser
- **Client Component** — render di browser, perlu JavaScript tambahan, data di-fetch via API

Mayoritas project yang lambat melakukan data fetching di Client Component dengan `useEffect`:

```tsx
// ❌ Anti-pattern — lambat
"use client"
function BookingsPage() {
  const [bookings, setBookings] = useState([])
  
  useEffect(() => {
    // Browser muat halaman dulu → baru fetch data → baru tampil
    fetch('/api/bookings').then(res => res.json()).then(setBookings)
  }, [])
  
  return <div>{bookings.map(...)}</div>
}
```

Problem: user melihat halaman kosong dulu, baru data muncul. Ada dua round-trip: browser muat JS, baru JS fetch data.

### Pattern yang Dipakai di Project Ini

```tsx
// ✅ Pattern ini — cepat
// src/app/(dashboard)/dashboard/page.tsx

export default async function DashboardPage() {
  // Data sudah ada sebelum HTML dikirim ke browser
  const { data: bookings } = await supabase
    .from("bookings")
    .select("id, booking_number, start_time, end_time, status")
    .eq("booking_date", today)

  // HTML sudah berisi data — tidak perlu fetch lagi di browser
  return <div>{bookings.map(...)}</div>
}
```

### Aturan Pembagian

| Gunakan **Server Component** untuk... | Gunakan **Client Component** untuk... |
|---------------------------------------|---------------------------------------|
| Fetch data dari database | Form dengan validasi real-time |
| Tampilkan data statis | Pagination dengan klik tombol |
| Auth check (requireMenu) | Filter/search dengan state lokal |
| Semua `page.tsx` dan `layout.tsx` | Modal, dropdown, drawer |

Pattern di project ini:
```
page.tsx (Server) → fetch data → pass ke _components/*-client.tsx (Client)
```

---

## Pilar 2: Parallel Fetching dengan `Promise.all()`

### Konsep

Jika ada 6 query yang tidak saling bergantung, jangan jalankan satu per satu:

```ts
// ❌ Anti-pattern — waterfall, lambat
const user = await getCurrentUser()          // 50ms
const bookings = await getBookings()         // 80ms
const studioInfo = await getStudioInfo()     // 30ms
// Total: 160ms — berurutan!
```

Jalankan semua serentak:

```ts
// ✅ Pattern ini — paralel, cepat
const [user, bookings, studioInfo] = await Promise.all([
  getCurrentUser(),    // ─┐
  getBookings(),       //  ├── jalan bersamaan
  getStudioInfo(),     // ─┘
])
// Total: ~80ms — selambat query paling lambat saja
```

### Contoh Nyata: Dashboard (6 query paralel)

```ts
// src/app/(dashboard)/dashboard/page.tsx

const [
  { count: totalBookings },   // 1. Hitung booking bulan ini
  { data: revenueRows },      // 2. Revenue booking lunas
  { count: belumLunas },      // 3. Hitung yang belum bayar
  { data: todayBookings },    // 4. Jadwal hari ini
  { data: printOrderRows },   // 5. Status print order
  studioInfo,                 // 6. Info studio (dari cache)
] = await Promise.all([
  supabase.from("bookings").select("id", { count: "exact", head: true })
    .gte("booking_date", monthStart).lte("booking_date", monthEnd),

  supabase.from("bookings").select("total")
    .gte("booking_date", monthStart).lte("booking_date", monthEnd)
    .in("status", PAID_STATUSES),

  supabase.from("bookings").select("id", { count: "exact", head: true })
    .gte("booking_date", monthStart).eq("status", "BOOKED"),

  supabase.from("bookings")
    .select("id, booking_number, start_time, end_time, status, customers(name), packages(name)")
    .eq("booking_date", today).not("status", "in", '("CANCELED")').order("start_time"),

  supabase.from("bookings").select("print_order_status")
    .in("print_order_status", ["SELECTION", "VENDOR", "PACKING", "SHIPPED"]),

  getCachedStudioInfo(),
]);
```

### Contoh Nyata: New Booking (13 query paralel)

```ts
// src/app/(dashboard)/bookings/new/page.tsx

const [
  currentUser,
  packages,
  backgrounds,
  addons,
  leads,
  photoFors,
  customFields,
  settingsGeneral,
  holidays,
  users,
  domiciles,
  packageCategories,
  addonCategories,
] = await Promise.all([
  requireMenu("bookings"),
  getCachedPackages(),        // dari cache — instant
  getCachedBackgrounds(),     // dari cache — instant
  getCachedAddons(),          // dari cache — instant
  getCachedLeads(),           // dari cache — instant
  getCachedPhotoFor(),        // dari cache — instant
  getCachedCustomFields(),    // dari cache — instant
  getCachedSettingsGeneral(), // dari cache — instant
  getCachedHolidays(),        // dari cache — instant
  getCachedActiveUsers(),     // dari cache — instant
  getCachedDomiciles(),       // dari cache — instant
  getCachedPackageCategories(),
  getCachedAddonCategories(),
]);
```

13 query → waktu = selambat query paling lambat (bukan total semua query).

---

## Pilar 3: Caching Dua Lapis

### Konsep

Data yang jarang berubah (paket foto, background, setting studio, dll.) tidak perlu di-fetch ulang setiap kali ada user yang buka halaman.

Project ini menggunakan dua lapisan cache:

| Lapisan | Fungsi | Scope |
|---------|--------|-------|
| `unstable_cache()` | Simpan hasil query di server cache | Lintas request — semua user berbagi cache ini |
| `React.cache()` | Deduplikasi dalam satu request | Per request — jika fungsi sama dipanggil 2x, hanya 1 DB hit |

### Implementasi di Project Ini

```ts
// src/lib/cached-queries.ts

import { unstable_cache } from "next/cache";
import { cache } from "react";
import { createAdminClient } from "@/utils/supabase/admin";

// Layer 1: unstable_cache — simpan di server cache, berlaku 1 jam
const _getCachedStudioInfo = unstable_cache(
  async () => {
    // PENTING: Harus pakai admin client (service role), bukan client biasa.
    // unstable_cache tidak bisa akses cookies() — sedangkan createClient()
    // butuh cookies untuk auth. Admin client pakai env var langsung.
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("settings_studio_info")
      .select("logo_url, studio_name, whatsapp_number, address, footer_text, instagram")
      .eq("lock", true)
      .maybeSingle();
    return data ?? null;
  },
  ["settings_studio_info"],                                 // cache key (unik per query)
  { tags: ["SETTINGS_STUDIO_INFO"], revalidate: 3600 }      // TTL 1 jam, bisa di-invalidate via tag
);

// Layer 2: React.cache — deduplikasi per request (wraps unstable_cache)
export const getCachedStudioInfo = cache(_getCachedStudioInfo);
```

**Kenapa dua lapis?**

Contoh: Dashboard layout memanggil `getCachedStudioInfo()`, lalu dashboard page juga memanggil fungsi yang sama. Tanpa `React.cache()`, itu 2 DB hit (walau hasilnya sama). Dengan `React.cache()`, cukup 1 hit per request.

### Data yang Di-cache vs Tidak

**Di-cache (master data, TTL 1 jam):**
- Settings studio (logo, nama, alamat, jam operasional)
- Paket foto aktif
- Background tersedia
- Add-on aktif
- Leads, domiciles, photo for, custom fields
- Studio holidays

**Tidak di-cache (data real-time):**
- Data booking (berubah terus)
- Data customer
- Data finance
- Data kalender

**TTL lebih pendek (5 menit):**
- Active users — bisa berubah jika ada user baru/nonaktif
- Roles
- Active vendors

### Cache Invalidation

Saat admin update settings, cache harus di-invalidate:

```ts
import { revalidateTag } from "next/cache";

// Setelah update data, invalidate cache dengan tag-nya
revalidateTag("SETTINGS_STUDIO_INFO");
revalidateTag("PACKAGES");
```

---

## Pilar 4: Loading UI — Skeleton & NextTopLoader

### Konsep

Ketika user klik navigasi ke halaman baru, ada dua hal yang terjadi bersamaan:
1. Next.js menampilkan `loading.tsx` dari route tujuan — **langsung, instan**
2. Server mulai render `page.tsx` (fetch data, dll.)

Hasilnya: user tidak pernah melihat blank screen. Yang terlihat adalah skeleton yang mirip dengan layout halaman asli.

### NextTopLoader (Progress Bar)

```tsx
// src/app/layout.tsx

import NextTopLoader from "nextjs-toploader";

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>
        {/* Progress bar merah di bagian atas halaman saat navigasi */}
        <NextTopLoader color="#8B1A1A" height={3} showSpinner={false} />
        {children}
      </body>
    </html>
  )
}
```

`showSpinner={false}` — tidak ada spinner di pojok kanan atas (terlalu mencolok).

### Skeleton Loading (loading.tsx)

```tsx
// src/app/(dashboard)/dashboard/loading.tsx
// Tampil INSTAN saat user klik ke dashboard

import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Greeting skeleton — dimensi sama persis dengan konten asli */}
      <div className="space-y-1.5">
        <Skeleton className="h-3.5 w-24" />
        <Skeleton className="h-7 w-56" />
        <Skeleton className="h-3.5 w-40" />
      </div>

      {/* Quick Menu skeleton */}
      <div>
        <Skeleton className="h-3 w-20 mb-3" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-2xl" />
          ))}
        </div>
      </div>

      {/* Stats skeleton */}
      <div>
        <Skeleton className="h-3 w-28 mb-3" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
```

**Aturan skeleton yang baik:**
- Dimensi (tinggi, lebar, border-radius) harus sama dengan konten asli
- Gunakan `Array.from({ length: N }).map(...)` untuk list skeleton
- Jangan buat skeleton yang terlalu detail — cukup representasi blok layout

### Setiap Route Punya `loading.tsx`

Project ini punya `loading.tsx` di setiap route:
- `(dashboard)/dashboard/loading.tsx`
- `(dashboard)/bookings/loading.tsx`
- `(dashboard)/bookings/new/loading.tsx`
- `(dashboard)/bookings/[id]/loading.tsx`
- `(dashboard)/customers/loading.tsx`
- `(dashboard)/calendar/loading.tsx`
- ... dan seterusnya (18 total)

---

## Pilar 5: Lean Database Queries

### Konsep

Semakin sedikit data yang diambil dari database, semakin cepat query dan semakin kecil data yang dikirim ke browser.

### Aturan: Jangan `select('*')`

```ts
// ❌ Anti-pattern — ambil semua kolom, termasuk yang tidak dipakai
supabase.from("bookings").select("*")

// ✅ Pattern ini — hanya kolom yang dibutuhkan
supabase.from("bookings")
  .select("id, booking_number, start_time, end_time, status, customers(name), packages(name)")
```

### Join Hanya Kolom yang Dibutuhkan

```ts
// ❌ Anti-pattern — ambil semua data customer dan paket
supabase.from("bookings").select("*, customers(*), packages(*)")

// ✅ Pattern ini — hanya nama customer dan nama paket
supabase.from("bookings")
  .select("id, booking_number, booking_date, total, customers(name), packages(name)")
```

### Fetch Sekali, Group di JavaScript

```ts
// ❌ Anti-pattern — 4 query COUNT terpisah
const { count: selectionCount } = await supabase.from("bookings")
  .select("id", { count: "exact", head: true }).eq("print_order_status", "SELECTION")
const { count: vendorCount } = await supabase.from("bookings")
  .select("id", { count: "exact", head: true }).eq("print_order_status", "VENDOR")
// ... 2 query lagi

// ✅ Pattern ini — 1 query, group di JS
const { data: printOrderRows } = await supabase
  .from("bookings")
  .select("print_order_status")
  .in("print_order_status", ["SELECTION", "VENDOR", "PACKING", "SHIPPED"]);

const printCounts = {
  SELECTION: printOrderRows.filter(r => r.print_order_status === "SELECTION").length,
  VENDOR:    printOrderRows.filter(r => r.print_order_status === "VENDOR").length,
  PACKING:   printOrderRows.filter(r => r.print_order_status === "PACKING").length,
  SHIPPED:   printOrderRows.filter(r => r.print_order_status === "SHIPPED").length,
};
```

### Count-only Query

Untuk menghitung jumlah baris tanpa ambil datanya:

```ts
// head: true → tidak return rows, hanya count
const { count } = await supabase
  .from("bookings")
  .select("id", { count: "exact", head: true })
  .gte("booking_date", monthStart)
  .lte("booking_date", monthEnd)
```

---

## Pilar 6: PWA & Image Optimization

### next.config.mjs

```js
// next.config.mjs

import withPWA from "@ducanh2912/next-pwa";

const nextConfig = {
  images: {
    // Format modern: AVIF (terkecil) → WebP → PNG fallback
    formats: ["image/avif", "image/webp"],
    remotePatterns: [/* URL Supabase storage */],
  },
  experimental: {
    // Tree-shake lucide-react — hanya icon yang dipakai yang di-bundle
    optimizePackageImports: ["lucide-react"],
  },
};

export default withPWA({
  dest: "public",
  cacheOnFrontEndNav: true,           // Cache navigasi di browser
  aggressiveFrontEndNavCaching: true, // Cache agresif — navigasi terasa instant
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === "development",
})(nextConfig);
```

**`aggressiveFrontEndNavCaching: true`** — ini yang membuat klik navigasi kedua kalinya terasa **instan** karena halaman di-cache di service worker.

### Font Optimization

```ts
// src/app/layout.tsx

const inter = Inter({
  subsets: ["latin"],
  display: "swap",  // Tampilkan teks dengan fallback font dulu, swap ke Inter saat siap
  preload: true,    // Preload font file saat halaman dimuat
});
```

`display: "swap"` — teks langsung terlihat dengan system font, tidak ada invisible text saat Inter belum selesai dimuat.

### Image dengan `priority`

```tsx
// src/components/layout/sidebar.tsx

<Image
  src={logoUrl}
  width={36}
  height={36}
  priority    // Preload gambar — tidak nunggu lazy load
  sizes="36px"
  alt="Logo"
/>
```

Gunakan `priority` hanya untuk gambar yang langsung terlihat saat halaman dimuat (above-the-fold).

---

## Pilar 7: Perceived Performance — Animasi yang Terasa Cepat

### Konsep

**Perceived performance** adalah seberapa cepat user *merasakan* aplikasi bekerja, bukan seberapa cepat sebenarnya. Animasi yang tepat bisa membuat transisi terasa lebih smooth walau waktu aktualnya sama.

### Page-in Animation

```ts
// tailwind.config.ts

keyframes: {
  "page-in": {
    from: { opacity: "0", transform: "translateY(6px)" },
    to:   { opacity: "1", transform: "translateY(0)" },
  },
},
animation: {
  "page-in": "page-in 0.18s cubic-bezier(0.25, 0.1, 0.25, 1) both",
}
```

- **Duration 180ms** — cukup untuk terasa smooth, tidak cukup lama untuk terasa lambat
- **cubic-bezier(0.25, 0.1, 0.25, 1)** — ease-in-out curve yang natural
- **translateY(6px)** — gerak naik 6px saat muncul, memberikan rasa "masuk"
- **opacity 0→1** — fade in yang subtle

Untuk menggunakannya:
```tsx
<div className="animate-page-in">
  {/* Konten halaman */}
</div>
```

### Kenapa `cubic-bezier` Array, Bukan String?

```ts
// ❌ TypeScript strict akan reject ini
"page-in 0.18s easeOut both"

// ✅ Harus array di Tailwind config
"page-in 0.18s cubic-bezier(0.25, 0.1, 0.25, 1) both"
```

---

## Checklist untuk Project Lain yang Lambat

Cek item berikut di project lain. Setiap item yang `❌` kemungkinan besar adalah penyebab kelambatan.

### Data Fetching

- [ ] Apakah `page.tsx` adalah **async Server Component**? (bukan `"use client"`)
- [ ] Apakah data di-fetch langsung di `page.tsx`, bukan di `useEffect`?
- [ ] Apakah query independen dijalankan dengan `Promise.all()`?
- [ ] Apakah ada `select('*')` yang bisa diganti dengan kolom spesifik?
- [ ] Apakah ada multiple query yang sebetulnya bisa di-merge jadi satu?

### Caching

- [ ] Apakah ada `unstable_cache()` untuk data master (settings, lookup data)?
- [ ] Apakah `unstable_cache` di-wrap dengan `React.cache()` untuk dedup per-request?
- [ ] Apakah admin client dipakai di dalam `unstable_cache` (bukan client yang butuh cookies)?

### Loading UI

- [ ] Apakah ada `loading.tsx` di setiap route?
- [ ] Apakah `NextTopLoader` terpasang di root layout?
- [ ] Apakah skeleton dimensinya mendekati konten asli?

### Next.js Config

- [ ] Apakah `Image` dari `next/image` dipakai (bukan `<img>` biasa)?
- [ ] Apakah font diload dengan `next/font/google` dan `display: "swap"`?
- [ ] Apakah semua navigasi menggunakan `<Link>` dari `next/link` (bukan `<a>`)?
- [ ] Apakah `optimizePackageImports` diaktifkan untuk library icon?

### PWA (opsional tapi impactful)

- [ ] Apakah `next-pwa` atau service worker terpasang?
- [ ] Apakah `aggressiveFrontEndNavCaching: true`?

---

## File Kunci di Project Ini

| File | Apa yang Bisa Dipelajari |
|------|--------------------------|
| [`src/lib/cached-queries.ts`](src/lib/cached-queries.ts) | Pattern caching dua lapis: `unstable_cache` + `React.cache` |
| [`src/app/layout.tsx`](src/app/layout.tsx) | Font optimization, NextTopLoader setup |
| [`src/app/(dashboard)/layout.tsx`](src/app/(dashboard)/layout.tsx) | Parallel fetch di layout level |
| [`src/app/(dashboard)/dashboard/page.tsx`](src/app/(dashboard)/dashboard/page.tsx) | 6 query paralel, count-only, group di JS |
| [`src/app/(dashboard)/bookings/new/page.tsx`](src/app/(dashboard)/bookings/new/page.tsx) | 13 query paralel semuanya dari cache |
| [`src/app/(dashboard)/dashboard/loading.tsx`](src/app/(dashboard)/dashboard/loading.tsx) | Skeleton UI yang match layout asli |
| [`next.config.mjs`](next.config.mjs) | PWA config, image formats, tree-shaking |
| [`tailwind.config.ts`](tailwind.config.ts) | page-in animation 180ms cubic-bezier |

---

## Rangkuman: Kenapa Navigasi Terasa Sat-Set

Saat user klik link ke halaman baru:

```
1. Klik → Link dari next/link (prefetch route)
         ↓
2. NextTopLoader muncul (progress bar merah di atas)
         ↓
3. loading.tsx langsung ditampilkan (skeleton instan)
         ↓
4. Server render page.tsx:
   - Promise.all() → semua query jalan paralel
   - getCached*() → sebagian besar dari cache, hampir instan
         ↓
5. HTML lengkap dikirim ke browser
         ↓
6. Skeleton diganti konten asli dengan animasi page-in 180ms
         ↓
7. User melihat halaman lengkap ✓
```

Total waktu yang user *rasakan* menunggu: waktu antara langkah 3 dan 7.
Skeleton muncul di langkah 3 — jadi user tidak pernah melihat blank screen.
