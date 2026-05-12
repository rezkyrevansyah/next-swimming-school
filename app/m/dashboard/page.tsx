import { Suspense } from "react";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { QrCode, ChevronRight, Phone, AlertCircle } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const DAYS = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
const STATUS_LABEL: Record<string, string> = {
  present: "Hadir", late: "Terlambat", permitted: "Izin", sick: "Sakit", absent: "Alpha",
};
const STATUS_VARIANT: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  present: "default", late: "secondary", permitted: "outline", sick: "outline", absent: "destructive",
};

function formatTime(t: string) { return t.slice(0, 5); }

function greeting() {
  const h = new Date().getHours();
  if (h < 11) return "Selamat pagi";
  if (h < 15) return "Selamat siang";
  if (h < 18) return "Selamat sore";
  return "Selamat malam";
}

function formatRupiah(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency", currency: "IDR", minimumFractionDigits: 0,
  }).format(amount);
}

// ── Dynamic: member-specific data ──────────────────────────────────────────────
async function MemberDashboardContent({ userId }: { userId: string }) {
  const supabase = createClient(await cookies());

  const { data: member } = await supabase
    .from("members")
    .select(`id, member_id_code, status, member_profiles(full_name, nickname, phone)`)
    .eq("user_id", userId)
    .single();

  if (!member || member.status !== "active") redirect("/login");

  const profile = Array.isArray(member.member_profiles)
    ? member.member_profiles[0]
    : member.member_profiles;

  const displayName = profile?.nickname || profile?.full_name?.split(" ")[0] || "Anggota";
  const todayDow = new Date().getDay();
  const todayDate = new Date().toISOString().slice(0, 10);

  const [
    { data: unpaidInvoices },
    { data: enrollments },
    { data: thisMonthAttendance },
    { data: recentAttendance },
  ] = await Promise.all([
    supabase
      .from("monthly_invoices")
      .select("id, period_month, total_amount, amount_paid, status")
      .eq("member_id", member.id)
      .in("status", ["unpaid", "partial"])
      .order("period_month", { ascending: false }),

    supabase
      .from("class_members")
      .select(`
        class_id,
        classes!inner(
          id, name, capacity, status,
          class_schedules(day_of_week, start_time, end_time),
          class_coaches(coaches(coach_profiles(full_name, phone)))
        )
      `)
      .eq("member_id", member.id)
      .eq("status", "enrolled"),

    supabase
      .from("attendance_records")
      .select("status")
      .eq("member_id", member.id)
      .gte("session_date", todayDate.slice(0, 7) + "-01")
      .lte("session_date", todayDate),

    supabase
      .from("attendance_records")
      .select(`status, session_date, class_id, classes(name)`)
      .eq("member_id", member.id)
      .order("session_date", { ascending: false })
      .limit(5),
  ]);

  const unpaidList = unpaidInvoices ?? [];
  const totalOutstanding = unpaidList.reduce(
    (s, i) => s + Math.max(0, (i.total_amount ?? 0) - (i.amount_paid ?? 0)),
    0
  );

  // Today's classes
  const todayClasses = (enrollments ?? []).flatMap((e) => {
    const cls = Array.isArray(e.classes) ? e.classes[0] : e.classes;
    if (!cls || cls.status !== "active") return [];
    const todaySched = (cls.class_schedules ?? []).find(
      (s: { day_of_week: number }) => s.day_of_week === todayDow
    ) as { start_time: string; end_time: string } | undefined;
    if (!todaySched) return [];
    return [{ id: cls.id, name: cls.name, startTime: todaySched.start_time, endTime: todaySched.end_time }];
  }).sort((a, b) => a.startTime.localeCompare(b.startTime));

  // Next upcoming class (any day)
  const nextClass = (() => {
    const now = new Date();
    const nowMin = now.getHours() * 60 + now.getMinutes();
    for (let delta = 0; delta <= 6; delta++) {
      const dow = (todayDow + delta) % 7;
      const matches = (enrollments ?? []).flatMap((e) => {
        const cls = Array.isArray(e.classes) ? e.classes[0] : e.classes;
        if (!cls || cls.status !== "active") return [];
        return (cls.class_schedules ?? [])
          .filter((s: { day_of_week: number }) => s.day_of_week === dow)
          .map((s: { start_time: string; end_time: string }) => ({
            name: cls.name, startTime: s.start_time, endTime: s.end_time, delta,
          }));
      });
      for (const m of matches.sort((a, b) => a.startTime.localeCompare(b.startTime))) {
        const [h, min] = m.startTime.split(":").map(Number);
        const classMin = h * 60 + min;
        if (delta > 0 || classMin > nowMin) return { ...m, dayName: delta === 0 ? "Hari ini" : DAYS[dow] };
      }
    }
    return null;
  })();

  // Stats this month
  const stats = { present: 0, late: 0, permitted: 0, sick: 0, absent: 0 };
  (thisMonthAttendance ?? []).forEach((r) => {
    if (r.status in stats) stats[r.status as keyof typeof stats]++;
  });
  const totalSessions = Object.values(stats).reduce((a, b) => a + b, 0);
  const attendanceRate = totalSessions > 0
    ? Math.round(((stats.present + stats.late) / totalSessions) * 100)
    : null;

  // Coaches from enrolled classes
  const coaches = (enrollments ?? []).flatMap((e) => {
    const cls = Array.isArray(e.classes) ? e.classes[0] : e.classes;
    return (cls?.class_coaches ?? []).flatMap((cc: { coaches: unknown }) => {
      const coach = Array.isArray(cc.coaches) ? cc.coaches[0] : cc.coaches;
      const cp = Array.isArray(coach?.coach_profiles) ? coach.coach_profiles[0] : coach?.coach_profiles;
      if (!cp?.full_name) return [];
      return [{ name: cp.full_name, phone: cp.phone ?? null }];
    });
  }).filter((c, i, arr) => arr.findIndex((x) => x.name === c.name) === i);

  return (
    <>
      {/* Greeting */}
      <div className="pt-2">
        <p className="text-muted-foreground text-sm">{greeting()},</p>
        <h1 className="text-xl font-semibold">{displayName} 👋</h1>
      </div>

      {/* Overdue invoice banner */}
      {unpaidList.length > 0 && (
        <Link
          href="/m/pembayaran"
          className="flex items-start gap-3 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 hover:bg-destructive/10 transition-colors"
        >
          <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-destructive">
              {unpaidList.length} tagihan belum lunas
            </p>
            <p className="text-xs text-destructive/80 mt-0.5">
              Total: {formatRupiah(totalOutstanding)} · Ketuk untuk lihat detail
            </p>
          </div>
          <ChevronRight className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
        </Link>
      )}

      {/* QR CTA */}
      <Link
        href="/m/qr"
        className="flex items-center gap-4 rounded-xl border bg-primary/5 border-primary/20 px-4 py-3 hover:bg-primary/10 transition-colors"
      >
        <QrCode className="h-10 w-10 text-primary shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm">QR Code Absensi</p>
          <p className="text-xs text-muted-foreground mt-0.5">Tunjukkan ke pelatih saat latihan</p>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
      </Link>

      {/* Next class */}
      {nextClass && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground uppercase tracking-wide">Kelas Berikutnya</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-semibold">{nextClass.name}</p>
            <p className="text-sm text-muted-foreground mt-0.5">
              {nextClass.dayName} · {formatTime(nextClass.startTime)}–{formatTime(nextClass.endTime)}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Today's classes */}
      {todayClasses.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">Kelas Hari Ini</h2>
          <div className="space-y-2">
            {todayClasses.map((cls) => (
              <div key={cls.id} className="rounded-xl border px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">{cls.name}</p>
                  <p className="text-xs text-muted-foreground">{formatTime(cls.startTime)}–{formatTime(cls.endTime)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats bulan ini */}
      {totalSessions > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground uppercase tracking-wide flex items-center justify-between">
              <span>Kehadiran Bulan Ini</span>
              {attendanceRate !== null && (
                <span className={cn(
                  "text-base font-bold",
                  attendanceRate >= 80 ? "text-green-600" : attendanceRate >= 60 ? "text-amber-600" : "text-destructive"
                )}>{attendanceRate}%</span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              {[
                { label: "Hadir", value: stats.present + stats.late, color: "text-green-600" },
                { label: "Izin", value: stats.permitted, color: "text-blue-600" },
                { label: "Sakit", value: stats.sick, color: "text-amber-600" },
                { label: "Alpha", value: stats.absent, color: "text-destructive" },
              ].map((s) => (
                <div key={s.label} className="space-y-1">
                  <p className={cn("text-xl font-bold", s.color)}>{s.value}</p>
                  <p className="text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent attendance */}
      {(recentAttendance ?? []).length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Absensi Terakhir</h2>
            <Link href="/m/absensi" className="text-xs text-primary hover:underline">Lihat semua</Link>
          </div>
          <div className="space-y-1.5">
            {(recentAttendance ?? []).map((r, i) => {
              const cls = Array.isArray(r.classes) ? r.classes[0] : r.classes;
              return (
                <div key={i} className="flex items-center justify-between text-sm px-1">
                  <div className="min-w-0">
                    <span className="truncate">{cls?.name ?? "—"}</span>
                    <span className="text-muted-foreground text-xs ml-2">
                      {new Date(r.session_date).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                    </span>
                  </div>
                  <Badge variant={STATUS_VARIANT[r.status] ?? "outline"} className="shrink-0 ml-2 text-xs">
                    {STATUS_LABEL[r.status] ?? r.status}
                  </Badge>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Coaches */}
      {coaches.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">Pelatih Saya</h2>
          <div className="space-y-2">
            {coaches.map((c) => (
              <div key={c.name} className="flex items-center justify-between rounded-xl border px-4 py-3">
                <p className="text-sm font-medium">{c.name}</p>
                {c.phone && (
                  <a
                    href={`https://wa.me/${c.phone.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-1.5")}
                  >
                    <Phone className="h-3.5 w-3.5" />
                    WA
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {(enrollments ?? []).length === 0 && (
        <div className="rounded-xl border px-4 py-10 text-center text-sm text-muted-foreground">
          Kamu belum terdaftar di kelas apapun. Hubungi admin untuk pendaftaran.
        </div>
      )}
    </>
  );
}

// ── Skeleton ───────────────────────────────────────────────────────────────────
function DashboardSkeleton() {
  return (
    <>
      <div className="pt-2 space-y-1 animate-pulse">
        <div className="h-4 w-28 bg-muted rounded" />
        <div className="h-7 w-40 bg-muted rounded" />
      </div>
      <div className="h-16 bg-muted rounded-xl animate-pulse" />
      <div className="h-16 bg-muted rounded-xl animate-pulse" />
      <div className="h-24 bg-muted rounded-xl animate-pulse" />
      <div className="h-32 bg-muted rounded-xl animate-pulse" />
    </>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────
export default async function MemberDashboardPage() {
  const supabase = createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <div className="p-4 space-y-4 max-w-lg mx-auto">
      <Suspense fallback={<DashboardSkeleton />}>
        <MemberDashboardContent userId={user.id} />
      </Suspense>
    </div>
  );
}
