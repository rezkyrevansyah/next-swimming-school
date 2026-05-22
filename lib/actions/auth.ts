"use server";

import { createClient } from "@/utils/supabase/server";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { loginSchema } from "@/lib/schemas/auth";
import { getRoleRedirectPath } from "@/lib/utils/auth-helpers";
import type { ActionResult } from "@/lib/types/common";

/**
 * Signs the user in with email + password.
 * On success, fetches the user's role and redirects to the appropriate dashboard.
 * On failure, returns an error message in Indonesian.
 */
export async function signIn(formData: FormData): Promise<ActionResult> {
  const raw = {
    email: formData.get("email"),
    password: formData.get("password"),
  };

  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      error: "Input tidak valid",
      fieldErrors: parsed.error.flatten(),
    };
  }

  const supabase = createClient(await cookies());

  // If already authenticated, skip sign-in and go straight to dashboard
  const { data: { user: existingUser } } = await supabase.auth.getUser();
  if (existingUser) {
    const { data: roleData } = await supabase.rpc("user_role");
    const destination = getRoleRedirectPath(roleData as string | null);
    redirect(destination);
  }

  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    if (error.message.includes("Invalid login credentials")) {
      return { error: "Email atau password salah" };
    }
    if (error.message.includes("Email not confirmed")) {
      return { error: "Email belum dikonfirmasi. Periksa kotak masuk Anda." };
    }
    return { error: "Gagal masuk. Coba lagi." };
  }

  // Use the same supabase instance (already has the new session) to fetch role
  const { data: roleData } = await supabase.rpc("user_role");
  const role = roleData as string | null;

  // Cache role & branch_id in cookies so layout components don't re-fetch on every navigation
  const jar = await cookies();
  const cookieOpts = { httpOnly: true, secure: true, path: "/", maxAge: 60 * 60 * 24 } as const;
  if (role) jar.set("x-user-role", role, cookieOpts);
  if (role !== "owner") {
    const { data: branchId } = await supabase.rpc("user_branch_id");
    if (branchId) jar.set("x-user-branch-id", branchId as string, cookieOpts);
  }

  const destination = getRoleRedirectPath(role);
  redirect(destination);
}

/**
 * Sends a password reset email to the user.
 */
export async function requestPasswordReset(email: string): Promise<ActionResult> {
  const supabase = createClient(await cookies());
  const reqHeaders = await headers();
  const origin = reqHeaders.get("origin") ?? process.env.NEXT_PUBLIC_APP_URL ?? "";

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/reset-password`,
  });

  // Always return success to avoid email enumeration
  if (error && !error.message.toLowerCase().includes("rate limit")) {
    return { error: "Gagal mengirim email. Coba lagi." };
  }

  return { data: undefined };
}

/**
 * Updates the current user's password (called after clicking reset link in email).
 */
export async function updatePassword(newPassword: string): Promise<ActionResult> {
  const supabase = createClient(await cookies());

  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) return { error: "Gagal mengubah password: " + error.message };

  return { data: undefined };
}

/**
 * Signs the current user out and redirects to /login.
 */
export async function signOut(): Promise<void> {
  const supabase = createClient(await cookies());
  await supabase.auth.signOut();
  const jar = await cookies();
  jar.delete("x-user-role");
  jar.delete("x-user-branch-id");
  redirect("/login");
}
