import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function OwnerDashboardPage() {
  const supabase = createClient(await cookies());
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold">Dashboard Pemilik</h1>
      <p className="text-muted-foreground mt-1">
        Dashboard pemilik akan hadir di Fase 2.
      </p>
    </div>
  );
}
