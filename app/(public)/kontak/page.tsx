import type { Metadata } from "next";
import { MapPin, Phone, Clock, MessageCircle, Waves } from "lucide-react";

export const metadata: Metadata = { title: "Kontak" };

const BRANCHES = [
  {
    name: "Cabang Utama",
    address: "Jl. Renang Indah No. 1, Jakarta Selatan",
    phone: "0812-0000-0001",
    wa: "6281200000001",
    hours: "Sen–Sab 06.00–20.00",
  },
  {
    name: "Cabang Barat",
    address: "Jl. Aqua Barat No. 5, Jakarta Barat",
    phone: "0812-0000-0002",
    wa: "6281200000002",
    hours: "Sen–Sab 07.00–19.00",
  },
  {
    name: "Cabang Timur",
    address: "Jl. Swim East No. 12, Jakarta Timur",
    phone: "0812-0000-0003",
    wa: "6281200000003",
    hours: "Sen–Sab 07.00–19.00",
  },
];

export default function KontakPage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="relative py-16 px-5 overflow-hidden bg-gradient-to-b from-sky-50 to-white">
        <div className="absolute inset-0 pointer-events-none" aria-hidden>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-40 rounded-full bg-sky-100/80 blur-3xl" />
        </div>
        <div className="relative max-w-xl mx-auto text-center">
          <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700">
            <Waves className="h-3 w-3" />
            Hubungi Kami
          </div>
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">Kami Siap Membantu</h1>
          <p className="mt-3 text-gray-500 text-sm sm:text-base">
            Ada pertanyaan soal program, jadwal, atau pendaftaran? Jangan ragu untuk menghubungi kami.
          </p>
        </div>
      </div>

      {/* Quick contact */}
      <section className="py-10 px-5">
        <div className="max-w-3xl mx-auto">
          <div className="grid gap-4 sm:grid-cols-2">
            <a
              href="https://wa.me/6281200000001"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-start gap-4 rounded-2xl border bg-white p-5 shadow-sm hover:shadow-md hover:border-sky-200 transition-all"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-600 group-hover:bg-green-100 transition-colors">
                <MessageCircle className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Chat WhatsApp</p>
                <p className="text-sm text-gray-500 mt-0.5">Respon cepat di jam operasional</p>
                <p className="text-xs text-green-600 mt-1 font-medium">Chat Sekarang →</p>
              </div>
            </a>

            <a
              href="tel:+6281200000001"
              className="group flex items-start gap-4 rounded-2xl border bg-white p-5 shadow-sm hover:shadow-md hover:border-sky-200 transition-all"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600 group-hover:bg-sky-100 transition-colors">
                <Phone className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Telepon</p>
                <p className="text-sm text-gray-500 mt-0.5">0812-0000-0001</p>
                <p className="text-xs text-sky-600 mt-1 font-medium">Hubungi →</p>
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* Branches */}
      <section className="py-10 px-5 pb-20">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-lg font-bold text-gray-900 mb-5">Lokasi Cabang</h2>
          <div className="space-y-4">
            {BRANCHES.map((b) => (
              <div key={b.name} className="rounded-2xl border bg-white p-5 shadow-sm space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-gray-900">{b.name}</p>
                    <p className="flex items-start gap-1.5 text-sm text-gray-500 mt-1">
                      <MapPin className="h-4 w-4 shrink-0 mt-0.5 text-sky-400" />
                      {b.address}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-4 text-xs text-gray-500 pt-2 border-t">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-sky-400" />
                    {b.hours}
                  </span>
                  <span className="flex items-center gap-1">
                    <Phone className="h-3.5 w-3.5 text-sky-400" />
                    {b.phone}
                  </span>
                </div>
                <a
                  href={`https://wa.me/${b.wa}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-green-600 hover:text-green-700 transition-colors"
                >
                  <MessageCircle className="h-3.5 w-3.5" />
                  WhatsApp Cabang Ini
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
