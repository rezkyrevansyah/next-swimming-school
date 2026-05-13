import type { Metadata } from "next";
import { LogoCircle } from "@/components/shared/logo";
import { ResetPasswordForm } from "./reset-password-form";

export const metadata: Metadata = {
  title: "Atur Ulang Password",
};

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-3">
          <LogoCircle size={72} />
          <div className="text-center">
            <h1 className="text-lg font-semibold">Atur Ulang Password</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Masukkan password baru Anda di bawah ini.
            </p>
          </div>
        </div>
        <ResetPasswordForm />
      </div>
    </div>
  );
}
