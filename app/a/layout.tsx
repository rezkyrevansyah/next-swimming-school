import { cookies } from "next/headers";
import { createClient, createAdminClient } from "@/utils/supabase/server";
import { AdminSidebar } from "@/components/shared/admin-sidebar";
import { BranchContextBanner } from "@/components/shared/branch-context-banner";
import { Suspense } from "react";
import { getBranchById } from "@/lib/data/branch";

// ── Static sidebar skeleton — pure HTML, no hooks, safe as Suspense fallback ──
function SidebarShell() {
  return (
    <aside className="hidden md:flex flex-col w-56 border-r bg-background shrink-0 animate-pulse">
      <div className="flex items-center h-14 px-4 border-b gap-2">
        <div className="h-9 w-9 rounded-full bg-muted shrink-0" />
        <div className="h-3 w-20 bg-muted rounded" />
      </div>
      <nav className="flex-1 px-2 py-4 space-y-1">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="h-8 bg-muted rounded-md mx-1" />
        ))}
      </nav>
      <div className="p-4 border-t">
        <div className="h-9 bg-muted rounded-md" />
      </div>
    </aside>
  );
}

// ── Dynamic: full sidebar with role, branch name, and badge counts ─────────────
async function DynamicSidebar() {
  const jar = await cookies();
  const supabase = createClient(jar);
  const { data: roleData } = await supabase.rpc("user_role");
  const role = (roleData as string | null) ?? "admin";

  const activeBranchId = jar.get("active_branch_id")?.value ?? null;
  const activeBranchName = jar.get("active_branch_name")?.value ?? null;
  const isOwnerInAdminMode = role === "owner" && !!activeBranchId;

  let branchId: string | null = activeBranchId;
  if (!branchId && role !== "owner") {
    const { data } = await supabase.rpc("user_branch_id");
    branchId = data ?? null;
  }

  let sidebarBranchName: string | null = null;
  if (isOwnerInAdminMode) {
    sidebarBranchName = activeBranchName;
  } else if (branchId) {
    const branch = await getBranchById(branchId);
    sidebarBranchName = branch?.name ?? null;
  }

  const db = createAdminClient();
  const [{ count: pendingRegistrasi }, { count: pendingApproval }] = await Promise.all([
    branchId
      ? db.from("members").select("*", { count: "exact", head: true })
          .eq("branch_id", branchId).is("deleted_at", null).eq("status", "pending_payment")
      : Promise.resolve({ count: 0, data: null, error: null }),
    db.from("change_requests").select("*", { count: "exact", head: true }).eq("status", "pending"),
  ]);

  return (
    <AdminSidebar
      role={role}
      branchName={sidebarBranchName}
      pendingCounts={{
        registrasi: pendingRegistrasi ?? 0,
        approval: pendingApproval ?? 0,
      }}
    />
  );
}

// ── Dynamic: owner branch context banner ──────────────────────────────────────
async function OwnerBanner() {
  const jar = await cookies();
  const supabase = createClient(jar);
  const { data: roleData } = await supabase.rpc("user_role");
  const role = (roleData as string | null) ?? "admin";
  const activeBranchId = jar.get("active_branch_id")?.value ?? null;
  const activeBranchName = jar.get("active_branch_name")?.value ?? null;
  const isOwnerInAdminMode = role === "owner" && !!activeBranchId;

  if (!isOwnerInAdminMode) return null;
  return <BranchContextBanner branchName={activeBranchName ?? "Cabang"} />;
}

// ── Page ───────────────────────────────────────────────────────────────────────
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <Suspense fallback={null}>
        <OwnerBanner />
      </Suspense>
      <div className="flex flex-1 min-h-0 overflow-hidden">
        <Suspense fallback={<SidebarShell />}>
          <DynamicSidebar />
        </Suspense>
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
