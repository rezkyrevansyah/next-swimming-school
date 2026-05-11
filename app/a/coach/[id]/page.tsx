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
import { CoachStatusActions } from "./coach-status-actions";

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

export default async function CoachDetailPage({ params }: PageProps) {
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
          <TabsTrigger value="bahaya">Zona Berbahaya</TabsTrigger>
        </TabsList>

        <TabsContent value="profil" className="mt-4 space-y-4">
          {coach.status !== "active" && !coach.deleted_at && (
            <CoachStatusActions coachId={coach.id} currentStatus={coach.status} />
          )}
          <CoachProfileTab coach={coach} profile={profile} email={email} branches={branches} />
        </TabsContent>

        <TabsContent value="bahaya" className="mt-4">
          <CoachDangerTab
            coachId={coach.id}
            isDeleted={!!coach.deleted_at}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
