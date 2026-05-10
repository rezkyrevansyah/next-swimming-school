"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import { createCoachSchema, updateCoachSchema } from "@/lib/schemas/coach";
import type { ActionResult } from "@/lib/types/common";
import type { Tables } from "@/lib/types/database";

type CoachRow = Tables<"coaches">;

async function generateCoachCode(
  supabase: Awaited<ReturnType<typeof createClient>>
): Promise<string> {
  const { count } = await supabase
    .from("coaches")
    .select("*", { count: "exact", head: true });
  const next = ((count ?? 0) + 1).toString().padStart(3, "0");
  return `PLT-${next}`;
}

export async function createCoach(
  formData: FormData
): Promise<ActionResult<CoachRow>> {
  const supabase = createClient(await cookies());

  const raw = Object.fromEntries(formData.entries());
  const parsed = createCoachSchema.safeParse(raw);

  if (!parsed.success) {
    return { error: "Data tidak valid.", fieldErrors: parsed.error.flatten() };
  }

  const {
    full_name,
    nickname,
    dob,
    gender,
    phone,
    specializations,
    email,
    branch_id,
  } = parsed.data;

  // 1. Create auth user
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

  const userId = authData.user.id;

  // 2. Generate coach code
  const coachIdCode = await generateCoachCode(supabase);

  // 3. Insert coach record
  const { data: coach, error: coachError } = await supabase
    .from("coaches")
    .insert({
      user_id: userId,
      coach_id_code: coachIdCode,
      status: "pending",
    })
    .select()
    .single();

  if (coachError || !coach) {
    return { error: `Gagal menyimpan pelatih: ${coachError?.message}` };
  }

  // 4. Insert coach profile
  const specArray = specializations
    ? specializations
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : null;

  const { error: profileError } = await supabase.from("coach_profiles").insert({
    coach_id: coach.id,
    full_name,
    nickname: nickname || null,
    dob: dob || null,
    gender: gender || null,
    phone: phone || null,
    specializations: specArray,
  });

  if (profileError) {
    return { error: `Gagal menyimpan profil: ${profileError.message}` };
  }

  // 5. Assign coach role
  const { data: coachRole } = await supabase
    .from("roles")
    .select("id")
    .eq("name", "coach")
    .single();

  if (coachRole) {
    await supabase.from("user_roles").insert({
      user_id: userId,
      role_id: coachRole.id,
      branch_id,
    });
  }

  // 6. Assign to branch
  await supabase.from("coach_branches").insert({
    coach_id: coach.id,
    branch_id,
    is_primary: true,
  });

  revalidatePath("/a/coach");
  return { data: coach };
}

export async function updateCoach(
  formData: FormData
): Promise<ActionResult<CoachRow>> {
  const supabase = createClient(await cookies());

  const raw = Object.fromEntries(formData.entries());
  const parsed = updateCoachSchema.safeParse(raw);

  if (!parsed.success) {
    return { error: "Data tidak valid.", fieldErrors: parsed.error.flatten() };
  }

  const { id, full_name, nickname, dob, gender, phone, specializations } =
    parsed.data;

  const profileUpdate: Record<string, unknown> = {};
  if (full_name) profileUpdate.full_name = full_name;
  if (nickname !== undefined) profileUpdate.nickname = nickname || null;
  if (dob !== undefined) profileUpdate.dob = dob || null;
  if (gender !== undefined) profileUpdate.gender = gender || null;
  if (phone !== undefined) profileUpdate.phone = phone || null;
  if (specializations !== undefined) {
    profileUpdate.specializations = specializations
      ? specializations
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : null;
  }

  if (Object.keys(profileUpdate).length > 0) {
    const { error: profileError } = await supabase
      .from("coach_profiles")
      .update(profileUpdate)
      .eq("coach_id", id!);

    if (profileError) {
      return { error: `Gagal memperbarui profil: ${profileError.message}` };
    }
  }

  const { data: updated, error } = await supabase
    .from("coaches")
    .select()
    .eq("id", id!)
    .single();

  if (error) return { error: error.message };

  revalidatePath("/a/coach");
  revalidatePath(`/a/coach/${id}`);
  return { data: updated };
}

export async function softDeleteCoach(id: string): Promise<ActionResult> {
  const supabase = createClient(await cookies());

  const { error } = await supabase
    .from("coaches")
    .update({ deleted_at: new Date().toISOString(), status: "inactive" })
    .eq("id", id)
    .is("deleted_at", null);

  if (error) return { error: `Gagal mengarsipkan pelatih: ${error.message}` };

  revalidatePath("/a/coach");
  return { data: undefined };
}

export async function restoreCoach(id: string): Promise<ActionResult> {
  const supabase = createClient(await cookies());

  const { error } = await supabase
    .from("coaches")
    .update({ deleted_at: null, status: "active" })
    .eq("id", id);

  if (error) return { error: `Gagal memulihkan pelatih: ${error.message}` };

  revalidatePath("/a/coach");
  return { data: undefined };
}
