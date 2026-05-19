import { Suspense } from "react";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ClipboardList, Clock, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { LeaveRequestDialog } from "./leave-request-dialog";

const DAYS = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

function formatTime(t: string) { return t.slice(0, 5); }

function AbsensiSkeleton() {
  return (
    <div className="p-4 space-y-4 max-w-lg mx-auto animate-pulse">
      <div className="pt-2 space-y-1">
        <div className="h-7 w-36 bg-muted rounded" />
        <div className="h-4 w-48 bg-muted rounded" />
      </div>
      <div className="h-16 bg-muted rounded-xl" />
      <div className="space-y-2">
        <div className="h-4 w-24 bg-muted rounded" />
        <div className="h-16 bg-muted rounded-xl" />
        <div className="h-16 bg-muted rounded-xl" />
      </div>
    </div>
  );
}

export default function AbsensiHubPage() {
  return (
    <Suspense fallback={<AbsensiSkeleton />}>
      <AbsensiHubContent />
    </Suspense>
  );
}

async function AbsensiHubContent() {
  const supabase = createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: coach } = await supabase
    .from("coaches")
    .select(`
      id,
      coach_branches!inner(branch_id, is_primary, branches(id, name))
    `)
    .eq("user_id", user.id)
    .eq("coach_branches.is_primary", true)
    .single();

  if (!coach) {
    return (
      <div className="p-6 text-center space-y-2">
        <AlertCircle className="h-10 w-10 text-destructive mx-auto" />
        <p className="text-sm text-muted-foreground">Profil pelatih tidak ditemukan.</p>
      </div>
    );
  }

  const branchEntry = Array.isArray(coach.coach_branches) ? coach.coach_branches[0] : coach.coach_branches;
  const branch = Array.isArray(branchEntry?.branches) ? branchEntry.branches[0] : branchEntry?.branches;
  const branchId = branch?.id;
  const todayDow = new Date().getDay();
  const todayDate = new Date().toISOString().slice(0, 10);

  // Check clock-in
  const { data: clockRecord } = await supabase
    .from("coach_clock_records")
    .select("id")
    .eq("coach_id", coach.id)
    .eq("branch_id", branchId ?? "")
    .eq("clock_in_date", todayDate)
    .maybeSingle();

  const hasClockedIn = !!clockRecord;

  // Get today's classes
  const { data: classCoaches } = await supabase
    .from("class_coaches")
    .select(`
      classes!inner(
        id, name, capacity, branch_id, status,
        class_schedules(day_of_week, start_time, end_time)
      )
    `)
    .eq("coach_id", coach.id);

  const todayClasses = (classCoaches ?? [])
    .flatMap((cc) => {
      const cls = Array.isArray(cc.classes) ? cc.classes[0] : cc.classes;
      if (!cls || cls.branch_id !== branchId || cls.status !== "active") return [];
      const todaySchedules = (cls.class_schedules ?? []).filter(
        (s: { day_of_week: number }) => s.day_of_week === todayDow
      );
      return todaySchedules.map((s: { start_time: string; end_time: string }) => ({
        id: cls.id,
        name: cls.name,
        startTime: s.start_time,
        endTime: s.end_time,
      }));
    })
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  // Attendance counts per class today
  const attendanceCounts: Record<string, number> = {};
  if (todayClasses.length > 0) {
    const classIds = todayClasses.map((c) => c.id);
    const { data: records } = await supabase
      .from("attendance_records")
      .select("class_id, status")
      .in("class_id", classIds)
      .eq("session_date", todayDate)
      .in("status", ["present", "late"]);

    (records ?? []).forEach((r) => {
      attendanceCounts[r.class_id] = (attendanceCounts[r.class_id] ?? 0) + 1;
    });
  }

  // Fetch active coaches in same branch for replacement dropdown (exclude self)
  const { data: branchCoaches } = await supabase
    .from("coach_branches")
    .select("coach_id, coaches!inner(id, status, deleted_at, coach_profiles(full_name))")
    .eq("branch_id", branchId ?? "")
    .neq("coach_id", coach.id);

  const replacementCoaches = (branchCoaches ?? [])
    .map((bc) => {
      const c = Array.isArray(bc.coaches) ? bc.coaches[0] : bc.coaches;
      const cp = Array.isArray(c?.coach_profiles) ? c.coach_profiles[0] : c?.coach_profiles;
      return { id: bc.coach_id, full_name: cp?.full_name ?? "—" };
    })
    .filter((c) => c.full_name !== "—");

  // Fetch today's submitted leave requests by this coach
  const { data: todayLeaves } = await supabase
    .from("coach_leaves")
    .select("id, class_id")
    .eq("coach_id", coach.id)
    .eq("leave_date", todayDate);

  const leavedClassIds = new Set((todayLeaves ?? []).map((l) => l.class_id));

  return (
    <div className="p-4 space-y-4 max-w-lg mx-auto">
      <div className="pt-2">
        <h1 className="text-xl font-semibold">Hub Absensi</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {branch?.name ?? "—"} · {DAYS[todayDow]}, {new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long" })}
        </p>
      </div>

      {/* Clock-in warning */}
      {!hasClockedIn && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800 px-4 py-3 text-sm">
          <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-amber-800 dark:text-amber-300">Belum absen masuk</p>
            <p className="text-amber-700 dark:text-amber-400 text-xs mt-0.5">
              Kamu perlu{" "}
              <Link href="/c/clock-in" className="underline font-medium">absen masuk</Link>
              {" "}terlebih dahulu.
            </p>
          </div>
        </div>
      )}

      {/* Class list */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">
          Kelas Hari Ini
        </h2>

        {todayClasses.length === 0 ? (
          <div className="rounded-xl border px-4 py-8 text-center text-sm text-muted-foreground">
            Tidak ada kelas hari ini.
          </div>
        ) : (
          <div className="space-y-2">
            {todayClasses.map((cls) => {
              const count = attendanceCounts[cls.id] ?? 0;
              const hasLeave = leavedClassIds.has(cls.id);
              return (
                <div key={cls.id} className="rounded-xl border overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm truncate">{cls.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        <Clock className="inline h-3 w-3 mr-1" />
                        {formatTime(cls.startTime)} – {formatTime(cls.endTime)}
                        {count > 0 && <span className="ml-2">{count} hadir</span>}
                      </p>
                    </div>
                    {hasLeave && (
                      <Badge variant="secondary" className="text-xs shrink-0 ml-3 bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                        Izin
                      </Badge>
                    )}
                  </div>
                  <div className="flex border-t">
                    <Link
                      href={hasClockedIn ? `/c/absensi/${cls.id}` : "#"}
                      onClick={!hasClockedIn ? (e) => e.preventDefault() : undefined}
                      className={cn(
                        "flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium transition-colors border-r",
                        hasClockedIn
                          ? "hover:bg-muted/50 text-foreground"
                          : "opacity-40 cursor-not-allowed text-muted-foreground"
                      )}
                    >
                      <ClipboardList className="h-3.5 w-3.5" />
                      Buka Absensi
                    </Link>
                    {hasLeave ? (
                      <div className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs text-muted-foreground">
                        Izin sudah diajukan
                      </div>
                    ) : (
                      <LeaveRequestDialog
                        classId={cls.id}
                        className={cls.name}
                        leaveDate={todayDate}
                        replacementCoaches={replacementCoaches}
                      />
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
