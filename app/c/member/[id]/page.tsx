import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Phone, MessageCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PageProps {
  params: Promise<{ id: string }>;
}

const ATTENDANCE_LABEL: Record<string, string> = {
  present: "Hadir",
  late: "Terlambat",
  permitted: "Izin",
  sick: "Sakit",
  absent: "Alpha",
};
const ATTENDANCE_VARIANT: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  present: "default",
  late: "secondary",
  permitted: "outline",
  sick: "outline",
  absent: "destructive",
};

export default async function CoachMemberDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Verify this coach has access (member is in one of coach's classes)
  const { data: coach } = await supabase
    .from("coaches")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!coach) redirect("/login");

  const { data: coachClasses } = await supabase
    .from("class_coaches")
    .select("class_id")
    .eq("coach_id", coach.id);

  const classIds = (coachClasses ?? []).map((cc) => cc.class_id);

  // Check this member is enrolled in at least one of coach's classes
  if (classIds.length > 0) {
    const { data: access } = await supabase
      .from("class_members")
      .select("member_id")
      .eq("member_id", id)
      .in("class_id", classIds)
      .eq("status", "enrolled")
      .maybeSingle();

    if (!access) notFound();
  } else {
    notFound();
  }

  // Fetch member data
  const { data: member } = await supabase
    .from("members")
    .select("id, member_id_code, status, member_profiles(full_name, phone, parent_name, parent_phone, dob, gender)")
    .eq("id", id)
    .single();

  if (!member) notFound();

  const profile = Array.isArray(member.member_profiles)
    ? member.member_profiles[0]
    : member.member_profiles;

  // Fetch their classes under this coach
  const { data: enrollments } = await supabase
    .from("class_members")
    .select("classes(id, name)")
    .eq("member_id", id)
    .in("class_id", classIds)
    .eq("status", "enrolled");

  // Fetch attendance history (last 30 records in coach's classes)
  const { data: attendance } = await supabase
    .from("attendance_records")
    .select("session_date, status, classes(name)")
    .eq("member_id", id)
    .in("class_id", classIds)
    .order("session_date", { ascending: false })
    .limit(30);

  const phone = profile?.phone ?? profile?.parent_phone ?? null;
  const waUrl = phone
    ? `https://wa.me/${phone.replace(/\D/g, "")}?text=${encodeURIComponent(`Halo ${profile?.full_name ?? ""},`)}`
    : null;

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="sticky top-0 bg-background border-b px-4 py-3 z-10 flex items-center gap-3">
        <Link href="/c/member" className={cn(buttonVariants({ variant: "ghost", size: "icon-sm" }))}>
          <ChevronLeft className="h-4 w-4" />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="font-semibold text-base truncate">{profile?.full_name ?? "—"}</h1>
          <p className="text-xs text-muted-foreground font-mono">{member.member_id_code}</p>
        </div>
        <Badge variant={member.status === "active" ? "default" : "outline"} className="text-xs shrink-0">
          {member.status === "active" ? "Aktif" : member.status}
        </Badge>
      </div>

      <div className="p-4 space-y-6">
        {/* Contact */}
        <div className="rounded-lg border p-4 space-y-3">
          <h2 className="text-sm font-semibold">Kontak</h2>
          <dl className="space-y-2 text-sm">
            {profile?.phone && (
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">No. HP</dt>
                <dd className="font-medium">{profile.phone}</dd>
              </div>
            )}
            {profile?.parent_name && (
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Orang Tua</dt>
                <dd className="font-medium">{profile.parent_name}</dd>
              </div>
            )}
            {profile?.parent_phone && (
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">HP Ortu</dt>
                <dd className="font-medium">{profile.parent_phone}</dd>
              </div>
            )}
            {profile?.dob && (
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Tgl Lahir</dt>
                <dd>{new Date(profile.dob).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</dd>
              </div>
            )}
          </dl>

          {waUrl && (
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "w-full gap-2 mt-2"
              )}
            >
              <MessageCircle className="h-4 w-4" />
              Hubungi via WhatsApp
            </a>
          )}
          {phone && !waUrl && (
            <a
              href={`tel:${phone}`}
              className={cn(buttonVariants({ variant: "outline", size: "sm" }), "w-full gap-2 mt-2")}
            >
              <Phone className="h-4 w-4" />
              Telepon
            </a>
          )}
        </div>

        {/* Enrolled classes */}
        <div className="rounded-lg border p-4 space-y-3">
          <h2 className="text-sm font-semibold">Kelas</h2>
          {(enrollments ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">Tidak ada kelas.</p>
          ) : (
            <ul className="space-y-1">
              {(enrollments ?? []).map((e, i) => {
                const cls = Array.isArray(e.classes) ? e.classes[0] : e.classes;
                return (
                  <li key={cls?.id ?? i} className="text-sm">
                    {cls?.name ?? "—"}
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Attendance history */}
        <div className="rounded-lg border p-4 space-y-3">
          <h2 className="text-sm font-semibold">Riwayat Absensi (30 terakhir)</h2>
          {!attendance || attendance.length === 0 ? (
            <p className="text-sm text-muted-foreground">Belum ada catatan absensi.</p>
          ) : (
            <div className="space-y-1.5">
              {attendance.map((a, i) => {
                const cls = Array.isArray(a.classes) ? a.classes[0] : a.classes;
                return (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <div>
                      <span className="text-muted-foreground text-xs">
                        {new Date(a.session_date).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                      </span>
                      {cls?.name && (
                        <span className="text-xs text-muted-foreground ml-1">· {cls.name}</span>
                      )}
                    </div>
                    <Badge variant={ATTENDANCE_VARIANT[a.status] ?? "outline"} className="text-xs">
                      {ATTENDANCE_LABEL[a.status] ?? a.status}
                    </Badge>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
