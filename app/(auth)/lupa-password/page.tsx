import type { Metadata } from "next";
import { Suspense } from "react";
import { LogoCircle } from "@/components/shared/logo";
import { ForgotPasswordForm } from "./forgot-password-form";

export const metadata: Metadata = {
  title: "Lupa Password",
};

interface PageProps {
  searchParams: Promise<{ error?: string }>;
}

export default function ForgotPasswordPage({ searchParams }: PageProps) {
  return (
    <Suspense>
      <ForgotPasswordContent searchParams={searchParams} />
    </Suspense>
  );
}

async function ForgotPasswordContent({ searchParams }: PageProps) {
  const { error } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-3">
          <LogoCircle size={72} />
          <div className="text-center">
            <h1 className="text-lg font-semibold">Lupa Password?</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Masukkan email Anda dan kami akan mengirim link untuk mengatur ulang password.
            </p>
          </div>
        </div>
        {error === "link_invalid" && (
          <div className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive text-center">
            Link sudah kadaluarsa atau tidak valid. Silakan minta link baru.
          </div>
        )}
        <ForgotPasswordForm />
      </div>
    </div>
  );
}
