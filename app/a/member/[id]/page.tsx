import { createClient, createAdminClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MemberProfileTab } from "./member-profile-tab";
import { MemberDangerTab } from "./member-danger-tab";
import { MemberQrCard } from "@/components/shared/member-qr-card";

const STATUS_LABEL: Record<string, string> = {
  active: "Aktif",
  inactive: "Tidak Aktif",
  pending_payment: "Menunggu Bayar",
};
const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  active: "default",
  inactive: "outline",
  pending_payment: "secondary",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function MemberDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = createClient(await cookies());

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: member, error } = await supabase
    .from("members")
    .select(`
      *,
      member_profiles(*),
      branches(id, name)
    `)
    .eq("id", id)
    .single();

  if (error || !member) notFound();

  const profile = Array.isArray(member.member_profiles)
    ? member.member_profiles[0]
    : member.member_profiles;

  const branch = Array.isArray(member.branches)
    ? member.branches[0]
    : member.branches;

  // Fetch email from auth.users via admin client
  let email: string | null = null;
  if (member.user_id) {
    const adminClient = createAdminClient();
    const { data: authUser } = await adminClient.auth.admin.getUserById(member.user_id);
    email = authUser?.user?.email ?? null;
  }

  return (
    <div className="p-6 max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-start gap-3">
        <Link
          href="/a/member"
          className={buttonVariants({ variant: "ghost", size: "icon-sm" })}
        >
          <ChevronLeft className="h-4 w-4" />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-semibold truncate">
              {profile?.full_name ?? "—"}
            </h1>
            <Badge variant={STATUS_VARIANT[member.status] ?? "outline"}>
              {STATUS_LABEL[member.status] ?? member.status}
            </Badge>
            {member.deleted_at && (
              <Badge variant="destructive">Diarsipkan</Badge>
            )}
          </div>
          <p className="text-muted-foreground text-sm mt-0.5">
            {member.member_id_code} · {branch?.name ?? "—"}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="profil">
        <TabsList variant="line">
          <TabsTrigger value="profil">Profil</TabsTrigger>
          <TabsTrigger value="qr">QR Code</TabsTrigger>
          <TabsTrigger value="bahaya">Zona Berbahaya</TabsTrigger>
        </TabsList>

        <TabsContent value="profil" className="mt-4">
          <MemberProfileTab member={member} profile={profile} branch={branch} email={email} />
        </TabsContent>

        <TabsContent value="qr" className="mt-4">
          <div className="max-w-xs mx-auto py-4">
            <p className="text-sm text-muted-foreground text-center mb-4">
              QR code ini bersifat permanen. Gunakan tombol di bawah untuk mengunduh atau mencetak.
            </p>
            <MemberQrCard
              memberId={member.id}
              memberCode={member.member_id_code}
              fullName={profile?.full_name ?? ""}
              compact
            />
          </div>
        </TabsContent>

        <TabsContent value="bahaya" className="mt-4">
          <MemberDangerTab
            memberId={member.id}
            userId={member.user_id}
            isDeleted={!!member.deleted_at}
            hasAccount={member.has_account}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
