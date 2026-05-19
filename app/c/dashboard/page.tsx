import { Suspense } from "react";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ClipboardList, Clock, CheckCircle2, AlertCircle, ShieldBan, Bell } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const DAYS = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

function formatTime(time: string) {
  return time.slice(0, 5);
}

// ── Dynamic: coach-specific data ───────────────────────────────────────────────
async function CoachDashboardContent({ userId }: { userId: string }) {
  const supabase = createClient(await cookies());

  const { data: coach } = await supabase
    .from("coaches")
    .select(`
      id, coach_id_code, status,
      coach_profiles(full_name, nickname),
      coach_branches!inner(branch_id, is_primary, branches(id, name, location_lat, location_lng))
    `)
    .eq("user_id", userId)
    .eq("coach_branches.is_primary", true)
    .single();

  if (!coach) {
    return (
      <div className="p-6 text-center space-y-2">
        <AlertCircle className="h-10 w-10 text-destructive mx-auto" />
        <p className="font-medium">Profil pelatih tidak ditemukan.</p>
        <p className="text-sm text-muted-foreground">Hubungi admin untuk bantuan.</p>
      </div>
    );
  }

  const profile = Array.isArray(coach.coach_profiles)
    ? coach.coach_profiles[0]
    : coach.coach_profiles;

  const branchEntry = Array.isArray(coach.coach_branches)
    ? coach.coach_branches[0]
    : coach.coach_branches;
  const branch = Array.isArray(branchEntry?.branches)
    ? branchEntry.branches[0]
    : branchEntry?.branches;

  const branchId = branch?.id;
  const todayDow = new Date().getDay();
  const todayDate = new Date().toISOString().slice(0, 10);

  const [{ data: allCoachClasses }, { data: clockRecord }, { data: activeSuspensions }, { data: unreadLeaves }] = await Promise.all([
    supabase
      .from("class_coaches")
      .select(`
        class_id,
        classes!inner(
          id, name, slug, capacity, status, branch_id,
          class_schedules(id, day_of_week, start_time, end_time)
        )
      `)
      .eq("coach_id", coach.id),

    supabase
      .from("coach_clock_records")
      .select("id, clock_in_at, clock_in_distance_m")
      .eq("coach_id", coach.id)
      .eq("branch_id", branchId ?? "")
      .eq("clock_in_date", todayDate)
      .maybeSingle(),

    supabase
      .from("coach_suspensions")
      .select("id, reason, resume_at")
      .eq("coach_id", coach.id)
      .is("lifted_at", null)
      .gt("resume_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1),

    supabase
      .from("coach_leaves")
      .select("id, leave_date, reason, coaches!coach_leaves_coach_id_fkey(coach_profiles(full_name)), classes(name)")
      .eq("replacement_coach_id", coach.id)
      .eq("is_read", false)
      .gte("leave_date", todayDate)
      .order("leave_date", { ascending: true }),
  ]);

  const activeSuspension = activeSuspensions?.[0] ?? null;

  // Filter: classes at primary branch, active, with schedule today
  const todaySchedules = (allCoachClasses ?? [])
    .filter((cc) => {
      const cls = Array.isArray(cc.classes) ? cc.classes[0] : cc.classes;
      return cls?.branch_id === branchId && cls?.status === "active";
    })
    .flatMap((cc) => {
      const cls = Array.isArray(cc.classes) ? cc.classes[0] : cc.classes;
      const schedules = cls?.class_schedules ?? [];
      return schedules
        .filter((s: { day_of_week: number }) => s.day_of_week === todayDow)
        .map((s: { id: string; start_time: string; end_time: string }) => ({
          classId: cls!.id,
          className: cls!.name,
          startTime: s.start_time,
          endTime: s.end_time,
        }));
    })
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const hasClasses = todaySchedules.length > 0;
  const hasClockedIn = !!clockRecord;

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 11) return "Selamat pagi";
    if (hour < 15) return "Selamat siang";
    if (hour < 18) return "Selamat sore";
    return "Selamat malam";
  };

  const name = profile?.nickname || profile?.full_name?.split(" ")[0] || "Pelatih";

  return (
    <>
      {/* Greeting */}
      <div className="pt-2">
        <p className="text-muted-foreground text-sm">{greeting()},</p>
        <h1 className="text-xl font-semibold">{name} 👋</h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          {branch?.name ?? "—"} · {DAYS[todayDow]}, {new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
        </p>
      </div>

      {/* Suspension banner */}
      {activeSuspension && (
        <div className="rounded-xl border border-red-300 bg-red-50 dark:bg-red-950/30 dark:border-red-800 p-4 flex items-start gap-3">
          <ShieldBan className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-red-800 dark:text-red-300">Akun kamu sedang disuspend</p>
            <p className="text-xs text-red-700 dark:text-red-400 mt-0.5">
              Aktif kembali:{" "}
              <strong>
                {new Date(activeSuspension.resume_at).toLocaleDateString("id-ID", {
                  day: "numeric", month: "long", year: "numeric",
                })}
              </strong>
              {activeSuspension.reason && ` · ${activeSuspension.reason}`}
            </p>
          </div>
        </div>
      )}

      {/* Leave notifications */}
      {(unreadLeaves ?? []).length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
            <Bell className="h-3.5 w-3.5" />
            Notifikasi Izin
          </h2>
          {(unreadLeaves ?? []).map((leave) => {
            const leaveCoach = Array.isArray((leave as any).coaches) ? (leave as any).coaches[0] : (leave as any).coaches;
            const cp = Array.isArray(leaveCoach?.coach_profiles) ? leaveCoach.coach_profiles[0] : leaveCoach?.coach_profiles;
            const cls = Array.isArray((leave as any).classes) ? (leave as any).classes[0] : (leave as any).classes;
            return (
              <div
                key={leave.id}
                className="rounded-xl border border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-800 px-4 py-3"
              >
                <p className="text-sm font-medium text-blue-900 dark:text-blue-200">
                  {cp?.full_name ?? "Pelatih"} izin · {cls?.name ?? "kelas"}
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-400 mt-0.5">
                  Tanggal:{" "}
                  {new Date(leave.leave_date).toLocaleDateString("id-ID", {
                    day: "numeric", month: "long", year: "numeric",
                  })}
                  {leave.reason && ` · ${leave.reason}`}
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                  Kamu perlu menghandle kelas ini sebagai pengganti.
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* Clock-in banner */}
      {hasClasses && (
        <div className={cn(
          "rounded-xl border p-4 flex items-start gap-3",
          hasClockedIn ? "bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-800" : "bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800"
        )}>
          {hasClockedIn ? (
            <>
              <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-green-800 dark:text-green-300">
                  Sudah absen masuk
                </p>
                <p className="text-xs text-green-700 dark:text-green-400 mt-0.5">
                  {new Date(clockRecord.clock_in_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                  {clockRecord.clock_in_distance_m != null && (
                    <> · Jarak: {Math.round(Number(clockRecord.clock_in_distance_m))}m</>
                  )}
                </p>
              </div>
            </>
          ) : (
            <>
              <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                  Belum absen masuk hari ini
                </p>
                <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
                  Kamu punya {todaySchedules.length} kelas hari ini
                </p>
              </div>
              <Link
                href="/c/clock-in"
                className={cn(buttonVariants({ size: "sm" }), "shrink-0 bg-amber-600 hover:bg-amber-700 text-white border-0")}
              >
                Absen Masuk
              </Link>
            </>
          )}
        </div>
      )}

      {/* Today's classes */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">
          Kelas Hari Ini
        </h2>

        {!hasClasses ? (
          <div className="rounded-xl border px-4 py-8 text-center text-sm text-muted-foreground">
            Tidak ada kelas dijadwalkan hari ini di {branch?.name ?? "cabang ini"}.
          </div>
        ) : (
          <div className="space-y-2">
            {todaySchedules.map((s, i) => (
              <Link
                key={i}
                href={`/c/absensi/${s.classId}`}
                className="flex items-center justify-between rounded-xl border px-4 py-3 hover:bg-muted/50 transition-colors"
              >
                <div className="min-w-0">
                  <p className="font-medium text-sm truncate">{s.className}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {formatTime(s.startTime)} – {formatTime(s.endTime)}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-3">
                  <Badge variant="outline" className="text-xs">
                    <ClipboardList className="h-3 w-3 mr-1" />
                    Absensi
                  </Badge>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Quick links */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">
          Akses Cepat
        </h2>
        <div className="grid grid-cols-2 gap-2">
          <Link
            href="/c/absensi"
            className={cn(buttonVariants({ variant: "outline" }), "h-auto py-3 flex-col gap-1")}
          >
            <ClipboardList className="h-5 w-5" />
            <span className="text-xs">Hub Absensi</span>
          </Link>
          <Link
            href="/c/kelas"
            className={cn(buttonVariants({ variant: "outline" }), "h-auto py-3 flex-col gap-1")}
          >
            <ClipboardList className="h-5 w-5" />
            <span className="text-xs">Kelas Saya</span>
          </Link>
        </div>
      </div>
    </>
  );
}

// ── Skeleton ───────────────────────────────────────────────────────────────────
function DashboardSkeleton() {
  return (
    <>
      <div className="pt-2 space-y-1 animate-pulse">
        <div className="h-4 w-28 bg-muted rounded" />
        <div className="h-7 w-40 bg-muted rounded" />
        <div className="h-3 w-52 bg-muted rounded" />
      </div>
      <div className="h-20 bg-muted rounded-xl animate-pulse" />
      <div className="space-y-2 animate-pulse">
        <div className="h-4 w-24 bg-muted rounded" />
        <div className="h-16 bg-muted rounded-xl" />
        <div className="h-16 bg-muted rounded-xl" />
      </div>
    </>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────
export default function CoachDashboardPage() {
  return (
    <div className="p-4 space-y-4 max-w-lg mx-auto">
      <Suspense fallback={<DashboardSkeleton />}>
        <CoachDashboardContentGated />
      </Suspense>
    </div>
  );
}

async function CoachDashboardContentGated() {
  const supabase = createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return <CoachDashboardContent userId={user.id} />;
}
