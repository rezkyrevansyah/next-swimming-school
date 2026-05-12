import { Suspense } from "react";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Banknote, AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

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
const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  unpaid: "destructive",
  partial: "secondary",
  paid: "default",
};
const STATUS_ICON: Record<string, React.ElementType> = {
  unpaid: AlertCircle,
  partial: Clock,
  paid: CheckCircle2,
};

export default function MemberPembayaranPage() {
  return (
    <Suspense>
      <PembayaranContent />
    </Suspense>
  );
}

async function PembayaranContent() {
  const supabase = createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Get member
  const { data: member } = await supabase
    .from("members")
    .select("id, payment_handling, status")
    .eq("user_id", user.id)
    .single();

  if (!member || member.status !== "active") redirect("/login");

  // Covered by school: no individual billing
  if (member.payment_handling === "covered_by_school") {
    return (
      <div className="p-4 max-w-lg mx-auto space-y-4">
        <div className="flex items-center gap-3">
          <Link href="/m/dashboard" className={buttonVariants({ variant: "ghost", size: "icon-sm" })}>
            <ChevronLeft className="h-4 w-4" />
          </Link>
          <h1 className="text-lg font-semibold">Pembayaran</h1>
        </div>
        <div className="rounded-xl border bg-card p-6 text-center space-y-2">
          <Banknote className="h-8 w-8 text-muted-foreground mx-auto" />
          <p className="font-medium text-muted-foreground">
            Pembayaran dikelola oleh sekolah afiliasi.
          </p>
          <p className="text-sm text-muted-foreground">
            Tidak ada tagihan individual untuk akunmu.
          </p>
        </div>
      </div>
    );
  }

  // Fetch invoices
  const { data: invoices } = await supabase
    .from("monthly_invoices")
    .select("id, period_month, total_amount, amount_paid, status, due_date")
    .eq("member_id", member.id)
    .order("period_month", { ascending: false });

  const list = invoices ?? [];
  const totalOutstanding = list.reduce(
    (s, i) => s + Math.max(0, (i.total_amount ?? 0) - (i.amount_paid ?? 0)),
    0
  );
  const unpaidCount = list.filter((i) => i.status !== "paid").length;

  return (
    <div className="p-4 max-w-lg mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/m/dashboard" className={buttonVariants({ variant: "ghost", size: "icon-sm" })}>
          <ChevronLeft className="h-4 w-4" />
        </Link>
        <h1 className="text-lg font-semibold">Pembayaran</h1>
      </div>

      {/* Outstanding summary */}
      {unpaidCount > 0 && (
        <div className="flex items-start gap-2 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">{unpaidCount} tagihan belum lunas</p>
            <p className="text-xs mt-0.5">Total: {formatRupiah(totalOutstanding)}</p>
          </div>
        </div>
      )}

      {/* Empty state */}
      {list.length === 0 ? (
        <div className="rounded-xl border bg-card p-8 text-center space-y-2">
          <Banknote className="h-8 w-8 text-muted-foreground mx-auto" />
          <p className="text-sm text-muted-foreground">Belum ada tagihan.</p>
        </div>
      ) : (
        <div className="rounded-xl border divide-y overflow-hidden">
          {list.map((inv) => {
            const remaining = Math.max(0, (inv.total_amount ?? 0) - (inv.amount_paid ?? 0));
            const StatusIcon = STATUS_ICON[inv.status] ?? AlertCircle;
            return (
              <div key={inv.id} className="px-4 py-3 flex items-start gap-3">
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
                  {inv.due_date && inv.status !== "paid" && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Jatuh tempo:{" "}
                      {new Date(inv.due_date).toLocaleDateString("id-ID", {
                        day: "numeric", month: "long", year: "numeric",
                      })}
                    </p>
                  )}
                </div>
                <Badge
                  variant={STATUS_VARIANT[inv.status] ?? "outline"}
                  className={cn("shrink-0 gap-1")}
                >
                  <StatusIcon className="h-3 w-3" />
                  {STATUS_LABEL[inv.status] ?? inv.status}
                </Badge>
              </div>
            );
          })}
        </div>
      )}

      <p className="text-xs text-muted-foreground text-center">
        Ada pertanyaan mengenai tagihan? Hubungi admin atau pelatih kamu.
      </p>
    </div>
  );
}
