"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import type { ActionResult } from "@/lib/types/common";
import { z } from "zod";

const memberLeaveSchema = z.object({
  class_id: z.string().uuid("Pilih kelas"),
  leave_date: z.string().min(1, "Pilih tanggal"),
  reason: z.string().max(500).optional().or(z.literal("")),
});

export async function submitMemberLeave(
  formData: FormData
): Promise<ActionResult<void>> {
  const supabase = createClient(await cookies());

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Tidak terautentikasi." };

  const raw = Object.fromEntries(formData.entries());
  const parsed = memberLeaveSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: "Data tidak valid.", fieldErrors: parsed.error.flatten() };
  }

  const { class_id, leave_date, reason } = parsed.data;

  // Get member id from user
  const { data: member, error: memberErr } = await supabase
    .from("members")
    .select("id")
    .eq("user_id", user.id)
    .eq("status", "active")
    .is("deleted_at", null)
    .single();

  if (memberErr || !member) {
    return { error: "Profil anggota tidak ditemukan." };
  }

  // Verify member is enrolled in this class
  const { data: enrollment } = await supabase
    .from("class_members")
    .select("id")
    .eq("member_id", member.id)
    .eq("class_id", class_id)
    .eq("status", "enrolled")
    .single();

  if (!enrollment) {
    return { error: "Kamu tidak terdaftar di kelas ini." };
  }

  const { error } = await supabase.from("member_leaves").insert({
    member_id: member.id,
    class_id,
    leave_date,
    reason: reason || null,
  });

  if (error) {
    if (error.code === "23505") {
      return { error: "Izin untuk kelas dan tanggal ini sudah diajukan." };
    }
    return { error: `Gagal mengajukan izin: ${error.message}` };
  }

  revalidatePath("/m/izin");
  revalidatePath("/m/dashboard");
  return { data: undefined };
}

export async function cancelMemberLeave(leaveId: string): Promise<ActionResult<void>> {
  const supabase = createClient(await cookies());

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Tidak terautentikasi." };

  // Get member id
  const { data: member } = await supabase
    .from("members")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!member) return { error: "Profil anggota tidak ditemukan." };

  // Only allow cancel if leave_date is today or future
  const { data: leave } = await supabase
    .from("member_leaves")
    .select("id, leave_date")
    .eq("id", leaveId)
    .eq("member_id", member.id)
    .single();

  if (!leave) return { error: "Data izin tidak ditemukan." };

  const today = new Date().toISOString().slice(0, 10);
  if (leave.leave_date < today) {
    return { error: "Izin yang sudah lewat tidak dapat dibatalkan." };
  }

  const { error } = await supabase
    .from("member_leaves")
    .delete()
    .eq("id", leaveId)
    .eq("member_id", member.id);

  if (error) return { error: `Gagal membatalkan izin: ${error.message}` };

  revalidatePath("/m/izin");
  revalidatePath("/m/dashboard");
  return { data: undefined };
}
