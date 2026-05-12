import { createClient, createAdminClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Users, UserCheck, BookOpen, TrendingUp,
  CheckCircle2, Clock, AlertCircle, CalendarDays,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const DAY_NAMES = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

const STATUS_LABEL: Record<string, string> = {
  present: "Hadir",
  late: "Telat",
  permitted: "Izin",
  sick: "Sakit",
  absent: "Alpha",
};
const STATUS_CLASS: Record<string, string> = {
  present: "text-green-700 bg-green-50 border-green-200",
  late: "text-amber-700 bg-amber-50 border-amber-200",
  permitted: "text-blue-700 bg-blue-50 border-blue-200",
  sick: "text-purple-700 bg-purple-50 border-purple-200",
  absent: "text-destructive bg-destructive/5 border-destructive/20",
};

async function getDashboardData(branchId: string) {
  const db = createAdminClient();
  const todayDow = new Date().getDay(); // 0=Sun, 1=Mon...
  const todayDate = new Date().toISOString().split("T")[0];

  const [
    { count: totalMembers },
    { count: activeMembers },
    { count: totalCoaches },
    { count: totalClasses },
    { count: pendingRegistrations },
    { count: pendingApprovals },
    todayClassesRes,
    recentAttendanceRes,
  ] = await Promise.all([
    db.from("members").select("*", { count: "exact", head: true })
      .eq("branch_id", branchId).is("deleted_at", null),
    db.from("members").select("*", { count: "exact", head: true })
      .eq("branch_id", branchId).is("deleted_at", null).eq("status", "active"),
    db.from("coach_branches").select("*", { count: "exact", head: true })
      .eq("branch_id", branchId),
    db.from("classes").select("*", { count: "exact", head: true })
      .eq("branch_id", branchId).is("deleted_at", null).eq("status", "active"),
    db.from("members").select("*", { count: "exact", head: true })
      .eq("branch_id", branchId).is("deleted_at", null).eq("status", "pending_payment"),
    db.from("change_requests").select("*", { count: "exact", head: true })
      .eq("status", "pending"),
    // Classes today (join class_schedules)
    db.from("class_schedules")
      .select("id, start_time, end_time, classes!inner(id, name, status)")
      .eq("day_of_week", todayDow)
      .eq("classes.branch_id", branchId)
      .eq("classes.status", "active")
      .is("classes.deleted_at", null),
    // Recent 8 attendance records
    db.from("attendance_records")
      .select("id, session_date, status, members(id, member_profiles(full_name)), classes(id, name)")
      .eq("branch_id", branchId)
      .order("created_at", { ascending: false })
      .limit(8),
  ]);

  return {
    totalMembers: totalMembers ?? 0,
    activeMembers: activeMembers ?? 0,
    totalCoaches: totalCoaches ?? 0,
    totalClasses: totalClasses ?? 0,
    pendingRegistrations: pendingRegistrations ?? 0,
    pendingApprovals: pendingApprovals ?? 0,
    todayClasses: (todayClassesRes.data ?? []).map((s) => {
      const cls = Array.isArray(s.classes) ? s.classes[0] : s.classes;
      return {
        scheduleId: s.id,
        classId: cls?.id ?? "",
        name: cls?.name ?? "—",
        start_time: s.start_time,
        end_time: s.end_time,
      };
    }),
    recentAttendance: (recentAttendanceRes.data ?? []).map((r) => {
      const member = Array.isArray(r.members) ? r.members[0] : r.members;
      const mp = Array.isArray(member?.member_profiles) ? member?.member_profiles[0] : member?.member_profiles;
      const cls = Array.isArray(r.classes) ? r.classes[0] : r.classes;
      return {
        id: r.id,
        memberId: member?.id ?? "",
        memberName: (mp as any)?.full_name ?? "—",
        className: (cls as any)?.name ?? "—",
        classId: (cls as any)?.id ?? "",
        date: r.session_date,
        status: r.status,
      };
    }),
    todayDate,
    todayDow,
  };
}

export default async function AdminDashboardPage() {
  const jar = await cookies();
  const supabase = createClient(jar);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const activeBranchId = jar.get("active_branch_id")?.value ?? null;
  let branchId = activeBranchId;
  if (!branchId) {
    const { data } = await supabase.rpc("user_branch_id");
    branchId = data ?? null;
  }
  if (!branchId) redirect("/login");

  const data = await getDashboardData(branchId);

  const statCards = [
    { label: "Total Anggota", value: data.totalMembers, icon: Users, desc: "Semua terdaftar", href: "/a/member" },
    { label: "Anggota Aktif", value: data.activeMembers, icon: TrendingUp, desc: "Status aktif", href: "/a/member?status=active" },
    { label: "Pelatih", value: data.totalCoaches, icon: UserCheck, desc: "Di cabang ini", href: "/a/coach" },
    { label: "Kelas Aktif", value: data.totalClasses, icon: BookOpen, desc: "Sedang berjalan", href: "/a/kelas" },
  ];

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Selamat datang kembali. Berikut ringkasan data terkini.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statCards.map(({ label, value, icon: Icon, desc, href }) => (
          <Link key={label} href={href} className="block">
            <Card size="sm" className="hover:bg-accent/40 transition-colors cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">{label}</span>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{value}</div>
                <p className="text-xs text-muted-foreground mt-1">{desc}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Action banners */}
      <div className="flex flex-wrap gap-3">
        {data.pendingRegistrations > 0 && (
          <Link
            href="/a/member/registrasi"
            className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-800 hover:bg-amber-100 transition-colors"
          >
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span><strong>{data.pendingRegistrations}</strong> pendaftaran menunggu persetujuan</span>
          </Link>
        )}
        {data.pendingApprovals > 0 && (
          <Link
            href="/a/approval"
            className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm text-blue-800 hover:bg-blue-100 transition-colors"
          >
            <Clock className="h-4 w-4 shrink-0" />
            <span><strong>{data.pendingApprovals}</strong> permintaan perubahan profil</span>
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Classes today */}
        <div className="rounded-xl border bg-card overflow-hidden">
          <div className="px-5 py-3.5 border-b flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium text-sm">Kelas Hari Ini</span>
              <span className="text-xs text-muted-foreground">({DAY_NAMES[data.todayDow]})</span>
            </div>
            <Link href="/a/kelas" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              Lihat semua →
            </Link>
          </div>
          <div className="divide-y">
            {data.todayClasses.length === 0 ? (
              <div className="px-5 py-8 text-center text-sm text-muted-foreground">
                Tidak ada kelas hari ini.
              </div>
            ) : (
              data.todayClasses.map((c) => (
                <Link
                  key={c.scheduleId}
                  href={`/a/kelas/${c.classId}`}
                  className="flex items-center justify-between px-5 py-3 text-sm hover:bg-accent/40 transition-colors"
                >
                  <span className="font-medium truncate">{c.name}</span>
                  <span className="text-xs text-muted-foreground shrink-0 ml-2 font-mono">
                    {c.start_time?.slice(0, 5)} – {c.end_time?.slice(0, 5)}
                  </span>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Recent attendance */}
        <div className="rounded-xl border bg-card overflow-hidden">
          <div className="px-5 py-3.5 border-b flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium text-sm">Absensi Terbaru</span>
            </div>
            <Link href="/a/absensi" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              Lihat semua →
            </Link>
          </div>
          <div className="divide-y">
            {data.recentAttendance.length === 0 ? (
              <div className="px-5 py-8 text-center text-sm text-muted-foreground">
                Belum ada data absensi.
              </div>
            ) : (
              data.recentAttendance.map((a) => (
                <div key={a.id} className="flex items-center justify-between px-5 py-3 text-sm">
                  <div className="min-w-0">
                    <p className="font-medium truncate">{a.memberName}</p>
                    <p className="text-xs text-muted-foreground truncate">{a.className}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    <span className="text-xs text-muted-foreground">
                      {new Date(a.date).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                    </span>
                    <span className={cn(
                      "text-xs rounded-full border px-2 py-0.5",
                      STATUS_CLASS[a.status] ?? "text-muted-foreground bg-muted"
                    )}>
                      {STATUS_LABEL[a.status] ?? a.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
