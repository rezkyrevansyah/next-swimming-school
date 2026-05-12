import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { OwnerSidebar } from "@/components/shared/owner-sidebar";

export default async function OwnerLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient(await cookies());
  const { data: roleData } = await supabase.rpc("user_role");
  if (roleData !== "owner") redirect("/a/dashboard");

  return (
    <div className="flex min-h-screen">
      <OwnerSidebar />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
