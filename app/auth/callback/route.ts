import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

/**
 * Supabase auth callback handler.
 * Called when user clicks a magic link / password reset link from email.
 * Exchanges the `code` param for a session, then redirects accordingly.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/auth/reset-password";

  if (code) {
    const supabase = createClient(await cookies());
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Something went wrong — redirect to forgot password with error hint
  return NextResponse.redirect(`${origin}/lupa-password?error=link_invalid`);
}
