import { Suspense } from "react";
import { createClient, createAdminClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CoachProfileTab } from "./coach-profile-tab";
import { CoachDangerTab } from "./coach-danger-tab";
import { CoachClassTab } from "./coach-class-tab";
import { CoachStatusActions } from "./coach-status-actions";
import { CoachCertificateTab } from "./coach-certificate-tab";
import { CoachClockinTab } from "./coach-clockin-tab";

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

        <TabsContent value="bahaya" className="mt-4">
          <CoachDangerTab
            coachId={coach.id}
            userId={coach.user_id ?? null}
            isDeleted={!!coach.deleted_at}
            passwordChangedAt={coach.password_changed_at ?? null}
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
