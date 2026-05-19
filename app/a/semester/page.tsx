import { Suspense } from "react";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { SemesterActions } from "./semester-actions";
import { CreateSemesterForm } from "./create-semester-form";
import { SkillCriteriaSection } from "./skill-criteria-section";
import { PaginationControls, DEFAULT_PAGE_SIZE } from "@/components/shared/pagination-controls";
import { getCachedBranches } from "@/lib/cache/master-data";

const STATUS_LABEL: Record<string, string> = {
  draft: "Draft",
  active: "Aktif",
  closed: "Selesai",
};
const STATUS_VARIANT: Record<string, "default" | "secondary" | "outline"> = {
  draft: "outline",
  active: "default",
  closed: "secondary",
};

interface PageProps {
  searchParams: Promise<{ page?: string; limit?: string }>;
}

function SemesterSkeleton() {
  return (
    <div className="p-6 space-y-4 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-7 w-32 bg-muted rounded" />
        <div className="h-9 w-28 bg-muted rounded" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-20 bg-muted rounded-xl" />
        ))}
      </div>
    </div>
  );
}

export default function SemesterPage({ searchParams }: PageProps) {
  return (
    <Suspense fallback={<SemesterSkeleton />}>
      <SemesterContentGated searchParams={searchParams} />
    </Suspense>
  );
}

async function SemesterContentGated({ searchParams }: PageProps) {
  const supabase = createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const params = await searchParams;
  return <SemesterContent params={params} />;
}

async function SemesterContent({
  params,
}: {
  params: { page?: string; limit?: string };
}) {
  const supabase = createClient(await cookies());

  const page = Math.max(1, parseInt(params.page ?? "1", 10));
  const pageSize = Math.max(1, parseInt(params.limit ?? String(DEFAULT_PAGE_SIZE), 10));
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  function buildUrl(overrides: Record<string, string | undefined>) {
    const p = new URLSearchParams();
    if (page > 1) p.set("page", String(page));
    if (pageSize !== DEFAULT_PAGE_SIZE) p.set("limit", String(pageSize));
    Object.entries(overrides).forEach(([k, v]) => {
      if (v === undefined) p.delete(k);
      else p.set(k, v);
    });
    const s = p.toString();
    return `/a/semester${s ? `?${s}` : ""}`;
  }

  const [{ data: semesters, count }, branches, { data: skillCriteria }] = await Promise.all([
    supabase
      .from("semesters")
      .select("id, name, start_date, end_date, input_deadline, status, branch_id, branches(name)", { count: "exact" })
      .order("start_date", { ascending: false })
      .range(from, to),
    getCachedBranches(),
    supabase
      .from("skill_criteria")
      .select("id, branch_id, key, label, description, sort_order, is_active")
      .order("branch_id")
      .order("sort_order"),
  ]);

  const totalPages = Math.ceil((count ?? 0) / pageSize);

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-xl md:text-2xl font-semibold">Manajemen Semester</h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          Kelola periode semester dan deadline input rapot pelatih.
        </p>
      </div>

      {/* Create form */}
      <div className="rounded-lg border bg-card p-4 md:p-6">
        <h2 className="font-semibold mb-4">Buat Semester Baru</h2>
        <CreateSemesterForm branches={branches} />
      </div>

      {/* Semester list */}
      <div className="space-y-3 pb-2">
        {(!semesters || semesters.length === 0) ? (
          <div className="rounded-lg border border-dashed px-6 py-12 text-center text-muted-foreground text-sm">
            Belum ada semester. Buat semester pertama di atas.
          </div>
        ) : (
          (semesters ?? []).map((s) => {
            const branch = Array.isArray(s.branches) ? s.branches[0] : s.branches;
            return (
              <div key={s.id} className="rounded-lg border bg-card">
                <div className="px-4 md:px-6 pt-4 pb-3 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold">{s.name}</p>
                      <Badge variant={STATUS_VARIANT[s.status] ?? "outline"}>
                        {STATUS_LABEL[s.status] ?? s.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {branch?.name ?? "—"} · {new Date(s.start_date).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })} — {new Date(s.end_date).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Deadline input rapot: {new Date(s.input_deadline).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                    </p>
                  </div>
                  <SemesterActions semesterId={s.id} currentStatus={s.status as "draft" | "active" | "closed"} />
                </div>
              </div>
            );
          })
        )}
      </div>

      <PaginationControls
        page={page}
        totalPages={totalPages}
        pageSize={pageSize}
        buildUrl={buildUrl}
      />

      {/* Skill criteria per branch */}
      {(branches).length > 0 && (
        <div className="space-y-4">
          <div>
            <h2 className="font-semibold">Kriteria Penilaian Rapot</h2>
            <p className="text-sm text-muted-foreground mt-0.5">Kelola kriteria skill yang muncul di form rapot pelatih. Perubahan berlaku untuk rapot semester berikutnya.</p>
          </div>
          {(branches).map((b) => {
            const branchCriteria = (skillCriteria ?? []).filter((c) => c.branch_id === b.id);
            return (
              <SkillCriteriaSection
                key={b.id}
                branchId={b.id}
                branchName={b.name}
                initialCriteria={branchCriteria}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
