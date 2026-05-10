"use server";

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { loginSchema } from "@/lib/schemas/auth";
import { getCurrentUserRole, getRoleRedirectPath } from "@/lib/utils/auth-helpers";
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

  // M2.6: fetch role and redirect to the correct dashboard
  const role = await getCurrentUserRole();
  const destination = getRoleRedirectPath(role);
  redirect(destination);
}

/**
 * Signs the current user out and redirects to /login.
 */
export async function signOut(): Promise<void> {
  const supabase = createClient(await cookies());
  await supabase.auth.signOut();
  redirect("/login");
}
