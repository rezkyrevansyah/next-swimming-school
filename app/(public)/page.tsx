import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Waves, Users, BarChart3, QrCode } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://nextswimmingschool.vercel.app";

export const metadata: Metadata = {
  title: "Next Swimming School — Sekolah Renang Terbaik",
  description:
    "Next Swimming School menyediakan program renang terstruktur untuk anak, remaja, dan dewasa. Pelatih bersertifikat, kelas kecil, dan sistem digital modern.",
  openGraph: {
    title: "Next Swimming School — Sekolah Renang Terbaik",
    description:
      "Program renang terstruktur untuk semua usia. Pelatih bersertifikat, kelas kecil, absensi & rapot digital.",
    url: APP_URL,
    siteName: "Next Swimming School",
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Next Swimming School",
    description: "Sekolah renang modern dengan sistem manajemen digital.",
  },
  alternates: { canonical: APP_URL },
};

const PROGRAMS = [
  {
    label: "Anak",
    age: "4–12 tahun",
    desc: "Pengenalan air, teknik dasar, dan keselamatan berenang yang menyenangkan.",
    color: "from-sky-400/20 to-blue-500/10",
    dot: "bg-sky-400",
  },
  {
    label: "Remaja",
    age: "13–17 tahun",
    desc: "Penyempurnaan gaya renang, stamina, dan persiapan kompetisi.",
    color: "from-indigo-400/20 to-violet-500/10",
    dot: "bg-indigo-400",
  },
  {
    label: "Dewasa",
    age: "18 tahun+",
    desc: "Program fleksibel untuk kebugaran, relaksasi, atau pemula.",
    color: "from-teal-400/20 to-cyan-500/10",
    dot: "bg-teal-400",
  },
];

const FEATURES = [
  {
    icon: QrCode,
    title: "Absensi QR",
    desc: "Setiap member punya QR code permanen. Hadir? Tinggal scan.",
  },
  {
    icon: BarChart3,
    title: "Pantau Perkembangan",
    desc: "Lihat riwayat kehadiran, jadwal, dan catatan latihan kapan saja.",
  },
  {
    icon: Users,
    title: "Pelatih Berpengalaman",
    desc: "Tim pelatih bersertifikat yang peduli pada setiap tahap kemajuan murid.",
  },
];

const STATS = [
  { value: "500+", label: "Murid Aktif" },
  { value: "8+", label: "Tahun Pengalaman" },
  { value: "3", label: "Cabang" },
  { value: "15+", label: "Pelatih" },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SportsActivityLocation",
      "@id": `${APP_URL}/#organization`,
      name: "Next Swimming School",
      url: APP_URL,
      description: "Sekolah renang modern dengan pelatih bersertifikat dan sistem manajemen digital.",
      "@context": "https://schema.org",
      potentialAction: {
        "@type": "ReserveAction",
        target: { "@type": "EntryPoint", urlTemplate: `${APP_URL}/daftar/member` },
        result: { "@type": "Reservation", name: "Daftar Kelas Renang" },
      },
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "Berapa umur minimal untuk ikut kelas renang?",
          acceptedAnswer: { "@type": "Answer", text: "Kelas kami tersedia mulai dari usia 4 tahun untuk program anak pemula." },
        },
        {
          "@type": "Question",
          name: "Bagaimana cara mendaftar?",
          acceptedAnswer: { "@type": "Answer", text: "Isi formulir pendaftaran online di halaman Daftar, lalu kirim bukti pembayaran melalui WhatsApp ke admin kami." },
        },
        {
          "@type": "Question",
          name: "Apakah tersedia kelas privat?",
          acceptedAnswer: { "@type": "Answer", text: "Ya, kami menyediakan kelas privat one-on-one dengan jadwal yang fleksibel sesuai kebutuhan Anda." },
        },
      ],
    },
  ],
};

export default function LandingPage() {
  return (
    <div className="overflow-x-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* ── HERO ──────────────────────────────────────────────────────── */}
      <section className="relative min-h-[88svh] flex flex-col items-center justify-center text-center px-5 pt-10 pb-32 overflow-hidden bg-gradient-to-b from-sky-50 via-white to-white">
        {/* Background blobs */}
        <div className="absolute inset-0 pointer-events-none select-none" aria-hidden>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[640px] h-[640px] rounded-full bg-sky-100/60 blur-3xl" />
          <div className="absolute top-1/3 left-1/4 w-48 h-48 rounded-full bg-blue-200/40 blur-2xl animate-float" />
          <div className="absolute bottom-1/3 right-[15%] w-32 h-32 rounded-full bg-sky-300/30 blur-xl animate-float [animation-delay:2s]" />
        </div>

        {/* Wave SVG */}
        <div className="absolute bottom-0 left-0 right-0 pointer-events-none" aria-hidden>
          <svg viewBox="0 0 1440 120" xmlns="http://www.w3.org/2000/svg" className="w-full animate-wave-slow" preserveAspectRatio="none">
            <path d="M0,64 C240,100 480,20 720,60 C960,100 1200,20 1440,60 L1440,120 L0,120 Z" fill="white" />
          </svg>
          <svg viewBox="0 0 1440 120" xmlns="http://www.w3.org/2000/svg" className="w-full absolute bottom-0 opacity-40 animate-wave-med" preserveAspectRatio="none">
            <path d="M0,80 C360,30 720,110 1080,50 C1260,20 1380,90 1440,70 L1440,120 L0,120 Z" fill="rgb(147 210 250)" />
          </svg>
        </div>

        {/* Badge */}
        <div className="relative mb-6 inline-flex items-center gap-1.5 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700">
          <Waves className="h-3 w-3" />
          Sekolah Renang Terpercaya
        </div>

        {/* Headline */}
        <h1 className="relative max-w-2xl text-4xl font-bold leading-tight tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
          Belajar Renang{" "}
          <span className="relative inline-block text-sky-600">
            Dengan Benar
            <svg className="absolute -bottom-1 left-0 w-full" viewBox="0 0 200 8" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" aria-hidden>
              <path d="M0,6 Q50,0 100,5 Q150,10 200,4" stroke="rgb(56 189 248)" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
            </svg>
          </span>
        </h1>

        <p className="relative mt-5 max-w-md text-base text-gray-500 sm:text-lg">
          Program renang terstruktur untuk semua usia — dari pengenalan air hingga teknik kompetisi.
        </p>

        <div className="relative mt-8 flex flex-col sm:flex-row gap-3 items-center">
          <Link href="/daftar/member" className={cn(buttonVariants({ size: "lg" }), "gap-2 rounded-full px-7 shadow-lg shadow-black/10")}>
            Daftar Sekarang <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/program" className={cn(buttonVariants({ variant: "ghost", size: "lg" }), "rounded-full")}>
            Lihat Program
          </Link>
        </div>

        {/* Trust row */}
        <div className="relative mt-10 flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-gray-400">
          {["Pelatih Bersertifikat", "Kolam Standar", "Gratis Konsultasi Pertama"].map((t) => (
            <span key={t} className="flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-sky-400" />
              {t}
            </span>
          ))}
        </div>
      </section>

      {/* ── STATS ────────────────────────────────────────────────────── */}
      <section className="py-14 px-5">
        <div className="max-w-3xl mx-auto grid grid-cols-2 gap-8 sm:grid-cols-4">
          {STATS.map(({ value, label }) => (
            <div key={label} className="text-center">
              <p className="text-3xl font-bold text-sky-600 sm:text-4xl">{value}</p>
              <p className="mt-1 text-sm text-gray-500">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── PROGRAMS ─────────────────────────────────────────────────── */}
      <section className="py-16 px-5 bg-gray-50/80">
        <div className="max-w-4xl mx-auto">
          <div className="mb-10 text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-sky-600 mb-2">Program</p>
            <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">Untuk Setiap Usia</h2>
            <p className="mt-3 text-gray-500 max-w-md mx-auto text-sm sm:text-base">
              Kurikulum disesuaikan dengan kemampuan dan kebutuhan masing-masing kelompok usia.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {PROGRAMS.map((p) => (
              <div
                key={p.label}
                className={cn(
                  "relative rounded-2xl bg-gradient-to-br p-5 border border-white/80 shadow-sm",
                  p.color
                )}
              >
                <div className={cn("h-2 w-2 rounded-full mb-3", p.dot)} />
                <p className="font-semibold text-gray-900">{p.label}</p>
                <p className="text-xs text-gray-500 mt-0.5 mb-3">{p.age}</p>
                <p className="text-sm text-gray-600 leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link href="/program" className={cn(buttonVariants({ variant: "outline", size: "sm" }), "rounded-full gap-1")}>
              Detail semua program <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────────────────── */}
      <section className="py-16 px-5">
        <div className="max-w-4xl mx-auto">
          <div className="mb-10 text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-sky-600 mb-2">Teknologi</p>
            <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">Sistem Manajemen Modern</h2>
          </div>

          <div className="grid gap-5 sm:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="group flex flex-col gap-3 rounded-2xl border bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-600 group-hover:bg-sky-100 transition-colors">
                  <Icon className="h-5 w-5" />
                </div>
                <p className="font-semibold text-gray-900">{title}</p>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────── */}
      <section className="py-20 px-5 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-sky-500 to-blue-700" aria-hidden />
        <div className="absolute inset-0 pointer-events-none" aria-hidden>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full border border-white/10 animate-ripple" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full border border-white/10 animate-ripple [animation-delay:1s]" />
        </div>

        <div className="relative max-w-xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-white sm:text-3xl">Mulai Perjalanan Renangmu</h2>
          <p className="mt-3 text-sky-100 text-sm sm:text-base">
            Daftarkan dirimu sekarang dan ikuti konsultasi pertama secara gratis.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/daftar/member" className={cn(buttonVariants({ size: "lg" }), "rounded-full bg-white text-sky-700 hover:bg-sky-50 gap-2 shadow-xl")}>
              Daftar Sekarang <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/kontak" className={cn(buttonVariants({ variant: "ghost", size: "lg" }), "rounded-full text-white hover:bg-white/10")}>
              Hubungi Kami
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────── */}
      <footer className="border-t py-8 px-5 text-center text-xs text-gray-400">
        <p>© 2025 Next Swimming School. Semua hak dilindungi.</p>
        <div className="mt-2 flex justify-center gap-4">
          <Link href="/program" className="hover:text-gray-600 transition-colors">Program</Link>
          <Link href="/tentang" className="hover:text-gray-600 transition-colors">Tentang</Link>
          <Link href="/kontak" className="hover:text-gray-600 transition-colors">Kontak</Link>
          <Link href="/login" className="hover:text-gray-600 transition-colors">Login</Link>
        </div>
      </footer>
    </div>
  );
}
