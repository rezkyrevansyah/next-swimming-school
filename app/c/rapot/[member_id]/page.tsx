import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { ReportCardForm } from "./report-card-form";

interface PageProps {
  params: Promise<{ member_id: string }>;
  searchParams: Promise<{ class_id?: string; semester_id?: string; coach_id?: string }>;
}

export default async function ReportCardPage({ params, searchParams }: PageProps) {
  const supabase = createClient(await cookies());
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { member_id } = await params;
  const sp = await searchParams;
  const class_id = sp.class_id;
  const semester_id = sp.semester_id;
  const coach_id = sp.coach_id;

  if (!class_id || !semester_id || !coach_id) notFound();

  // Fetch all data in parallel
  const [memberRes, classRes, semesterRes, attendanceRes, existingReportRes] = await Promise.all([
    supabase
      .from("members")
      .select("id, member_id_code, member_profiles(full_name, dob, gender)")
      .eq("id", member_id)
      .single(),
    supabase
      .from("classes")
      .select("id, name")
      .eq("id", class_id)
      .single(),
    supabase
      .from("semesters")
      .select("id, name, start_date, end_date, input_deadline, status")
      .eq("id", semester_id)
      .single(),
    // Attendance stats for this semester period
    supabase
      .from("attendance_records")
      .select("status")
      .eq("member_id", member_id)
      .eq("class_id", class_id),
    // Existing report card (for edit)
    supabase
      .from("report_cards")
      .select("*")
      .eq("semester_id", semester_id)
      .eq("member_id", member_id)
      .eq("class_id", class_id)
      .maybeSingle(),
  ]);

  if (!memberRes.data || !classRes.data || !semesterRes.data) notFound();

  const member = memberRes.data;
  const cls = classRes.data;
  const semester = semesterRes.data;
  const existing = existingReportRes.data;

  // Calculate attendance stats
  const attendance = { present: 0, late: 0, permitted: 0, sick: 0, absent: 0 };
  (attendanceRes.data ?? []).forEach((r) => {
    if (r.status in attendance) attendance[r.status as keyof typeof attendance]++;
  });
  const sessions_total = Object.values(attendance).reduce((a, b) => a + b, 0);

  const profile = Array.isArray(member.member_profiles)
    ? member.member_profiles[0]
    : member.member_profiles;

  const isPastDeadline = new Date(semester.input_deadline) < new Date();
  const isPublished = existing?.status === "published";
  const canEdit = !isPastDeadline && !isPublished;

  return (
    <div className="p-4 space-y-4 max-w-lg mx-auto pb-24">
      <div className="pt-2">
        <p className="text-xs text-muted-foreground">{semester.name}</p>
        <h1 className="text-xl font-semibold mt-0.5">{profile?.full_name ?? member.member_id_code}</h1>
        <p className="text-sm text-muted-foreground">{cls.name}</p>
      </div>

      {(isPastDeadline || isPublished) && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {isPublished
            ? "Rapot ini sudah dipublikasikan dan tidak dapat diubah."
            : "Deadline input rapot sudah lewat. Tidak dapat lagi mengedit."}
        </div>
      )}

      <ReportCardForm
        memberId={member_id}
        classId={class_id}
        semesterId={semester_id}
        coachId={coach_id}
        memberName={profile?.full_name ?? member.member_id_code}
        semesterName={semester.name}
        attendanceStats={{ ...attendance, sessions_total }}
        existing={existing ? {
          id: existing.id,
          sessions_total: existing.sessions_total,
          sessions_present: existing.sessions_present,
          sessions_late: existing.sessions_late,
          sessions_permitted: existing.sessions_permitted,
          sessions_sick: existing.sessions_sick,
          sessions_absent: existing.sessions_absent,
          skill_scores: existing.skill_scores as Record<string, number>,
          coach_notes: existing.coach_notes,
          goals_achieved: existing.goals_achieved,
          next_goals: existing.next_goals,
          status: existing.status,
        } : null}
        canEdit={canEdit}
        coachAuthId={coach_id}
      />
    </div>
  );
}
