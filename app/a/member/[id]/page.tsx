import { Suspense } from "react";
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
import { MemberClassTab } from "./member-class-tab";
import { MemberRapotTab } from "./member-rapot-tab";
import { MemberQrCard } from "@/components/shared/member-qr-card";
import { MemberPaymentTab } from "./member-payment-tab";
import { MemberAbsensiTab } from "./member-absensi-tab";

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

  // Fetch class enrollments
  const { data: classEnrollments } = await supabase
    .from("class_members")
    .select("status, classes(id, name, status)")
    .eq("member_id", id)
    .order("joined_at", { ascending: false });

  // Fetch active classes for enroll dropdown
  const { data: activeClasses } = await supabase
    .from("classes")
    .select("id, name")
    .eq("status", "active")
    .is("deleted_at", null)
    .order("name");

  // Fetch attendance records (latest 50)
  const { data: attendanceRecords } = await supabase
    .from("attendance_records")
    .select(`
      id, session_date, status, scan_method, notes,
      classes(name),
      coaches:recorded_by_coach_id(coach_profiles(full_name))
    `)
    .eq("member_id", id)
    .order("session_date", { ascending: false })
    .limit(50);

  // Fetch invoices (only for individual payment members)
  const invoices = member.payment_handling === "individual"
    ? (await supabase
        .from("monthly_invoices")
        .select("id, period_month, total_amount, amount_paid, status, due_date, generated_at")
        .eq("member_id", id)
        .order("period_month", { ascending: false })
      ).data ?? []
    : [];

  const unpaidInvoiceCount = invoices.filter((i) => i.status === "unpaid").length;

  // Fetch report cards
  const { data: reportCards } = await supabase
    .from("report_cards")
    .select(`
      id, status, published_at, attendance_rate,
      sessions_total, sessions_present, sessions_late,
      sessions_absent, skill_scores, coach_notes,
      semesters(id, name, start_date, end_date),
      classes(id, name),
      coaches(id, coach_profiles(full_name))
    `)
    .eq("member_id", id)
    .order("published_at", { ascending: false, nullsFirst: false });

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
          <TabsTrigger value="kelas">Kelas</TabsTrigger>
          <TabsTrigger value="rapot">
            Rapot
            {(reportCards ?? []).length > 0 && (
              <span className="ml-1.5 inline-flex items-center justify-center h-4 min-w-4 px-1 rounded-full bg-muted text-muted-foreground text-[10px] font-bold">
                {(reportCards ?? []).length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="absensi">
            Absensi
            {(attendanceRecords ?? []).length > 0 && (
              <span className="ml-1.5 inline-flex items-center justify-center h-4 min-w-4 px-1 rounded-full bg-muted text-muted-foreground text-[10px] font-bold">
                {(attendanceRecords ?? []).length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="pembayaran">
            Pembayaran
            {unpaidInvoiceCount > 0 && (
              <span className="ml-1.5 inline-flex items-center justify-center h-4 min-w-4 px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold">
                {unpaidInvoiceCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="qr">QR Code</TabsTrigger>
          <TabsTrigger value="bahaya">Zona Berbahaya</TabsTrigger>
        </TabsList>

        <TabsContent value="profil" className="mt-4">
          <MemberProfileTab
            member={{
              id: member.id,
              type: member.type,
              payment_handling: member.payment_handling,
              status: member.status,
              private_sessions_total: (member as any).private_sessions_total ?? null,
              private_sessions_used: (member as any).private_sessions_used ?? null,
              private_package_price: (member as any).private_package_price ?? null,
            }}
            profile={profile}
            branch={branch}
            email={email}
          />
        </TabsContent>

        <TabsContent value="kelas" className="mt-4">
          <MemberClassTab
            memberId={member.id}
            enrolled={(classEnrollments ?? []) as any}
            availableClasses={activeClasses ?? []}
          />
        </TabsContent>

        <TabsContent value="rapot" className="mt-4">
          <MemberRapotTab reports={(reportCards ?? []) as any} />
        </TabsContent>

        <TabsContent value="absensi" className="mt-4">
          <MemberAbsensiTab records={(attendanceRecords ?? []) as any} />
        </TabsContent>

        <TabsContent value="pembayaran" className="mt-4">
          <MemberPaymentTab
            invoices={invoices as any}
            memberPaymentHandling={member.payment_handling}
          />
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
            passwordChangedAt={member.password_changed_at ?? null}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function MemberDetailPage({ params }: PageProps) {
  return (
    <div>
      <Suspense fallback={<PageSkeleton />}>
        <PageContent params={params} />
      </Suspense>
    </div>
  );
}
