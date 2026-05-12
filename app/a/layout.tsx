import { cookies } from "next/headers";
import { createClient, createAdminClient } from "@/utils/supabase/server";
import { AdminSidebar } from "@/components/shared/admin-sidebar";
import { BranchContextBanner } from "@/components/shared/branch-context-banner";
import { unstable_noStore as noStore } from "next/cache";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jar = await cookies();
  const supabase = createClient(jar);
  const { data: roleData } = await supabase.rpc("user_role");
  const role = (roleData as string | null) ?? "admin";

  const activeBranchId = jar.get("active_branch_id")?.value ?? null;
  const activeBranchName = jar.get("active_branch_name")?.value ?? null;
  const isOwnerInAdminMode = role === "owner" && !!activeBranchId;

  // For non-owner admins: fetch their branch name from the DB
  let sidebarBranchName: string | null = null;
  if (role !== "owner") {
    const { data: branchId } = await supabase.rpc("user_branch_id");
    if (branchId) {
      const db = createAdminClient();
      const { data: branch } = await db
        .from("branches")
        .select("name")
        .eq("id", branchId)
        .single();
      sidebarBranchName = branch?.name ?? null;
    }
  } else if (isOwnerInAdminMode) {
    sidebarBranchName = activeBranchName;
  }

  // Fetch pending counts for sidebar badges
  noStore();
  const db = createAdminClient();
  const activeBranchIdForCounts = jar.get("active_branch_id")?.value ?? null;
  let branchIdForCounts: string | null = activeBranchIdForCounts;
  if (!branchIdForCounts) {
    const { data } = await supabase.rpc("user_branch_id");
    branchIdForCounts = data ?? null;
  }

  const [{ count: pendingRegistrasi }, { count: pendingApproval }] = await Promise.all([
    branchIdForCounts
      ? db.from("members").select("*", { count: "exact", head: true })
          .eq("branch_id", branchIdForCounts).is("deleted_at", null).eq("status", "pending_payment")
      : Promise.resolve({ count: 0 }),
    db.from("change_requests").select("*", { count: "exact", head: true }).eq("status", "pending"),
  ]);

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      {isOwnerInAdminMode && (
        <BranchContextBanner branchName={activeBranchName ?? "Cabang"} />
      )}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        <AdminSidebar
          role={role}
          branchName={sidebarBranchName}
          pendingCounts={{
            registrasi: pendingRegistrasi ?? 0,
            approval: pendingApproval ?? 0,
          }}
        />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
