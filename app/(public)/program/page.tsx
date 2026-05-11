import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Clock, Users, Trophy, Waves } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Program" };

const PROGRAMS = [
  {
    id: "anak-pemula",
    label: "Anak Pemula",
    age: "4–6 tahun",
    level: "Pemula",
    sessions: "2× seminggu",
    size: "Maks. 6 murid/kelas",
    color: "sky",
    highlights: [
      "Pengenalan dan adaptasi air",
      "Teknik mengapung dasar",
      "Pernafasan di air",
      "Keselamatan diri di kolam",
    ],
    desc: "Program paling dasar, dirancang untuk membuat anak-anak merasa nyaman dan aman di dalam air. Fokus pada kesenangan dan rasa percaya diri.",
  },
  {
    id: "anak-lanjut",
    label: "Anak Lanjutan",
    age: "7–12 tahun",
    level: "Lanjutan",
    sessions: "2–3× seminggu",
    size: "Maks. 8 murid/kelas",
    color: "blue",
    highlights: [
      "Gaya bebas & gaya punggung",
      "Teknik start & pembalikan",
      "Penguatan stamina",
      "Dasar kompetisi",
    ],
    desc: "Untuk anak yang sudah bisa mengapung, program ini memperkenalkan gaya renang formal dan membangun fondasi teknik yang solid.",
  },
  {
    id: "remaja",
    label: "Remaja",
    age: "13–17 tahun",
    level: "Semua Level",
    sessions: "3× seminggu",
    size: "Maks. 8 murid/kelas",
    color: "indigo",
    highlights: [
      "Semua 4 gaya renang",
      "Latihan interval & stamina",
      "Teknik pembalikan flip-turn",
      "Persiapan kompetisi",
    ],
    desc: "Program intensif untuk remaja dengan jalur pemula hingga kompetisi. Jadwal fleksibel mengikuti kesibukan sekolah.",
  },
  {
    id: "dewasa",
    label: "Dewasa",
    age: "18 tahun+",
    level: "Semua Level",
    sessions: "2–3× seminggu",
    size: "Maks. 6 murid/kelas",
    color: "teal",
    highlights: [
      "Teknik renang yang efisien",
      "Program kebugaran air",
      "Kelas pagi & sore tersedia",
      "Cocok untuk pemula total",
    ],
    desc: "Tidak ada kata terlambat untuk belajar renang. Program dewasa kami menyesuaikan dengan kemampuan awal dan tujuan masing-masing individu.",
  },
  {
    id: "privat",
    label: "Privat",
    age: "Semua Usia",
    level: "Fleksibel",
    sessions: "Sesuai jadwal",
    size: "1-on-1",
    color: "violet",
    highlights: [
      "Jadwal 100% fleksibel",
      "Fokus penuh dari pelatih",
      "Program custom sesuai target",
      "Progres lebih cepat",
    ],
    desc: "Sesi one-on-one dengan pelatih berpengalaman. Ideal untuk yang ingin progres cepat, persiapan kompetisi, atau yang punya kebutuhan khusus.",
  },
];

const COLOR_MAP: Record<string, { bg: string; text: string; border: string; badge: string }> = {
  sky:    { bg: "bg-sky-50",    text: "text-sky-700",    border: "border-sky-200",    badge: "bg-sky-100 text-sky-700" },
  blue:   { bg: "bg-blue-50",   text: "text-blue-700",   border: "border-blue-200",   badge: "bg-blue-100 text-blue-700" },
  indigo: { bg: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-200", badge: "bg-indigo-100 text-indigo-700" },
  teal:   { bg: "bg-teal-50",   text: "text-teal-700",   border: "border-teal-200",   badge: "bg-teal-100 text-teal-700" },
  violet: { bg: "bg-violet-50", text: "text-violet-700", border: "border-violet-200", badge: "bg-violet-100 text-violet-700" },
};

export default function ProgramPage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="relative py-16 px-5 text-center bg-gradient-to-b from-sky-50 to-white overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" aria-hidden>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-40 rounded-full bg-sky-100/80 blur-3xl" />
        </div>
        <div className="relative max-w-xl mx-auto">
          <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700">
            <Waves className="h-3 w-3" />
            Program Kami
          </div>
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">Pilih Program yang Tepat</h1>
          <p className="mt-3 text-gray-500 text-sm sm:text-base">
            Setiap program dirancang khusus dengan kurikulum terstruktur dan pelatih berdedikasi.
          </p>
        </div>
      </div>

      {/* Program cards */}
      <div className="max-w-4xl mx-auto px-5 pb-20 space-y-5">
        {PROGRAMS.map((p) => {
          const c = COLOR_MAP[p.color];
          return (
            <div key={p.id} className={cn("rounded-2xl border p-6 sm:p-8", c.border)}>
              <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <h2 className="text-lg font-bold text-gray-900">{p.label}</h2>
                    <span className={cn("text-xs font-medium rounded-full px-2.5 py-0.5", c.badge)}>
                      {p.level}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mb-4">{p.desc}</p>

                  <div className="flex flex-wrap gap-4 text-xs text-gray-500 mb-5">
                    <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {p.size}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {p.sessions}</span>
                    <span className="flex items-center gap-1"><Trophy className="h-3.5 w-3.5" /> {p.age}</span>
                  </div>

                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5">
                    {p.highlights.map((h) => (
                      <li key={h} className="flex items-center gap-2 text-sm text-gray-600">
                        <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", `bg-${p.color}-400`)} />
                        {h}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* CTA */}
      <div className="border-t py-14 px-5 text-center bg-gray-50/60">
        <h3 className="text-xl font-bold text-gray-900 mb-2">Masih bingung pilih program?</h3>
        <p className="text-gray-500 text-sm mb-6">Hubungi kami untuk konsultasi gratis dan kami akan bantu tentukan program terbaik untukmu.</p>
        <div className="flex justify-center gap-3 flex-col sm:flex-row">
          <Link href="/kontak" className={cn(buttonVariants({ variant: "outline", size: "sm" }), "rounded-full")}>
            Konsultasi Gratis
          </Link>
          <Link href="/daftar/member" className={cn(buttonVariants({ size: "sm" }), "rounded-full gap-1")}>
            Daftar Sekarang <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
