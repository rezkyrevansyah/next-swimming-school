import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import { getRoleRedirectPath } from "@/lib/utils/auth-helpers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

/** Route prefixes that require an authenticated session */
const PROTECTED_PREFIXES = ["/m", "/c", "/a", "/o", "/s"];

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabase = createServerClient(
    supabaseUrl!,
    supabaseKey!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    },
  );

  // Refresh session — IMPORTANT: do not remove; keeps cookies up-to-date
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Unauthenticated user accessing a protected route → /login
  const isProtected = PROTECTED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  );
  if (!user && isProtected) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    return NextResponse.redirect(loginUrl);
  }

  // Authenticated user on /login → redirect to their role-specific dashboard
  if (user && pathname === "/login") {
    // Call the user_role() RPC directly (same client, already authenticated)
    const { data: roleData } = await supabase.rpc("user_role");
    const role = roleData as string | null;
    const destination = getRoleRedirectPath(role);
    const dashboardUrl = request.nextUrl.clone();
    dashboardUrl.pathname = destination;
    return NextResponse.redirect(dashboardUrl);
  }

  return supabaseResponse;
}
