import type { Metadata } from "next";
import { LoginForm } from "@/components/shared/login-form";
import { LogoCircle } from "@/components/shared/logo";

export const metadata: Metadata = {
  title: "Masuk",
};

export default function LoginPage() {
  return (
    <div className="w-full max-w-sm space-y-6">
      <div className="flex flex-col items-center gap-3">
        <LogoCircle size={72} />
        <p className="text-sm text-muted-foreground">
          Masuk ke akun Anda untuk melanjutkan
        </p>
      </div>
      <LoginForm />
    </div>
  );
}
