import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Banknote, AlertCircle, CheckCircle2, Clock,
  ChevronRight, Plus, TrendingUp,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DEFAULT_PAGE_SIZE } from "@/lib/constants";

// ============================================================================
// Helpers
// ============================================================================
function formatRupiah(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

function formatPeriod(period: string) {
  const [year, month] = period.split("-");
  const date = new Date(Number(year), Number(month) - 1);
  return date.toLocaleDateString("id-ID", { month: "long", year: "numeric" });
}

const STATUS_LABEL: Record<string, string> = {
  unpaid: "Belum Bayar",
  partial: "Sebagian",
  paid: "Lunas",
};

const STATUS_VARIANT: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  unpaid: "destructive",
  partial: "secondary",
  paid: "default",
};

// ============================================================================
// Page
// ============================================================================
interface PageProps {
  searchParams: Promise<{
    page?: string;
    status?: string;
    period?: string;
  }>;
}

export default async function FinansialPage({ searchParams }: PageProps) {
  const jar = await cookies();
  const supabase = createClient(jar);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Branch context (same pattern as dashboard)
  const activeBranchId = jar.get("active_branch_id")?.value ?? null;
  let branchId = activeBranchId;
  if (!branchId) {
    const { data } = await supabase.rpc("user_branch_id");
    branchId = data ?? null;
  }
  if (!branchId) redirect("/login");

  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1", 10));
  const statusFilter = params.status ?? "";
  const periodFilter = params.period ?? "";
  const offset = (page - 1) * DEFAULT_PAGE_SIZE;

  // ── Stats (current month) ──────────────────────────────────────────────
  const currentPeriod = new Date().toISOString().slice(0, 7); // YYYY-MM

  const [
    { count: totalInvoices },
    { count: paidCount },
    { count: unpaidCount },
    { count: partialCount },
    totalAmountRes,
    totalCollectedRes,
  ] = await Promise.all([
    supabase
      .from("monthly_invoices")
      .select("*", { count: "exact", head: true })
      .eq("branch_id", branchId)
      .eq("period_month", currentPeriod),
    supabase
      .from("monthly_invoices")
      .select("*", { count: "exact", head: true })
      .eq("branch_id", branchId)
      .eq("period_month", currentPeriod)
      .eq("status", "paid"),
    supabase
      .from("monthly_invoices")
      .select("*", { count: "exact", head: true })
      .eq("branch_id", branchId)
      .eq("period_month", currentPeriod)
      .eq("status", "unpaid"),
    supabase
      .from("monthly_invoices")
      .select("*", { count: "exact", head: true })
      .eq("branch_id", branchId)
      .eq("period_month", currentPeriod)
      .eq("status", "partial"),
    supabase
      .from("monthly_invoices")
      .select("total_amount")
      .eq("branch_id", branchId)
      .eq("period_month", currentPeriod),
    supabase
      .from("monthly_invoices")
      .select("amount_paid")
      .eq("branch_id", branchId)
      .eq("period_month", currentPeriod),
  ]);

  const totalAmount = (totalAmountRes.data ?? []).reduce(
    (s, r) => s + (r.total_amount ?? 0),
    0
  );
  const totalCollected = (totalCollectedRes.data ?? []).reduce(
    (s, r) => s + (r.amount_paid ?? 0),
    0
  );
  const outstanding = totalAmount - totalCollected;

  // ── Invoice list (paginated, filterable) ───────────────────────────────
  let query = supabase
    .from("monthly_invoices")
    .select(
      `
      id, period_month, total_amount, amount_paid, status, due_date, created_at,
      members(
        id, member_id_code,
        member_profiles(full_name)
      )
    `,
      { count: "exact" }
    )
    .eq("branch_id", branchId)
    .order("period_month", { ascending: false })
    .order("created_at", { ascending: false })
    .range(offset, offset + DEFAULT_PAGE_SIZE - 1);

  if (statusFilter) query = query.eq("status", statusFilter);
  if (periodFilter) query = query.eq("period_month", periodFilter);

  const { data: invoices, count: totalCount } = await query;
  const totalPages = Math.ceil((totalCount ?? 0) / DEFAULT_PAGE_SIZE);

  // ── Available periods for filter ───────────────────────────────────────
  const { data: periods } = await supabase
    .from("monthly_invoices")
    .select("period_month")
    .eq("branch_id", branchId)
    .order("period_month", { ascending: false });

  const uniquePeriods = [
    ...new Set((periods ?? []).map((p) => p.period_month)),
  ];

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl font-semibold">Finansial</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Tagihan & pembayaran anggota — {formatPeriod(currentPeriod)}
          </p>
        </div>
        <Link
          href="/a/finansial/generate"
          className={cn(buttonVariants({ variant: "default" }), "gap-2")}
        >
          <Plus className="h-4 w-4" />
          Generate Tagihan
        </Link>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          icon={Banknote}
          label="Total Tagihan"
          value={formatRupiah(totalAmount)}
          sub={`${totalInvoices ?? 0} invoice bulan ini`}
          color="blue"
        />
        <StatCard
          icon={TrendingUp}
          label="Terkumpul"
          value={formatRupiah(totalCollected)}
          sub={`${paidCount ?? 0} lunas`}
          color="green"
        />
        <StatCard
          icon={AlertCircle}
          label="Outstanding"
          value={formatRupiah(outstanding)}
          sub={`${unpaidCount ?? 0} belum bayar`}
          color="red"
        />
        <StatCard
          icon={Clock}
          label="Sebagian"
          value={String(partialCount ?? 0)}
          sub="invoice partial"
          color="amber"
        />
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap items-center">
        <span className="text-sm text-muted-foreground">Filter:</span>

        {/* Period filter */}
        <select
          name="period"
          defaultValue={periodFilter}
          onChange={undefined}
          className="h-8 rounded-md border border-input bg-background px-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          form="filter-form"
        />

        {/* Status filter links */}
        {[
          { label: "Semua", value: "" },
          { label: "Belum Bayar", value: "unpaid" },
          { label: "Sebagian", value: "partial" },
          { label: "Lunas", value: "paid" },
        ].map(({ label, value }) => {
          const params = new URLSearchParams();
          if (value) params.set("status", value);
          if (periodFilter) params.set("period", periodFilter);
          const href = `/a/finansial${params.size > 0 ? `?${params}` : ""}`;
          const isActive = statusFilter === value;
          return (
            <Link
              key={value}
              href={href}
              className={cn(
                "h-8 px-3 rounded-full text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              {label}
            </Link>
          );
        })}

        {/* Period select as link (client workaround: just list common periods) */}
        {uniquePeriods.length > 0 && (
          <div className="flex gap-1 flex-wrap ml-2">
            {uniquePeriods.slice(0, 6).map((p) => {
              const params = new URLSearchParams();
              if (statusFilter) params.set("status", statusFilter);
              params.set("period", p);
              const href = `/a/finansial?${params}`;
              const isActive = periodFilter === p;
              return (
                <Link
                  key={p}
                  href={href}
                  className={cn(
                    "h-7 px-2.5 rounded-full text-xs font-medium transition-colors border",
                    isActive
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border text-muted-foreground hover:bg-muted"
                  )}
                >
                  {formatPeriod(p)}
                </Link>
              );
            })}
            {periodFilter && (
              <Link
                href={statusFilter ? `/a/finansial?status=${statusFilter}` : "/a/finansial"}
                className="h-7 px-2.5 rounded-full text-xs font-medium border border-border text-muted-foreground hover:bg-muted transition-colors"
              >
                ✕ Reset
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Invoice list */}
      {(!invoices || invoices.length === 0) ? (
        <div className="rounded-xl border bg-card p-8 text-center space-y-2">
          <Banknote className="h-8 w-8 text-muted-foreground mx-auto" />
          <p className="font-medium text-muted-foreground">
            {periodFilter || statusFilter
              ? "Tidak ada invoice yang sesuai filter."
              : "Belum ada tagihan. Klik \"Generate Tagihan\" untuk membuat tagihan bulan ini."}
          </p>
        </div>
      ) : (
        <div className="rounded-xl border divide-y overflow-hidden">
          {(invoices ?? []).map((inv) => {
            const member = Array.isArray(inv.members) ? inv.members[0] : inv.members;
            const mp = Array.isArray(member?.member_profiles)
              ? member?.member_profiles[0]
              : member?.member_profiles;
            const fullName = (mp as any)?.full_name ?? "—";
            const remaining = (inv.total_amount ?? 0) - (inv.amount_paid ?? 0);

            return (
              <Link
                key={inv.id}
                href={`/a/finansial/${inv.id}`}
                className="flex items-center gap-4 px-4 py-3 hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-sm truncate">{fullName}</p>
                    <span className="text-xs text-muted-foreground font-mono">
                      {member?.member_id_code}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {formatPeriod(inv.period_month)}
                    {inv.due_date && (
                      <span className="ml-2">
                        · Jatuh tempo{" "}
                        {new Date(inv.due_date).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                    )}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-semibold">
                    {formatRupiah(inv.total_amount ?? 0)}
                  </p>
                  {inv.status !== "paid" && (
                    <p className="text-xs text-muted-foreground">
                      sisa {formatRupiah(remaining)}
                    </p>
                  )}
                </div>
                <Badge variant={STATUS_VARIANT[inv.status] ?? "outline"}>
                  {STATUS_LABEL[inv.status] ?? inv.status}
                </Badge>
                <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
              </Link>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            {offset + 1}–{Math.min(offset + DEFAULT_PAGE_SIZE, totalCount ?? 0)} dari{" "}
            {totalCount} invoice
          </span>
          <div className="flex gap-2">
            {page > 1 && (
              <Link
                href={`/a/finansial?page=${page - 1}${statusFilter ? `&status=${statusFilter}` : ""}${periodFilter ? `&period=${periodFilter}` : ""}`}
                className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
              >
                Sebelumnya
              </Link>
            )}
            {page < totalPages && (
              <Link
                href={`/a/finansial?page=${page + 1}${statusFilter ? `&status=${statusFilter}` : ""}${periodFilter ? `&period=${periodFilter}` : ""}`}
                className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
              >
                Berikutnya
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// StatCard
// ============================================================================
function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub: string;
  color: "blue" | "green" | "red" | "amber";
}) {
  const colorMap = {
    blue: "text-blue-600 bg-blue-50",
    green: "text-green-600 bg-green-50",
    red: "text-destructive bg-destructive/10",
    amber: "text-amber-600 bg-amber-50",
  };

  return (
    <div className="rounded-xl border bg-card p-4 space-y-2">
      <div className={cn("inline-flex p-2 rounded-lg", colorMap[color])}>
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className="text-xl font-bold leading-tight">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-[11px] text-muted-foreground mt-0.5">{sub}</p>
      </div>
    </div>
  );
}
