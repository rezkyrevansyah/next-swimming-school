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
    .from("classes")
    .select(
      `id, name, slug, status, capacity, monthly_price, sessions_per_month, deleted_at, branches(name), class_members(status)`,
      { count: "exact" }
    )
    .order("created_at", { ascending: false })
    .range(from, to);

  if (showDeleted) query = query.not("deleted_at", "is", null);
  else query = query.is("deleted_at", null);

  if (q) query = query.or(`name.ilike.%${q}%,slug.ilike.%${q}%`);

  const { data: classes, count, error } = await query;

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
    return `/a/kelas${s ? `?${s}` : ""}`;
  }

  function formatPrice(price: number) {
    if (price === 0) return "Gratis";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(price);
  }

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold">Kelas</h1>
          <p className="text-muted-foreground text-sm mt-0.5">{count ?? 0} kelas</p>
        </div>
        <Link href="/a/kelas/baru" className={buttonVariants({ size: "sm" })}>
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Tambah Kelas</span>
          <span className="sm:hidden">Tambah</span>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <form className="flex-1 relative" method="GET" action="/a/kelas">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input name="q" defaultValue={q} placeholder="Cari nama kelas..." className="pl-8" />
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
              <TableHead>Nama Kelas</TableHead>
              <TableHead>Cabang</TableHead>
              <TableHead>Anggota</TableHead>
              <TableHead>Kapasitas</TableHead>
              <TableHead>Sesi/Bln</TableHead>
              <TableHead>Harga</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!classes || classes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                  {q ? `Tidak ada hasil untuk "${q}"` : "Belum ada kelas."}
                </TableCell>
              </TableRow>
            ) : (
              classes.map((c) => {
                const branch = Array.isArray(c.branches) ? c.branches[0] : c.branches;
                return (
                  <TableRow key={c.id} className={c.deleted_at ? "opacity-60" : ""}>
                    <TableCell>
                      <Link href={`/a/kelas/${c.id}`} className="font-medium hover:underline">
                        {c.name}
                      </Link>
                      <div className="text-xs text-muted-foreground font-mono">{c.slug}</div>
                    </TableCell>
                    <TableCell className="text-sm">{branch?.name ?? "—"}</TableCell>
                    <TableCell className="text-sm">
                      {(() => {
                        const cms = Array.isArray(c.class_members) ? c.class_members : [];
                        const enrolled = cms.filter((m: { status: string }) => m.status === "enrolled").length;
                        return (
                          <span className={enrolled === 0 ? "text-muted-foreground" : ""}>
                            {enrolled}
                            <span className="text-muted-foreground text-xs"> / {c.capacity}</span>
                          </span>
                        );
                      })()}
                    </TableCell>
                    <TableCell className="text-sm">{c.capacity}</TableCell>
                    <TableCell className="text-sm">{c.sessions_per_month}</TableCell>
                    <TableCell className="text-sm">{formatPrice(c.monthly_price)}</TableCell>
                    <TableCell>
                      <Badge variant={c.status === "active" ? "default" : "outline"}>
                        {c.status === "active" ? "Aktif" : "Tidak Aktif"}
                      </Badge>
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
        {!classes || classes.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-sm border rounded-lg">
            {q ? `Tidak ada hasil untuk "${q}"` : "Belum ada kelas."}
          </div>
        ) : (
          classes.map((c) => {
            const branch = Array.isArray(c.branches) ? c.branches[0] : c.branches;
            return (
              <Link
                key={c.id}
                href={`/a/kelas/${c.id}`}
                className={cn(
                  "flex items-center justify-between rounded-lg border px-4 py-3 hover:bg-muted/50 transition-colors",
                  c.deleted_at && "opacity-60"
                )}
              >
                <div className="min-w-0">
                  <p className="font-medium truncate">{c.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {branch?.name ?? "—"} · {formatPrice(c.monthly_price)}
                    {(() => {
                      const cms = Array.isArray(c.class_members) ? c.class_members : [];
                      const enrolled = cms.filter((m: { status: string }) => m.status === "enrolled").length;
                      return enrolled > 0 ? ` · ${enrolled} siswa` : "";
                    })()}
                  </p>
                </div>
                <Badge variant={c.status === "active" ? "default" : "outline"} className="shrink-0 ml-3">
                  {c.status === "active" ? "Aktif" : "Nonaktif"}
                </Badge>
              </Link>
            );
          })
        )}
      </div>

      <PaginationControls page={page} totalPages={totalPages} pageSize={pageSize} buildUrl={buildUrl} />
    </div>
  );
}

export default function ClassListPage({ searchParams }: PageProps) {
  return (
    <div>
      <Suspense fallback={<PageSkeleton />}>
        <PageContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
