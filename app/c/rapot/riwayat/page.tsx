import { Suspense } from "react";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ChevronDown, Star, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";


function StarDisplay({ score, max = 5 }: { score: number; max?: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: max }, (_, i) => i + 1).map((n) => (
        <Star
          key={n}
          className={cn(
            "h-3.5 w-3.5",
            n <= score ? "text-amber-400 fill-amber-400" : "text-muted-foreground/20"
          )}
        />
      ))}
    </div>
  );
}

function PageSkeleton() {
  return (
    <div className="p-4 space-y-4 max-w-lg mx-auto animate-pulse">
      <div className="h-7 w-40 bg-muted rounded" />
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-24 bg-muted rounded-xl" />
        ))}
      </div>
    </div>
  );
}

async function PageContent() {
  const supabase = createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: coach } = await supabase
    .from("coaches")
    .select("id")
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

  const [{ data: reportCards }, { data: skillCriteriaAll }] = await Promise.all([
    supabase
      .from("report_cards")
      .select(`
        id, status, published_at, attendance_rate,
        sessions_total, sessions_present, sessions_late,
        sessions_permitted, sessions_sick, sessions_absent,
        skill_scores, coach_notes, goals_achieved, next_goals,
        semesters(id, name, start_date, end_date),
        classes(name, branch_id),
        members(member_profiles(full_name, nickname))
      `)
      .eq("coach_id", coach.id)
      .eq("status", "published")
      .order("published_at", { ascending: false }),
    supabase
      .from("skill_criteria")
      .select("branch_id, key, label")
      .eq("is_active", true),
  ]);

  // Build label map per branch
  const skillLabelByBranch: Record<string, Record<string, string>> = {};
  (skillCriteriaAll ?? []).forEach((c) => {
    if (!skillLabelByBranch[c.branch_id]) skillLabelByBranch[c.branch_id] = {};
    skillLabelByBranch[c.branch_id][c.key] = c.label;
  });

  function getSkillLabel(branchId: string | undefined, key: string) {
    const map = branchId ? skillLabelByBranch[branchId] : undefined;
    return map?.[key] ?? key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  }

  // Group by semester
  type ReportEntry = typeof reportCards extends (infer T)[] | null ? T : never;
  const bySemester = new Map<string, { semesterName: string; reports: ReportEntry[] }>();
  (reportCards ?? []).forEach((rc) => {
    const sem = Array.isArray(rc.semesters) ? rc.semesters[0] : rc.semesters;
    if (!sem) return;
    if (!bySemester.has(sem.id)) {
      bySemester.set(sem.id, { semesterName: sem.name, reports: [] });
    }
    bySemester.get(sem.id)!.reports.push(rc);
  });

  const semesterEntries = Array.from(bySemester.entries());

  return (
    <div className="p-4 space-y-4 max-w-lg mx-auto pb-24">
      <div className="pt-2">
        <Link href="/c/rapot" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-3">
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Rapot
        </Link>
        <h1 className="text-xl font-semibold">Riwayat Rapot</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {(reportCards ?? []).length} rapot published
        </p>
      </div>

      {semesterEntries.length === 0 ? (
        <div className="rounded-xl border px-4 py-10 text-center text-sm text-muted-foreground">
          Belum ada rapot yang dipublikasikan.
        </div>
      ) : (
        <div className="space-y-6">
          {semesterEntries.map(([semId, { semesterName, reports }]) => (
            <div key={semId}>
              <div className="flex items-center gap-2 mb-2">
                <h2 className="text-sm font-semibold">{semesterName}</h2>
                <Badge variant="outline" className="text-xs">{reports.length} rapot</Badge>
              </div>
              <div className="space-y-2">
                {reports.map((rc) => {
                  const cls = Array.isArray(rc.classes) ? rc.classes[0] : rc.classes;
                  const branchId = (cls as any)?.branch_id as string | undefined;
                  const memberRec = Array.isArray(rc.members) ? rc.members[0] : rc.members;
                  const mp = Array.isArray(memberRec?.member_profiles) ? memberRec.member_profiles[0] : memberRec?.member_profiles;
                  const memberName = mp?.nickname || mp?.full_name || "Member";
                  const skills = (rc.skill_scores as Record<string, number>) ?? {};
                  const rate = Number(rc.attendance_rate ?? 0);

                  return (
                    <details key={rc.id} className="rounded-xl border group">
                      <summary className="flex items-center justify-between px-4 py-3 cursor-pointer list-none">
                        <div className="min-w-0">
                          <p className="font-medium text-sm truncate">{memberName}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {cls?.name ?? "—"} · Kehadiran{" "}
                            <span className={cn(
                              "font-medium",
                              rate >= 80 ? "text-green-600" : rate >= 60 ? "text-amber-600" : "text-destructive"
                            )}>
                              {rate}%
                            </span>
                          </p>
                        </div>
                        <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-open:rotate-180 shrink-0 ml-3" />
                      </summary>

                      <div className="px-4 pb-4 space-y-3 border-t pt-3">
                        {/* Attendance */}
                        <div className="grid grid-cols-5 gap-1 text-center text-xs">
                          {[
                            { label: "Hadir", value: rc.sessions_present + rc.sessions_late, color: "text-green-600" },
                            { label: "Izin", value: rc.sessions_permitted, color: "text-blue-600" },
                            { label: "Sakit", value: rc.sessions_sick, color: "text-amber-600" },
                            { label: "Alpha", value: rc.sessions_absent, color: "text-destructive" },
                            { label: "Total", value: rc.sessions_total, color: "" },
                          ].map((s) => (
                            <div key={s.label}>
                              <p className={cn("text-base font-bold", s.color)}>{s.value}</p>
                              <p className="text-muted-foreground">{s.label}</p>
                            </div>
                          ))}
                        </div>

                        {/* Skills */}
                        {Object.keys(skills).length > 0 && (
                          <div className="space-y-2">
                            <p className="text-xs font-semibold text-muted-foreground">Penilaian</p>
                            {Object.entries(skills).map(([key, score]) => (
                              <div key={key} className="flex items-center justify-between">
                                <span className="text-xs">{getSkillLabel(branchId, key)}</span>
                                <div className="flex items-center gap-1.5">
                                  <StarDisplay score={score} />
                                  <span className="text-xs text-muted-foreground">{score}/5</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {rc.goals_achieved && (
                          <div>
                            <p className="text-xs font-semibold text-muted-foreground mb-1">Pencapaian</p>
                            <p className="text-xs text-muted-foreground whitespace-pre-line">{rc.goals_achieved}</p>
                          </div>
                        )}

                        {rc.next_goals && (
                          <div>
                            <p className="text-xs font-semibold text-muted-foreground mb-1">Target Berikutnya</p>
                            <p className="text-xs text-muted-foreground whitespace-pre-line">{rc.next_goals}</p>
                          </div>
                        )}

                        {rc.coach_notes && (
                          <div>
                            <p className="text-xs font-semibold text-muted-foreground mb-1">Catatan Coach</p>
                            <p className="text-xs text-muted-foreground whitespace-pre-line">{rc.coach_notes}</p>
                          </div>
                        )}

                        <p className="text-xs text-muted-foreground/60">
                          Dipublikasikan{" "}
                          {rc.published_at
                            ? new Date(rc.published_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
                            : "—"}
                        </p>
                      </div>
                    </details>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function CoachRapotRiwayatPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <PageContent />
    </Suspense>
  );
}
