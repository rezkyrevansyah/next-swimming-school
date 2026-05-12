"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { createClient, createAdminClient } from "@/utils/supabase/server";
import { logActivity } from "@/lib/utils/activity-log";
import type { ActionResult } from "@/lib/types/common";

type ChangeField = { old: string | null; new: string | null };
type Changes = Record<string, ChangeField>;

/**
 * Member/coach submit permintaan edit profil.
 * Membuat row baru di change_requests dengan status 'pending'.
 */
export async function submitChangeRequest(
  resourceType: "member_profile" | "coach_profile",
  resourceId: string,
  changes: Changes
): Promise<ActionResult<{ id: string }>> {
  const supabase = createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Tidak terautentikasi." };

  // Cek apakah sudah ada pending request untuk resource ini
  const { data: existing } = await supabase
    .from("change_requests")
    .select("id")
    .eq("resource_type", resourceType)
    .eq("resource_id", resourceId)
    .eq("status", "pending")
    .maybeSingle();

  if (existing) {
    return { error: "Masih ada permintaan yang sedang menunggu persetujuan." };
  }

  const { data, error } = await supabase
    .from("change_requests")
    .insert({
      requester_id: user.id,
      resource_type: resourceType,
      resource_id: resourceId,
      changes,
    })
    .select("id")
    .single();

  if (error) return { error: `Gagal mengirim permintaan: ${error.message}` };

  revalidatePath("/m/profil");
  revalidatePath("/c/profil");
  revalidatePath("/a/approval");

  return { data: { id: data.id } };
}

/**
 * Admin approve change request: apply perubahan ke member_profiles / coach_profiles,
 * update status change_request menjadi 'approved'.
 */
export async function approveChangeRequest(id: string): Promise<ActionResult> {
  const supabase = createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Tidak terautentikasi." };

  const { data: req, error: fetchErr } = await supabase
    .from("change_requests")
    .select("*")
    .eq("id", id)
    .eq("status", "pending")
    .single();

  if (fetchErr || !req) return { error: "Permintaan tidak ditemukan atau sudah diproses." };

  const changes = req.changes as Changes;
  // Fields that are stored as PostgreSQL arrays
  const ARRAY_FIELDS = new Set(["specializations", "certifications", "languages"]);
  const updates: Record<string, unknown> = {};
  for (const [field, { new: newVal }] of Object.entries(changes)) {
    if (ARRAY_FIELDS.has(field)) {
      if (Array.isArray(newVal)) {
        updates[field] = newVal;
      } else if (typeof newVal === "string" && newVal.length > 0) {
        updates[field] = newVal.split(",").map((s) => s.trim()).filter(Boolean);
      } else {
        updates[field] = [];
      }
    } else {
      updates[field] = newVal;
    }
  }

  // Apply ke tabel yang sesuai
  const table = req.resource_type === "member_profile" ? "member_profiles" : "coach_profiles";
  const fkField = req.resource_type === "member_profile" ? "member_id" : "coach_id";

  const { error: updateErr } = await supabase
    .from(table as "member_profiles")
    .update(updates)
    .eq(fkField, req.resource_id);

  if (updateErr) return { error: `Gagal menerapkan perubahan: ${updateErr.message}` };

  // Update status request
  const { error: statusErr } = await supabase
    .from("change_requests")
    .update({
      status: "approved",
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (statusErr) return { error: `Gagal update status: ${statusErr.message}` };

  await logActivity(supabase, {
    action: "approve_change_request",
    resource_type: req.resource_type,
    resource_id: req.resource_id,
  });

  revalidatePath("/a/approval");
  revalidatePath("/m/profil");
  revalidatePath("/c/profil");
  return { data: undefined };
}

/**
 * Admin reject change request: update status menjadi 'rejected' + simpan catatan.
 */
export async function rejectChangeRequest(id: string, note: string): Promise<ActionResult> {
  const supabase = createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Tidak terautentikasi." };

  const { data: req, error: fetchErr } = await supabase
    .from("change_requests")
    .select("resource_type, resource_id")
    .eq("id", id)
    .eq("status", "pending")
    .single();

  if (fetchErr || !req) return { error: "Permintaan tidak ditemukan atau sudah diproses." };

  const { error } = await supabase
    .from("change_requests")
    .update({
      status: "rejected",
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
      note: note || null,
    })
    .eq("id", id);

  if (error) return { error: `Gagal menolak permintaan: ${error.message}` };

  await logActivity(supabase, {
    action: "reject_change_request",
    resource_type: req.resource_type,
    resource_id: req.resource_id,
  });

  revalidatePath("/a/approval");
  revalidatePath("/m/profil");
  revalidatePath("/c/profil");
  return { data: undefined };
}
