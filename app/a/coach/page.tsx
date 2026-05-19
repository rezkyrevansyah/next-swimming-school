import { Suspense } from "react";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Search, Plus } from "lucide-react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { PaginationControls, DEFAULT_PAGE_SIZE } from "@/components/shared/pagination-controls";

const STATUS_LABEL: Record<string, string> = {
  active: "Aktif",
  inactive: "Tidak Aktif",
  pending: "Menunggu",
};
const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  active: "default",
  pending: "secondary",
  inactive: "outline",
};

interface PageProps {
  searchParams: Promise<{ q?: string; page?: string; deleted?: string; limit?: string }>;
}

function PageSkeleton() {
  return (
    <div className="p-4 md:p-6 space-y-4 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-7 w-32 bg-muted rounded" />
        <div className="h-9 w-28 bg-muted rounded" />
      </div>
      <div className="h-10 bg-muted rounded" />
      <div className="space-y-2">
        <div className="h-10 bg-muted rounded" />
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-14 bg-muted rounded" />
        ))}
      </div>
    </div>
  );
}

async function PageContent({ searchParams }: PageProps) {
  const supabase = createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const params = await searchParams;
  const q = params.q?.trim() ?? "";
  const page = Math.max(1, parseInt(params.page ?? "1", 10));
  const pageSize = Math.max(1, parseInt(params.limit ?? String(DEFAULT_PAGE_SIZE), 10));
  const showDeleted = params.deleted === "1";
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("coaches")
    .select(
      `id, coach_id_code, status, deleted_at,
       coach_profiles!inner(full_name, phone, specializations)`,
      { count: "exact" }
    )
    .order("created_at", { ascending: false })
    .range(from, to);

  if (showDeleted) query = query.not("deleted_at", "is", null);
  else query = query.is("deleted_at", null);

  if (q) {
    query = query.or(
      `coach_id_code.ilike.%${q}%,coach_profiles.full_name.ilike.%${q}%`
    );
  }

  const { data: coaches, count, error } = await query;

  // Fetch currently active suspensions
  const now = new Date().toISOString();
  const { data: suspensions } = await supabase
    .from("coach_suspensions")
    .select("coach_id")
    .is("lifted_at", null)
    .gt("resume_at", now);
  const suspendedCoachIds = new Set((suspensions ?? []).map((s) => s.coach_id));

  if (error) {
    return (
      <div className="p-6">
        <p className="text-destructive">Gagal memuat data: {error.message}</p>
      </div>
    );
  }

  const totalPages = Math.ceil((count ?? 0) / pageSize);

  function buildUrl(overrides: Record<string, string | undefined>) {
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    if (page > 1) p.set("page", String(page));
    if (showDeleted) p.set("deleted", "1");
    if (pageSize !== DEFAULT_PAGE_SIZE) p.set("limit", String(pageSize));
    Object.entries(overrides).forEach(([k, v]) => {
      if (v === undefined) p.delete(k);
      else p.set(k, v);
    });
    const s = p.toString();
    return `/a/coach${s ? `?${s}` : ""}`;
  }

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold">Pelatih</h1>
          <p className="text-muted-foreground text-sm mt-0.5">{count ?? 0} pelatih</p>
        </div>
        <Link href="/a/coach/baru" className={buttonVariants({ size: "sm" })}>
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Tambah Pelatih</span>
          <span className="sm:hidden">Tambah</span>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <form className="flex-1 relative" method="GET" action="/a/coach">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input name="q" defaultValue={q} placeholder="Cari nama atau ID pelatih..." className="pl-8" />
          {showDeleted && <input type="hidden" name="deleted" value="1" />}
        </form>
        <Link
          href={buildUrl({ deleted: showDeleted ? undefined : "1", page: undefined })}
          className={cn(buttonVariants({ variant: "outline", size: "sm" }), showDeleted && "border-destructive text-destructive")}
        >
          {showDeleted ? "Sembunyikan Arsip" : "Tampilkan Arsip"}
        </Link>
      </div>

      {/* Desktop */}
      <div className="hidden md:block rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID Pelatih</TableHead>
              <TableHead>Nama</TableHead>
              <TableHead>Telepon</TableHead>
              <TableHead>Spesialisasi</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!coaches || coaches.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                  {q ? `Tidak ada hasil untuk "${q}"` : "Belum ada pelatih."}
                </TableCell>
              </TableRow>
            ) : (
              coaches.map((c) => {
                const profile = Array.isArray(c.coach_profiles) ? c.coach_profiles[0] : c.coach_profiles;
                return (
                  <TableRow key={c.id} className={c.deleted_at ? "opacity-60" : ""}>
                    <TableCell>
                      <Link href={`/a/coach/${c.id}`} className="font-mono text-xs text-primary hover:underline">
                        {c.coach_id_code}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Link href={`/a/coach/${c.id}`} className="font-medium hover:underline">
                        {profile?.full_name ?? "—"}
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">{profile?.phone ?? "—"}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {profile?.specializations?.join(", ") || "—"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <Badge variant={STATUS_VARIANT[c.status] ?? "outline"}>
                          {STATUS_LABEL[c.status] ?? c.status}
                        </Badge>
                        {suspendedCoachIds.has(c.id) && (
                          <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                            Suspended
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile */}
      <div className="md:hidden space-y-2">
        {!coaches || coaches.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-sm border rounded-lg">
            {q ? `Tidak ada hasil untuk "${q}"` : "Belum ada pelatih."}
          </div>
        ) : (
          coaches.map((c) => {
            const profile = Array.isArray(c.coach_profiles) ? c.coach_profiles[0] : c.coach_profiles;
            return (
              <Link
                key={c.id}
                href={`/a/coach/${c.id}`}
                className={cn(
                  "flex items-center justify-between rounded-lg border px-4 py-3 hover:bg-muted/50 transition-colors",
                  c.deleted_at && "opacity-60"
                )}
              >
                <div className="min-w-0">
                  <p className="font-medium truncate">{profile?.full_name ?? "—"}</p>
                  <p className="text-xs text-muted-foreground font-mono mt-0.5">
                    {c.coach_id_code}
                    {profile?.specializations?.length ? " · " + profile.specializations[0] : ""}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0 ml-3">
                  <Badge variant={STATUS_VARIANT[c.status] ?? "outline"}>
                    {STATUS_LABEL[c.status] ?? c.status}
                  </Badge>
                  {suspendedCoachIds.has(c.id) && (
                    <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 text-xs">
                      Suspended
                    </Badge>
                  )}
                </div>
              </Link>
            );
          })
        )}
      </div>

      <PaginationControls page={page} totalPages={totalPages} pageSize={pageSize} buildUrl={buildUrl} />
    </div>
  );
}

export default function CoachListPage({ searchParams }: PageProps) {
  return (
    <div>
      <Suspense fallback={<PageSkeleton />}>
        <PageContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
