import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, CheckCircle2, Clock, User, GraduationCap } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const SKILL_LABELS: Record<string, string> = {
  teknik_dasar: "Teknik Dasar",
  teknik_napas: "Teknik Napas",
  koordinasi: "Koordinasi Gerak",
  kecepatan: "Kecepatan",
  ketahanan: "Ketahanan",
  kedisiplinan: "Kedisiplinan",
};

const SCORE_LABELS: Record<number, string> = {
  1: "Perlu Banyak Latihan",
  2: "Berkembang",
  3: "Cukup",
  4: "Baik",
  5: "Sangat Baik",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminRapotDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: report, error } = await supabase
    .from("report_cards")
    .select(`
      id, status, published_at, attendance_rate,
      sessions_total, sessions_present, sessions_late,
      sessions_permitted, sessions_sick, sessions_absent,
      skill_scores, coach_notes, goals_achieved, next_goals,
      created_at, updated_at,
      members(id, member_id_code, member_profiles(full_name, dob, gender)),
      classes(id, name),
      semesters(id, name, start_date, end_date),
      coaches(id, coach_id_code, coach_profiles(full_name))
    `)
    .eq("id", id)
    .single();

  if (error || !report) notFound();

  const member = Array.isArray(report.members) ? report.members[0] : report.members;
  const memberProfile = Array.isArray(member?.member_profiles) ? member?.member_profiles[0] : member?.member_profiles;
  const cls = Array.isArray(report.classes) ? report.classes[0] : report.classes;
  const semester = Array.isArray(report.semesters) ? report.semesters[0] : report.semesters;
  const coach = Array.isArray(report.coaches) ? report.coaches[0] : report.coaches;
  const coachProfile = Array.isArray(coach?.coach_profiles) ? coach?.coach_profiles[0] : coach?.coach_profiles;

  const isPublished = report.status === "published";
  const rate = Number(report.attendance_rate ?? 0);
  const skillScores = (report.skill_scores ?? {}) as Record<string, number>;

  return (
    <div className="p-4 md:p-6 max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex items-start gap-3">
        <Link
          href="/a/rapot"
          className={buttonVariants({ variant: "ghost", size: "icon-sm" })}
        >
          <ChevronLeft className="h-4 w-4" />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-semibold truncate">
              {memberProfile?.full_name ?? member?.member_id_code ?? "—"}
            </h1>
            {isPublished ? (
              <Badge variant="default" className="gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Dipublikasikan
              </Badge>
            ) : (
              <Badge variant="secondary" className="gap-1">
                <Clock className="h-3 w-3" />
                Draft
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            {semester?.name ?? "—"} · {cls?.name ?? "—"}
          </p>
        </div>
      </div>

      {/* Meta info */}
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-xl border bg-card px-4 py-3 space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <User className="h-3.5 w-3.5" />
            Anggota
          </div>
          <Link href={`/a/member/${member?.id}`} className="font-medium hover:underline text-sm">
            {memberProfile?.full_name ?? "—"}
          </Link>
          <p className="text-xs text-muted-foreground">{member?.member_id_code}</p>
        </div>
        <div className="rounded-xl border bg-card px-4 py-3 space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <GraduationCap className="h-3.5 w-3.5" />
            Pelatih
          </div>
          <Link href={`/a/coach/${coach?.id}`} className="font-medium hover:underline text-sm">
            {coachProfile?.full_name ?? "—"}
          </Link>
          <p className="text-xs text-muted-foreground">{coach?.coach_id_code}</p>
        </div>
      </div>

      {/* Attendance */}
      <div className="rounded-xl border bg-card px-5 py-4 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-sm">Rekap Kehadiran</h2>
          <span className={cn(
            "text-2xl font-bold",
            rate >= 80 ? "text-green-600" : rate >= 60 ? "text-amber-600" : "text-destructive"
          )}>
            {rate.toFixed(0)}%
          </span>
        </div>
        <div className="grid grid-cols-5 gap-2 text-center text-xs">
          <div>
            <p className="text-xl font-bold text-green-600">{(report.sessions_present ?? 0) + (report.sessions_late ?? 0)}</p>
            <p className="text-muted-foreground">Hadir</p>
          </div>
          <div>
            <p className="text-xl font-bold text-blue-600">{report.sessions_permitted ?? 0}</p>
            <p className="text-muted-foreground">Izin</p>
          </div>
          <div>
            <p className="text-xl font-bold text-amber-600">{report.sessions_sick ?? 0}</p>
            <p className="text-muted-foreground">Sakit</p>
          </div>
          <div>
            <p className="text-xl font-bold text-destructive">{report.sessions_absent ?? 0}</p>
            <p className="text-muted-foreground">Alpha</p>
          </div>
          <div>
            <p className="text-xl font-bold">{report.sessions_total ?? 0}</p>
            <p className="text-muted-foreground">Total</p>
          </div>
        </div>
      </div>

      {/* Skill scores */}
      {Object.keys(skillScores).length > 0 && (
        <div className="rounded-xl border bg-card px-5 py-4 space-y-3">
          <h2 className="font-semibold text-sm">Penilaian Kemampuan</h2>
          <div className="space-y-2">
            {Object.entries(skillScores).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{SKILL_LABELS[key] ?? key}</span>
                <div className="flex items-center gap-2">
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <div
                        key={n}
                        className={cn(
                          "h-2 w-5 rounded-sm",
                          n <= value ? "bg-primary" : "bg-muted"
                        )}
                      />
                    ))}
                  </div>
                  <span className="font-medium w-4 text-right">{value}</span>
                  <span className="text-xs text-muted-foreground hidden sm:block">— {SCORE_LABELS[value]}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Narrative */}
      {(report.goals_achieved || report.next_goals || report.coach_notes) && (
        <div className="rounded-xl border bg-card px-5 py-4 space-y-4">
          <h2 className="font-semibold text-sm">Catatan Pelatih</h2>

          {report.goals_achieved && (
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Pencapaian Semester Ini</p>
              <p className="text-sm whitespace-pre-line">{report.goals_achieved}</p>
            </div>
          )}

          {report.next_goals && (
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Target Semester Berikutnya</p>
              <p className="text-sm whitespace-pre-line">{report.next_goals}</p>
            </div>
          )}

          {report.coach_notes && (
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Catatan Umum</p>
              <p className="text-sm whitespace-pre-line">{report.coach_notes}</p>
            </div>
          )}
        </div>
      )}

      {/* Footer dates */}
      <div className="text-xs text-muted-foreground space-y-1">
        <p>Dibuat: {new Date(report.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
        {report.published_at && (
          <p>Dipublikasikan: {new Date(report.published_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
        )}
      </div>
    </div>
  );
}
