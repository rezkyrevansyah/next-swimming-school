import { Suspense } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { GenerateForm } from "./generate-form";

function PageSkeleton() {
  return (
    <div className="p-6 space-y-4 animate-pulse">
      <div className="h-8 w-48 bg-muted rounded" />
      <div className="h-96 bg-muted rounded-xl" />
    </div>
  );
}

async function PageContent() {
  const jar = await cookies();
  const supabase = createClient(jar);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const activeBranchId = jar.get("active_branch_id")?.value ?? null;
  let branchId = activeBranchId;
  if (!branchId) {
    const { data } = await supabase.rpc("user_branch_id");
    branchId = data ?? null;
  }
  if (!branchId) redirect("/login");

  const { data: branch } = await supabase
    .from("branches")
    .select("id, name")
    .eq("id", branchId)
    .single();

  const { count: eligibleCount } = await supabase
    .from("members")
    .select("*", { count: "exact", head: true })
    .eq("branch_id", branchId)
    .eq("status", "active")
    .eq("type", "regular")
    .eq("payment_handling", "individual")
    .is("deleted_at", null);

  return (
    <div className="rounded-xl border bg-card p-5">
      <GenerateForm
        branchId={branchId}
        branchName={branch?.name ?? "—"}
        eligibleMemberCount={eligibleCount ?? 0}
      />
    </div>
  );
}

export default function GenerateInvoicePage() {
  return (
    <div className="p-4 md:p-6 max-w-lg space-y-5">
      <div className="flex items-center gap-3">
        <Link
          href="/a/finansial"
          className={buttonVariants({ variant: "ghost", size: "icon-sm" })}
        >
          <ChevronLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-xl font-semibold">Generate Tagihan</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Buat tagihan bulanan untuk semua anggota reguler
          </p>
        </div>
      </div>

      <Suspense fallback={<PageSkeleton />}>
        <PageContent />
      </Suspense>
    </div>
  );
}
