"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient, createAdminClient } from "@/utils/supabase/server";
import { createBranchSchema, updateBranchSchema } from "@/lib/schemas/branch";
import type { ActionResult } from "@/lib/types/common";
import type { Tables } from "@/lib/types/database";

type BranchRow = Tables<"branches">;

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export async function createBranch(
  formData: FormData
): Promise<ActionResult<BranchRow>> {
  const raw = Object.fromEntries(formData.entries());
  const parsed = createBranchSchema.safeParse(raw);

  if (!parsed.success) {
    return { error: "Data tidak valid.", fieldErrors: parsed.error.flatten() };
  }

  const { name, address, contact_phone, contact_email, location_lat, location_lng, status } =
    parsed.data;

  // Use admin client so owner (who bypasses RLS) can create branches
  const db = createAdminClient();

  // Generate unique slug
  const baseSlug = slugify(name);
  const { data: existing } = await db
    .from("branches")
    .select("slug")
    .like("slug", `${baseSlug}%`);

  const usedSlugs = new Set((existing ?? []).map((b) => b.slug));
  let slug = baseSlug;
  let counter = 2;
  while (usedSlugs.has(slug)) {
    slug = `${baseSlug}-${counter++}`;
  }

  const { data: branch, error } = await db
    .from("branches")
    .insert({
      name,
      slug,
      address: address || null,
      contact_phone: contact_phone || null,
      contact_email: contact_email || null,
      location_lat: location_lat ?? null,
      location_lng: location_lng ?? null,
      status,
      is_default: false,
    })
    .select()
    .single();

  if (error) return { error: `Gagal membuat cabang: ${error.message}` };

  revalidatePath("/o/cabang");
  return { data: branch };
}

export async function updateBranch(
  formData: FormData
): Promise<ActionResult<BranchRow>> {
  const supabase = createClient(await cookies());

  const raw = Object.fromEntries(formData.entries());
  const parsed = updateBranchSchema.safeParse(raw);

  if (!parsed.success) {
    return { error: "Data tidak valid.", fieldErrors: parsed.error.flatten() };
  }

  const { id, name, address, contact_phone, contact_email, location_lat, location_lng, status } =
    parsed.data;

  const { data: updated, error } = await supabase
    .from("branches")
    .update({
      name,
      address: address || null,
      contact_phone: contact_phone || null,
      contact_email: contact_email || null,
      location_lat: location_lat ?? null,
      location_lng: location_lng ?? null,
      status,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) return { error: `Gagal memperbarui cabang: ${error.message}` };

  revalidatePath("/a/cabang");
  revalidatePath(`/a/cabang/${id}`);
  revalidatePath("/o/cabang");
  revalidatePath(`/o/cabang/${id}`);
  return { data: updated };
}

/**
 * Sets the active_branch_id cookie so the owner can manage a specific branch
 * via the admin panel. Redirects to /a/dashboard after setting.
 */
export async function setActiveBranch(formData: FormData): Promise<void> {
  const branchId = formData.get("branch_id") as string;
  const branchName = formData.get("branch_name") as string;

  if (!branchId) redirect("/o/dashboard");

  const jar = await cookies();
  jar.set("active_branch_id", branchId, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 8, // 8 jam
  });
  jar.set("active_branch_name", branchName ?? "", {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 8,
  });

  redirect("/a/dashboard");
}

/**
 * Clears the active branch context and returns owner to /o/dashboard.
 */
export async function clearActiveBranch(): Promise<void> {
  const jar = await cookies();
  jar.delete("active_branch_id");
  jar.delete("active_branch_name");
  redirect("/o/dashboard");
}
