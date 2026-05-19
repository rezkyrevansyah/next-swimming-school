import { Suspense } from "react";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { ReviewCoachSection } from "./review-coach-section";


function SkillBar({ score }: { score: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((n) => (
          <Star
            key={n}
            className={cn(
              "h-4 w-4",
              n <= score ? "text-amber-400 fill-amber-400" : "text-muted-foreground/30"
            )}
          />
        ))}
      </div>
      <span className="text-xs text-muted-foreground">{score}/5</span>
    </div>
  );
}

interface PageProps {
  params: Promise<{ id: string }>;
}

function SimpleSkeleton() {
  return (
    <div className="p-4 space-y-3 animate-pulse">
      <div className="h-7 w-40 bg-muted rounded" />
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="h-16 bg-muted rounded-xl" />
      ))}
    </div>
  );
}

async function PageContent({ params }: PageProps) {
  const { id } = await params;
  const supabase = createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: member } = await supabase
    .from("members")
    .select("id, status")
    .eq("user_id", user.id)
    .single();

  if (!member || member.status !== "active") redirect("/login");

  const { data: report } = await supabase
    .from("report_cards")
    .select(`
      id, status, published_at, attendance_rate,
      sessions_total, sessions_present, sessions_late,
      sessions_permitted, sessions_sick, sessions_absent,
      skill_scores, coach_notes, goals_achieved, next_goals,
      semesters(name, start_date, end_date),
      classes(name, branch_id),
      coaches(id, coach_profiles(full_name, phone))
    `)
    .eq("id", id)
    .eq("member_id", member.id)
    .eq("status", "published")
    .single();

  if (!report) notFound();

  // Fetch existing review for this report card
  const { data: existingReview } = await supabase
    .from("coach_reviews")
    .select("id, rating, comment, edited_at, created_at")
    .eq("report_card_id", id)
    .eq("member_id", member.id)
    .maybeSingle();

  const semester = Array.isArray(report.semesters) ? report.semesters[0] : report.semesters;
  const cls = Array.isArray(report.classes) ? report.classes[0] : report.classes;

  // Fetch dynamic skill criteria for this branch
  const { data: skillCriteriaData } = cls?.branch_id
    ? await supabase
        .from("skill_criteria")
        .select("key, label")
        .eq("branch_id", cls.branch_id)
        .eq("is_active", true)
        .order("sort_order")
    : { data: null };

  const skillLabelMap: Record<string, string> = {};
  (skillCriteriaData ?? []).forEach((c) => { skillLabelMap[c.key] = c.label; });
  // Fallback to key if not found
  function getSkillLabel(key: string) {
    return skillLabelMap[key] ?? key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  }
  const coach = Array.isArray(report.coaches) ? report.coaches[0] : report.coaches;
  const coachProfile = Array.isArray(coach?.coach_profiles) ? coach.coach_profiles[0] : coach?.coach_profiles;
  const skills = (report.skill_scores as Record<string, number>) ?? {};
  const rate = Number(report.attendance_rate ?? 0);

  return (
    <>
      {/* Back */}
      <div className="pt-2">
        <Link href="/m/rapot" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-3">
          <ArrowLeft className="h-4 w-4" />
          Kembali
        </Link>
        <h1 className="text-xl font-semibold">{semester?.name ?? "Rapot"}</h1>
        <p className="text-sm text-muted-foreground">{cls?.name ?? "—"}</p>
        {coachProfile?.full_name && (
          <p className="text-xs text-muted-foreground mt-0.5">Pelatih: {coachProfile.full_name}</p>
        )}
      </div>

      {/* Attendance */}
      <div className="rounded-xl border p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-sm">Kehadiran</h2>
          <span className={cn(
            "text-xl font-bold",
            rate >= 80 ? "text-green-600" : rate >= 60 ? "text-amber-600" : "text-destructive"
          )}>
            {rate}%
          </span>
        </div>
        <div className="grid grid-cols-5 gap-1 text-center text-xs">
          {[
            { label: "Hadir", value: report.sessions_present + report.sessions_late, color: "text-green-600" },
            { label: "Izin", value: report.sessions_permitted, color: "text-blue-600" },
            { label: "Sakit", value: report.sessions_sick, color: "text-amber-600" },
            { label: "Alpha", value: report.sessions_absent, color: "text-destructive" },
            { label: "Total", value: report.sessions_total, color: "" },
          ].map((s) => (
            <div key={s.label}>
              <p className={cn("text-lg font-bold", s.color)}>{s.value}</p>
              <p className="text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Skills */}
      {Object.keys(skills).length > 0 && (
        <div className="rounded-xl border p-4 space-y-3">
          <h2 className="font-semibold text-sm">Penilaian Kemampuan</h2>
          <div className="space-y-2.5">
            {Object.entries(skills).map(([key, score]) => (
              <div key={key} className="flex items-center justify-between">
                <span className="text-sm">{getSkillLabel(key)}</span>
                <SkillBar score={score} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Goals achieved */}
      {report.goals_achieved && (
        <div className="rounded-xl border p-4 space-y-2">
          <h2 className="font-semibold text-sm">Pencapaian Semester Ini</h2>
          <p className="text-sm text-muted-foreground whitespace-pre-line">{report.goals_achieved}</p>
        </div>
      )}

      {/* Next goals */}
      {report.next_goals && (
        <div className="rounded-xl border p-4 space-y-2">
          <h2 className="font-semibold text-sm">Target Semester Berikutnya</h2>
          <p className="text-sm text-muted-foreground whitespace-pre-line">{report.next_goals}</p>
        </div>
      )}

      {/* Coach notes */}
      {report.coach_notes && (
        <div className="rounded-xl border p-4 space-y-2">
          <h2 className="font-semibold text-sm">Catatan Pelatih</h2>
          <p className="text-sm text-muted-foreground whitespace-pre-line">{report.coach_notes}</p>
        </div>
      )}

      {/* Review coach */}
      <ReviewCoachSection
        reportCardId={report.id}
        coachName={coachProfile?.full_name ?? "Pelatih"}
        existingReview={existingReview ?? null}
      />

      {/* Contact coach */}
      {coachProfile?.phone && (
        <div className="rounded-xl border p-4 text-center">
          <p className="text-sm text-muted-foreground mb-2">Ada pertanyaan tentang rapot ini?</p>
          <a
            href={`https://wa.me/${coachProfile.phone.replace(/\D/g, "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-primary hover:underline"
          >
            Hubungi Pelatih via WhatsApp
          </a>
        </div>
      )}

      <p className="text-xs text-center text-muted-foreground pb-2">
        Dipublikasikan {report.published_at
          ? new Date(report.published_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
          : "—"}
      </p>
    </>
  );
}

export default function MemberRapotDetailPage({ params }: PageProps) {
  return (
    <div className="p-4 space-y-5 max-w-lg mx-auto pb-24">
      <Suspense fallback={<SimpleSkeleton />}>
        <PageContent params={params} />
      </Suspense>
    </div>
  );
}
