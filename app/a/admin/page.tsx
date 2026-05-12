import { Suspense } from "react";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ShieldCheck } from "lucide-react";

async function PageContent() {
  const supabase = createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: roleData } = await supabase.rpc("user_role");
  if (roleData !== "owner") redirect("/a/dashboard");

  return (
    <>
      <div>
        <h1 className="text-2xl font-semibold">Kelola Admin</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Tambah dan kelola akun admin cabang.
        </p>
      </div>
      <div className="rounded-xl border border-dashed px-6 py-16 text-center text-muted-foreground text-sm flex flex-col items-center gap-3">
        <ShieldCheck className="h-10 w-10 opacity-30" />
        <p>Halaman ini sedang dalam pengembangan.</p>
      </div>
    </>
  );
}

export default function AdminManagementPage() {
  return (
    <div className="p-6 space-y-4 max-w-2xl">
      <Suspense fallback={
        <div className="p-6 space-y-4 animate-pulse">
          <div className="h-8 w-48 bg-muted rounded" />
          <div className="h-96 bg-muted rounded-xl" />
        </div>
      }>
        <PageContent />
      </Suspense>
    </div>
  );
}
