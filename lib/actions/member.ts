"use server";

import { cookies } from "next/headers";
import { revalidatePath, revalidateTag } from "next/cache";
import { createClient, createAdminClient } from "@/utils/supabase/server";
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
    private_sessions_total,
    private_package_price,
    email,
    password,
  } = parsed.data;

  // 1. Optionally create auth user (requires service role key)
  const adminClient = createAdminClient();
  let userId: string | null = null;
  if (email && password) {
    const { data: authData, error: authError } =
      await adminClient.auth.admin.createUser({
        email,
        password,
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
      ...(type === "private" && {
        private_sessions_total: private_sessions_total || null,
        private_package_price: private_package_price || null,
      }),
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

  // 5. If account created, assign member role (use adminClient to bypass RLS on user_roles)
  if (userId) {
    const { data: memberRole } = await adminClient
      .from("roles")
      .select("id")
      .eq("name", "member")
      .single();

    if (memberRole) {
      await adminClient.from("user_roles").insert({
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
  revalidateTag(`stats-admin-${branch_id}`, "minutes");
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
    private_sessions_total,
    private_package_price,
  } = parsed.data;

  // Update member record
  if (branch_id || type || payment_handling !== undefined || school_id !== undefined || private_sessions_total !== undefined || private_package_price !== undefined) {
    const { error: memberError } = await supabase
      .from("members")
      .update({
        ...(branch_id && { branch_id }),
        ...(type && { type }),
        ...(payment_handling && { payment_handling }),
        ...(school_id !== undefined && { school_id: school_id || null }),
        ...(type === "private" && {
          private_sessions_total: private_sessions_total || null,
          private_package_price: private_package_price || null,
        }),
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
  memberId: string,
  userId: string,
  newPassword: string
): Promise<ActionResult> {
  if (!newPassword || newPassword.length < 8) {
    return { error: "Password minimal 8 karakter." };
  }

  const { error } = await createAdminClient().auth.admin.updateUserById(userId, {
    password: newPassword,
  });
  if (error) return { error: `Gagal mereset kata sandi: ${error.message}` };

  // Record when password was changed
  const supabase = createClient(await cookies());
  await supabase
    .from("members")
    .update({ password_changed_at: new Date().toISOString() })
    .eq("id", memberId);

  return { data: undefined };
}

/**
 * Approve a pending_payment member: set status = 'active',
 * optionally create a Supabase auth account and assign role.
 */
export async function approveMember(
  memberId: string,
  options: { email?: string; branchId: string }
): Promise<ActionResult<{ tempPassword?: string }>> {
  const supabase = createClient(await cookies());

  // Verify member exists and is pending_payment
  const { data: member, error: fetchError } = await supabase
    .from("members")
    .select("id, status, has_account, user_id, branch_id")
    .eq("id", memberId)
    .single();

  if (fetchError || !member) {
    return { error: "Anggota tidak ditemukan." };
  }
  if (member.status !== "pending_payment") {
    return { error: "Anggota bukan dalam status menunggu pembayaran." };
  }

  let userId = member.user_id;
  let tempPassword: string | undefined;

  // Create auth account if email provided and no account yet
  if (options.email && !member.has_account) {
    tempPassword = Math.random().toString(36).slice(-8).toUpperCase() + "1!";
    const { data: authData, error: authError } =
      await createAdminClient().auth.admin.createUser({
        email: options.email,
        password: tempPassword,
        email_confirm: true,
      });

    if (authError) {
      return { error: `Gagal membuat akun: ${authError.message}` };
    }
    userId = authData.user.id;

    // Assign member role (use adminClient to bypass RLS on user_roles)
    const ac = createAdminClient();
    const { data: memberRole } = await ac
      .from("roles")
      .select("id")
      .eq("name", "member")
      .single();

    if (memberRole) {
      await ac.from("user_roles").insert({
        user_id: userId,
        role_id: memberRole.id,
        branch_id: options.branchId,
      });
    }
  }

  // Update member status to active
  const { error: updateError } = await supabase
    .from("members")
    .update({
      status: "active",
      has_account: !!userId,
      user_id: userId,
    })
    .eq("id", memberId);

  if (updateError) {
    return { error: `Gagal mengaktifkan anggota: ${updateError.message}` };
  }

  await logActivity(supabase, {
    action: "approve_member",
    resource_type: "members",
    resource_id: memberId,
    branch_id: member.branch_id,
  });

  revalidatePath("/a/member");
  revalidatePath("/a/member/registrasi");
  revalidateTag(`stats-admin-${member.branch_id}`, "minutes");
  return { data: { tempPassword } };
}

export async function hardDeleteMember(id: string): Promise<ActionResult> {
  const supabase = createClient(await cookies());

  // Delete profile first (FK constraint)
  await supabase.from("member_profiles").delete().eq("member_id", id);

  // Delete the member row
  const { error } = await supabase.from("members").delete().eq("id", id);
  if (error) return { error: `Gagal menghapus anggota: ${error.message}` };

  await logActivity(supabase, {
    action: "hard_delete_member",
    resource_type: "members",
    resource_id: id,
  });

  revalidatePath("/a/member");
  return { data: undefined };
}

/**
 * Reject a pending_payment member: soft-delete the record.
 */
export async function rejectMember(memberId: string): Promise<ActionResult> {
  const supabase = createClient(await cookies());

  const { data: member } = await supabase
    .from("members")
    .select("branch_id")
    .eq("id", memberId)
    .single();

  const { error } = await supabase
    .from("members")
    .update({ deleted_at: new Date().toISOString(), status: "inactive" })
    .eq("id", memberId)
    .eq("status", "pending_payment");

  if (error) {
    return { error: `Gagal menolak pendaftaran: ${error.message}` };
  }

  await logActivity(supabase, {
    action: "reject_member",
    resource_type: "members",
    resource_id: memberId,
    branch_id: member?.branch_id,
  });

  revalidatePath("/a/member");
  revalidatePath("/a/member/registrasi");
  if (member?.branch_id) revalidateTag(`stats-admin-${member.branch_id}`, "minutes");
  return { data: undefined };
}

