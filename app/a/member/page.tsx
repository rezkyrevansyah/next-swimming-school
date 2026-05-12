import { Suspense } from "react";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Search, Plus } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { PaginationControls, DEFAULT_PAGE_SIZE } from "@/components/shared/pagination-controls";

const STATUS_LABEL: Record<string, string> = {
  active: "Aktif",
  inactive: "Tidak Aktif",
  pending_payment: "Menunggu Bayar",
};
const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  active: "default",
  inactive: "outline",
  pending_payment: "secondary",
};

interface PageProps {
  searchParams: Promise<{ q?: string; page?: string; deleted?: string; limit?: string }>;
}

function MemberListSkeleton() {
  return (
    <div className="p-6 space-y-4 animate-pulse">
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

export default function MemberListPage({ searchParams }: PageProps) {
  return (
    <Suspense fallback={<MemberListSkeleton />}>
      <MemberListContent searchParams={searchParams} />
    </Suspense>
  );
}

async function MemberListContent({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string; deleted?: string; limit?: string }>;
}) {
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
    .from("members")
    .select(
      `id, member_id_code, status, type, has_account, joined_date, deleted_at,
       member_profiles!inner(full_name, phone, dob),
       class_members(status)`,
      { count: "exact" }
    )
    .order("created_at", { ascending: false })
    .range(from, to);

  if (showDeleted) query = query.not("deleted_at", "is", null);
  else query = query.is("deleted_at", null);

  if (q) {
    query = query.or(
      `member_id_code.ilike.%${q}%,member_profiles.full_name.ilike.%${q}%`
    );
  }

  const { data: members, count, error } = await query;

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
    return `/a/member${s ? `?${s}` : ""}`;
  }

  return (
    <div className="p-4 md:p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold">Anggota</h1>
          <p className="text-muted-foreground text-sm mt-0.5">{count ?? 0} anggota</p>
        </div>
        <Link href="/a/member/baru" className={buttonVariants({ size: "sm" })}>
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Tambah Anggota</span>
          <span className="sm:hidden">Tambah</span>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2">
        <form className="flex-1 relative" method="GET" action="/a/member">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            name="q"
            defaultValue={q}
            placeholder="Cari nama atau ID anggota..."
            className="pl-8"
          />
          {showDeleted && <input type="hidden" name="deleted" value="1" />}
        </form>
        <Link
          href={buildUrl({ deleted: showDeleted ? undefined : "1", page: undefined })}
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            showDeleted && "border-destructive text-destructive"
          )}
        >
          {showDeleted ? "Sembunyikan Arsip" : "Tampilkan Arsip"}
        </Link>
      </div>

      {/* Desktop table */}
      <div className="hidden md:block rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID Anggota</TableHead>
              <TableHead>Nama</TableHead>
              <TableHead>Telepon</TableHead>
              <TableHead>Tipe</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Kelas</TableHead>
              <TableHead>Akun</TableHead>
              <TableHead>Bergabung</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!members || members.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                  {q ? `Tidak ada hasil untuk "${q}"` : "Belum ada anggota."}
                </TableCell>
              </TableRow>
            ) : (
              members.map((m) => {
                const profile = Array.isArray(m.member_profiles)
                  ? m.member_profiles[0]
                  : m.member_profiles;
                return (
                  <TableRow key={m.id} className={m.deleted_at ? "opacity-60" : ""}>
                    <TableCell>
                      <Link href={`/a/member/${m.id}`} className="font-mono text-xs text-primary hover:underline">
                        {m.member_id_code}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Link href={`/a/member/${m.id}`} className="font-medium hover:underline">
                        {profile?.full_name ?? "—"}
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">{profile?.phone ?? "—"}</TableCell>
                    <TableCell className="text-xs">{m.type === "regular" ? "Reguler" : "Afiliasi"}</TableCell>
                    <TableCell>
                      <Badge variant={STATUS_VARIANT[m.status] ?? "outline"}>
                        {STATUS_LABEL[m.status] ?? m.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {(() => {
                        const cms = Array.isArray(m.class_members) ? m.class_members : [];
                        const active = cms.filter((c: { status: string }) => c.status === "enrolled").length;
                        return active > 0
                          ? <Badge variant="default">{active} kelas</Badge>
                          : <Badge variant="outline" className="text-muted-foreground">Belum</Badge>;
                      })()}
                    </TableCell>
                    <TableCell>
                      <Badge variant={m.has_account ? "default" : "outline"}>
                        {m.has_account ? "Ya" : "Tidak"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {m.joined_date
                        ? new Date(m.joined_date).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })
                        : "—"}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile card list */}
      <div className="md:hidden space-y-2">
        {!members || members.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-sm border rounded-lg">
            {q ? `Tidak ada hasil untuk "${q}"` : "Belum ada anggota."}
          </div>
        ) : (
          members.map((m) => {
            const profile = Array.isArray(m.member_profiles)
              ? m.member_profiles[0]
              : m.member_profiles;
            return (
              <Link
                key={m.id}
                href={`/a/member/${m.id}`}
                className={cn(
                  "flex items-center justify-between rounded-lg border px-4 py-3 hover:bg-muted/50 transition-colors",
                  m.deleted_at && "opacity-60"
                )}
              >
                <div className="min-w-0">
                  <p className="font-medium truncate">{profile?.full_name ?? "—"}</p>
                  <p className="text-xs text-muted-foreground font-mono mt-0.5">{m.member_id_code}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-3">
                  <Badge variant={STATUS_VARIANT[m.status] ?? "outline"}>
                    {STATUS_LABEL[m.status] ?? m.status}
                  </Badge>
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
