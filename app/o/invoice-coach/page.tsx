import { Suspense } from "react";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { FileText, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

function PageSkeleton() {
  return (
    <div className="p-6 space-y-4 max-w-4xl animate-pulse">
      <div className="h-7 w-40 bg-muted rounded" />
      <div className="h-48 bg-muted rounded-xl" />
    </div>
  );
}

function formatRupiah(n: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency", currency: "IDR", minimumFractionDigits: 0,
  }).format(n);
}

function formatPeriod(p: string) {
  const [y, m] = p.split("-");
  return new Date(Number(y), Number(m) - 1).toLocaleDateString("id-ID", {
    month: "long", year: "numeric",
  });
}

async function PageContent() {
  const supabase = createClient(await cookies());

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: invoices } = await supabase
    .from("coach_invoices")
    .select(`
      id, period_month, total_sessions, total_amount, status, generated_at,
      coaches(id, coach_profiles(full_name)),
      branches(name)
    `)
    .is("deleted_at", null)
    .order("period_month", { ascending: false })
    .order("generated_at", { ascending: false });

  const rows = (invoices ?? []).map((inv) => {
    const coach = Array.isArray(inv.coaches) ? inv.coaches[0] : inv.coaches;
    const cp = Array.isArray(coach?.coach_profiles) ? coach.coach_profiles[0] : coach?.coach_profiles;
    const branch = Array.isArray(inv.branches) ? inv.branches[0] : inv.branches;
    return {
      id: inv.id,
      period_month: inv.period_month,
      total_sessions: inv.total_sessions,
      total_amount: Number(inv.total_amount),
      status: inv.status as "draft" | "submitted",
      coach_name: (cp as any)?.full_name ?? "—",
      branch_name: (branch as any)?.name ?? "—",
    };
  });

  const totalAmount = rows.reduce((s, r) => s + r.total_amount, 0);

  return (
    <div className="p-6 max-w-4xl space-y-5">
      <div>
        <h1 className="text-xl font-semibold">Invoice Pelatih</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {rows.length} invoice · Total {formatRupiah(totalAmount)}
        </p>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-xl border px-4 py-12 text-center">
          <FileText className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Belum ada invoice dari pelatih.</p>
        </div>
      ) : (
        <div className="rounded-xl border overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 border-b">
              <tr>
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Pelatih</th>
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Periode</th>
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Cabang</th>
                <th className="text-right px-4 py-2.5 font-medium text-muted-foreground">Sesi</th>
                <th className="text-right px-4 py-2.5 font-medium text-muted-foreground">Total</th>
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-2.5" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {rows.map((r) => (
                <tr key={r.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 font-medium">{r.coach_name}</td>
                  <td className="px-4 py-3">{formatPeriod(r.period_month)}</td>
                  <td className="px-4 py-3 text-muted-foreground">{r.branch_name}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{r.total_sessions}</td>
                  <td className="px-4 py-3 text-right tabular-nums font-medium">
                    {formatRupiah(r.total_amount)}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={r.status === "submitted" ? "default" : "outline"} className="text-xs">
                      {r.status === "submitted" ? "Diajukan" : "Draft"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/o/invoice-coach/${r.id}`}
                      className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                    >
                      Detail <ChevronRight className="h-3 w-3" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function OwnerInvoiceCoachPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <PageContent />
    </Suspense>
  );
}
