import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { AdminSidebar } from "@/components/shared/admin-sidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient(await cookies());
  const { data: roleData } = await supabase.rpc("user_role");
  const role = (roleData as string | null) ?? "admin";

  return (
    <div className="flex min-h-screen">
      <AdminSidebar role={role} />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
