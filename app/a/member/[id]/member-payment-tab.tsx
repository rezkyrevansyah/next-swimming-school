import Link from "next/link";
import { Banknote, ChevronRight, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// ============================================================================
// Types
// ============================================================================
interface InvoiceSummary {
  id: string;
  period_month: string;
  total_amount: number;
  amount_paid: number;
  status: "unpaid" | "paid" | "partial";
  due_date: string | null;
  generated_at: string;
}

interface MemberPaymentTabProps {
  invoices: InvoiceSummary[];
  memberPaymentHandling: string;
}

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
// Component
// ============================================================================
export function MemberPaymentTab({
  invoices,
  memberPaymentHandling,
}: MemberPaymentTabProps) {
  // Afiliasi / covered by school: no billing
  if (memberPaymentHandling === "covered_by_school") {
    return (
      <div className="rounded-xl border bg-card p-5 text-center space-y-2">
        <Banknote className="h-8 w-8 text-muted-foreground mx-auto" />
        <p className="font-medium text-muted-foreground">
          Anggota ini dikelola pembayarannya oleh sekolah afiliasi.
        </p>
        <p className="text-sm text-muted-foreground">
          Tidak ada tagihan individual.
        </p>
      </div>
    );
  }

  // Summary stats
  const totalUnpaid = invoices.filter((i) => i.status === "unpaid").length;
  const totalOutstanding = invoices.reduce(
    (s, i) => s + Math.max(0, (i.total_amount ?? 0) - (i.amount_paid ?? 0)),
    0
  );

  return (
    <div className="space-y-4">
      {/* Outstanding banner */}
      {totalUnpaid > 0 && (
        <div className="flex items-start gap-2 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">
              {totalUnpaid} tagihan belum dibayar
            </p>
            <p className="text-xs mt-0.5">
              Total outstanding: {formatRupiah(totalOutstanding)}
            </p>
          </div>
        </div>
      )}

      {/* Quick link to finansial */}
      <div className="flex justify-end">
        <Link
          href="/a/finansial"
          className="text-xs text-primary hover:underline flex items-center gap-1"
        >
          Lihat semua tagihan
          <ChevronRight className="h-3 w-3" />
        </Link>
      </div>

      {/* Invoice list */}
      {invoices.length === 0 ? (
        <div className="rounded-xl border bg-card p-6 text-center space-y-2">
          <Banknote className="h-8 w-8 text-muted-foreground mx-auto" />
          <p className="text-sm text-muted-foreground">
            Belum ada tagihan untuk anggota ini.
          </p>
        </div>
      ) : (
        <div className="rounded-xl border divide-y overflow-hidden">
          {invoices.map((inv) => {
            const remaining =
              (inv.total_amount ?? 0) - (inv.amount_paid ?? 0);
            return (
              <Link
                key={inv.id}
                href={`/a/finansial/${inv.id}`}
                className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{formatPeriod(inv.period_month)}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {formatRupiah(inv.total_amount ?? 0)}
                    {inv.status !== "paid" && remaining > 0 && (
                      <span className="text-destructive ml-1">
                        · sisa {formatRupiah(remaining)}
                      </span>
                    )}
                  </p>
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
    </div>
  );
}
