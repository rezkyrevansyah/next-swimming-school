"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import { createMemberSchema, updateMemberSchema } from "@/lib/schemas/member";
import type { ActionResult } from "@/lib/types/common";
import type { Tables } from "@/lib/types/database";
import { logActivity } from "@/lib/utils/activity-log";

type MemberRow = Tables<"members">;

/** Generate next member ID code, e.g. MBR-0001 */
async function generateMemberCode(
  supabase: Awaited<ReturnType<typeof createClient>>
): Promise<string> {
  const { count } = await supabase
    .from("members")
    .select("*", { count: "exact", head: true });

  const next = ((count ?? 0) + 1).toString().padStart(4, "0");
  return `MBR-${next}`;
}

export async function createMember(
  formData: FormData
): Promise<ActionResult<MemberRow>> {
  const supabase = createClient(await cookies());

  const raw = Object.fromEntries(formData.entries());
  const parsed = createMemberSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      error: "Data tidak valid.",
      fieldErrors: parsed.error.flatten(),
    };
  }

  const {
    full_name,
    nickname,
    dob,
    gender,
    phone,
    phone_owner,
    parent_name,
    parent_phone,
    address,
    health_history,
    branch_id,
    type,
    payment_handling,
    school_id,
    email,
  } = parsed.data;

  // 1. Optionally create auth user
  let userId: string | null = null;
  if (email) {
    const tempPassword = Math.random().toString(36).slice(-10) + "A1!";
    const { data: authData, error: authError } =
      await supabase.auth.admin.createUser({
        email,
        password: tempPassword,
        email_confirm: true,
      });

    if (authError) {
      return { error: `Gagal membuat akun: ${authError.message}` };
    }
    userId = authData.user.id;
  }

  // 2. Generate member code
  const memberIdCode = await generateMemberCode(supabase);

  // 3. Insert member record
  const { data: member, error: memberError } = await supabase
    .from("members")
    .insert({
      branch_id,
      type,
      payment_handling,
      school_id: school_id || null,
      user_id: userId,
      has_account: !!userId,
      member_id_code: memberIdCode,
    })
    .select()
    .single();

  if (memberError || !member) {
    return { error: `Gagal menyimpan anggota: ${memberError?.message}` };
  }

  // 4. Insert member profile
  const { error: profileError } = await supabase.from("member_profiles").insert({
    member_id: member.id,
    full_name,
    nickname: nickname || null,
    dob,
    gender,
    phone: phone || null,
    phone_owner,
    parent_name: parent_name || null,
    parent_phone: parent_phone || null,
    address: address || null,
    health_history: health_history || null,
  });

  if (profileError) {
    return { error: `Gagal menyimpan profil: ${profileError.message}` };
  }

  // 5. If account created, assign member role
  if (userId) {
    const { data: memberRole } = await supabase
      .from("roles")
      .select("id")
      .eq("name", "member")
      .single();

    if (memberRole) {
      await supabase.from("user_roles").insert({
        user_id: userId,
        role_id: memberRole.id,
        branch_id,
      });
    }
  }

  await logActivity(supabase, {
    action: "create_member",
    resource_type: "members",
    resource_id: member.id,
    branch_id,
  });

  revalidatePath("/a/member");
  return { data: member };
}

export async function updateMember(
  formData: FormData
): Promise<ActionResult<MemberRow>> {
  const supabase = createClient(await cookies());

  const raw = Object.fromEntries(formData.entries());
  const parsed = updateMemberSchema.safeParse(raw);

  if (!parsed.success) {
    return { error: "Data tidak valid.", fieldErrors: parsed.error.flatten() };
  }

  const {
    id,
    full_name,
    nickname,
    dob,
    gender,
    phone,
    phone_owner,
    parent_name,
    parent_phone,
    address,
    health_history,
    branch_id,
    type,
    payment_handling,
    school_id,
  } = parsed.data;

  // Update member record
  if (branch_id || type || payment_handling !== undefined || school_id !== undefined) {
    const { error: memberError } = await supabase
      .from("members")
      .update({
        ...(branch_id && { branch_id }),
        ...(type && { type }),
        ...(payment_handling && { payment_handling }),
        ...(school_id !== undefined && { school_id: school_id || null }),
      })
      .eq("id", id!);

    if (memberError) {
      return { error: `Gagal memperbarui anggota: ${memberError.message}` };
    }
  }

  // Update profile
  const profileUpdate: Record<string, unknown> = {};
  if (full_name) profileUpdate.full_name = full_name;
  if (nickname !== undefined) profileUpdate.nickname = nickname || null;
  if (dob) profileUpdate.dob = dob;
  if (gender) profileUpdate.gender = gender;
  if (phone !== undefined) profileUpdate.phone = phone || null;
  if (phone_owner) profileUpdate.phone_owner = phone_owner;
  if (parent_name !== undefined) profileUpdate.parent_name = parent_name || null;
  if (parent_phone !== undefined) profileUpdate.parent_phone = parent_phone || null;
  if (address !== undefined) profileUpdate.address = address || null;
  if (health_history !== undefined) profileUpdate.health_history = health_history || null;

  if (Object.keys(profileUpdate).length > 0) {
    const { error: profileError } = await supabase
      .from("member_profiles")
      .update(profileUpdate)
      .eq("member_id", id!);

    if (profileError) {
      return { error: `Gagal memperbarui profil: ${profileError.message}` };
    }
  }

  const { data: updated, error } = await supabase
    .from("members")
    .select()
    .eq("id", id!)
    .single();

  if (error) return { error: error.message };

  await logActivity(supabase, {
    action: "update_member",
    resource_type: "members",
    resource_id: id!,
  });

  revalidatePath("/a/member");
  revalidatePath(`/a/member/${id}`);
  return { data: updated };
}

export async function softDeleteMember(id: string): Promise<ActionResult> {
  const supabase = createClient(await cookies());

  const { error } = await supabase
    .from("members")
    .update({ deleted_at: new Date().toISOString(), status: "inactive" })
    .eq("id", id)
    .is("deleted_at", null);

  if (error) return { error: `Gagal menghapus anggota: ${error.message}` };

  await logActivity(supabase, {
    action: "soft_delete_member",
    resource_type: "members",
    resource_id: id,
  });

  revalidatePath("/a/member");
  return { data: undefined };
}

export async function restoreMember(id: string): Promise<ActionResult> {
  const supabase = createClient(await cookies());

  const { error } = await supabase
    .from("members")
    .update({ deleted_at: null, status: "active" })
    .eq("id", id);

  if (error) return { error: `Gagal memulihkan anggota: ${error.message}` };

  await logActivity(supabase, {
    action: "restore_member",
    resource_type: "members",
    resource_id: id,
  });

  revalidatePath("/a/member");
  return { data: undefined };
}

export async function resetMemberPassword(
  userId: string
): Promise<ActionResult<{ tempPassword: string }>> {
  const supabase = createClient(await cookies());

  const tempPassword =
    Math.random().toString(36).slice(-8).toUpperCase() + "1!";

  const { error } = await supabase.auth.admin.updateUserById(userId, {
    password: tempPassword,
  });

  if (error) return { error: `Gagal mereset kata sandi: ${error.message}` };

  return { data: { tempPassword } };
}
