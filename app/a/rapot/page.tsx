import { Suspense } from "react";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Clock, MessageCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PaginationControls, DEFAULT_PAGE_SIZE } from "@/components/shared/pagination-controls";

interface PageProps {
  searchParams: Promise<{
    page?: string;
    semester_id?: string;
    status?: string;
    limit?: string;
  }>;
}

export default async function AdminRapotPage({ searchParams }: PageProps) {
  const supabase = createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const params = await searchParams;

  return (
    <div className="p-4 md:p-6 space-y-4">
      <Suspense fallback={
        <div className="p-6 space-y-4 animate-pulse">
          <div className="h-8 w-48 bg-muted rounded" />
          <div className="h-10 bg-muted rounded" />
          <div className="space-y-2">
            {Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-12 bg-muted rounded" />)}
          </div>
        </div>
      }>
        <PageContent searchParams={params} />
      </Suspense>
    </div>
  );
}

async function PageContent({ searchParams }: {
  searchParams: {
    page?: string;
    semester_id?: string;
    status?: string;
    limit?: string;
  };
}) {
  const supabase = createClient(await cookies());

  const page = Math.max(1, parseInt(searchParams.page ?? "1", 10));
  const pageSize = Math.max(1, parseInt(searchParams.limit ?? String(DEFAULT_PAGE_SIZE), 10));
  const semesterFilter = searchParams.semester_id ?? "";
  const statusFilter = searchParams.status ?? "";
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  // Fetch semesters for filter
  const { data: semesters } = await supabase
    .from("semesters")
    .select("id, name")
    .order("start_date", { ascending: false });

  let query = supabase
    .from("report_cards")
    .select(
      `id, status, published_at, attendance_rate, sessions_total,
       sessions_present, sessions_late, sessions_absent, skill_scores,
       members(id, member_id_code, member_profiles(full_name)),
       classes(id, name),
       semesters(id, name),
       coaches(id, coach_profiles(full_name))`,
      { count: "exact" }
    )
    .order("published_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (semesterFilter) query = query.eq("semester_id", semesterFilter);
  if (statusFilter) query = query.eq("status", statusFilter);

  const { data: reports, count } = await query;
  const totalPages = Math.ceil((count ?? 0) / pageSize);

  function buildUrl(overrides: Record<string, string | undefined>) {
    const p = new URLSearchParams();
    if (semesterFilter) p.set("semester_id", semesterFilter);
    if (statusFilter) p.set("status", statusFilter);
    if (page > 1) p.set("page", String(page));
    if (pageSize !== DEFAULT_PAGE_SIZE) p.set("limit", String(pageSize));
    Object.entries(overrides).forEach(([k, v]) => {
      if (v === undefined) p.delete(k);
      else p.set(k, v);
    });
    const s = p.toString();
    return `/a/rapot${s ? `?${s}` : ""}`;
  }

  return (
    <>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold">Rapot</h1>
          <p className="text-muted-foreground text-sm mt-0.5">{count ?? 0} rapot</p>
        </div>
        <Link
          href="/a/rapot/notifikasi"
          className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-2 shrink-0")}
        >
          <MessageCircle className="h-4 w-4" />
          Notifikasi WA
        </Link>
      </div>

      {/* Filters */}
      <form method="GET" action="/a/rapot" className="flex flex-wrap gap-2">
        <select
          name="semester_id"
          defaultValue={semesterFilter}
          className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">Semua Semester</option>
          {(semesters ?? []).map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>

        <select
          name="status"
          defaultValue={statusFilter}
          className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">Semua Status</option>
          <option value="published">Dipublikasikan</option>
          <option value="draft">Draft</option>
        </select>

        <div className="flex gap-2">
          <button type="submit" className={cn(buttonVariants({ size: "sm" }))}>Filter</button>
          <Link href="/a/rapot" className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>Reset</Link>
        </div>
      </form>

      {/* List */}
      {!reports || reports.length === 0 ? (
        <div className="rounded-xl border border-dashed px-6 py-16 text-center text-muted-foreground text-sm">
          Belum ada rapot.
        </div>
      ) : (
        <div className="space-y-2">
          {reports.map((r) => {
            const member = Array.isArray(r.members) ? r.members[0] : r.members;
            const memberProfile = Array.isArray(member?.member_profiles) ? member?.member_profiles[0] : member?.member_profiles;
            const cls = Array.isArray(r.classes) ? r.classes[0] : r.classes;
            const semester = Array.isArray(r.semesters) ? r.semesters[0] : r.semesters;
            const coach = Array.isArray(r.coaches) ? r.coaches[0] : r.coaches;
            const coachProfile = Array.isArray(coach?.coach_profiles) ? coach?.coach_profiles[0] : coach?.coach_profiles;
            const rate = Number(r.attendance_rate ?? 0);
            const isPublished = r.status === "published";

            return (
              <Link
                key={r.id}
                href={`/a/rapot/${r.id}`}
                className="flex items-center justify-between gap-3 rounded-xl border bg-card hover:bg-accent/40 transition-colors px-5 py-4"
              >
                <div className="flex-1 min-w-0 space-y-0.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm">
                      {memberProfile?.full_name ?? member?.member_id_code ?? "—"}
                    </span>
                    <span className="text-xs text-muted-foreground">·</span>
                    <span className="text-xs text-muted-foreground">{cls?.name ?? "—"}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                    <span>{semester?.name ?? "—"}</span>
                    {coachProfile?.full_name && <span>Pelatih: {coachProfile.full_name}</span>}
                    {r.published_at && (
                      <span>
                        {new Date(r.published_at).toLocaleDateString("id-ID", {
                          day: "numeric", month: "short", year: "numeric",
                        })}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className={`text-sm font-semibold ${rate >= 80 ? "text-green-600" : rate >= 60 ? "text-amber-600" : "text-destructive"}`}>
                    {rate.toFixed(0)}%
                  </span>
                  {isPublished ? (
                    <Badge variant="default" className="gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      Publish
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="gap-1">
                      <Clock className="h-3 w-3" />
                      Draft
                    </Badge>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}

      <PaginationControls page={page} totalPages={totalPages} pageSize={pageSize} buildUrl={buildUrl} />
    </>
  );
}
