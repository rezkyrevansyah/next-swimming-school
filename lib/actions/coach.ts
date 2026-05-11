"use server";

import { cookies, headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { createClient, createAdminClient } from "@/utils/supabase/server";
import { createCoachSchema, updateCoachSchema } from "@/lib/schemas/coach";
import { uploadToR2 } from "@/lib/storage";
import { haversineDistance } from "@/lib/utils/haversine";
import { logActivity } from "@/lib/utils/activity-log";
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
    password,
    branch_id,
  } = parsed.data;

  // 1. Create auth user (requires service role key)
  const adminClient = createAdminClient();
  const { data: authData, error: authError } =
    await adminClient.auth.admin.createUser({
      email,
      password,
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
      status: "active",
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

  // 5. Assign coach role (use adminClient to bypass RLS on user_roles)
  const { data: coachRole } = await adminClient
    .from("roles")
    .select("id")
    .eq("name", "coach")
    .single();

  if (coachRole) {
    await adminClient.from("user_roles").insert({
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

export async function setCoachStatus(
  id: string,
  status: "active" | "inactive" | "pending"
): Promise<ActionResult> {
  const supabase = createClient(await cookies());

  const { error } = await supabase
    .from("coaches")
    .update({ status })
    .eq("id", id);

  if (error) return { error: `Gagal mengubah status: ${error.message}` };

  revalidatePath(`/a/coach/${id}`);
  revalidatePath("/a/coach");
  return { data: undefined };
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

export async function hardDeleteCoach(id: string): Promise<ActionResult> {
  const supabase = createClient(await cookies());

  // Delete related records first
  await supabase.from("coach_profiles").delete().eq("coach_id", id);
  await supabase.from("coach_branches").delete().eq("coach_id", id);

  const { error } = await supabase.from("coaches").delete().eq("id", id);
  if (error) return { error: `Gagal menghapus pelatih: ${error.message}` };

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

export async function resetCoachPassword(
  coachId: string,
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
    .from("coaches")
    .update({ password_changed_at: new Date().toISOString() })
    .eq("id", coachId);

  return { data: undefined };
}

// ─── Clock-In ─────────────────────────────────────────────────────────────────

interface ClockInInput {
  selfieBase64: string; // base64 JPEG from camera capture
  lat: number;
  lng: number;
  accuracy: number;
  branchId: string;
  branchLat: number | null;
  branchLng: number | null;
}

export async function clockIn(input: ClockInInput): Promise<ActionResult<{ distanceM: number }>> {
  const supabase = createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Tidak terautentikasi." };

  // Get coach id
  const { data: coach } = await supabase
    .from("coaches")
    .select("id")
    .eq("user_id", user.id)
    .single();
  if (!coach) return { error: "Profil pelatih tidak ditemukan." };

  // Check not already clocked in today
  const todayDate = new Date().toISOString().slice(0, 10);
  const { data: existing } = await supabase
    .from("coach_clock_records")
    .select("id")
    .eq("coach_id", coach.id)
    .eq("branch_id", input.branchId)
    .eq("clock_in_date", todayDate)
    .maybeSingle();

  if (existing) return { error: "Kamu sudah absen masuk hari ini di cabang ini." };

  // Upload selfie to R2
  const base64Data = input.selfieBase64.replace(/^data:image\/\w+;base64,/, "");
  const buffer = Buffer.from(base64Data, "base64");

  let selfieUrl: string | null = null;
  try {
    const key = await uploadToR2(buffer, "attendance_selfie", coach.id, {
      extension: "jpg",
      contentType: "image/jpeg",
    });
    selfieUrl = key;
  } catch {
    // Non-blocking: continue even if upload fails
    selfieUrl = null;
  }

  // Calculate distance
  const distanceM =
    input.branchLat != null && input.branchLng != null
      ? Math.round(haversineDistance(input.lat, input.lng, input.branchLat, input.branchLng))
      : null;

  // Get user agent + IP from headers
  const reqHeaders = await headers();
  const userAgent = reqHeaders.get("user-agent") ?? undefined;
  const ip = reqHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ?? undefined;

  // Insert clock record
  const { error } = await supabase.from("coach_clock_records").insert({
    coach_id: coach.id,
    branch_id: input.branchId,
    clock_in_date: todayDate,
    clock_in_selfie_url: selfieUrl,
    clock_in_lat: input.lat,
    clock_in_lng: input.lng,
    clock_in_distance_m: distanceM,
    clock_in_accuracy: input.accuracy,
    ip_address: ip,
    user_agent: userAgent,
  });

  if (error) return { error: `Gagal menyimpan absensi: ${error.message}` };

  await logActivity(supabase, {
    action: "clock_in",
    resource_type: "coach_clock_records",
    branch_id: input.branchId,
    metadata: { distance_m: distanceM },
  });

  revalidatePath("/c/dashboard");
  revalidatePath("/c/clock-in");

  return { data: { distanceM: distanceM ?? 0 } };
}
