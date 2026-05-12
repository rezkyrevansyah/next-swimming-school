import { Suspense } from "react";
import { createAdminClient } from "@/utils/supabase/server";
import Link from "next/link";
import { Building2, Users, UserCheck, BookOpen, ArrowRight } from "lucide-react";
import { setActiveBranch } from "@/lib/actions/branch";
import { getAllBranches } from "@/lib/data/branch";
import { getOwnerBranchStats } from "@/lib/data/stats";

// ── Cached: per-branch stats ───────────────────────────────────────────────────
async function OwnerDashboardContent() {
  const branches = await getAllBranches();

  if (branches.length === 0) {
    return (
      <div className="rounded-xl border border-dashed p-16 text-center text-muted-foreground flex flex-col items-center gap-3">
        <Building2 className="h-10 w-10 opacity-30" />
        <p>Belum ada cabang. Buat cabang pertama di menu Cabang.</p>
        <Link href="/o/cabang" className="text-sm text-primary hover:underline">
          Kelola Cabang →
        </Link>
      </div>
    );
  }

  const branchStats = await Promise.all(
    branches.map((b) => getOwnerBranchStats(b.id, b.name, b.status, b.is_default))
  );

  const totalMembers = branchStats.reduce((s, b) => s + b.memberCount, 0);
  const totalCoaches = branchStats.reduce((s, b) => s + b.coachCount, 0);
  const totalClasses = branchStats.reduce((s, b) => s + b.classCount, 0);

  return (
    <>
      {/* Grand total cards */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total Anggota", value: totalMembers, icon: Users },
          { label: "Total Pelatih", value: totalCoaches, icon: UserCheck },
          { label: "Kelas Aktif", value: totalClasses, icon: BookOpen },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="rounded-xl border bg-card p-4 flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2.5">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{value}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Per-branch breakdown */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
          Per Cabang
        </h2>
        <div className="space-y-3">
          {branchStats.map((b) => (
            <div key={b.id} className="rounded-xl border bg-card overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3 border-b bg-muted/30">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{b.name}</span>
                  {b.is_default && (
                    <span className="text-xs bg-primary/10 text-primary rounded-full px-2 py-0.5">Utama</span>
                  )}
                  <span className={`text-xs rounded-full px-2 py-0.5 ${
                    b.status === "active" ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"
                  }`}>
                    {b.status === "active" ? "Aktif" : "Nonaktif"}
                  </span>
                </div>
                <form action={setActiveBranch}>
                  <input type="hidden" name="branch_id" value={b.id} />
                  <input type="hidden" name="branch_name" value={b.name} />
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
                  >
                    Kelola
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </form>
              </div>
              <div className="grid grid-cols-4 divide-x">
                {[
                  { label: "Anggota", value: b.memberCount },
                  { label: "Pelatih", value: b.coachCount },
                  { label: "Kelas Aktif", value: b.classCount },
                  { label: "Member Aktif", value: `${b.activeRate}%` },
                ].map(({ label, value }) => (
                  <div key={label} className="px-4 py-3 text-center">
                    <p className="text-xl font-bold">{value}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

// ── Skeleton ───────────────────────────────────────────────────────────────────
function DashboardSkeleton() {
  return (
    <>
      <div className="grid grid-cols-3 gap-3 animate-pulse">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-20 bg-muted rounded-xl" />
        ))}
      </div>
      <div className="space-y-3 animate-pulse">
        <div className="h-4 w-20 bg-muted rounded" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-28 bg-muted rounded-xl" />
        ))}
      </div>
    </>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────
export default async function OwnerDashboardPage() {
  return (
    <div className="p-4 md:p-6 space-y-6 max-w-5xl">
      <div>
        <h1 className="text-xl md:text-2xl font-semibold">Helicopter View</h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          Ringkasan keseluruhan semua cabang
        </p>
      </div>

      <Suspense fallback={<DashboardSkeleton />}>
        <OwnerDashboardContent />
      </Suspense>
    </div>
  );
}
