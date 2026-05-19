import { cacheLife, cacheTag } from "next/cache";
import { createAdminClient } from "@/utils/supabase/server";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface BranchItem {
  id: string;
  name: string;
}

export interface ClassItem {
  id: string;
  name: string;
  branch_id: string;
}

export interface CoachItem {
  id: string;
  branch_id: string | null;
  full_name: string;
}

// ─── Cached fetchers ─────────────────────────────────────────────────────────
// These use the admin client (no cookies) so they are safe to cache.
// Revalidate via revalidateTag("branches" | "classes" | "coaches").

export async function getCachedBranches(): Promise<BranchItem[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("branches");

  const supabase = createAdminClient();
  const { data } = await supabase
    .from("branches")
    .select("id, name")
    .is("deleted_at", null)
    .order("name");

  return data ?? [];
}

export async function getCachedActiveClasses(): Promise<ClassItem[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("classes");

  const supabase = createAdminClient();
  const { data } = await supabase
    .from("classes")
    .select("id, name, branch_id")
    .eq("status", "active")
    .is("deleted_at", null)
    .order("name");

  return data ?? [];
}

export async function getCachedActiveCoaches(): Promise<CoachItem[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("coaches");

  const supabase = createAdminClient();
  const { data } = await supabase
    .from("coaches")
    .select("id, branch_id, coach_profiles(full_name)")
    .eq("status", "active")
    .is("deleted_at", null);

  return (data ?? []).map((c) => {
    const cp = Array.isArray(c.coach_profiles) ? c.coach_profiles[0] : c.coach_profiles;
    return {
      id: c.id,
      branch_id: c.branch_id ?? null,
      full_name: (cp as { full_name?: string } | null)?.full_name ?? "—",
    };
  });
}

// ─── Per-branch helpers ───────────────────────────────────────────────────────
// These take branchId as argument — it becomes part of the cache key.

export async function getCachedClassesByBranch(branchId: string): Promise<ClassItem[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("classes");

  const supabase = createAdminClient();
  const { data } = await supabase
    .from("classes")
    .select("id, name, branch_id")
    .eq("branch_id", branchId)
    .eq("status", "active")
    .is("deleted_at", null)
    .order("name");

  return data ?? [];
}

export async function getCachedCoachesByBranch(branchId: string): Promise<CoachItem[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("coaches");

  const supabase = createAdminClient();
  const { data } = await supabase
    .from("coaches")
    .select("id, branch_id, coach_profiles(full_name)")
    .eq("branch_id", branchId)
    .eq("status", "active")
    .is("deleted_at", null);

  return (data ?? []).map((c) => {
    const cp = Array.isArray(c.coach_profiles) ? c.coach_profiles[0] : c.coach_profiles;
    return {
      id: c.id,
      branch_id: c.branch_id ?? null,
      full_name: (cp as { full_name?: string } | null)?.full_name ?? "—",
    };
  });
}
