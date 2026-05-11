"use server";

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import type { ActionResult } from "@/lib/types/common";

interface SelfRegisterInput {
  full_name: string;
  dob: string;
  gender: string;
  phone: string;
  phone_owner: string;
  parent_name?: string;
  parent_phone?: string;
  address?: string;
  health_history?: string;
  branch_id: string;
  type: string;
}

async function generateMemberCode(
  supabase: Awaited<ReturnType<typeof createClient>>
): Promise<string> {
  const { count } = await supabase
    .from("members")
    .select("*", { count: "exact", head: true });
  const next = ((count ?? 0) + 1).toString().padStart(4, "0");
  return `MBR-${next}`;
}

export async function selfRegisterMember(
  formData: FormData
): Promise<ActionResult<{ memberCode: string }>> {
  const supabase = createClient(await cookies());

  const full_name = (formData.get("full_name") as string)?.trim();
  const dob = (formData.get("dob") as string)?.trim();
  const gender = (formData.get("gender") as string)?.trim();
  const phone = (formData.get("phone") as string)?.trim();
  const phone_owner = (formData.get("phone_owner") as string)?.trim();
  const parent_name = (formData.get("parent_name") as string)?.trim() || null;
  const parent_phone = (formData.get("parent_phone") as string)?.trim() || null;
  const address = (formData.get("address") as string)?.trim() || null;
  const health_history = (formData.get("health_history") as string)?.trim() || null;
  const branch_id = (formData.get("branch_id") as string)?.trim();
  const type = (formData.get("type") as string)?.trim() || "regular";

  if (!full_name || !dob || !gender || !phone || !phone_owner || !branch_id) {
    return { error: "Harap lengkapi semua field yang diperlukan." };
  }

  // Validate branch exists and is active
  const { data: branch } = await supabase
    .from("branches")
    .select("id")
    .eq("id", branch_id)
    .eq("status", "active")
    .is("deleted_at", null)
    .single();

  if (!branch) return { error: "Cabang tidak ditemukan atau tidak aktif." };

  const memberIdCode = await generateMemberCode(supabase);

  const { data: member, error: memberError } = await supabase
    .from("members")
    .insert({
      branch_id,
      type: type as "regular" | "special",
      payment_handling: "prepaid",
      user_id: null,
      has_account: false,
      member_id_code: memberIdCode,
      status: "pending_payment",
    })
    .select("id")
    .single();

  if (memberError || !member) {
    return { error: "Gagal menyimpan pendaftaran. Coba lagi." };
  }

  const { error: profileError } = await supabase.from("member_profiles").insert({
    member_id: member.id,
    full_name,
    dob,
    gender: gender as "male" | "female",
    phone,
    phone_owner: phone_owner as "self" | "parent" | "other",
    parent_name,
    parent_phone,
    address,
    health_history,
  });

  if (profileError) {
    // Best-effort cleanup
    await supabase.from("members").delete().eq("id", member.id);
    return { error: "Gagal menyimpan data profil. Coba lagi." };
  }

  return { data: { memberCode: memberIdCode } };
}
