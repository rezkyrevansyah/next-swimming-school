import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function CoachDashboardPage() {
  const supabase = createClient(await cookies());
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold">Halo, Pelatih!</h1>
      <p className="text-muted-foreground mt-1">
        Dashboard pelatih sedang dibangun. (M4)
      </p>
    </div>
  );
}
