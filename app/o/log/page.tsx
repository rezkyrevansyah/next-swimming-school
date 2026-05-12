import { createAdminClient } from "@/utils/supabase/server";
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
import { DEFAULT_PAGE_SIZE } from "@/lib/constants";

const ACTION_LABEL: Record<string, string> = {
  create_member: "Buat Anggota",
  update_member: "Ubah Anggota",
  soft_delete_member: "Arsip Anggota",
  restore_member: "Pulihkan Anggota",
  hard_delete_member: "Hapus Anggota",
  approve_member: "Setujui Anggota",
  reject_member: "Tolak Anggota",
  create_coach: "Buat Pelatih",
  update_coach: "Ubah Pelatih",
  soft_delete_coach: "Arsip Pelatih",
  restore_coach: "Pulihkan Pelatih",
  hard_delete_coach: "Hapus Pelatih",
  update_schedules: "Ubah Jadwal",
  assign_coach: "Tugaskan Pelatih",
  unassign_coach: "Lepas Pelatih",
  enroll_member: "Daftarkan ke Kelas",
  unenroll_member: "Keluarkan dari Kelas",
};

interface PageProps {
  searchParams: Promise<{
    page?: string;
    action?: string;
    resource_type?: string;
    branch_id?: string;
    date_from?: string;
    date_to?: string;
  }>;
}

export default async function OwnerLogPage({ searchParams }: PageProps) {
  const db = createAdminClient();

  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1", 10));
  const actionFilter = params.action ?? "";
  const resourceFilter = params.resource_type ?? "";
  const branchFilter = params.branch_id ?? "";
  const dateFrom = params.date_from ?? "";
  const dateTo = params.date_to ?? "";
  const from = (page - 1) * DEFAULT_PAGE_SIZE;
  const to = from + DEFAULT_PAGE_SIZE - 1;

  // Fetch branches for filter dropdown
  const { data: branches } = await db
    .from("branches")
    .select("id, name")
    .is("deleted_at", null)
    .order("name");

  let query = db
    .from("activity_logs")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (actionFilter) query = query.eq("action", actionFilter);
  if (resourceFilter) query = query.eq("resource_type", resourceFilter);
  if (branchFilter) query = query.eq("branch_id", branchFilter);
  if (dateFrom) query = query.gte("created_at", dateFrom);
  if (dateTo) query = query.lte("created_at", dateTo + "T23:59:59");

  const { data: logs, count } = await query;
  const totalPages = Math.ceil((count ?? 0) / DEFAULT_PAGE_SIZE);

  const uniqueActions = Object.keys(ACTION_LABEL);
  const uniqueResources = ["members", "coaches", "classes", "branches"];

  function buildUrl(overrides: Record<string, string | undefined>) {
    const p = new URLSearchParams();
    if (actionFilter) p.set("action", actionFilter);
    if (resourceFilter) p.set("resource_type", resourceFilter);
    if (branchFilter) p.set("branch_id", branchFilter);
    if (dateFrom) p.set("date_from", dateFrom);
    if (dateTo) p.set("date_to", dateTo);
    if (page > 1) p.set("page", String(page));
    Object.entries(overrides).forEach(([k, v]) => {
      if (v === undefined) p.delete(k);
      else p.set(k, v);
    });
    const s = p.toString();
    return `/o/log${s ? `?${s}` : ""}`;
  }

  const branchMap = Object.fromEntries((branches ?? []).map((b) => [b.id, b.name]));

  return (
    <div className="p-4 md:p-6 space-y-4 max-w-6xl">
      <div>
        <h1 className="text-xl md:text-2xl font-semibold">Log Aktivitas</h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          {count ?? 0} entri — semua cabang
        </p>
      </div>

      {/* Filters */}
      <form method="GET" action="/o/log" className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
        <select
          name="action"
          defaultValue={actionFilter}
          className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">Semua Aksi</option>
          {uniqueActions.map((a) => (
            <option key={a} value={a}>{ACTION_LABEL[a] ?? a}</option>
          ))}
        </select>

        <select
          name="resource_type"
          defaultValue={resourceFilter}
          className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">Semua Tipe</option>
          {uniqueResources.map((r) => (
            <option key={r} value={r} className="capitalize">{r}</option>
          ))}
        </select>

        <select
          name="branch_id"
          defaultValue={branchFilter}
          className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">Semua Cabang</option>
          {(branches ?? []).map((b) => (
            <option key={b.id} value={b.id}>{b.name}</option>
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

        <div className="flex gap-2">
          <button type="submit" className={cn(buttonVariants({ size: "sm" }))}>Filter</button>
          <Link href="/o/log" className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>Reset</Link>
        </div>
      </form>

      {/* Table */}
      <div className="rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Waktu</TableHead>
              <TableHead>Aksi</TableHead>
              <TableHead>Tipe</TableHead>
              <TableHead>ID Resource</TableHead>
              <TableHead>Cabang</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!logs || logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                  Tidak ada log aktivitas.
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(log.created_at).toLocaleString("id-ID", {
                      day: "numeric", month: "short", year: "numeric",
                      hour: "2-digit", minute: "2-digit",
                    })}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs font-mono">
                      {ACTION_LABEL[log.action] ?? log.action}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm capitalize">{log.resource_type}</TableCell>
                  <TableCell className="text-xs font-mono text-muted-foreground">
                    {log.resource_id ? log.resource_id.slice(0, 8) + "…" : "—"}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {log.branch_id ? (branchMap[log.branch_id] ?? log.branch_id.slice(0, 8) + "…") : "—"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Hal. {page} / {totalPages}</span>
          <div className="flex gap-2">
            <Link
              href={buildUrl({ page: String(page - 1) })}
              className={cn(buttonVariants({ variant: "outline", size: "sm" }), page <= 1 && "pointer-events-none opacity-50")}
            >
              Prev
            </Link>
            <Link
              href={buildUrl({ page: String(page + 1) })}
              className={cn(buttonVariants({ variant: "outline", size: "sm" }), page >= totalPages && "pointer-events-none opacity-50")}
            >
              Next
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
