import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function MemberDashboardPage() {
  const supabase = createClient(await cookies());
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold">Halo, Anggota!</h1>
      <p className="text-muted-foreground mt-1">
        Dashboard anggota sedang dibangun. (M5)
      </p>
    </div>
  );
}
