import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { FileText, AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ClassMemberEntry {
  member_id: string;
  class_id: string;
  member_name: string;
  class_name: string;
  report_status: "draft" | "published" | "not_started";
  report_id: string | null;
}

export default async function CoachRapotPage() {
  const supabase = createClient(await cookies());
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Get coach record
  const { data: coach } = await supabase
    .from("coaches")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!coach) {
    return (
      <div className="p-6 text-center space-y-2">
        <AlertCircle className="h-10 w-10 text-destructive mx-auto" />
        <p className="font-medium">Profil pelatih tidak ditemukan.</p>
      </div>
    );
  }

  // Get active semester for coach's branch
  const { data: activeSemester } = await supabase
    .from("semesters")
    .select("id, name, start_date, end_date, input_deadline, status")
    .eq("status", "active")
    .limit(1)
    .maybeSingle();

  // Get coach's classes + members enrolled
  const { data: classCoaches } = await supabase
    .from("class_coaches")
    .select(`
      class_id,
      classes!inner(id, name, status,
        class_members(member_id, status,
          members!inner(id, member_id_code, status,
            member_profiles(full_name)
          )
        )
      )
    `)
    .eq("coach_id", coach.id);

  // Flatten to member × class entries
  const memberClassPairs: { member_id: string; class_id: string; member_name: string; class_name: string }[] = [];
  for (const cc of classCoaches ?? []) {
    const cls = Array.isArray(cc.classes) ? cc.classes[0] : cc.classes;
    if (!cls || cls.status !== "active") continue;
    for (const cm of cls.class_members ?? []) {
      const member = Array.isArray(cm.members) ? cm.members[0] : cm.members;
      if (!member || member.status !== "active") continue;
      const profile = Array.isArray(member.member_profiles) ? member.member_profiles[0] : member.member_profiles;
      memberClassPairs.push({
        member_id: member.id,
        class_id: cls.id,
        member_name: profile?.full_name ?? member.member_id_code,
        class_name: cls.name,
      });
    }
  }

  // Get existing report cards for active semester
  let reportMap: Map<string, { id: string; status: string }> = new Map();
  if (activeSemester) {
    const memberIds = memberClassPairs.map((p) => p.member_id);
    if (memberIds.length > 0) {
      const { data: reports } = await supabase
        .from("report_cards")
        .select("id, member_id, class_id, status")
        .eq("semester_id", activeSemester.id)
        .eq("coach_id", coach.id);

      (reports ?? []).forEach((r) => {
        reportMap.set(`${r.member_id}:${r.class_id}`, { id: r.id, status: r.status });
      });
    }
  }

  // Build display list
  const entries: ClassMemberEntry[] = memberClassPairs.map((p) => {
    const report = reportMap.get(`${p.member_id}:${p.class_id}`);
    return {
      ...p,
      report_status: report ? (report.status as "draft" | "published") : "not_started",
      report_id: report?.id ?? null,
    };
  }).sort((a, b) => a.member_name.localeCompare(b.member_name));

  const isPastDeadline = activeSemester
    ? new Date(activeSemester.input_deadline) < new Date()
    : false;

  const counts = entries.reduce(
    (acc, e) => {
      acc[e.report_status]++;
      return acc;
    },
    { published: 0, draft: 0, not_started: 0 }
  );

  return (
    <div className="p-4 space-y-4 max-w-lg mx-auto pb-24">
      <div className="pt-2">
        <h1 className="text-xl font-semibold">Rapot Siswa</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Input penilaian semester</p>
      </div>

      {/* Active semester info */}
      {activeSemester ? (
        <div className={cn(
          "rounded-xl border p-4",
          isPastDeadline
            ? "bg-red-50 border-red-200"
            : "bg-blue-50 border-blue-200"
        )}>
          <p className={cn("font-semibold text-sm", isPastDeadline ? "text-red-800" : "text-blue-800")}>
            {activeSemester.name}
          </p>
          <p className={cn("text-xs mt-0.5", isPastDeadline ? "text-red-600" : "text-blue-600")}>
            Deadline input: {new Date(activeSemester.input_deadline).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
            {isPastDeadline && " · SUDAH LEWAT"}
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm font-medium text-amber-800">Tidak ada semester aktif</p>
          <p className="text-xs text-amber-600 mt-0.5">Hubungi admin untuk mengaktifkan semester.</p>
        </div>
      )}

      {/* Progress summary */}
      {activeSemester && entries.length > 0 && (
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          {[
            { label: "Selesai", value: counts.published, color: "text-green-600" },
            { label: "Draft", value: counts.draft, color: "text-amber-600" },
            { label: "Belum", value: counts.not_started, color: "text-muted-foreground" },
          ].map((s) => (
            <div key={s.label} className="rounded-lg border py-2 space-y-0.5">
              <p className={cn("text-2xl font-bold", s.color)}>{s.value}</p>
              <p className="text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Member list */}
      {entries.length === 0 ? (
        <div className="rounded-xl border border-dashed px-6 py-12 text-center text-muted-foreground text-sm">
          <FileText className="h-8 w-8 mx-auto mb-2 opacity-30" />
          <p>Tidak ada siswa aktif yang diajar.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {entries.map((entry) => {
            const canEdit = activeSemester && !isPastDeadline;
            const href = canEdit
              ? `/c/rapot/${entry.member_id}?class_id=${entry.class_id}&semester_id=${activeSemester!.id}&coach_id=${coach.id}`
              : undefined;

            const statusIcon =
              entry.report_status === "published" ? (
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              ) : entry.report_status === "draft" ? (
                <Clock className="h-4 w-4 text-amber-600" />
              ) : null;

            const content = (
              <div className="flex items-center justify-between rounded-xl border px-4 py-3 hover:bg-muted/50 transition-colors">
                <div className="min-w-0">
                  <p className="font-medium text-sm truncate">{entry.member_name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{entry.class_name}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-3">
                  {statusIcon}
                  <Badge
                    variant={
                      entry.report_status === "published"
                        ? "default"
                        : entry.report_status === "draft"
                        ? "secondary"
                        : "outline"
                    }
                    className="text-xs"
                  >
                    {entry.report_status === "published"
                      ? "Selesai"
                      : entry.report_status === "draft"
                      ? "Draft"
                      : "Belum"}
                  </Badge>
                </div>
              </div>
            );

            return href ? (
              <Link key={`${entry.member_id}:${entry.class_id}`} href={href}>
                {content}
              </Link>
            ) : (
              <div key={`${entry.member_id}:${entry.class_id}`} className="opacity-60 cursor-not-allowed">
                {content}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
