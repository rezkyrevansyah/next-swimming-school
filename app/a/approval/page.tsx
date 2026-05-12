import { Suspense } from "react";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ApprovalCard } from "./approval-card";
import { CheckSquare } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { PaginationControls, DEFAULT_PAGE_SIZE } from "@/components/shared/pagination-controls";
import { cn } from "@/lib/utils";

interface PageProps {
  searchParams: Promise<{ status?: string; page?: string; limit?: string }>;
}

const STATUS_TABS = [
  { value: "pending", label: "Menunggu" },
  { value: "approved", label: "Disetujui" },
  { value: "rejected", label: "Ditolak" },
  { value: "all", label: "Semua" },
];

function PageSkeleton() {
  return (
    <div className="p-4 md:p-6 space-y-5 max-w-3xl animate-pulse">
      <div className="h-7 w-40 bg-muted rounded" />
      <div className="flex gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-8 w-20 bg-muted rounded" />
        ))}
      </div>
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-24 bg-muted rounded-xl" />
        ))}
      </div>
    </div>
  );
}

async function PageContent({ searchParams }: PageProps) {
  const supabase = createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const params = await searchParams;
  const statusFilter = params.status ?? "pending";
  const page = Math.max(1, parseInt(params.page ?? "1", 10));
  const pageSize = Math.max(1, parseInt(params.limit ?? String(DEFAULT_PAGE_SIZE), 10));
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  function buildUrl(overrides: Record<string, string | undefined>) {
    const p = new URLSearchParams();
    if (statusFilter !== "pending") p.set("status", statusFilter);
    if (page > 1) p.set("page", String(page));
    if (pageSize !== DEFAULT_PAGE_SIZE) p.set("limit", String(pageSize));
    Object.entries(overrides).forEach(([k, v]) => {
      if (v === undefined) p.delete(k);
      else p.set(k, v);
    });
    const s = p.toString();
    return `/a/approval${s ? `?${s}` : ""}`;
  }

  let query = supabase
    .from("change_requests")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (statusFilter !== "all") {
    query = query.eq("status", statusFilter);
  }

  const { data: requests, count } = await query;
  const totalPages = Math.ceil((count ?? 0) / pageSize);

  // Fetch names from member/coach profiles
  const db = createAdminClient();
  const memberResourceIds = (requests ?? [])
    .filter((r) => r.resource_type === "member_profile")
    .map((r) => r.resource_id);
  const coachResourceIds = (requests ?? [])
    .filter((r) => r.resource_type === "coach_profile")
    .map((r) => r.resource_id);

  const [{ data: memberProfiles }, { data: coachProfiles }] = await Promise.all([
    memberResourceIds.length > 0
      ? db.from("member_profiles").select("member_id, full_name").in("member_id", memberResourceIds)
      : Promise.resolve({ data: [] }),
    coachResourceIds.length > 0
      ? db.from("coach_profiles").select("coach_id, full_name").in("coach_id", coachResourceIds)
      : Promise.resolve({ data: [] }),
  ]);

  const memberNameMap = Object.fromEntries(
    (memberProfiles ?? []).map((p) => [p.member_id, p.full_name])
  );
  const coachNameMap = Object.fromEntries(
    (coachProfiles ?? []).map((p) => [p.coach_id, p.full_name])
  );

  const enriched = (requests ?? []).map((r) => ({
    ...r,
    subject_name:
      r.resource_type === "member_profile"
        ? memberNameMap[r.resource_id] ?? "—"
        : coachNameMap[r.resource_id] ?? "—",
  }));

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-3xl">
      <div>
        <h1 className="text-xl md:text-2xl font-semibold">Edit Request</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {count ?? 0} permintaan
        </p>
      </div>

      {/* Status filter */}
      <div className="flex gap-2 flex-wrap">
        {STATUS_TABS.map((tab) => (
          <Link
            key={tab.value}
            href={buildUrl({ status: tab.value === "pending" ? undefined : tab.value, page: "1" })}
            className={cn(
              buttonVariants({ size: "sm", variant: statusFilter === tab.value ? "default" : "outline" })
            )}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {enriched.length === 0 ? (
        <div className="rounded-xl border border-dashed p-16 text-center text-muted-foreground flex flex-col items-center gap-3">
          <CheckSquare className="h-10 w-10 opacity-30" />
          <p>Tidak ada permintaan.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {enriched.map((req) => (
            <ApprovalCard key={req.id} request={req} />
          ))}
        </div>
      )}

      <PaginationControls
        page={page}
        totalPages={totalPages}
        pageSize={pageSize}
        buildUrl={buildUrl}
      />
    </div>
  );
}

export default function ApprovalPage({ searchParams }: PageProps) {
  return (
    <div>
      <Suspense fallback={<PageSkeleton />}>
        <PageContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
