"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import type { ActionResult } from "@/lib/types/common";
import { logActivity } from "@/lib/utils/activity-log";

// ============================================================================
// Semester actions
// ============================================================================

export async function createSemester(formData: FormData): Promise<ActionResult> {
  const supabase = createClient(await cookies());

  const name = formData.get("name") as string;
  const branch_id = formData.get("branch_id") as string;
  const start_date = formData.get("start_date") as string;
  const end_date = formData.get("end_date") as string;
  const input_deadline = formData.get("input_deadline") as string;

  if (!name || !branch_id || !start_date || !end_date || !input_deadline) {
    return { error: "Semua field wajib diisi." };
  }
  if (new Date(end_date) <= new Date(start_date)) {
    return { error: "Tanggal selesai harus setelah tanggal mulai." };
  }
  if (new Date(input_deadline) < new Date(end_date)) {
    return { error: "Deadline input harus sama atau setelah tanggal selesai." };
  }

  const { error } = await supabase.from("semesters").insert({
    name,
    branch_id,
    start_date,
    end_date,
    input_deadline,
    status: "draft",
  });

  if (error) return { error: `Gagal membuat semester: ${error.message}` };

  await logActivity(supabase, {
    action: "create_semester",
    resource_type: "semesters",
    branch_id,
  });

  revalidatePath("/a/semester");
  return { data: undefined };
}

export async function updateSemesterStatus(
  semesterId: string,
  status: "draft" | "active" | "closed"
): Promise<ActionResult> {
  const supabase = createClient(await cookies());

  const { data: sem } = await supabase
    .from("semesters")
    .select("branch_id")
    .eq("id", semesterId)
    .single();

  const { error } = await supabase
    .from("semesters")
    .update({ status })
    .eq("id", semesterId);

  if (error) return { error: `Gagal mengubah status: ${error.message}` };

  await logActivity(supabase, {
    action: `semester_status_${status}`,
    resource_type: "semesters",
    resource_id: semesterId,
    branch_id: sem?.branch_id,
  });

  revalidatePath("/a/semester");
  return { data: undefined };
}

export async function deleteSemester(semesterId: string): Promise<ActionResult> {
  const supabase = createClient(await cookies());

  // Only allow deleting draft semesters
  const { data: sem } = await supabase
    .from("semesters")
    .select("status, branch_id")
    .eq("id", semesterId)
    .single();

  if (!sem) return { error: "Semester tidak ditemukan." };
  if (sem.status !== "draft") return { error: "Hanya semester berstatus Draft yang bisa dihapus." };

  const { error } = await supabase.from("semesters").delete().eq("id", semesterId);
  if (error) return { error: `Gagal menghapus semester: ${error.message}` };

  revalidatePath("/a/semester");
  return { data: undefined };
}

// ============================================================================
// Report card actions
// ============================================================================

export async function upsertReportCard(formData: FormData): Promise<ActionResult> {
  const supabase = createClient(await cookies());

  const semester_id = formData.get("semester_id") as string;
  const member_id = formData.get("member_id") as string;
  const class_id = formData.get("class_id") as string;
  const coach_id = formData.get("coach_id") as string;
  const sessions_total = parseInt(formData.get("sessions_total") as string) || 0;
  const sessions_present = parseInt(formData.get("sessions_present") as string) || 0;
  const sessions_late = parseInt(formData.get("sessions_late") as string) || 0;
  const sessions_permitted = parseInt(formData.get("sessions_permitted") as string) || 0;
  const sessions_sick = parseInt(formData.get("sessions_sick") as string) || 0;
  const sessions_absent = parseInt(formData.get("sessions_absent") as string) || 0;
  const coach_notes = (formData.get("coach_notes") as string) || null;
  const goals_achieved = (formData.get("goals_achieved") as string) || null;
  const next_goals = (formData.get("next_goals") as string) || null;

  // Parse skill scores (sent as individual fields prefixed with "skill_")
  const skill_scores: Record<string, number> = {};
  for (const [key, value] of formData.entries()) {
    if (key.startsWith("skill_") && value) {
      skill_scores[key.replace("skill_", "")] = Number(value);
    }
  }

  const payload = {
    semester_id,
    member_id,
    class_id,
    coach_id,
    sessions_total,
    sessions_present,
    sessions_late,
    sessions_permitted,
    sessions_sick,
    sessions_absent,
    skill_scores,
    coach_notes,
    goals_achieved,
    next_goals,
    status: "draft" as const,
  };

  const { error } = await supabase
    .from("report_cards")
    .upsert(payload, { onConflict: "semester_id,member_id,class_id" });

  if (error) return { error: `Gagal menyimpan rapot: ${error.message}` };

  revalidatePath("/c/rapot");
  return { data: undefined };
}

export async function publishReportCard(reportCardId: string): Promise<ActionResult> {
  const supabase = createClient(await cookies());

  const { error } = await supabase
    .from("report_cards")
    .update({ status: "published", published_at: new Date().toISOString() })
    .eq("id", reportCardId)
    .eq("status", "draft");

  if (error) return { error: `Gagal mempublikasikan rapot: ${error.message}` };

  revalidatePath("/c/rapot");
  revalidatePath("/m/rapot");
  return { data: undefined };
}

// ============================================================================
// Skill criteria actions
// ============================================================================

export async function createSkillCriteria(formData: FormData): Promise<ActionResult> {
  const supabase = createClient(await cookies());
  const branch_id = formData.get("branch_id") as string;
  const label = (formData.get("label") as string)?.trim();
  const description = (formData.get("description") as string)?.trim() || null;

  if (!branch_id || !label) return { error: "Label wajib diisi." };

  // Generate key from label: lowercase, spaces → underscore, strip non-alphanumeric
  const key = label.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "");
  if (!key) return { error: "Label tidak valid untuk dijadikan key." };

  // Get max sort_order for this branch
  const { data: existing } = await supabase
    .from("skill_criteria")
    .select("sort_order")
    .eq("branch_id", branch_id)
    .order("sort_order", { ascending: false })
    .limit(1);
  const sort_order = (existing?.[0]?.sort_order ?? 0) + 1;

  const { error } = await supabase.from("skill_criteria").insert({
    branch_id, key, label, description, sort_order,
  });
  if (error) {
    if (error.code === "23505") return { error: `Kriteria dengan key "${key}" sudah ada.` };
    return { error: error.message };
  }

  revalidatePath("/a/semester");
  return { data: undefined };
}

export async function updateSkillCriteria(
  id: string,
  updates: { label?: string; description?: string; is_active?: boolean }
): Promise<ActionResult> {
  const supabase = createClient(await cookies());

  const payload: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (updates.label !== undefined) payload.label = updates.label.trim();
  if (updates.description !== undefined) payload.description = updates.description.trim() || null;
  if (updates.is_active !== undefined) payload.is_active = updates.is_active;

  const { error } = await supabase.from("skill_criteria").update(payload).eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/a/semester");
  return { data: undefined };
}

export async function deleteSkillCriteria(id: string): Promise<ActionResult> {
  const supabase = createClient(await cookies());
  const { error } = await supabase.from("skill_criteria").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/a/semester");
  return { data: undefined };
}

export async function reorderSkillCriteria(
  items: { id: string; sort_order: number }[]
): Promise<ActionResult> {
  const supabase = createClient(await cookies());
  const updates = items.map(({ id, sort_order }) =>
    supabase.from("skill_criteria").update({ sort_order }).eq("id", id)
  );
  await Promise.all(updates);
  revalidatePath("/a/semester");
  return { data: undefined };
}
