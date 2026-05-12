import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

/**
 * Returns the highest-level role name for the currently authenticated user.
 * Returns null if the user has no role assigned (should not happen in production).
 *
 * Calls the public.user_role() RPC defined in 005_rls_helpers.sql.
 */
export async function getCurrentUserRole(): Promise<string | null> {
  const supabase = createClient(await cookies());
  const { data, error } = await supabase.rpc("user_role");
  if (error) {
    console.error("getCurrentUserRole error:", error.message);
    return null;
  }
  return data as string | null;
}

/**
 * Maps a role name to the appropriate dashboard redirect path.
 * Used after login and in middleware to send users to the right panel.
 */
export function getRoleRedirectPath(role: string | null): string {
  switch (role) {
    case "owner":
      return "/o/dashboard";
    case "manager":
    case "admin":
      return "/a/dashboard";
    case "coach":
      return "/c/dashboard";
    case "member":
      return "/m/dashboard";
    default:
      // Unknown/no role: send to member dashboard as safe fallback
      return "/m/dashboard";
  }
}
