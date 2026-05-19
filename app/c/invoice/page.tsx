import { Suspense } from "react";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { getCoachSessionsForMonth } from "@/lib/actions/coach-invoice";
import { InvoiceSessionTable } from "./invoice-session-table";

interface PageProps {
  searchParams: Promise<{ month?: string }>;
}

function PageSkeleton() {
  return (
    <div className="p-4 space-y-4 max-w-3xl animate-pulse">
      <div className="h-7 w-40 bg-muted rounded" />
      <div className="h-10 bg-muted rounded" />
      <div className="h-64 bg-muted rounded-xl" />
    </div>
  );
}

function getPrevNextMonth(month: string) {
  const [y, m] = month.split("-").map(Number);
  const prev = m === 1
    ? `${y - 1}-12`
    : `${y}-${String(m - 1).padStart(2, "0")}`;
  const next = m === 12
    ? `${y + 1}-01`
    : `${y}-${String(m + 1).padStart(2, "0")}`;
  return { prev, next };
}

async function PageContent({ searchParams }: PageProps) {
  const { month: monthParam } = await searchParams;
  const today = new Date();
  const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
  const periodMonth = monthParam ?? currentMonth;

  const supabase = createClient(await cookies());

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: coach } = await supabase
    .from("coaches")
    .select("id, coach_profiles(full_name)")
    .eq("user_id", user.id)
    .single();

  if (!coach) {
    return (
      <div className="p-6 text-center space-y-2">
        <AlertCircle className="h-10 w-10 text-destructive mx-auto" />
        <p className="text-sm text-muted-foreground">Profil pelatih tidak ditemukan.</p>
      </div>
    );
  }

  const [sessions, { data: existingInvoiceRow }] = await Promise.all([
    getCoachSessionsForMonth(coach.id, periodMonth),
    supabase
      .from("coach_invoices")
      .select("id, total_sessions, total_amount, status, generated_at")
      .eq("coach_id", coach.id)
      .eq("period_month", periodMonth)
      .is("deleted_at", null)
      .maybeSingle(),
  ]);

  const existingInvoice = existingInvoiceRow
    ? {
        id: existingInvoiceRow.id,
        total_sessions: existingInvoiceRow.total_sessions,
        total_amount: Number(existingInvoiceRow.total_amount),
        status: existingInvoiceRow.status,
        generated_at: existingInvoiceRow.generated_at,
      }
    : null;

  const [y, m] = periodMonth.split("-").map(Number);
  const periodLabel = new Date(y, m - 1).toLocaleDateString("id-ID", {
    month: "long", year: "numeric",
  });

  const { prev, next } = getPrevNextMonth(periodMonth);
  const cp = Array.isArray(coach.coach_profiles) ? coach.coach_profiles[0] : coach.coach_profiles;

  const eligibleCount = sessions.filter((s) => s.eligible).length;

  return (
    <div className="p-4 space-y-5 max-w-3xl pb-24">
      {/* Header */}
      <div className="pt-2">
        <h1 className="text-xl font-semibold">Invoice Saya</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {(cp as any)?.full_name ?? "—"} — pilih sesi untuk digenerate
        </p>
      </div>

      {/* Month navigation */}
      <div className="flex items-center justify-between rounded-xl border px-4 py-2.5">
        <Link
          href={`/c/invoice?month=${prev}`}
          className={buttonVariants({ variant: "ghost", size: "icon-sm" })}
        >
          <ChevronLeft className="h-4 w-4" />
        </Link>
        <div className="text-center">
          <p className="font-semibold">{periodLabel}</p>
          <p className="text-xs text-muted-foreground">
            {eligibleCount} sesi bisa diklaim
          </p>
        </div>
        <Link
          href={`/c/invoice?month=${next}`}
          className={buttonVariants({ variant: "ghost", size: "icon-sm" })}
        >
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Session table */}
      <InvoiceSessionTable
        sessions={sessions}
        periodMonth={periodMonth}
        existingInvoice={existingInvoice}
      />
    </div>
  );
}

export default function CoachInvoicePage({ searchParams }: PageProps) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <PageContent searchParams={searchParams} />
    </Suspense>
  );
}
