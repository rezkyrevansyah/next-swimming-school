"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import type { ActionResult } from "@/lib/types/common";
import { logActivity } from "@/lib/utils/activity-log";

/**
 * Admin manually inputs an attendance record (izin / sakit / etc.)
 */
export async function createManualAttendance(
  formData: FormData
): Promise<ActionResult> {
  const supabase = createClient(await cookies());

  const member_id = formData.get("member_id") as string;
  const class_id = formData.get("class_id") as string;
  const session_date = formData.get("session_date") as string;
  const status = formData.get("status") as string;
  const notes = (formData.get("notes") as string) || null;

  if (!member_id || !class_id || !session_date || !status) {
    return { error: "Semua field wajib diisi." };
  }

  const VALID_STATUSES = ["present", "late", "permitted", "sick", "absent"];
  if (!VALID_STATUSES.includes(status)) {
    return { error: "Status tidak valid." };
  }

  // Get branch_id from member
  const { data: member } = await supabase
    .from("members")
    .select("branch_id")
    .eq("id", member_id)
    .single();

  if (!member) return { error: "Anggota tidak ditemukan." };

  // Check for duplicate
  const { data: existing } = await supabase
    .from("attendance_records")
    .select("id")
    .eq("member_id", member_id)
    .eq("class_id", class_id)
    .eq("session_date", session_date)
    .maybeSingle();

  if (existing) {
    return { error: "Absensi untuk anggota, kelas, dan tanggal ini sudah ada." };
  }

  const { error } = await supabase.from("attendance_records").insert({
    member_id,
    class_id,
    branch_id: member.branch_id,
    session_date,
    status,
    scan_method: "manual",
    notes,
  });

  if (error) return { error: `Gagal menyimpan absensi: ${error.message}` };

  await logActivity(supabase, {
    action: "create_manual_attendance",
    resource_type: "attendance_records",
    branch_id: member.branch_id,
    metadata: { member_id, class_id, session_date, status },
  });

  revalidatePath("/a/absensi");
  return { data: undefined };
}

/**
 * Admin deletes an attendance record.
 */
export async function deleteAttendance(recordId: string): Promise<ActionResult> {
  const supabase = createClient(await cookies());

  const { data: record } = await supabase
    .from("attendance_records")
    .select("branch_id")
    .eq("id", recordId)
    .single();

  const { error } = await supabase
    .from("attendance_records")
    .delete()
    .eq("id", recordId);

  if (error) return { error: `Gagal menghapus absensi: ${error.message}` };

  await logActivity(supabase, {
    action: "delete_attendance",
    resource_type: "attendance_records",
    resource_id: recordId,
    branch_id: record?.branch_id,
  });

  revalidatePath("/a/absensi");
  return { data: undefined };
}
