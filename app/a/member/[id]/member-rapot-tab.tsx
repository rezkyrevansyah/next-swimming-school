import Link from "next/link";
import { FileText, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const SKILL_LABELS: Record<string, string> = {
  teknik_dasar: "Teknik Dasar",
  teknik_napas: "Teknik Napas",
  koordinasi: "Koordinasi",
  kecepatan: "Kecepatan",
  ketahanan: "Ketahanan",
  kedisiplinan: "Kedisiplinan",
};

interface ReportCard {
  id: string;
  status: string;
  published_at: string | null;
  attendance_rate: number | null;
  sessions_total: number;
  sessions_present: number;
  sessions_late: number;
  sessions_absent: number;
  skill_scores: Record<string, number> | null;
  coach_notes: string | null;
  semesters: { id: string; name: string; start_date: string; end_date: string } | null;
  classes: { id: string; name: string } | null;
  coaches: { id: string; coach_profiles: { full_name: string } | { full_name: string }[] | null } | null;
}

export function MemberRapotTab({ reports }: { reports: ReportCard[] }) {
  if (reports.length === 0) {
    return (
      <div className="rounded-xl border border-dashed px-6 py-12 text-center text-muted-foreground text-sm">
        Belum ada rapot untuk anggota ini.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {reports.map((r) => {
        const semester = Array.isArray(r.semesters) ? r.semesters[0] : r.semesters;
        const cls = Array.isArray(r.classes) ? r.classes[0] : r.classes;
        const coach = Array.isArray(r.coaches) ? r.coaches[0] : r.coaches;
        const coachProfile = Array.isArray(coach?.coach_profiles) ? coach?.coach_profiles[0] : coach?.coach_profiles;

        const isPublished = r.status === "published";
        const rate = r.attendance_rate ?? 0;

        return (
          <Link
            key={r.id}
            href={`/a/rapot/${r.id}`}
            className="block rounded-xl border bg-card hover:bg-accent/40 transition-colors px-5 py-4 space-y-2"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-0.5 min-w-0">
                <p className="font-medium text-sm truncate">{semester?.name ?? "—"}</p>
                <p className="text-xs text-muted-foreground">{cls?.name ?? "—"}</p>
              </div>
              {isPublished ? (
                <Badge variant="default" className="gap-1 shrink-0">
                  <CheckCircle2 className="h-3 w-3" />
                  Dipublikasikan
                </Badge>
              ) : (
                <Badge variant="secondary" className="gap-1 shrink-0">
                  <Clock className="h-3 w-3" />
                  Draft
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className={`font-semibold ${rate >= 80 ? "text-green-600" : rate >= 60 ? "text-amber-600" : "text-destructive"}`}>
                {Number(rate).toFixed(0)}% hadir
              </span>
              <span>{r.sessions_total} sesi</span>
              {coachProfile?.full_name && <span>Pelatih: {coachProfile.full_name}</span>}
              {r.published_at && (
                <span>
                  {new Date(r.published_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                </span>
              )}
            </div>

            {r.skill_scores && Object.keys(r.skill_scores).length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {Object.entries(r.skill_scores as Record<string, number>).map(([k, v]) => (
                  <span key={k} className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[11px]">
                    {SKILL_LABELS[k] ?? k}: <strong>{v}</strong>
                  </span>
                ))}
              </div>
            )}
          </Link>
        );
      })}
    </div>
  );
}
