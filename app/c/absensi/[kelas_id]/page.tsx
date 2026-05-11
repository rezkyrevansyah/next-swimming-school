import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { AttendanceTabs } from "./attendance-tabs";

interface PageProps {
  params: Promise<{ kelas_id: string }>;
}

function formatTime(t: string) { return t.slice(0, 5); }

const DAYS = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

export default async function AbsensiActivePage({ params }: PageProps) {
  const { kelas_id } = await params;
  const supabase = createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: coach } = await supabase
    .from("coaches")
    .select("id, coach_branches!inner(branch_id, is_primary)")
    .eq("user_id", user.id)
    .eq("coach_branches.is_primary", true)
    .single();

  if (!coach) redirect("/c/dashboard");

  // Get class info + today's schedule
  const { data: cls, error } = await supabase
    .from("classes")
    .select(`*, class_schedules(day_of_week, start_time, end_time), branches(name)`)
    .eq("id", kelas_id)
    .single();

  if (error || !cls) notFound();

  const todayDow = new Date().getDay();
  const todayDate = new Date().toISOString().slice(0, 10);

  const todaySchedule = (cls.class_schedules ?? []).find(
    (s: { day_of_week: number }) => s.day_of_week === todayDow
  ) as { start_time: string; end_time: string } | undefined;

  const branch = Array.isArray(cls.branches) ? cls.branches[0] : cls.branches;

  // Get enrolled members
  const { data: enrolled } = await supabase
    .from("class_members")
    .select(`
      member_id,
      members!inner(id, member_id_code, status, member_profiles(full_name))
    `)
    .eq("class_id", kelas_id)
    .eq("status", "enrolled");

  // Get existing attendance records for today
  const { data: existingRecords } = await supabase
    .from("attendance_records")
    .select("member_id, status, scan_method")
    .eq("class_id", kelas_id)
    .eq("session_date", todayDate);

  const members = (enrolled ?? []).map((e) => {
    const m = Array.isArray(e.members) ? e.members[0] : e.members;
    const profile = Array.isArray(m?.member_profiles) ? m.member_profiles[0] : m?.member_profiles;
    const existing = (existingRecords ?? []).find((r) => r.member_id === e.member_id);
    return {
      id: m?.id ?? e.member_id,
      memberCode: m?.member_id_code ?? "",
      fullName: profile?.full_name ?? "—",
      existingStatus: existing?.status ?? null,
    };
  });

  const presentCount = (existingRecords ?? []).filter(
    (r) => r.status === "present" || r.status === "late"
  ).length;

  return (
    <div className="p-4 space-y-4 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-start gap-2 pt-2">
        <Link
          href="/c/absensi"
          className={buttonVariants({ variant: "ghost", size: "icon-sm" })}
        >
          <ChevronLeft className="h-4 w-4" />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-semibold truncate">{cls.name}</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {branch?.name ?? "—"} · {DAYS[todayDow]}
            {todaySchedule && ` · ${formatTime(todaySchedule.start_time)}–${formatTime(todaySchedule.end_time)}`}
          </p>
          <p className="text-xs text-muted-foreground">
            {presentCount} / {members.length} hadir
          </p>
        </div>
      </div>

      <AttendanceTabs
        classId={kelas_id}
        sessionDate={todayDate}
        classStartTime={todaySchedule?.start_time ?? null}
        members={members}
        initialRecords={(existingRecords ?? []) as { member_id: string; status: string }[]}
      />
    </div>
  );
}
