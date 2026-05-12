"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import { createClassSchema, updateClassSchema } from "@/lib/schemas/class";
import type { ActionResult } from "@/lib/types/common";
import type { Tables } from "@/lib/types/database";
import { logActivity } from "@/lib/utils/activity-log";

type ClassRow = Tables<"classes">;

export async function createClass(
  formData: FormData
): Promise<ActionResult<ClassRow>> {
  const supabase = createClient(await cookies());

  const raw = Object.fromEntries(formData.entries());
  const parsed = createClassSchema.safeParse(raw);

  if (!parsed.success) {
    return { error: "Data tidak valid.", fieldErrors: parsed.error.flatten() };
  }

  const {
    name,
    slug,
    description,
    branch_id,
    capacity,
    monthly_price,
    sessions_per_month,
    age_range_min,
    age_range_max,
    location_name,
    status,
  } = parsed.data;

  const { data: cls, error } = await supabase
    .from("classes")
    .insert({
      name,
      slug,
      description: description || null,
      branch_id,
      capacity,
      monthly_price,
      sessions_per_month,
      age_range_min: age_range_min ?? null,
      age_range_max: age_range_max ?? null,
      location_name: location_name || null,
      status,
    })
    .select()
    .single();

  if (error || !cls) {
    return { error: `Gagal menyimpan kelas: ${error?.message}` };
  }

  revalidatePath("/a/kelas");
  return { data: cls };
}

export async function updateClass(
  formData: FormData
): Promise<ActionResult<ClassRow>> {
  const supabase = createClient(await cookies());

  const raw = Object.fromEntries(formData.entries());
  const parsed = updateClassSchema.safeParse(raw);

  if (!parsed.success) {
    return { error: "Data tidak valid.", fieldErrors: parsed.error.flatten() };
  }

  const { id, age_range_min, age_range_max, description, location_name, ...rest } =
    parsed.data;

  const updateData: Record<string, unknown> = { ...rest };
  if (description !== undefined) updateData.description = description || null;
  if (location_name !== undefined) updateData.location_name = location_name || null;
  if (age_range_min !== undefined) updateData.age_range_min = age_range_min ?? null;
  if (age_range_max !== undefined) updateData.age_range_max = age_range_max ?? null;

  const { data: updated, error } = await supabase
    .from("classes")
    .update(updateData)
    .eq("id", id!)
    .select()
    .single();

  if (error) return { error: `Gagal memperbarui kelas: ${error.message}` };

  revalidatePath("/a/kelas");
  revalidatePath(`/a/kelas/${id}`);
  return { data: updated };
}

export async function softDeleteClass(id: string): Promise<ActionResult> {
  const supabase = createClient(await cookies());

  const { error } = await supabase
    .from("classes")
    .update({ deleted_at: new Date().toISOString(), status: "inactive" })
    .eq("id", id)
    .is("deleted_at", null);

  if (error) return { error: `Gagal mengarsipkan kelas: ${error.message}` };

  revalidatePath("/a/kelas");
  return { data: undefined };
}

export async function restoreClass(id: string): Promise<ActionResult> {
  const supabase = createClient(await cookies());

  const { error } = await supabase
    .from("classes")
    .update({ deleted_at: null, status: "active" })
    .eq("id", id);

  if (error) return { error: `Gagal memulihkan kelas: ${error.message}` };

  revalidatePath("/a/kelas");
  return { data: undefined };
}

export async function hardDeleteClass(id: string): Promise<ActionResult> {
  const supabase = createClient(await cookies());

  // Delete related records first
  await supabase.from("class_schedules").delete().eq("class_id", id);
  await supabase.from("class_coaches").delete().eq("class_id", id);
  await supabase.from("class_members").delete().eq("class_id", id);

  const { error } = await supabase.from("classes").delete().eq("id", id);
  if (error) return { error: `Gagal menghapus kelas: ${error.message}` };

  revalidatePath("/a/kelas");
  return { data: undefined };
}

// ── Schedules ────────────────────────────────────────────────────────────────

export async function saveSchedules(
  classId: string,
  schedules: { day_of_week: number; start_time: string; end_time: string }[]
): Promise<ActionResult> {
  const supabase = createClient(await cookies());

  // Delete existing schedules then re-insert (replace strategy)
  const { error: deleteError } = await supabase
    .from("class_schedules")
    .delete()
    .eq("class_id", classId);

  if (deleteError) {
    return { error: `Gagal menghapus jadwal lama: ${deleteError.message}` };
  }

  if (schedules.length === 0) {
    revalidatePath(`/a/kelas/${classId}`);
    return { data: undefined };
  }

  const rows = schedules.map((s) => ({
    class_id: classId,
    day_of_week: s.day_of_week,
    start_time: s.start_time,
    end_time: s.end_time,
  }));

  const { error: insertError } = await supabase
    .from("class_schedules")
    .insert(rows);

  if (insertError) {
    return { error: `Gagal menyimpan jadwal: ${insertError.message}` };
  }

  await logActivity(supabase, {
    action: "update_schedules",
    resource_type: "classes",
    resource_id: classId,
  });

  revalidatePath(`/a/kelas/${classId}`);
  return { data: undefined };
}

// ── Coach Assignment ──────────────────────────────────────────────────────────

export async function assignCoach(
  classId: string,
  coachId: string
): Promise<ActionResult> {
  const supabase = createClient(await cookies());

  const { error } = await supabase.from("class_coaches").insert({
    class_id: classId,
    coach_id: coachId,
  });

  if (error) {
    if (error.code === "23505") {
      return { error: "Pelatih sudah ditugaskan ke kelas ini." };
    }
    return { error: `Gagal menugaskan pelatih: ${error.message}` };
  }

  await logActivity(supabase, {
    action: "assign_coach",
    resource_type: "classes",
    resource_id: classId,
    metadata: { coach_id: coachId },
  });

  revalidatePath(`/a/kelas/${classId}`);
  return { data: undefined };
}

export async function unassignCoach(
  classId: string,
  coachId: string
): Promise<ActionResult> {
  const supabase = createClient(await cookies());

  const { error } = await supabase
    .from("class_coaches")
    .delete()
    .eq("class_id", classId)
    .eq("coach_id", coachId);

  if (error) return { error: `Gagal menghapus pelatih: ${error.message}` };

  await logActivity(supabase, {
    action: "unassign_coach",
    resource_type: "classes",
    resource_id: classId,
    metadata: { coach_id: coachId },
  });

  revalidatePath(`/a/kelas/${classId}`);
  return { data: undefined };
}

// ── Attendance ────────────────────────────────────────────────────────────────

const LATE_THRESHOLD_MINUTES = 15;

export async function recordAttendanceByQr(
  scannedMemberId: string,
  classId: string,
  sessionDate: string // YYYY-MM-DD
): Promise<ActionResult<{ memberName: string; status: string }>> {
  const supabase = createClient(await cookies());

  // Get coach id
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Tidak terautentikasi." };

  const { data: coach } = await supabase
    .from("coaches")
    .select("id")
    .eq("user_id", user.id)
    .single();

  // Validate member: active, not deleted, enrolled in this class
  const { data: member } = await supabase
    .from("members")
    .select(`id, status, deleted_at, member_profiles(full_name)`)
    .eq("id", scannedMemberId)
    .single();

  if (!member || member.deleted_at || member.status !== "active") {
    return { error: "Member tidak ditemukan atau tidak aktif." };
  }

  const { data: enrollment } = await supabase
    .from("class_members")
    .select("status")
    .eq("class_id", classId)
    .eq("member_id", scannedMemberId)
    .single();

  if (!enrollment || enrollment.status !== "enrolled") {
    return { error: "Member tidak terdaftar di kelas ini." };
  }

  // Get class schedule for today to determine late status
  const todayDow = new Date().getDay();
  const { data: schedule } = await supabase
    .from("class_schedules")
    .select("start_time")
    .eq("class_id", classId)
    .eq("day_of_week", todayDow)
    .maybeSingle();

  let attendanceStatus: "present" | "late" = "present";
  if (schedule?.start_time) {
    const [h, m] = schedule.start_time.split(":").map(Number);
    const classStart = new Date();
    classStart.setHours(h, m, 0, 0);
    const diffMin = (Date.now() - classStart.getTime()) / 60_000;
    if (diffMin > LATE_THRESHOLD_MINUTES) attendanceStatus = "late";
  }

  // Get branch_id from class
  const { data: cls } = await supabase
    .from("classes")
    .select("branch_id")
    .eq("id", classId)
    .single();

  // Upsert attendance (duplicate = already recorded)
  const { error } = await supabase
    .from("attendance_records")
    .insert({
      member_id: scannedMemberId,
      class_id: classId,
      branch_id: cls?.branch_id ?? "",
      session_date: sessionDate,
      status: attendanceStatus,
      recorded_by_coach_id: coach?.id ?? null,
      scanned_at: new Date().toISOString(),
      scan_method: "qr",
    });

  if (error) {
    if (error.code === "23505") return { error: "DUPLICATE" }; // already recorded
    return { error: `Gagal menyimpan absensi: ${error.message}` };
  }

  const profile = Array.isArray(member.member_profiles)
    ? member.member_profiles[0]
    : member.member_profiles;

  return { data: { memberName: profile?.full_name ?? "—", status: attendanceStatus } };
}

export async function recordAttendanceManual(
  memberId: string,
  classId: string,
  sessionDate: string,
  status: "present" | "late" | "permitted" | "sick" | "absent"
): Promise<ActionResult> {
  const supabase = createClient(await cookies());

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Tidak terautentikasi." };

  const { data: coach } = await supabase
    .from("coaches")
    .select("id")
    .eq("user_id", user.id)
    .single();

  const { data: cls } = await supabase
    .from("classes")
    .select("branch_id")
    .eq("id", classId)
    .single();

  // Upsert: update if exists, insert if not
  const { error } = await supabase
    .from("attendance_records")
    .upsert({
      member_id: memberId,
      class_id: classId,
      branch_id: cls?.branch_id ?? "",
      session_date: sessionDate,
      status,
      recorded_by_coach_id: coach?.id ?? null,
      scan_method: "manual",
    }, { onConflict: "member_id,class_id,session_date" });

  if (error) return { error: `Gagal menyimpan absensi: ${error.message}` };

  revalidatePath(`/c/absensi/${classId}`);
  return { data: undefined };
}

// ── Member Enrollment ─────────────────────────────────────────────────────────

export async function enrollMember(
  classId: string,
  memberId: string
): Promise<ActionResult> {
  const supabase = createClient(await cookies());

  // Check capacity
  const [{ count: enrolled }, { data: cls }] = await Promise.all([
    supabase
      .from("class_members")
      .select("*", { count: "exact", head: true })
      .eq("class_id", classId)
      .eq("status", "enrolled"),
    supabase
      .from("classes")
      .select("capacity")
      .eq("id", classId)
      .single(),
  ]);

  if (cls && (enrolled ?? 0) >= cls.capacity) {
    return { error: "Kapasitas kelas sudah penuh." };
  }

  // Upsert: handles both new enrollments and re-enrolling a previously withdrawn member
  const { error } = await supabase.from("class_members").upsert(
    { class_id: classId, member_id: memberId, status: "enrolled" },
    { onConflict: "class_id,member_id" }
  );

  if (error) {
    return { error: `Gagal mendaftarkan anggota: ${error.message}` };
  }

  await logActivity(supabase, {
    action: "enroll_member",
    resource_type: "classes",
    resource_id: classId,
    metadata: { member_id: memberId },
  });

  revalidatePath(`/a/kelas/${classId}`);
  revalidatePath(`/a/member/${memberId}`);
  return { data: undefined };
}

export async function unenrollMember(
  classId: string,
  memberId: string
): Promise<ActionResult> {
  const supabase = createClient(await cookies());

  const { error } = await supabase
    .from("class_members")
    .update({ status: "withdrawn" })
    .eq("class_id", classId)
    .eq("member_id", memberId);

  if (error) return { error: `Gagal mengeluarkan anggota: ${error.message}` };

  await logActivity(supabase, {
    action: "unenroll_member",
    resource_type: "classes",
    resource_id: classId,
    metadata: { member_id: memberId },
  });

  revalidatePath(`/a/kelas/${classId}`);
  revalidatePath(`/a/member/${memberId}`);
  return { data: undefined };
}
