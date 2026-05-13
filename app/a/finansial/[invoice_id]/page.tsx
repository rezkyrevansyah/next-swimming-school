import { Suspense } from "react";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft, Phone, User, Calendar, Receipt,
  CheckCircle2, AlertCircle, Clock,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { RecordPaymentForm } from "./record-payment-form";
import { DeletePaymentButton } from "./delete-payment-button";

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

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
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
const STATUS_ICON: Record<string, React.ElementType> = {
  unpaid: AlertCircle,
  partial: Clock,
  paid: CheckCircle2,
};

// ============================================================================
// Page
// ============================================================================
interface PageProps {
  params: Promise<{ invoice_id: string }>;
}

export default function InvoiceDetailPage({ params }: PageProps) {
  return (
    <Suspense fallback={
      <div className="p-4 md:p-6 space-y-4 animate-pulse">
        <div className="h-8 w-32 bg-muted rounded" />
        <div className="h-48 bg-muted rounded-xl" />
        <div className="h-32 bg-muted rounded-xl" />
      </div>
    }>
      <InvoiceDetailContent params={params} />
    </Suspense>
  );
}

async function InvoiceDetailContent({ params }: PageProps) {
  const { invoice_id } = await params;
  const jar = await cookies();
  const supabase = createClient(jar);

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Fetch invoice with all relations
  const { data: invoice, error } = await supabase
    .from("monthly_invoices")
    .select(
      `
      *,
      members(
        id, member_id_code, status,
        member_profiles(full_name, nickname, phone, phone_owner, parent_name, parent_phone)
      ),
      invoice_items(id, description, amount, class_id, classes(name)),
      payments(id, amount, paid_at, notes, proof_url, recorded_by, created_at)
    `
    )
    .eq("id", invoice_id)
    .single();

  if (error || !invoice) notFound();

  const member = Array.isArray(invoice.members) ? invoice.members[0] : invoice.members;
  const profile = Array.isArray(member?.member_profiles)
    ? member?.member_profiles[0]
    : member?.member_profiles;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const items: any[] = Array.isArray(invoice.invoice_items) ? invoice.invoice_items : [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const payments: any[] = (Array.isArray(invoice.payments) ? invoice.payments : []).sort(
    (a: { paid_at: string }, b: { paid_at: string }) =>
      new Date(b.paid_at).getTime() - new Date(a.paid_at).getTime()
  );

  const outstanding = (invoice.total_amount ?? 0) - (invoice.amount_paid ?? 0);
  const StatusIcon = STATUS_ICON[invoice.status] ?? AlertCircle;

  // Contact info
  const phone =
    profile?.phone_owner === "parent"
      ? profile?.parent_phone
      : profile?.phone;
  const waHref = phone
    ? `https://wa.me/${phone.replace(/\D/g, "").replace(/^0/, "62")}?text=${encodeURIComponent(
        `Halo ${profile?.full_name}, tagihan kelas renang bulan ${formatPeriod(invoice.period_month)} sebesar ${formatRupiah(invoice.total_amount ?? 0)} belum lunas. Mohon segera melakukan pembayaran. Terima kasih 🏊`
      )}`
    : null;

  return (
    <div className="p-4 md:p-6 max-w-2xl space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/a/finansial"
          className={buttonVariants({ variant: "ghost", size: "icon-sm" })}
        >
          <ChevronLeft className="h-4 w-4" />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-lg font-semibold truncate">
              Tagihan — {formatPeriod(invoice.period_month)}
            </h1>
            <Badge variant={STATUS_VARIANT[invoice.status] ?? "outline"}>
              <StatusIcon className="h-3 w-3 mr-1" />
              {STATUS_LABEL[invoice.status] ?? invoice.status}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Dibuat {formatDate(invoice.generated_at)}
          </p>
        </div>
      </div>

      {/* Member info */}
      <div className="rounded-xl border bg-card p-4 space-y-3">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Anggota
        </p>
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-lg font-bold text-muted-foreground shrink-0">
            {(profile?.full_name ?? "?").charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="font-medium truncate">{profile?.full_name ?? "—"}</p>
            <p className="text-xs text-muted-foreground font-mono">
              {member?.member_id_code}
            </p>
          </div>
          {waHref && (
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "ml-auto gap-2 shrink-0"
              )}
            >
              <Phone className="h-3.5 w-3.5" />
              WA
            </a>
          )}
        </div>
        <Link
          href={`/a/member/${member?.id}`}
          className="text-xs text-primary hover:underline flex items-center gap-1"
        >
          <User className="h-3 w-3" />
          Lihat profil anggota
        </Link>
      </div>

      {/* Invoice summary */}
      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="px-4 py-3 border-b bg-muted/30">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Rincian Tagihan
          </p>
        </div>
        <div className="divide-y">
          {items.length > 0 ? (
            items.map((item) => {
              const cls = Array.isArray((item as any).classes)
                ? (item as any).classes[0]
                : (item as any).classes;
              return (
                <div key={item.id} className="px-4 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm">{item.description}</p>
                    {cls?.name && (
                      <p className="text-xs text-muted-foreground">{cls.name}</p>
                    )}
                  </div>
                  <p className="text-sm font-medium shrink-0 ml-4">
                    {formatRupiah(item.amount ?? 0)}
                  </p>
                </div>
              );
            })
          ) : (
            <div className="px-4 py-3 text-sm text-muted-foreground">
              Tidak ada rincian item.
            </div>
          )}
        </div>

        {/* Totals */}
        <div className="px-4 py-3 border-t space-y-1.5 bg-muted/20">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Total Tagihan</span>
            <span className="font-semibold">{formatRupiah(invoice.total_amount ?? 0)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Sudah Dibayar</span>
            <span className="text-green-700">{formatRupiah(invoice.amount_paid ?? 0)}</span>
          </div>
          {outstanding > 0 && (
            <div className="flex justify-between text-sm font-semibold border-t pt-1.5 mt-1.5">
              <span>Sisa Tagihan</span>
              <span className="text-destructive">{formatRupiah(outstanding)}</span>
            </div>
          )}
          {outstanding <= 0 && (
            <div className="flex justify-between text-sm font-semibold border-t pt-1.5 mt-1.5 text-green-700">
              <span>Status</span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Lunas
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Due date & notes */}
      {(invoice.due_date || invoice.notes) && (
        <div className="rounded-xl border bg-card p-4 space-y-2">
          {invoice.due_date && (
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="text-muted-foreground">Jatuh tempo:</span>
              <span className="font-medium">
                {new Date(invoice.due_date).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>
          )}
          {invoice.notes && (
            <div className="flex items-start gap-2 text-sm">
              <Receipt className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
              <p className="text-muted-foreground">{invoice.notes}</p>
            </div>
          )}
        </div>
      )}

      {/* Payment history */}
      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="px-4 py-3 border-b bg-muted/30 flex items-center justify-between">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Riwayat Pembayaran
          </p>
          {payments.length > 0 && (
            <span className="text-xs text-muted-foreground">{payments.length} transaksi</span>
          )}
        </div>
        {payments.length === 0 ? (
          <p className="px-4 py-5 text-sm text-muted-foreground text-center">
            Belum ada pembayaran dicatat.
          </p>
        ) : (
          <div className="divide-y">
            {payments.map((pay) => (
              <div key={pay.id} className="px-4 py-3 flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-green-700">
                      +{formatRupiah(pay.amount ?? 0)}
                    </p>
                    {pay.notes && (
                      <span className="text-xs text-muted-foreground truncate">
                        — {pay.notes}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {formatDate(pay.paid_at)}
                  </p>
                </div>
                <DeletePaymentButton paymentId={pay.id} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Record payment form */}
      <RecordPaymentForm
        invoiceId={invoice_id}
        outstanding={outstanding}
        disabled={invoice.status === "paid"}
      />

      {invoice.status === "paid" && (
        <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          Invoice ini sudah lunas. Tidak perlu pembayaran tambahan.
        </div>
      )}
    </div>
  );
}
