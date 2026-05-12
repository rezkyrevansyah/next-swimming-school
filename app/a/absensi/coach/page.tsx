import { Suspense } from "react";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PaginationControls, DEFAULT_PAGE_SIZE } from "@/components/shared/pagination-controls";
import { SuspiciousToggle } from "./suspicious-toggle";

interface PageProps {
  searchParams: Promise<{
    page?: string;
    coach_id?: string;
    date_from?: string;
    date_to?: string;
    suspicious?: string;
    limit?: string;
  }>;
}

function AbsensiCoachSkeleton() {
  return (
    <div className="p-6 space-y-4 animate-pulse">
      <div className="h-7 w-40 bg-muted rounded" />
      <div className="flex gap-2">
        <div className="h-10 w-40 bg-muted rounded" />
        <div className="h-10 w-40 bg-muted rounded" />
      </div>
      <div className="space-y-2">
        <div className="h-10 bg-muted rounded" />
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-14 bg-muted rounded" />
        ))}
      </div>
    </div>
  );
}

export default async function AbsensiCoachPage({ searchParams }: PageProps) {
  const supabase = createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const params = await searchParams;

  return (
    <Suspense fallback={<AbsensiCoachSkeleton />}>
      <AbsensiCoachContent params={params} />
    </Suspense>
  );
}

async function AbsensiCoachContent({
  params,
}: {
  params: {
    page?: string;
    coach_id?: string;
    date_from?: string;
    date_to?: string;
    suspicious?: string;
    limit?: string;
  };
}) {
  const supabase = createClient(await cookies());

  const page = Math.max(1, parseInt(params.page ?? "1", 10));
  const pageSize = Math.max(1, parseInt(params.limit ?? String(DEFAULT_PAGE_SIZE), 10));
  const coachFilter = params.coach_id ?? "";
  const dateFrom = params.date_from ?? "";
  const dateTo = params.date_to ?? "";
  const suspiciousOnly = params.suspicious === "1";
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  // Fetch coaches for filter dropdown
  const { data: coaches } = await supabase
    .from("coaches")
    .select("id, coach_profiles(full_name)")
    .eq("status", "active")
    .is("deleted_at", null)
    .order("created_at");

  let query = supabase
    .from("coach_clock_records")
    .select(
      `id, clock_in_date, clock_in_at, clock_in_distance_m, suspicious_flag, notes,
       coaches!inner(id, coach_id_code, coach_profiles(full_name)),
       branches(name)`,
      { count: "exact" }
    )
    .order("clock_in_date", { ascending: false })
    .order("clock_in_at", { ascending: false })
    .range(from, to);

  if (coachFilter) query = query.eq("coach_id", coachFilter);
  if (dateFrom) query = query.gte("clock_in_date", dateFrom);
  if (dateTo) query = query.lte("clock_in_date", dateTo);
  if (suspiciousOnly) query = query.eq("suspicious_flag", true);

  const { data: records, count } = await query;
  const totalPages = Math.ceil((count ?? 0) / pageSize);

  function buildUrl(overrides: Record<string, string | undefined>) {
    const p = new URLSearchParams();
    if (coachFilter) p.set("coach_id", coachFilter);
    if (dateFrom) p.set("date_from", dateFrom);
    if (dateTo) p.set("date_to", dateTo);
    if (suspiciousOnly) p.set("suspicious", "1");
    if (page > 1) p.set("page", String(page));
    if (pageSize !== DEFAULT_PAGE_SIZE) p.set("limit", String(pageSize));
    Object.entries(overrides).forEach(([k, v]) => {
      if (v === undefined) p.delete(k);
      else p.set(k, v);
    });
    const s = p.toString();
    return `/a/absensi/coach${s ? `?${s}` : ""}`;
  }

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div>
        <h1 className="text-xl md:text-2xl font-semibold">Absensi Pelatih</h1>
        <p className="text-muted-foreground text-sm mt-0.5">{count ?? 0} catatan clock-in</p>
      </div>

      {/* Filters */}
      <form method="GET" action="/a/absensi/coach" className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <select
          name="coach_id"
          defaultValue={coachFilter}
          className="col-span-2 md:col-span-1 h-9 rounded-md border border-input bg-background px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">Semua Pelatih</option>
          {(coaches ?? []).map((c) => {
            const profile = Array.isArray(c.coach_profiles) ? c.coach_profiles[0] : c.coach_profiles;
            return (
              <option key={c.id} value={c.id}>{profile?.full_name ?? c.id}</option>
            );
          })}
        </select>

        <input
          name="date_from"
          type="date"
          defaultValue={dateFrom}
          className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <input
          name="date_to"
          type="date"
          defaultValue={dateTo}
          className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />

        <label className="flex items-center gap-2 h-9 text-sm cursor-pointer">
          <input
            type="checkbox"
            name="suspicious"
            value="1"
            defaultChecked={suspiciousOnly}
            className="h-4 w-4 rounded border-input"
          />
          Hanya mencurigakan
        </label>

        <div className="col-span-2 md:col-span-4 flex gap-2">
          <button type="submit" className={cn(buttonVariants({ size: "sm" }))}>Filter</button>
          <Link href="/a/absensi/coach" className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>Reset</Link>
        </div>
      </form>

      {/* Table */}
      <div className="rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tanggal</TableHead>
              <TableHead>Pelatih</TableHead>
              <TableHead>Cabang</TableHead>
              <TableHead>Jam Clock-In</TableHead>
              <TableHead>Jarak (m)</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!records || records.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                  Tidak ada data absensi pelatih.
                </TableCell>
              </TableRow>
            ) : (
              records.map((r) => {
                const coach = Array.isArray(r.coaches) ? r.coaches[0] : r.coaches;
                const cProfile = Array.isArray(coach?.coach_profiles)
                  ? coach?.coach_profiles?.[0]
                  : coach?.coach_profiles;
                const branch = Array.isArray(r.branches) ? r.branches[0] : r.branches;

                return (
                  <TableRow key={r.id} className={r.suspicious_flag ? "bg-destructive/5" : undefined}>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(r.clock_in_date).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                    </TableCell>
                    <TableCell>
                      <Link href={`/a/coach/${coach?.id}`} className="text-sm font-medium hover:underline">
                        {cProfile?.full_name ?? "—"}
                      </Link>
                    </TableCell>
                    <TableCell className="text-sm">{branch?.name ?? "—"}</TableCell>
                    <TableCell className="text-sm font-mono">
                      {new Date(r.clock_in_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                    </TableCell>
                    <TableCell className="text-sm">
                      {r.clock_in_distance_m != null ? `${Math.round(r.clock_in_distance_m)} m` : "—"}
                    </TableCell>
                    <TableCell>
                      <SuspiciousToggle recordId={r.id} suspicious={r.suspicious_flag} />
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <PaginationControls page={page} totalPages={totalPages} pageSize={pageSize} buildUrl={buildUrl} />
    </div>
  );
}
