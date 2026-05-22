import { createClient } from "@/utils/supabase/server";
import { cookies, headers } from "next/headers";

/**
 * Returns the current user's ID from the x-user-id header set by proxy.ts.
 * Falls back to a Supabase getUser() call if the header is missing.
 * Use this in page/layout Server Components instead of calling getUser() directly.
 */
export async function getCurrentUserId(): Promise<string | null> {
  const h = await headers();
  const fromHeader = h.get("x-user-id");
  if (fromHeader) return fromHeader;

  // Fallback: header missing (e.g. direct server invocation in tests)
  const supabase = createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id ?? null;
}

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
