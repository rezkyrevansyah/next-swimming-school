import { Suspense } from "react";
import { createClient, createAdminClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Users, UserCheck, BookOpen, TrendingUp,
  CheckCircle2, Clock, AlertCircle, CalendarDays,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getAdminDashboardStats } from "@/lib/data/stats";

const DAY_NAMES = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

const STATUS_LABEL: Record<string, string> = {
  present: "Hadir", late: "Telat", permitted: "Izin", sick: "Sakit", absent: "Alpha",
};
const STATUS_CLASS: Record<string, string> = {
  present: "text-green-700 bg-green-50 border-green-200",
  late: "text-amber-700 bg-amber-50 border-amber-200",
  permitted: "text-blue-700 bg-blue-50 border-blue-200",
  sick: "text-purple-700 bg-purple-50 border-purple-200",
  absent: "text-destructive bg-destructive/5 border-destructive/20",
};

// ── Cached: stats + today's classes ──────────────────────────────────────────
async function DashboardStats({ branchId }: { branchId: string }) {
  const data = await getAdminDashboardStats(branchId);

  const statCards = [
    { label: "Total Anggota", value: data.totalMembers, icon: Users, href: "/a/member" },
    { label: "Anggota Aktif", value: data.activeMembers, icon: TrendingUp, href: "/a/member?status=active" },
    { label: "Pelatih", value: data.totalCoaches, icon: UserCheck, href: "/a/coach" },
    { label: "Kelas Aktif", value: data.totalClasses, icon: BookOpen, href: "/a/kelas" },
  ];

  return (
    <>
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statCards.map(({ label, value, icon: Icon, href }) => (
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

      {/* Today's classes */}
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
    </>
  );
}

// ── Dynamic: recent attendance (always fresh) ─────────────────────────────────
async function RecentAttendance({ branchId }: { branchId: string }) {
  const db = createAdminClient();
  const { data: records } = await db
    .from("attendance_records")
    .select("id, session_date, status, members(id, member_profiles(full_name)), classes(id, name)")
    .eq("branch_id", branchId)
    .order("created_at", { ascending: false })
    .limit(8);

  const recentAttendance = (records ?? []).map((r) => {
    const member = Array.isArray(r.members) ? r.members[0] : r.members;
    const mp = Array.isArray(member?.member_profiles) ? member?.member_profiles[0] : member?.member_profiles;
    const cls = Array.isArray(r.classes) ? r.classes[0] : r.classes;
    return {
      id: r.id,
      memberName: (mp as any)?.full_name ?? "—",
      className: (cls as any)?.name ?? "—",
      classId: (cls as any)?.id ?? "",
      date: r.session_date,
      status: r.status,
    };
  });

  return (
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
        {recentAttendance.length === 0 ? (
          <div className="px-5 py-8 text-center text-sm text-muted-foreground">
            Belum ada data absensi.
          </div>
        ) : (
          recentAttendance.map((a) => (
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
  );
}

// ── Skeletons ─────────────────────────────────────────────────────────────────
function StatsSkeleton() {
  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 animate-pulse">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 bg-muted rounded-xl" />
        ))}
      </div>
      <div className="h-48 bg-muted rounded-xl animate-pulse" />
    </>
  );
}

function AttendanceSkeleton() {
  return (
    <div className="rounded-xl border animate-pulse">
      <div className="h-12 bg-muted border-b" />
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="h-14 bg-muted/50 border-b" />
      ))}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
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

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Selamat datang kembali. Berikut ringkasan data terkini.
        </p>
      </div>

      <Suspense fallback={<StatsSkeleton />}>
        <DashboardStats branchId={branchId} />
      </Suspense>

      <Suspense fallback={<AttendanceSkeleton />}>
        <RecentAttendance branchId={branchId} />
      </Suspense>
    </div>
  );
}
