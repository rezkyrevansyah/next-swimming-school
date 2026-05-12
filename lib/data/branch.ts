import { cacheLife, cacheTag } from "next/cache";
import { createAdminClient } from "@/utils/supabase/server";

export async function getBranchById(branchId: string) {
  "use cache";
  cacheLife("hours");
  cacheTag(`branch-${branchId}`);
  const db = createAdminClient();
  const { data } = await db
    .from("branches")
    .select("id, name, status, location_lat, location_lng")
    .eq("id", branchId)
    .single();
  return data;
}

export async function getAllBranches() {
  "use cache";
  cacheLife("hours");
  cacheTag("branches");
  const db = createAdminClient();
  const { data } = await db
    .from("branches")
    .select("id, name, status, is_default")
    .is("deleted_at", null)
    .order("is_default", { ascending: false });
  return data ?? [];
}
