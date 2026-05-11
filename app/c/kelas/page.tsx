import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { AlertCircle, Users, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const DAYS = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

function formatTime(t: string) {
  return t.slice(0, 5);
}

export default async function CoachKelasPage() {
  const supabase = createClient(await cookies());
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: coach } = await supabase
    .from("coaches")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!coach) {
    return (
      <div className="p-6 text-center space-y-2">
        <AlertCircle className="h-10 w-10 text-destructive mx-auto" />
        <p className="font-medium">Profil pelatih tidak ditemukan.</p>
      </div>
    );
  }

  const { data: classCoaches } = await supabase
    .from("class_coaches")
    .select(`
      class_id,
      classes!inner(
        id, name, slug, capacity, status, age_range_min, age_range_max,
        class_schedules(day_of_week, start_time, end_time),
        class_members(member_id, status)
      )
    `)
    .eq("coach_id", coach.id);

  const classes = (classCoaches ?? []).map((cc) => {
    const cls = Array.isArray(cc.classes) ? cc.classes[0] : cc.classes;
    const enrolledCount = (cls?.class_members ?? []).filter(
      (cm: { status: string }) => cm.status === "enrolled"
    ).length;
    return { ...cls, enrolledCount };
  }).filter((c) => c && c.status === "active");

  return (
    <div className="p-4 space-y-4 max-w-lg mx-auto pb-24">
      <div className="pt-2">
        <h1 className="text-xl font-semibold">Kelas Saya</h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          {classes.length} kelas aktif
        </p>
      </div>

      {classes.length === 0 ? (
        <div className="rounded-xl border border-dashed px-6 py-12 text-center text-muted-foreground text-sm">
          Belum ada kelas yang ditugaskan ke kamu.
        </div>
      ) : (
        <div className="space-y-3">
          {classes.map((cls) => {
            if (!cls) return null;
            const schedules = (cls.class_schedules ?? []) as { day_of_week: number; start_time: string; end_time: string }[];

            return (
              <Link
                key={cls.id}
                href={`/c/kelas/${cls.id}`}
                className="block rounded-xl border bg-card hover:bg-muted/50 transition-colors overflow-hidden"
              >
                <div className="px-4 py-4 space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold truncate">{cls.name}</p>
                      {(cls.age_range_min || cls.age_range_max) && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {cls.age_range_min && cls.age_range_max
                            ? `${cls.age_range_min}–${cls.age_range_max} tahun`
                            : cls.age_range_min
                            ? `${cls.age_range_min}+ tahun`
                            : `s/d ${cls.age_range_max} tahun`}
                        </p>
                      )}
                    </div>
                    <Badge variant="default" className="shrink-0">Aktif</Badge>
                  </div>

                  {/* Schedules */}
                  {schedules.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {schedules.map((s, i) => (
                        <span
                          key={i}
                          className="flex items-center gap-1 text-xs bg-muted rounded-md px-2 py-0.5"
                        >
                          <Clock className="h-3 w-3" />
                          {DAYS[s.day_of_week]} {formatTime(s.start_time)}–{formatTime(s.end_time)}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Capacity */}
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Users className="h-3.5 w-3.5" />
                    {cls.enrolledCount}/{cls.capacity} peserta
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
