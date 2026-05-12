import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ChangePasswordForm } from "@/components/shared/change-password-form";

export default async function CoachPengaturanPage() {
  const supabase = createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <div className="p-4 space-y-4 max-w-lg mx-auto pb-24">
      <div className="pt-2">
        <h1 className="text-xl font-semibold">Pengaturan</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Kelola akun Anda</p>
      </div>

      <div className="rounded-xl border bg-card p-5 space-y-3">
        <div>
          <p className="text-xs text-muted-foreground">Email</p>
          <p className="text-sm font-medium">{user.email}</p>
        </div>
      </div>

      <ChangePasswordForm backHref="/c/profil" />
    </div>
  );
}
