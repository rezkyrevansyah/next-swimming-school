import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { FileText, ChevronRight, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default async function MemberRapotPage() {
  const supabase = createClient(await cookies());
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: member } = await supabase
    .from("members")
    .select("id, status")
    .eq("user_id", user.id)
    .single();

  if (!member || member.status !== "active") redirect("/login");

  // Get published report cards with semester + class info
  const { data: reports } = await supabase
    .from("report_cards")
    .select(`
      id, status, published_at, attendance_rate,
      sessions_total, sessions_present, sessions_late,
      sessions_permitted, sessions_sick, sessions_absent,
      skill_scores, coach_notes, goals_achieved, next_goals,
      semesters(id, name, start_date, end_date),
      classes(id, name),
      coaches(id, coach_profiles(full_name))
    `)
    .eq("member_id", member.id)
    .eq("status", "published")
    .order("published_at", { ascending: false });

  return (
    <div className="p-4 space-y-4 max-w-lg mx-auto pb-24">
      <div className="pt-2">
        <h1 className="text-xl font-semibold">Rapot Saya</h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          Hasil penilaian dari pelatih setiap semester
        </p>
      </div>

      {(!reports || reports.length === 0) ? (
        <div className="rounded-xl border border-dashed px-6 py-16 text-center">
          <FileText className="h-10 w-10 mx-auto mb-3 text-muted-foreground/40" />
          <p className="font-medium text-muted-foreground">Belum ada rapot</p>
          <p className="text-sm text-muted-foreground mt-1">
            Rapot akan muncul di sini setelah pelatih mempublikasikannya.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {(reports ?? []).map((r) => {
            const semester = Array.isArray(r.semesters) ? r.semesters[0] : r.semesters;
            const cls = Array.isArray(r.classes) ? r.classes[0] : r.classes;
            const coach = Array.isArray(r.coaches) ? r.coaches[0] : r.coaches;
            const coachProfile = Array.isArray(coach?.coach_profiles) ? coach.coach_profiles[0] : coach?.coach_profiles;
            const rate = Number(r.attendance_rate ?? 0);

            return (
              <Link
                key={r.id}
                href={`/m/rapot/${r.id}`}
                className="block rounded-xl border bg-card hover:bg-muted/50 transition-colors overflow-hidden"
              >
                <div className="px-4 py-4 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-sm">{semester?.name ?? "—"}</p>
                      <Badge variant="default" className="text-xs gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        Selesai
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{cls?.name ?? "—"}</p>
                    {coachProfile?.full_name && (
                      <p className="text-xs text-muted-foreground">Pelatih: {coachProfile.full_name}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      Dipublikasikan {r.published_at
                        ? new Date(r.published_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
                        : "—"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="text-right">
                      <p className={cn(
                        "text-lg font-bold",
                        rate >= 80 ? "text-green-600" : rate >= 60 ? "text-amber-600" : "text-destructive"
                      )}>
                        {rate}%
                      </p>
                      <p className="text-xs text-muted-foreground">Kehadiran</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
