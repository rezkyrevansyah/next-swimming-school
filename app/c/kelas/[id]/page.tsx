import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Phone, ClipboardList } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const DAYS = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

function formatTime(t: string) {
  return t.slice(0, 5);
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CoachKelasDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = createClient(await cookies());
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Verify coach owns access to this class
  const { data: coach } = await supabase
    .from("coaches")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!coach) redirect("/login");

  const { data: access } = await supabase
    .from("class_coaches")
    .select("class_id")
    .eq("class_id", id)
    .eq("coach_id", coach.id)
    .maybeSingle();

  if (!access) notFound();

  // Fetch class details + members + attendance summary
  const [{ data: cls }, { data: members }, { data: recentAttendance }] =
    await Promise.all([
      supabase
        .from("classes")
        .select("id, name, capacity, status, age_range_min, age_range_max, class_schedules(day_of_week, start_time, end_time)")
        .eq("id", id)
        .single(),

      supabase
        .from("class_members")
        .select(`
          member_id, status, joined_at,
          members!inner(
            id, member_id_code, status,
            member_profiles(full_name, phone, dob)
          )
        `)
        .eq("class_id", id)
        .eq("status", "enrolled"),

      // Last 7 days attendance for this class
      supabase
        .from("attendance_records")
        .select("member_id, session_date, status")
        .eq("class_id", id)
        .gte("session_date", new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString().slice(0, 10))
        .order("session_date", { ascending: false }),
    ]);

  if (!cls) notFound();

  const schedules = cls.class_schedules ?? [];

  // Build attendance map per member (last 7 days)
  const attendanceMap: Record<string, string[]> = {};
  (recentAttendance ?? []).forEach((r) => {
    if (!attendanceMap[r.member_id]) attendanceMap[r.member_id] = [];
    attendanceMap[r.member_id].push(r.status);
  });

  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="p-4 space-y-4 max-w-lg mx-auto pb-24">
      {/* Header */}
      <div className="pt-2">
        <Link
          href="/c/kelas"
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-3"
        >
          <ArrowLeft className="h-4 w-4" />
          Kelas Saya
        </Link>
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-xl font-semibold">{cls.name}</h1>
          <Badge variant={cls.status === "active" ? "default" : "outline"}>
            {cls.status === "active" ? "Aktif" : "Tidak Aktif"}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground mt-0.5">
          {(members ?? []).length}/{cls.capacity} peserta
        </p>
      </div>

      {/* Jadwal */}
      {schedules.length > 0 && (
        <div className="rounded-xl border p-4 space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Jadwal</p>
          <div className="space-y-1">
            {(schedules as { day_of_week: number; start_time: string; end_time: string }[]).map((s, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span>{DAYS[s.day_of_week]}</span>
                <span className="text-muted-foreground">{formatTime(s.start_time)} – {formatTime(s.end_time)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Absensi shortcut */}
      <Link
        href={`/c/absensi/${id}`}
        className={cn(buttonVariants({ variant: "outline" }), "w-full justify-center gap-2")}
      >
        <ClipboardList className="h-4 w-4" />
        Buka Absensi Kelas Ini
      </Link>

      {/* Member list */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">
          Daftar Peserta ({(members ?? []).length})
        </h2>
        {(members ?? []).length === 0 ? (
          <div className="rounded-xl border border-dashed px-6 py-8 text-center text-sm text-muted-foreground">
            Belum ada peserta terdaftar.
          </div>
        ) : (
          <div className="space-y-2">
            {(members ?? []).map((cm) => {
              const member = Array.isArray(cm.members) ? cm.members[0] : cm.members;
              const profile = Array.isArray(member?.member_profiles)
                ? member.member_profiles[0]
                : member?.member_profiles;
              const waPhone = profile?.phone?.replace(/\D/g, "");
              const recentStatuses = attendanceMap[cm.member_id] ?? [];
              const presentCount = recentStatuses.filter((s) => ["present", "late"].includes(s)).length;

              return (
                <div key={cm.member_id} className="rounded-xl border px-4 py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">{profile?.full_name ?? "—"}</p>
                    <p className="text-xs text-muted-foreground font-mono">{member?.member_id_code ?? "—"}</p>
                    {recentStatuses.length > 0 && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        7 hari terakhir: {presentCount}/{recentStatuses.length} hadir
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {profile?.phone && (
                      <a
                        href={`https://wa.me/${waPhone}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-1")}
                      >
                        <Phone className="h-3.5 w-3.5" />
                        WA
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
