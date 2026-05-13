import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Suspense } from "react";
import { ArrowRight, Award, BookOpen, Users, TrendingUp, Heart, Building2, ChevronRight } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { FaqAccordion } from "./faq-accordion";
import { FadeUp } from "@/components/shared/fade-up";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://nextswimmingschool.vercel.app";

export const metadata: Metadata = {
  title: "Next Swimming School — Sekolah Renang Terbaik",
  description:
    "Next Swimming School menyediakan program renang terstruktur untuk anak, remaja, dan dewasa. Pelatih bersertifikat, kelas kecil, dan sistem digital modern.",
  openGraph: {
    title: "Next Swimming School — Sekolah Renang Terbaik",
    description: "Program renang terstruktur untuk semua usia. Pelatih bersertifikat, kelas kecil, absensi & rapot digital.",
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

// ── Design tokens ──────────────────────────────────────────────
const C = {
  navy:    "#0A2547",
  blue700: "#174A93",
  blue600: "#1E5DB8",
  blue50:  "#EEF5FF",
  cyan400: "#22D3EE",
  cyan500: "#06B6D4",
  slate900: "#0F172A",
  slate800: "#1E293B",
  slate600: "#475569",
  slate50:  "#F8FAFC",
  slate200: "#E2E8F0",
};

// ── Hero ───────────────────────────────────────────────────────
const HERO_IMG = "https://images.unsplash.com/photo-1720553900212-78817a04ded4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1920";

// ── Why Next items (hardcode) ──────────────────────────────────
const WHY_ITEMS = [
  { icon: Award,      title: "Coach Bersertifikasi",   desc: "Semua pelatih memiliki sertifikasi resmi dan pengalaman minimal 5 tahun." },
  { icon: BookOpen,   title: "Kurikulum Terstruktur",  desc: "Program berbasis level dengan milestone jelas di setiap tahap perkembangan." },
  { icon: Users,      title: "Kelas Kecil & Personal", desc: "Maks. 8 murid per kelas agar setiap anak mendapat perhatian penuh." },
  { icon: Building2,  title: "Fasilitas Modern",       desc: "Kolam standar internasional, air bersih, ruang ganti nyaman dan aman." },
  { icon: TrendingUp, title: "Tracking Progress",      desc: "Pantau perkembangan anak secara digital lewat dashboard member online." },
  { icon: Heart,      title: "Komunitas Suportif",     desc: "Bergabung dengan komunitas ratusan keluarga yang saling mendukung." },
];

// ── How it works (hardcode) ────────────────────────────────────
const STEPS = [
  { num: "01", title: "Daftar Online",         desc: "Isi form pendaftaran di website kami. Hanya butuh 5 menit." },
  { num: "02", title: "Konfirmasi Pembayaran", desc: "Kirim bukti transfer ke admin via WhatsApp untuk aktivasi akun." },
  { num: "03", title: "Mulai Berenang",        desc: "Datang ke kolam, tunjukkan QR code, dan mulai sesi pertamamu!" },
];

// ── FAQ (hardcode) ─────────────────────────────────────────────
const FAQS = [
  { q: "Berapa biaya pendaftaran dan kelas?", a: "Biaya pendaftaran awal Rp 500.000 (sekali bayar) + biaya kelas bulanan mulai dari Rp 2.000.000/bulan tergantung program yang dipilih." },
  { q: "Anak saya belum bisa berenang, bisa daftar?", a: "Tentu! Kelas Beginner kami dirancang khusus untuk pemula dari nol. Pelatih kami terlatih menangani anak yang takut air sekalipun." },
  { q: "Apa yang perlu dipersiapkan untuk kelas pertama?", a: "Cukup pakaian renang, kacamata renang, topi renang, dan handuk. Untuk anak kecil, tambahkan sandal kolam dan botol minum." },
  { q: "Bagaimana sistem pembayarannya?", a: "Pembayaran dilakukan setiap bulan via transfer bank. Admin akan mengirimkan tagihan via WhatsApp di awal bulan." },
  { q: "Bisakah pindah jadwal jika berhalangan?", a: "Bisa! Penggantian jadwal bisa dilakukan maks. 2× per bulan dengan menghubungi admin minimal 24 jam sebelum kelas." },
  { q: "Bagaimana cara melihat perkembangan anak?", a: "Orang tua dapat memantau progress melalui dashboard member online yang diperbarui setiap bulan oleh pelatih." },
  { q: "Berapa lama biasanya bisa berenang dengan baik?", a: "Untuk pemula, rata-rata 3–6 bulan sudah bisa berenang dasar. Progres setiap anak berbeda tergantung frekuensi latihan." },
  { q: "Apakah ada coach perempuan?", a: "Ya, kami memiliki pelatih perempuan yang siap menangani kelas khusus putri maupun kelas campuran." },
];

// ── Fallback program cards (when no DB data) ───────────────────
const FALLBACK_PROGRAMS = [
  {
    title: "Kelas Beginner",
    tag: "Usia 4–7",
    desc: "Belajar dari nol, pengenalan air, teknik dasar yang menyenangkan.",
    schedule: "Sen, Rab, Jum",
    price: "Rp 2.000.000",
    img: "https://images.unsplash.com/photo-1778141580880-36612d636256?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800",
    slug: "beginner",
  },
  {
    title: "Kelas Intermediate",
    tag: "Usia 8–12",
    desc: "Perbaiki teknik, tingkatkan kecepatan dan daya tahan di air.",
    schedule: "Sel, Kam, Sab",
    price: "Rp 2.500.000",
    img: "https://images.unsplash.com/photo-1778145079390-064ef2d1d2d8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800",
    slug: "intermediate",
  },
  {
    title: "Kelas Advanced",
    tag: "Usia 13+",
    desc: "Latihan intensif untuk kompetisi dan performa tinggi.",
    schedule: "Sen – Jum",
    price: "Rp 3.000.000",
    img: "https://images.unsplash.com/photo-1772987548827-4f769a0625bd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800",
    slug: "advanced",
  },
];

const FALLBACK_COACHES = [
  { name: "Coach Sari Dewi",    role: "Head Coach · Freestyle",   img: "https://images.unsplash.com/photo-1528803030572-cf341cadda3e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400" },
  { name: "Coach Budi Santoso", role: "Coach · Butterfly",        img: "https://images.unsplash.com/photo-1674092700929-a79b97cdb88b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400" },
  { name: "Coach Riana Putri",  role: "Coach · Kids Specialist",  img: "https://images.unsplash.com/photo-1778145079390-064ef2d1d2d8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400" },
];

// ── Fallback stats (used in skeleton / when DB unavailable) ───
const FALLBACK_STATS = [
  { num: "500+", label: "Member Aktif" },
  { num: "20+",  label: "Coach Bersertifikat" },
  { num: "3",    label: "Cabang" },
  { num: "10+",  label: "Tahun Pengalaman" },
];

// ── JSON-LD ────────────────────────────────────────────────────
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SportsActivityLocation",
      "@id": `${APP_URL}/#organization`,
      name: "Next Swimming School",
      url: APP_URL,
      description: "Sekolah renang modern dengan pelatih bersertifikat dan sistem manajemen digital.",
      potentialAction: {
        "@type": "ReserveAction",
        target: { "@type": "EntryPoint", urlTemplate: `${APP_URL}/daftar/member` },
        result: { "@type": "Reservation", name: "Daftar Kelas Renang" },
      },
    },
    {
      "@type": "FAQPage",
      mainEntity: FAQS.slice(0, 4).map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
  ],
};

// ── Helpers ────────────────────────────────────────────────────
function SectionLabel({ children }: { children: string }) {
  return (
    <div style={{ fontSize: 11, fontWeight: 800, color: C.cyan500, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 14 }}>
      {children}
    </div>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{
      fontSize: "clamp(26px,4vw,42px)", fontWeight: 900, color: C.slate900,
      letterSpacing: "-0.03em", fontFamily: "var(--font-jakarta, sans-serif)",
      lineHeight: 1.15, margin: 0,
    }}>
      {children}
    </h2>
  );
}

// ── Skeleton for dynamic sections ─────────────────────────────
function DynamicSectionsSkeleton() {
  return (
    <>
      {/* Trust Bar skeleton */}
      <section style={{ backgroundColor: "white", borderBottom: `1px solid ${C.slate200}` }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "52px 24px" }}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {FALLBACK_STATS.map((s, i) => (
              <div key={i}>
                <div style={{ fontSize: "clamp(32px,5vw,48px)", fontWeight: 900, color: C.blue600, letterSpacing: "-0.04em", lineHeight: 1, fontFamily: "var(--font-jakarta, sans-serif)" }}>{s.num}</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#64748B", letterSpacing: "0.1em", textTransform: "uppercase", marginTop: 8 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Programs skeleton */}
      <section style={{ backgroundColor: "white", padding: "96px 24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 52, flexWrap: "wrap", gap: 16 }}>
            <div>
              <SectionLabel>Program Unggulan</SectionLabel>
              <SectionHeading>Pilih Program yang<br />Tepat Untukmu</SectionHeading>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[0, 1, 2].map((i) => (
              <div key={i} style={{ backgroundColor: "white", borderRadius: 24, overflow: "hidden", border: `1px solid ${C.slate200}`, boxShadow: "0 4px 12px rgba(15,23,42,0.06)" }}>
                <div style={{ aspectRatio: "16/9", backgroundColor: C.slate200 }} />
                <div style={{ padding: "22px 24px 24px" }}>
                  <div style={{ height: 20, width: "60%", backgroundColor: C.slate200, borderRadius: 6, marginBottom: 10 }} />
                  <div style={{ height: 14, width: "90%", backgroundColor: C.slate200, borderRadius: 6 }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Coaches skeleton */}
      <section style={{ backgroundColor: "white", padding: "96px 24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <SectionLabel>Pelatih Kami</SectionLabel>
            <SectionHeading>Tim Coach Berdedikasi</SectionHeading>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[0, 1, 2].map((i) => (
              <div key={i} style={{ borderRadius: 24, overflow: "hidden", border: `1px solid ${C.slate200}`, backgroundColor: "white" }}>
                <div style={{ aspectRatio: "4/3", backgroundColor: C.slate200 }} />
                <div style={{ padding: "18px 20px 20px" }}>
                  <div style={{ height: 16, width: "50%", backgroundColor: C.slate200, borderRadius: 6 }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

// ── Inner async component (DB-dependent sections) ─────────────
type ProgramCard = { title: string; tag: string; desc: string; schedule: string; price: string; img: string; slug: string };
type CoachCard = { name: string; role: string; img: string };

async function DynamicSections() {
  const supabase = createClient(await cookies());

  const [
    { count: memberCount },
    { count: coachCount },
    { count: branchCount },
    { data: dbPrograms },
    { data: dbCoaches },
  ] = await Promise.all([
    supabase.from("members").select("*", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("coaches").select("*", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("branches").select("*", { count: "exact", head: true }),
    supabase
      .from("classes")
      .select("id, name, slug, description, cover_url, monthly_price, age_range_min, age_range_max, class_schedules(day_of_week, start_time)")
      .eq("status", "active")
      .order("created_at", { ascending: true })
      .limit(3),
    supabase
      .from("coaches")
      .select("id, coach_profiles(full_name, photo_url, specializations, is_featured)")
      .eq("status", "active")
      .limit(3),
  ]);

  const STATS = [
    { num: `${memberCount ?? 500}+`, label: "Member Aktif" },
    { num: `${coachCount ?? 20}+`,   label: "Coach Bersertifikat" },
    { num: String(branchCount ?? 3), label: "Cabang" },
    { num: "10+",                     label: "Tahun Pengalaman" },
  ];

  const programs: ProgramCard[] = (dbPrograms && dbPrograms.length > 0)
    ? dbPrograms.map((p) => {
        const schedules = Array.isArray(p.class_schedules) ? p.class_schedules : [];
        const days = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
        const schedStr = schedules.map((s: { day_of_week: number; start_time: string }) => days[s.day_of_week]).join(", ");
        const ageTag = p.age_range_min && p.age_range_max
          ? `Usia ${p.age_range_min}–${p.age_range_max}`
          : p.age_range_min ? `Usia ${p.age_range_min}+` : "";
        const price = p.monthly_price
          ? new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(p.monthly_price)
          : "";
        return {
          title: p.name,
          tag: ageTag,
          desc: p.description ?? "",
          schedule: schedStr,
          price,
          img: p.cover_url ?? FALLBACK_PROGRAMS[0].img,
          slug: p.slug ?? p.id,
        };
      })
    : FALLBACK_PROGRAMS;

  const coaches: CoachCard[] = (dbCoaches && dbCoaches.length > 0)
    ? dbCoaches.map((c) => {
        const cp = Array.isArray(c.coach_profiles) ? c.coach_profiles[0] : c.coach_profiles;
        const specs = (cp?.specializations as string[] | null) ?? [];
        return {
          name: cp?.full_name ?? "Coach",
          role: specs.length > 0 ? `Coach · ${specs.slice(0, 2).join(", ")}` : "Coach",
          img: cp?.photo_url ?? FALLBACK_COACHES[0].img,
        };
      })
    : FALLBACK_COACHES;

  return (
    <>
      {/* ══ TRUST BAR ═════════════════════════════════════════════════ */}
      <section style={{ backgroundColor: "white", borderBottom: `1px solid ${C.slate200}` }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "52px 24px" }}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {STATS.map((s, i) => (
              <FadeUp key={i} delay={i * 60}>
                <div>
                  <div style={{ fontSize: "clamp(32px,5vw,48px)", fontWeight: 900, color: C.blue600, letterSpacing: "-0.04em", lineHeight: 1, fontFamily: "var(--font-jakarta, sans-serif)" }}>{s.num}</div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#64748B", letterSpacing: "0.1em", textTransform: "uppercase", marginTop: 8 }}>{s.label}</div>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ══ PROGRAMS PREVIEW ══════════════════════════════════════════ */}
      <section style={{ backgroundColor: "white", padding: "96px 24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <FadeUp>
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 52, flexWrap: "wrap", gap: 16 }}>
              <div>
                <SectionLabel>Program Unggulan</SectionLabel>
                <SectionHeading>Pilih Program yang<br />Tepat Untukmu</SectionHeading>
              </div>
              <Link
                href="/program"
                style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 14, fontWeight: 700, color: C.blue600, textDecoration: "none" }}
              >
                Lihat Semua <ChevronRight size={15} />
              </Link>
            </div>
          </FadeUp>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {programs.map((p, i) => (
              <FadeUp key={p.slug} delay={i * 80}>
                <div
                  style={{ backgroundColor: "white", borderRadius: 24, overflow: "hidden", border: `1px solid ${C.slate200}`, boxShadow: "0 4px 12px rgba(15,23,42,0.06)", height: "100%" }}
                >
                  <div style={{ position: "relative", aspectRatio: "16/9", overflow: "hidden" }}>
                    <Image
                      src={p.img}
                      alt={p.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      style={{ objectFit: "cover" }}
                    />
                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(0deg, rgba(10,37,71,0.35) 0%, transparent 55%)" }} />
                    {p.tag && (
                      <span style={{ position: "absolute", top: 12, left: 12, backgroundColor: C.cyan400, color: "#06182F", fontSize: 11, fontWeight: 800, letterSpacing: "0.06em", padding: "4px 10px", borderRadius: 9999 }}>
                        {p.tag}
                      </span>
                    )}
                  </div>

                  <div style={{ padding: "22px 24px 24px" }}>
                    <h3 style={{ fontSize: 18, fontWeight: 700, color: C.slate900, marginBottom: 6, fontFamily: "var(--font-jakarta, sans-serif)" }}>{p.title}</h3>
                    <p style={{ fontSize: 14, color: "#64748B", lineHeight: 1.55, marginBottom: 18 }}>{p.desc}</p>
                    <div style={{ height: 1, backgroundColor: C.slate200, marginBottom: 16 }} />
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div>
                        {p.schedule && <div style={{ fontSize: 12, color: "#94A3B8", fontWeight: 600, marginBottom: 2 }}>{p.schedule}</div>}
                        {p.price && (
                          <div style={{ fontSize: 17, fontWeight: 800, color: C.blue600, fontFamily: "var(--font-jakarta, sans-serif)" }}>
                            {p.price}<span style={{ fontSize: 12, fontWeight: 500, color: "#94A3B8" }}>/bln</span>
                          </div>
                        )}
                      </div>
                      <Link
                        href={`/program/${p.slug}`}
                        style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 13, fontWeight: 700, color: C.blue600, textDecoration: "none", border: `1px solid #B8D6FF`, padding: "8px 16px", borderRadius: 10, backgroundColor: C.blue50 }}
                      >
                        Detail <ArrowRight size={13} />
                      </Link>
                    </div>
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ══ COACH HIGHLIGHTS ══════════════════════════════════════════ */}
      <section style={{ backgroundColor: "white", padding: "96px 24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <FadeUp>
            <div style={{ textAlign: "center", marginBottom: 52 }}>
              <SectionLabel>Pelatih Kami</SectionLabel>
              <SectionHeading>Tim Coach Berdedikasi</SectionHeading>
            </div>
          </FadeUp>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {coaches.map((c, i) => (
              <FadeUp key={i} delay={i * 80}>
                <div style={{ borderRadius: 24, overflow: "hidden", border: `1px solid ${C.slate200}`, backgroundColor: "white", boxShadow: "0 4px 12px rgba(15,23,42,0.06)" }}>
                  <div style={{ position: "relative", aspectRatio: "4/3", overflow: "hidden" }}>
                    <Image
                      src={c.img}
                      alt={c.name}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      style={{ objectFit: "cover" }}
                    />
                  </div>
                  <div style={{ padding: "18px 20px 20px" }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: C.slate900, marginBottom: 3, fontFamily: "var(--font-jakarta, sans-serif)" }}>{c.name}</h3>
                    <div style={{ fontSize: 11, fontWeight: 700, color: C.cyan500, letterSpacing: "0.08em", textTransform: "uppercase" }}>{c.role}</div>
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

// ── Outer page component (sync — renders immediately) ─────────
export default function LandingPage() {
  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", overflowX: "hidden" }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ══ HERO ══════════════════════════════════════════════════════ */}
      <section style={{ position: "relative", minHeight: 720, display: "flex", alignItems: "center", overflow: "hidden" }}>
        <div className="absolute inset-0">
          <Image
            src={HERO_IMG}
            alt="Kolam renang Next Swimming School"
            fill
            priority
            sizes="100vw"
            style={{ objectFit: "cover", objectPosition: "center 35%" }}
          />
        </div>
        <div style={{ position: "absolute", inset: 0, background: `linear-gradient(90deg, rgba(10,37,71,0.88) 0%, rgba(30,93,184,0.48) 100%)` }} />
        <div style={{ position: "absolute", top: "10%", right: "12%", width: 440, height: 440, borderRadius: "50%", background: "radial-gradient(circle, rgba(34,211,238,0.08) 0%, transparent 70%)", pointerEvents: "none" }} />

        <div style={{ position: "relative", zIndex: 1, maxWidth: 1200, margin: "0 auto", padding: "130px 24px 90px", width: "100%" }}>
          <div style={{ maxWidth: 660 }}>
            <FadeUp delay={0}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, backgroundColor: "rgba(34,211,238,0.12)", border: "1px solid rgba(34,211,238,0.28)", borderRadius: 9999, padding: "5px 14px", marginBottom: 28 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: C.cyan400, flexShrink: 0 }} />
                <span style={{ fontSize: 12, fontWeight: 700, color: "#67E8F9", letterSpacing: "0.1em", textTransform: "uppercase" }}>Swimming Excellence</span>
              </div>
            </FadeUp>

            <FadeUp delay={80}>
              <h1 style={{ fontSize: "clamp(40px,7vw,68px)", fontWeight: 900, color: "white", letterSpacing: "-0.04em", lineHeight: 1.05, marginBottom: 22, fontFamily: "var(--font-jakarta, sans-serif)" }}>
                Berenang Lebih Baik,<br />
                <span style={{ color: C.cyan400 }}>Dimulai dari Sini.</span>
              </h1>
            </FadeUp>

            <FadeUp delay={160}>
              <p style={{ fontSize: 18, color: "rgba(255,255,255,0.8)", lineHeight: 1.7, maxWidth: 520, marginBottom: 40 }}>
                Belajar berenang dengan kurikulum terstruktur dan pelatih bersertifikasi. Dari pemula hingga atlet berprestasi.
              </p>
            </FadeUp>

            <FadeUp delay={240}>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 60 }}>
                <Link
                  href="/daftar/member"
                  style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "0 28px", height: 56, fontSize: 16, fontWeight: 800, color: "#06182F", textDecoration: "none", backgroundColor: C.cyan400, borderRadius: 14, boxShadow: "0 8px 24px rgba(34,211,238,0.30)", fontFamily: "var(--font-jakarta, sans-serif)" }}
                >
                  Daftar Sekarang <ArrowRight size={18} />
                </Link>
                <Link
                  href="/program"
                  style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "0 28px", height: 56, fontSize: 16, fontWeight: 700, color: "white", textDecoration: "none", border: "1.5px solid rgba(255,255,255,0.45)", borderRadius: 14, backdropFilter: "blur(4px)", backgroundColor: "rgba(255,255,255,0.07)" }}
                >
                  Lihat Program
                </Link>
              </div>
            </FadeUp>

            <FadeUp delay={320}>
              <div style={{ height: 1, backgroundColor: "rgba(255,255,255,0.12)", marginBottom: 28 }} />
              <div style={{ display: "flex", gap: 36, flexWrap: "wrap" }}>
                {FALLBACK_STATS.map((s) => (
                  <div key={s.label}>
                    <div style={{ fontSize: 26, fontWeight: 900, color: C.cyan400, letterSpacing: "-0.03em", fontFamily: "var(--font-jakarta, sans-serif)" }}>{s.num}</div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.55)", letterSpacing: "0.06em", textTransform: "uppercase", marginTop: 2 }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* ══ DYNAMIC SECTIONS (Trust Bar + Programs + Coaches) ════════ */}
      <Suspense fallback={<DynamicSectionsSkeleton />}>
        <DynamicSections />
      </Suspense>

      {/* ══ WHY NEXT ══════════════════════════════════════════════════ */}
      <section style={{ backgroundColor: C.slate50, padding: "96px 24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <FadeUp>
            <div style={{ textAlign: "center", marginBottom: 60 }}>
              <SectionLabel>Kenapa Next?</SectionLabel>
              <SectionHeading>Lebih dari Sekadar<br />Belajar Berenang</SectionHeading>
            </div>
          </FadeUp>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {WHY_ITEMS.map((item, i) => (
              <FadeUp key={item.title} delay={i * 60}>
                <div
                  style={{ backgroundColor: "white", border: `1px solid ${C.slate200}`, borderRadius: 24, padding: "28px 28px 32px", boxShadow: "0 4px 12px rgba(15,23,42,0.06)", height: "100%" }}
                >
                  <div style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: C.blue50, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18 }}>
                    <item.icon size={24} color={C.blue600} strokeWidth={2} />
                  </div>
                  <h3 style={{ fontSize: 17, fontWeight: 700, color: C.slate900, marginBottom: 8, fontFamily: "var(--font-jakarta, sans-serif)" }}>{item.title}</h3>
                  <p style={{ fontSize: 14, color: C.slate600, lineHeight: 1.65, margin: 0 }}>{item.desc}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ══ HOW IT WORKS ══════════════════════════════════════════════ */}
      <section style={{ backgroundColor: C.slate50, padding: "96px 24px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <FadeUp>
            <div style={{ textAlign: "center", marginBottom: 60 }}>
              <SectionLabel>Gampang Saja</SectionLabel>
              <SectionHeading>Mulai Berenang dalam 3 Langkah</SectionHeading>
            </div>
          </FadeUp>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-1">
            {STEPS.map((step, i) => (
              <FadeUp key={i} delay={i * 80}>
                <div style={{ padding: "36px 28px", textAlign: "center", position: "relative" }}>
                  <div style={{ fontSize: "clamp(52px,8vw,68px)", fontWeight: 900, color: C.cyan400, letterSpacing: "-0.04em", lineHeight: 1, marginBottom: 16, opacity: 0.85, fontFamily: "var(--font-jakarta, sans-serif)" }}>
                    {step.num}
                  </div>
                  <h3 style={{ fontSize: 18, fontWeight: 700, color: C.slate900, marginBottom: 10, fontFamily: "var(--font-jakarta, sans-serif)" }}>{step.title}</h3>
                  <p style={{ fontSize: 14, color: C.slate600, lineHeight: 1.65, maxWidth: 220, margin: "0 auto" }}>{step.desc}</p>
                </div>
              </FadeUp>
            ))}
          </div>

          <FadeUp delay={100}>
            <div style={{ textAlign: "center", marginTop: 48 }}>
              <Link
                href="/daftar/member"
                style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "0 28px", height: 52, fontSize: 15, fontWeight: 800, color: "#06182F", textDecoration: "none", backgroundColor: C.cyan400, borderRadius: 14, fontFamily: "var(--font-jakarta, sans-serif)" }}
              >
                Mulai Sekarang <ArrowRight size={16} />
              </Link>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ══ FAQ ═══════════════════════════════════════════════════════ */}
      <section style={{ backgroundColor: C.slate50, padding: "96px 24px" }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <FadeUp>
            <div style={{ textAlign: "center", marginBottom: 52 }}>
              <SectionLabel>Ada Pertanyaan?</SectionLabel>
              <SectionHeading>Frequently Asked Questions</SectionHeading>
            </div>
          </FadeUp>
          <FadeUp delay={80}>
            <FaqAccordion faqs={FAQS} />
          </FadeUp>
        </div>
      </section>

      {/* ══ FINAL CTA ═════════════════════════════════════════════════ */}
      <section style={{ backgroundColor: "white", padding: "96px 24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <FadeUp>
          <div style={{ background: `linear-gradient(135deg, ${C.navy} 0%, ${C.blue700} 100%)`, borderRadius: 32, padding: "72px 48px", textAlign: "center", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: -60, right: "8%", width: 320, height: 320, borderRadius: "50%", background: "radial-gradient(circle, rgba(34,211,238,0.10) 0%, transparent 70%)", pointerEvents: "none" }} />
            <div style={{ position: "absolute", bottom: -40, left: "5%", width: 240, height: 240, borderRadius: "50%", background: "radial-gradient(circle, rgba(30,93,184,0.25) 0%, transparent 70%)", pointerEvents: "none" }} />

            <div style={{ position: "relative", zIndex: 1 }}>
              <SectionLabel>Bergabung Sekarang</SectionLabel>
              <h2 style={{ fontSize: "clamp(28px,4vw,48px)", fontWeight: 900, color: "white", letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: 16, fontFamily: "var(--font-jakarta, sans-serif)" }}>
                Siap Mulai Perjalanan<br />Berenangmu?
              </h2>
              <p style={{ fontSize: 17, color: "rgba(255,255,255,0.72)", lineHeight: 1.7, marginBottom: 40, maxWidth: 480, margin: "0 auto 40px" }}>
                Bergabung dengan ratusan member yang sudah merasakan manfaatnya.
              </p>
              <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
                <Link
                  href="/daftar/member"
                  style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "0 32px", height: 54, fontSize: 16, fontWeight: 800, color: "#06182F", textDecoration: "none", backgroundColor: C.cyan400, borderRadius: 14, boxShadow: "0 8px 24px rgba(34,211,238,0.25)", fontFamily: "var(--font-jakarta, sans-serif)" }}
                >
                  Daftar Sekarang <ArrowRight size={18} />
                </Link>
                <Link
                  href="/kontak"
                  style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "0 32px", height: 54, fontSize: 16, fontWeight: 700, color: "white", textDecoration: "none", border: "1.5px solid rgba(255,255,255,0.30)", borderRadius: 14 }}
                >
                  Hubungi Kami
                </Link>
              </div>
            </div>
          </div>
          </FadeUp>
        </div>
      </section>
    </div>
  );
}
