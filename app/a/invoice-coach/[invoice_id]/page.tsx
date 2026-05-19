import { Suspense } from "react";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { InvoicePrintView } from "@/components/coach/invoice-print-view";

interface PageProps {
  params: Promise<{ invoice_id: string }>;
}

function PageSkeleton() {
  return (
    <div className="p-6 space-y-4 max-w-3xl animate-pulse">
      <div className="h-8 w-32 bg-muted rounded" />
      <div className="h-48 bg-muted rounded-xl" />
    </div>
  );
}

async function PageContent({ params }: PageProps) {
  const { invoice_id } = await params;
  const supabase = createClient(await cookies());

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: invoice, error } = await supabase
    .from("coach_invoices")
    .select(`
      id, period_month, total_sessions, total_amount, status, generated_at,
      coaches(
        id,
        coach_profiles(full_name, phone, alamat, nomor_rekening, nama_bank)
      ),
      branches(name),
      coach_invoice_items(
        id, session_date, rate_per_session, notes,
        classes(name)
      )
    `)
    .eq("id", invoice_id)
    .is("deleted_at", null)
    .single();

  if (error || !invoice) notFound();

  const coach = Array.isArray(invoice.coaches) ? invoice.coaches[0] : invoice.coaches;
  const cp = Array.isArray(coach?.coach_profiles) ? coach.coach_profiles[0] : coach?.coach_profiles;
  const branch = Array.isArray(invoice.branches) ? invoice.branches[0] : invoice.branches;
  const items = (Array.isArray(invoice.coach_invoice_items)
    ? invoice.coach_invoice_items
    : []
  ).sort((a: { session_date: string }, b: { session_date: string }) =>
    a.session_date.localeCompare(b.session_date)
  );

  const invoiceData = {
    id: invoice.id,
    period_month: invoice.period_month,
    total_sessions: invoice.total_sessions,
    total_amount: Number(invoice.total_amount),
    status: invoice.status as "draft" | "submitted",
    generated_at: invoice.generated_at,
    coach_name: (cp as any)?.full_name ?? "—",
    coach_phone: (cp as any)?.phone ?? null,
    coach_alamat: (cp as any)?.alamat ?? null,
    coach_rekening: (cp as any)?.nomor_rekening ?? null,
    coach_bank: (cp as any)?.nama_bank ?? null,
    branch_name: (branch as any)?.name ?? "—",
    items: items.map((item: any) => {
      const cls = Array.isArray(item.classes) ? item.classes[0] : item.classes;
      return {
        id: item.id,
        session_date: item.session_date,
        class_name: (cls as any)?.name ?? "—",
        rate_per_session: Number(item.rate_per_session),
        notes: item.notes,
      };
    }),
  };

  return (
    <div className="p-6 max-w-3xl space-y-5">
      <div className="flex items-center gap-3">
        <Link
          href="/a/invoice-coach"
          className={buttonVariants({ variant: "ghost", size: "icon-sm" })}
        >
          <ChevronLeft className="h-4 w-4" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-lg font-semibold">Invoice — {invoiceData.coach_name}</h1>
            <Badge variant={invoiceData.status === "submitted" ? "default" : "outline"} className="text-xs">
              {invoiceData.status === "submitted" ? "Diajukan" : "Draft"}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            {new Date(Number(invoice.period_month.split("-")[0]), Number(invoice.period_month.split("-")[1]) - 1)
              .toLocaleDateString("id-ID", { month: "long", year: "numeric" })}
            {" · "}{invoiceData.branch_name}
          </p>
        </div>
      </div>

      <InvoicePrintView invoice={invoiceData} />
    </div>
  );
}

export default function AdminInvoiceDetailPage({ params }: PageProps) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <PageContent params={params} />
    </Suspense>
  );
}
