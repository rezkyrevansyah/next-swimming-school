import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Heart, Shield, Star, Waves } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Tentang Kami" };

const VALUES = [
  {
    icon: Shield,
    title: "Keselamatan Pertama",
    desc: "Setiap kelas dimulai dengan protokol keselamatan. Rasio pelatih-murid dijaga agar setiap anak selalu diawasi.",
  },
  {
    icon: Heart,
    title: "Penuh Kasih",
    desc: "Kami percaya setiap murid belajar dengan tempo berbeda. Tidak ada tekanan, hanya dukungan konsisten.",
  },
  {
    icon: Star,
    title: "Standar Tinggi",
    desc: "Pelatih kami bersertifikat dan rutin mengikuti pelatihan lanjutan untuk memastikan kualitas terbaik.",
  },
];

const TIMELINE = [
  { year: "2016", text: "Didirikan dengan 1 kolam dan 3 pelatih di cabang pertama." },
  { year: "2018", text: "Ekspansi ke cabang kedua, murid mencapai 200 orang." },
  { year: "2020", text: "Adaptasi pandemi dengan protokol ketat, tetap beroperasi aman." },
  { year: "2022", text: "Peluncuran cabang ketiga dan sistem manajemen digital pertama." },
  { year: "2024", text: "Lebih dari 500 murid aktif, 15 pelatih, sistem absensi QR." },
];

export default function TentangPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="relative py-16 px-5 overflow-hidden bg-gradient-to-b from-sky-50 to-white">
        <div className="absolute inset-0 pointer-events-none" aria-hidden>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-40 rounded-full bg-sky-100/80 blur-3xl" />
        </div>
        <div className="relative max-w-2xl mx-auto text-center">
          <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700">
            <Waves className="h-3 w-3" />
            Tentang Kami
          </div>
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">Kami Ada untuk Membantumu Berenang</h1>
          <p className="mt-4 text-gray-500 text-sm sm:text-base leading-relaxed">
            Next Swimming School lahir dari keyakinan sederhana: setiap orang berhak bisa berenang dengan aman.
            Sejak 2016, kami telah membantu ratusan murid — dari anak-anak hingga orang dewasa — menemukan
            kepercayaan diri di dalam air.
          </p>
        </div>
      </div>

      {/* Values */}
      <section className="py-16 px-5 max-w-4xl mx-auto">
        <div className="mb-10 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-sky-600 mb-2">Nilai Kami</p>
          <h2 className="text-2xl font-bold text-gray-900">Yang Mendorong Kami Setiap Hari</h2>
        </div>
        <div className="grid gap-5 sm:grid-cols-3">
          {VALUES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex flex-col gap-3 rounded-2xl border bg-white p-6 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
                <Icon className="h-5 w-5" />
              </div>
              <p className="font-semibold text-gray-900">{title}</p>
              <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Story / Timeline */}
      <section className="py-16 px-5 bg-gray-50/80">
        <div className="max-w-2xl mx-auto">
          <div className="mb-10 text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-sky-600 mb-2">Perjalanan</p>
            <h2 className="text-2xl font-bold text-gray-900">8 Tahun Bersama Murid Kami</h2>
          </div>
          <div className="relative pl-8 space-y-8">
            {/* Vertical line */}
            <div className="absolute left-3 top-2 bottom-2 w-px bg-sky-200" aria-hidden />
            {TIMELINE.map(({ year, text }) => (
              <div key={year} className="relative">
                <div className="absolute -left-5 top-1 h-2 w-2 rounded-full bg-sky-400 ring-4 ring-sky-50" />
                <p className="text-xs font-bold text-sky-600 mb-1">{year}</p>
                <p className="text-sm text-gray-600 leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quote */}
      <section className="py-16 px-5">
        <div className="max-w-2xl mx-auto text-center">
          <blockquote className="text-xl font-medium text-gray-700 leading-relaxed italic">
            &ldquo;Air tidak mengenal usia. Yang penting adalah keberanian untuk memulai.&rdquo;
          </blockquote>
          <p className="mt-4 text-sm text-gray-400">— Pendiri Next Swimming School</p>
        </div>
      </section>

      {/* CTA */}
      <div className="border-t py-14 px-5 text-center bg-gray-50/60">
        <h3 className="text-xl font-bold text-gray-900 mb-2">Bergabunglah Bersama Kami</h3>
        <p className="text-gray-500 text-sm mb-6">Jadi bagian dari keluarga besar Next Swimming School.</p>
        <div className="flex justify-center gap-3 flex-col sm:flex-row">
          <Link href="/daftar/member" className={cn(buttonVariants({ size: "sm" }), "rounded-full gap-1")}>
            Daftar Sekarang <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <Link href="/kontak" className={cn(buttonVariants({ variant: "outline", size: "sm" }), "rounded-full")}>
            Hubungi Kami
          </Link>
        </div>
      </div>
    </div>
  );
}
