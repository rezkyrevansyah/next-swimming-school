import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import {
  ArrowLeft, ArrowRight, Clock, Users, Trophy, Calendar, MapPin, Waves,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const DAY_NAMES = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = createClient(await cookies());
  const { data: cls } = await supabase
    .from("classes")
    .select("name, description")
    .eq("slug", slug)
    .eq("status", "active")
    .is("deleted_at", null)
    .single();

  if (!cls) return { title: "Program Tidak Ditemukan" };

  return {
    title: `${cls.name} — Next Swimming School`,
    description: cls.description ?? `Detail program ${cls.name} di Next Swimming School.`,
    openGraph: {
      title: `${cls.name} — Next Swimming School`,
      description: cls.description ?? `Detail program ${cls.name} di Next Swimming School.`,
    },
  };
}

export default async function ProgramDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const supabase = createClient(await cookies());

  const { data: cls } = await supabase
    .from("classes")
    .select(`
      id, name, slug, description,
      age_range_min, age_range_max,
      monthly_price, sessions_per_month, capacity,
      location_name,
      class_schedules(day_of_week, start_time, end_time),
      class_coaches(coaches(coach_profiles(full_name, photo_url, specializations)))
    `)
    .eq("slug", slug)
    .eq("status", "active")
    .is("deleted_at", null)
    .single();

  if (!cls) notFound();

  const schedules = (cls.class_schedules ?? []) as { day_of_week: number; start_time: string; end_time: string }[];
  const coaches = (cls.class_coaches ?? []).flatMap((cc: any) => {
    const coach = Array.isArray(cc.coaches) ? cc.coaches[0] : cc.coaches;
    const profile = Array.isArray(coach?.coach_profiles) ? coach?.coach_profiles[0] : coach?.coach_profiles;
    return profile ? [profile] : [];
  }) as { full_name: string; photo_url: string | null; specializations: string[] | null }[];

  const ageLabel = cls.age_range_min && cls.age_range_max
    ? `${cls.age_range_min}–${cls.age_range_max} tahun`
    : cls.age_range_min
    ? `${cls.age_range_min}+ tahun`
    : "Semua usia";

  const priceLabel = cls.monthly_price > 0
    ? `Rp ${Number(cls.monthly_price).toLocaleString("id-ID")}/bulan`
    : "Hubungi kami";

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="relative py-14 px-5 bg-gradient-to-b from-sky-50 to-white overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" aria-hidden>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-40 rounded-full bg-sky-100/80 blur-3xl" />
        </div>
        <div className="relative max-w-2xl mx-auto">
          <Link
            href="/program"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Semua Program
          </Link>
          <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700">
            <Waves className="h-3 w-3" />
            Program
          </div>
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">{cls.name}</h1>
          {cls.description && (
            <p className="mt-3 text-gray-500 text-sm sm:text-base max-w-xl">{cls.description}</p>
          )}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-5 pb-20 space-y-6">
        {/* Quick stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: Trophy, label: "Usia", value: ageLabel },
            { icon: Users, label: "Kapasitas", value: `Maks. ${cls.capacity} murid` },
            { icon: Clock, label: "Sesi/Bulan", value: `${cls.sessions_per_month}× sesi` },
            { icon: MapPin, label: "Lokasi", value: cls.location_name ?? "Kolam Utama" },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="rounded-xl border bg-card p-4 space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Icon className="h-3.5 w-3.5" />
                {label}
              </div>
              <p className="font-semibold text-sm">{value}</p>
            </div>
          ))}
        </div>

        {/* Schedule */}
        {schedules.length > 0 && (
          <div className="rounded-xl border bg-card p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <h2 className="font-semibold text-sm">Jadwal Kelas</h2>
            </div>
            <div className="space-y-2">
              {schedules.map((s, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="font-medium">{DAY_NAMES[s.day_of_week]}</span>
                  <span className="text-muted-foreground font-mono">
                    {s.start_time?.slice(0, 5)} – {s.end_time?.slice(0, 5)} WIB
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Coaches */}
        {coaches.length > 0 && (
          <div className="rounded-xl border bg-card p-5 space-y-3">
            <h2 className="font-semibold text-sm">Pelatih</h2>
            <div className="space-y-3">
              {coaches.map((c, i) => (
                <div key={i} className="flex items-center gap-3">
                  {c.photo_url ? (
                    <img src={c.photo_url} alt={c.full_name} className="h-10 w-10 rounded-full object-cover border" />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-sm font-semibold text-muted-foreground border">
                      {c.full_name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-sm">{c.full_name}</p>
                    {c.specializations && (c.specializations as string[]).length > 0 && (
                      <p className="text-xs text-muted-foreground">
                        {(c.specializations as string[]).join(", ")}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pricing */}
        <div className="rounded-xl border border-sky-200 bg-sky-50 p-5 space-y-2">
          <p className="text-xs font-medium text-sky-700 uppercase tracking-wide">Biaya Bulanan</p>
          <p className="text-2xl font-bold text-sky-800">{priceLabel}</p>
          <p className="text-xs text-sky-700">Termasuk {cls.sessions_per_month} sesi latihan per bulan.</p>
        </div>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/daftar/member"
            className={cn(buttonVariants({ size: "default" }), "flex-1 gap-2 justify-center rounded-full")}
          >
            Daftar Sekarang <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/kontak"
            className={cn(buttonVariants({ variant: "outline", size: "default" }), "flex-1 justify-center rounded-full")}
          >
            Tanya Dulu
          </Link>
        </div>
      </div>
    </div>
  );
}
