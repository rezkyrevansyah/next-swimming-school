import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClassDetailTab } from "./class-detail-tab";
import { ClassDangerTab } from "./class-danger-tab";
import { ScheduleTab } from "./schedule-tab";
import { CoachTab } from "./coach-tab";
import { MemberRosterTab } from "./member-roster-tab";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ClassDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Fetch class + branch
  const { data: cls, error } = await supabase
    .from("classes")
    .select(`*, branches(id, name)`)
    .eq("id", id)
    .single();

  if (error || !cls) notFound();

  const branch = Array.isArray(cls.branches) ? cls.branches[0] : cls.branches;

  // Fetch schedules, assigned coaches, enrolled members in parallel
  const [
    { data: schedules },
    { data: assignedCoaches },
    { data: enrolled },
    { data: allCoaches },
    { data: allMembers },
  ] = await Promise.all([
    supabase
      .from("class_schedules")
      .select("id, day_of_week, start_time, end_time")
      .eq("class_id", id)
      .order("day_of_week"),

    supabase
      .from("class_coaches")
      .select(`coach_id, coaches(coach_id_code, coach_profiles(full_name))`)
      .eq("class_id", id),

    supabase
      .from("class_members")
      .select(`member_id, status, joined_at, members(member_id_code, member_profiles(full_name))`)
      .eq("class_id", id)
      .order("joined_at"),

    // All active coaches for assignment picker
    supabase
      .from("coaches")
      .select(`id, coach_id_code, coach_profiles(full_name)`)
      .is("deleted_at", null)
      .eq("status", "active"),

    // All active members for enrollment picker
    supabase
      .from("members")
      .select(`id, member_id_code, member_profiles(full_name)`)
      .is("deleted_at", null)
      .eq("status", "active"),
  ]);

  const activeEnrolledCount = (enrolled ?? []).filter(
    (e) => e.status === "enrolled"
  ).length;

  return (
    <div className="p-6 max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-start gap-3">
        <Link
          href="/a/kelas"
          className={buttonVariants({ variant: "ghost", size: "icon-sm" })}
        >
          <ChevronLeft className="h-4 w-4" />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-semibold truncate">{cls.name}</h1>
            <Badge variant={cls.status === "active" ? "default" : "outline"}>
              {cls.status === "active" ? "Aktif" : "Tidak Aktif"}
            </Badge>
            {cls.deleted_at && (
              <Badge variant="destructive">Diarsipkan</Badge>
            )}
          </div>
          <p className="text-muted-foreground text-sm mt-0.5">
            <span className="font-mono">{cls.slug}</span> · {branch?.name ?? "—"} ·{" "}
            {activeEnrolledCount}/{cls.capacity} peserta
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="detail">
        <TabsList variant="line">
          <TabsTrigger value="detail">Detail</TabsTrigger>
          <TabsTrigger value="jadwal">
            Jadwal{" "}
            {schedules && schedules.length > 0 && (
              <span className="ml-1 text-xs opacity-60">({schedules.length})</span>
            )}
          </TabsTrigger>
          <TabsTrigger value="pelatih">
            Pelatih{" "}
            {assignedCoaches && assignedCoaches.length > 0 && (
              <span className="ml-1 text-xs opacity-60">({assignedCoaches.length})</span>
            )}
          </TabsTrigger>
          <TabsTrigger value="anggota">
            Anggota{" "}
            {activeEnrolledCount > 0 && (
              <span className="ml-1 text-xs opacity-60">({activeEnrolledCount})</span>
            )}
          </TabsTrigger>
          <TabsTrigger value="bahaya">Zona Berbahaya</TabsTrigger>
        </TabsList>

        <TabsContent value="detail" className="mt-4">
          <ClassDetailTab cls={cls} branch={branch} />
        </TabsContent>

        <TabsContent value="jadwal" className="mt-4">
          <ScheduleTab
            classId={id}
            initialSchedules={schedules ?? []}
          />
        </TabsContent>

        <TabsContent value="pelatih" className="mt-4">
          <CoachTab
            classId={id}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            assignedCoaches={(assignedCoaches ?? []) as any}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            availableCoaches={(allCoaches ?? []) as any}
          />
        </TabsContent>

        <TabsContent value="anggota" className="mt-4">
          <MemberRosterTab
            classId={id}
            capacity={cls.capacity}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            enrolled={(enrolled ?? []) as any}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            availableMembers={(allMembers ?? []) as any}
          />
        </TabsContent>

        <TabsContent value="bahaya" className="mt-4">
          <ClassDangerTab classId={cls.id} isDeleted={!!cls.deleted_at} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
