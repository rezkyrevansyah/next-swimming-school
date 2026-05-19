import { Suspense } from "react";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { ExternalLink } from "lucide-react";

const DAYS = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
function formatTime(t: string) { return t.slice(0, 5); }

export default function MemberJadwalPage() {
  return (
    <Suspense>
      <JadwalContent />
    </Suspense>
  );
}

async function JadwalContent() {
  const supabase = createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: member } = await supabase
    .from("members")
    .select("id")
    .eq("user_id", user.id)
    .single();
  if (!member) redirect("/login");

  const { data: enrollments } = await supabase
    .from("class_members")
    .select(`
      classes!inner(
        id, name, status, capacity, tujuan_title, program_url,
        branches(name),
        class_schedules(day_of_week, start_time, end_time),
        class_coaches(coaches(coach_profiles(full_name)))
      )
    `)
    .eq("member_id", member.id)
    .eq("status", "enrolled");

  // Group schedules by day of week
  type ScheduleEntry = { className: string; startTime: string; endTime: string; branch: string; coaches: string[]; tujuanTitle?: string | null; programUrl?: string | null };
  const byDay: Record<number, ScheduleEntry[]> = {};

  (enrollments ?? []).forEach((e) => {
    const cls = Array.isArray(e.classes) ? e.classes[0] : e.classes;
    if (!cls || cls.status !== "active") return;
    const branch = Array.isArray(cls.branches) ? cls.branches[0] : cls.branches;
    const coaches = (cls.class_coaches ?? []).map((cc: { coaches: unknown }) => {
      const coach = Array.isArray(cc.coaches) ? cc.coaches[0] : cc.coaches;
      const cp = Array.isArray(coach?.coach_profiles) ? coach.coach_profiles[0] : coach?.coach_profiles;
      return cp?.full_name ?? "";
    }).filter(Boolean);

    (cls.class_schedules ?? []).forEach((s: { day_of_week: number; start_time: string; end_time: string }) => {
      if (!byDay[s.day_of_week]) byDay[s.day_of_week] = [];
      byDay[s.day_of_week].push({
        className: cls.name,
        startTime: s.start_time,
        endTime: s.end_time,
        branch: branch?.name ?? "—",
        coaches,
        tujuanTitle: (cls as any).tujuan_title ?? null,
        programUrl: (cls as any).program_url ?? null,
      });
    });
  });

  // Sort each day's entries by start time
  Object.values(byDay).forEach((entries) => entries.sort((a, b) => a.startTime.localeCompare(b.startTime)));

  const todayDow = new Date().getDay();
  const orderedDays = [1, 2, 3, 4, 5, 6, 0]; // Mon–Sun

  return (
    <div className="p-4 space-y-4 max-w-lg mx-auto">
      <div className="pt-2">
        <h1 className="text-xl font-semibold">Jadwal Latihan</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Kelas yang kamu ikuti</p>
      </div>

      {Object.keys(byDay).length === 0 ? (
        <div className="rounded-xl border px-4 py-10 text-center text-sm text-muted-foreground">
          Belum ada jadwal. Hubungi admin untuk pendaftaran kelas.
        </div>
      ) : (
        <div className="space-y-4">
          {orderedDays.filter((d) => byDay[d]).map((dow) => (
            <div key={dow}>
              <div className="flex items-center gap-2 mb-2">
                <h2 className="text-sm font-semibold">{DAYS[dow]}</h2>
                {dow === todayDow && (
                  <Badge variant="default" className="text-xs">Hari ini</Badge>
                )}
              </div>
              <div className="space-y-2">
                {byDay[dow].map((s, i) => (
                  <div key={i} className="rounded-xl border px-4 py-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm">{s.className}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {formatTime(s.startTime)}–{formatTime(s.endTime)} · {s.branch}
                        </p>
                        {s.coaches.length > 0 && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Pelatih: {s.coaches.join(", ")}
                          </p>
                        )}
                        {s.tujuanTitle && (
                          <p className="text-xs text-muted-foreground mt-1 italic">{s.tujuanTitle}</p>
                        )}
                        {s.programUrl && (
                          <a
                            href={s.programUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-1"
                          >
                            <ExternalLink className="h-3 w-3" />
                            Lihat Program Latihan
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
