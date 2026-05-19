import { Suspense } from "react";
import { createClient, createAdminClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Star } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CoachProfileTab } from "./coach-profile-tab";
import { CoachDangerTab } from "./coach-danger-tab";
import { CoachClassTab } from "./coach-class-tab";
import { CoachStatusActions } from "./coach-status-actions";
import { CoachCertificateTab } from "./coach-certificate-tab";
import { CoachClockinTab } from "./coach-clockin-tab";
import { cn } from "@/lib/utils";

const STATUS_LABEL: Record<string, string> = {
  active: "Aktif",
  inactive: "Tidak Aktif",
  pending: "Menunggu",
};
const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  active: "default",
  pending: "secondary",
  inactive: "outline",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

function PageSkeleton() {
  return (
    <div className="p-6 max-w-3xl space-y-6 animate-pulse">
      <div className="h-7 w-48 bg-muted rounded" />
      <div className="h-10 bg-muted rounded" />
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-16 bg-muted rounded" />
        ))}
      </div>
    </div>
  );
}

async function PageContent({ params }: PageProps) {
  const { id } = await params;
  const supabase = createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: coach, error } = await supabase
    .from("coaches")
    .select(`
      *,
      coach_profiles(*),
      coach_branches(branch_id, is_primary, branches(id, name))
    `)
    .eq("id", id)
    .single();

  if (error || !coach) notFound();

  const profile = Array.isArray(coach.coach_profiles)
    ? coach.coach_profiles[0]
    : coach.coach_profiles;

  const branches = (Array.isArray(coach.coach_branches) ? coach.coach_branches : []).map(
    (cb: { branch_id: string; is_primary: boolean; branches: { id: string; name: string } | { id: string; name: string }[] | null }) => ({
      branch_id: cb.branch_id,
      is_primary: cb.is_primary,
      name: (Array.isArray(cb.branches) ? cb.branches[0]?.name : cb.branches?.name) ?? cb.branch_id,
    })
  );

  // Fetch email from auth.users via admin client
  let email: string | null = null;
  if (coach.user_id) {
    const adminClient = createAdminClient();
    const { data: authUser } = await adminClient.auth.admin.getUserById(coach.user_id);
    email = authUser?.user?.email ?? null;
  }

  // Fetch classes assigned to this coach
  const { data: coachClasses } = await supabase
    .from("class_coaches")
    .select("classes(id, name, status, class_schedules(day_of_week, start_time, end_time))")
    .eq("coach_id", id);

  // Fetch certificates
  const { data: certificates } = await supabase
    .from("coach_certificates")
    .select("id, name, photo_url, issued_year, valid_until, no_expiry, approval_status, approval_notes, approved_at")
    .eq("coach_id", id)
    .order("created_at", { ascending: false });

  // Fetch active suspension
  const { data: activeSuspensions } = await supabase
    .from("coach_suspensions")
    .select("id, reason, suspended_at, resume_at")
    .eq("coach_id", id)
    .is("lifted_at", null)
    .gt("resume_at", new Date().toISOString())
    .order("created_at", { ascending: false })
    .limit(1);
  const activeSuspension = activeSuspensions?.[0] ?? null;

  // Find classes where this coach is the only coach
  const { data: classCoachCounts } = await supabase
    .from("class_coaches")
    .select("class_id, classes(name)")
    .in(
      "class_id",
      (coachClasses ?? []).map((cc) => {
        const cls = Array.isArray(cc.classes) ? cc.classes[0] : cc.classes;
        return cls?.id ?? "";
      }).filter(Boolean)
    );

  // Group by class_id to find solo-coach classes
  const countByClass: Record<string, { name: string; count: number }> = {};
  (classCoachCounts ?? []).forEach((row) => {
    const cls = Array.isArray(row.classes) ? row.classes[0] : row.classes;
    if (!row.class_id || !cls) return;
    if (!countByClass[row.class_id]) countByClass[row.class_id] = { name: cls.name ?? "", count: 0 };
    countByClass[row.class_id].count++;
  });
  const singleCoachClasses = Object.entries(countByClass)
    .filter(([, v]) => v.count === 1)
    .map(([classId, v]) => ({ id: classId, name: v.name }));

  // Fetch reviews for this coach
  const { data: coachReviews } = await supabase
    .from("coach_reviews")
    .select(`
      id, rating, comment, edited_at, created_at,
      report_cards(semesters(name), classes(name)),
      members(member_profiles(full_name, nickname))
    `)
    .eq("coach_id", id)
    .order("created_at", { ascending: false });

  const avgRating = (coachReviews ?? []).length > 0
    ? ((coachReviews ?? []).reduce((s, r) => s + r.rating, 0) / (coachReviews ?? []).length).toFixed(1)
    : null;

  return (
    <div className="p-6 max-w-3xl space-y-6">
      <div className="flex items-start gap-3">
        <Link
          href="/a/coach"
          className={buttonVariants({ variant: "ghost", size: "icon-sm" })}
        >
          <ChevronLeft className="h-4 w-4" />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-semibold truncate">
              {profile?.full_name ?? "—"}
            </h1>
            <Badge variant={STATUS_VARIANT[coach.status] ?? "outline"}>
              {STATUS_LABEL[coach.status] ?? coach.status}
            </Badge>
            {coach.deleted_at && (
              <Badge variant="destructive">Diarsipkan</Badge>
            )}
          </div>
          <p className="text-muted-foreground text-sm mt-0.5">
            {coach.coach_id_code}
          </p>
        </div>
      </div>

      <Tabs defaultValue="profil">
        <TabsList variant="line">
          <TabsTrigger value="profil">Profil</TabsTrigger>
          <TabsTrigger value="kelas">Kelas</TabsTrigger>
          <TabsTrigger value="sertifikat">
            Sertifikat
            {(certificates ?? []).filter(c => c.approval_status === "pending_approval").length > 0 && (
              <span className="ml-1.5 inline-flex items-center justify-center h-4 w-4 rounded-full bg-amber-500 text-white text-[10px] font-bold">
                {(certificates ?? []).filter(c => c.approval_status === "pending_approval").length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="absensi">Absensi</TabsTrigger>
          <TabsTrigger value="review">
            Review
            {(coachReviews ?? []).length > 0 && (
              <span className="ml-1.5 text-xs text-amber-500 font-bold">{avgRating}</span>
            )}
          </TabsTrigger>
          <TabsTrigger value="bahaya">Zona Berbahaya</TabsTrigger>
        </TabsList>

        <TabsContent value="profil" className="mt-4 space-y-4">
          {coach.status !== "active" && !coach.deleted_at && (
            <CoachStatusActions coachId={coach.id} currentStatus={coach.status} />
          )}
          <CoachProfileTab coach={coach} profile={profile} email={email} branches={branches} />
        </TabsContent>

        <TabsContent value="kelas" className="mt-4">
          <CoachClassTab
            classes={(coachClasses ?? []).map((cc) => {
              const cls = Array.isArray(cc.classes) ? cc.classes[0] : cc.classes;
              return {
                id: cls?.id ?? "",
                name: cls?.name ?? "",
                status: cls?.status ?? "",
                class_schedules: (Array.isArray(cls?.class_schedules) ? cls.class_schedules : []) as any,
              };
            }).filter((c) => c.id)}
          />
        </TabsContent>

        <TabsContent value="sertifikat" className="mt-4">
          <CoachCertificateTab certs={(certificates ?? []) as any} />
        </TabsContent>

        <TabsContent value="absensi" className="mt-4">
          <CoachClockinTab coachId={coach.id} />
        </TabsContent>

        <TabsContent value="review" className="mt-4 space-y-3">
          {(coachReviews ?? []).length === 0 ? (
            <div className="rounded-lg border px-4 py-10 text-center text-sm text-muted-foreground">
              Belum ada review dari member.
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 rounded-lg border p-4">
                <p className="text-3xl font-bold text-amber-500">{avgRating}</p>
                <div>
                  <div className="flex gap-0.5">
                    {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                      <Star key={n} className={cn("h-3.5 w-3.5", n <= Math.round(Number(avgRating)) ? "text-amber-400 fill-amber-400" : "text-muted-foreground/20")} />
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{(coachReviews ?? []).length} review</p>
                </div>
              </div>
              {(coachReviews ?? []).map((r) => {
                const rc = Array.isArray(r.report_cards) ? r.report_cards[0] : r.report_cards;
                const semester = Array.isArray(rc?.semesters) ? rc.semesters[0] : rc?.semesters;
                const cls = Array.isArray(rc?.classes) ? rc.classes[0] : rc?.classes;
                const memberRec = Array.isArray(r.members) ? r.members[0] : r.members;
                const mp = Array.isArray(memberRec?.member_profiles) ? memberRec.member_profiles[0] : memberRec?.member_profiles;
                return (
                  <div key={r.id} className="rounded-lg border p-4 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium text-sm">{mp?.nickname || mp?.full_name || "Member"}</p>
                        <p className="text-xs text-muted-foreground">{semester?.name ?? "—"} · {cls?.name ?? "—"}</p>
                      </div>
                      <p className="font-bold text-amber-500 text-sm shrink-0">{r.rating}/10</p>
                    </div>
                    {r.comment && <p className="text-sm text-muted-foreground italic">&ldquo;{r.comment}&rdquo;</p>}
                    <p className="text-xs text-muted-foreground/60">
                      {new Date(r.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                      {r.edited_at && " · diedit"}
                    </p>
                  </div>
                );
              })}
            </>
          )}
        </TabsContent>

        <TabsContent value="bahaya" className="mt-4">
          <CoachDangerTab
            coachId={coach.id}
            userId={coach.user_id ?? null}
            isDeleted={!!coach.deleted_at}
            passwordChangedAt={coach.password_changed_at ?? null}
            activeSuspension={activeSuspension ? {
              id: activeSuspension.id,
              reason: activeSuspension.reason ?? null,
              suspended_at: activeSuspension.suspended_at,
              resume_at: activeSuspension.resume_at,
            } : null}
            singleCoachClasses={singleCoachClasses}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function CoachDetailPage({ params }: PageProps) {
  return (
    <div>
      <Suspense fallback={<PageSkeleton />}>
        <PageContent params={params} />
      </Suspense>
    </div>
  );
}
