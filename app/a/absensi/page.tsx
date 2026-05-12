import { Suspense } from "react";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus } from "lucide-react";
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

const STATUS_LABEL: Record<string, string> = {
  present: "Hadir",
  late: "Terlambat",
  permitted: "Izin",
  sick: "Sakit",
  absent: "Alpha",
};
const STATUS_VARIANT: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  present: "default",
  late: "secondary",
  permitted: "outline",
  sick: "outline",
  absent: "destructive",
};

interface PageProps {
  searchParams: Promise<{
    q?: string;
    page?: string;
    class_id?: string;
    status?: string;
    date_from?: string;
    date_to?: string;
    limit?: string;
  }>;
}

function AbsensiSkeleton() {
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

export default function AbsensiPage({ searchParams }: PageProps) {
  return (
    <Suspense fallback={<AbsensiSkeleton />}>
      <AbsensiContent searchParams={searchParams} />
    </Suspense>
  );
}

async function AbsensiContent({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    page?: string;
    class_id?: string;
    status?: string;
    date_from?: string;
    date_to?: string;
    limit?: string;
  }>;
}) {
  const supabase = createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const params = await searchParams;

  const q = params.q?.trim() ?? "";
  const page = Math.max(1, parseInt(params.page ?? "1", 10));
  const pageSize = Math.max(1, parseInt(params.limit ?? String(DEFAULT_PAGE_SIZE), 10));
  const classFilter = params.class_id ?? "";
  const statusFilter = params.status ?? "";
  const dateFrom = params.date_from ?? "";
  const dateTo = params.date_to ?? "";
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  // Fetch active classes for filter dropdown
  const { data: classes } = await supabase
    .from("classes")
    .select("id, name")
    .eq("status", "active")
    .is("deleted_at", null)
    .order("name");

  let query = supabase
    .from("attendance_records")
    .select(
      `id, session_date, status, scan_method, notes,
       members!inner(member_id_code, member_profiles(full_name)),
       classes!inner(name),
       coaches(coach_profiles(full_name))`,
      { count: "exact" }
    )
    .order("session_date", { ascending: false })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (classFilter) query = query.eq("class_id", classFilter);
  if (statusFilter) query = query.eq("status", statusFilter);
  if (dateFrom) query = query.gte("session_date", dateFrom);
  if (dateTo) query = query.lte("session_date", dateTo);
  // Member name search via member_profiles
  if (q) {
    query = query.or(
      `members.member_id_code.ilike.%${q}%`
    );
  }

  const { data: records, count } = await query;
  const totalPages = Math.ceil((count ?? 0) / pageSize);

  function buildUrl(overrides: Record<string, string | undefined>) {
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    if (classFilter) p.set("class_id", classFilter);
    if (statusFilter) p.set("status", statusFilter);
    if (dateFrom) p.set("date_from", dateFrom);
    if (dateTo) p.set("date_to", dateTo);
    if (page > 1) p.set("page", String(page));
    if (pageSize !== DEFAULT_PAGE_SIZE) p.set("limit", String(pageSize));
    Object.entries(overrides).forEach(([k, v]) => {
      if (v === undefined) p.delete(k);
      else p.set(k, v);
    });
    const s = p.toString();
    return `/a/absensi${s ? `?${s}` : ""}`;
  }

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold">Rekap Absensi</h1>
          <p className="text-muted-foreground text-sm mt-0.5">{count ?? 0} catatan</p>
        </div>
        <Link href="/a/absensi/manual" className={cn(buttonVariants({ size: "sm" }), "gap-2")}>
          <Plus className="h-4 w-4" />
          Input Manual
        </Link>
      </div>

      {/* Filters */}
      <form method="GET" action="/a/absensi" className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <select
          name="class_id"
          defaultValue={classFilter}
          className="col-span-2 md:col-span-1 h-9 rounded-md border border-input bg-background px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">Semua Kelas</option>
          {(classes ?? []).map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        <select
          name="status"
          defaultValue={statusFilter}
          className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">Semua Status</option>
          {Object.entries(STATUS_LABEL).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
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

        <div className="col-span-2 md:col-span-4 flex gap-2">
          <button
            type="submit"
            className={cn(buttonVariants({ size: "sm" }))}
          >
            Filter
          </button>
          <Link
            href="/a/absensi"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            Reset
          </Link>
        </div>
      </form>

      {/* Table */}
      <div className="rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tanggal</TableHead>
              <TableHead>Member</TableHead>
              <TableHead>Kelas</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Metode</TableHead>
              <TableHead>Pelatih</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!records || records.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                  Tidak ada data absensi.
                </TableCell>
              </TableRow>
            ) : (
              records.map((r) => {
                const member = Array.isArray(r.members) ? r.members[0] : r.members;
                const mProfile = Array.isArray(member?.member_profiles)
                  ? member?.member_profiles?.[0]
                  : member?.member_profiles;
                const cls = Array.isArray(r.classes) ? r.classes[0] : r.classes;
                const coach = Array.isArray(r.coaches) ? r.coaches[0] : r.coaches;
                const cProfile = Array.isArray(coach?.coach_profiles)
                  ? coach?.coach_profiles?.[0]
                  : coach?.coach_profiles;

                return (
                  <TableRow key={r.id}>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(r.session_date).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                    </TableCell>
                    <TableCell>
                      <p className="font-medium text-sm">{mProfile?.full_name ?? "—"}</p>
                      <p className="text-xs text-muted-foreground font-mono">{member?.member_id_code ?? "—"}</p>
                    </TableCell>
                    <TableCell className="text-sm">{cls?.name ?? "—"}</TableCell>
                    <TableCell>
                      <Badge variant={STATUS_VARIANT[r.status] ?? "outline"}>
                        {STATUS_LABEL[r.status] ?? r.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground capitalize">
                      {r.scan_method === "qr" ? "QR Scan" : "Manual"}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {cProfile?.full_name ?? "—"}
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
