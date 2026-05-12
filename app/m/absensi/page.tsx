import { Suspense } from "react";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { AbsensiFilter } from "./absensi-filter";

interface PageProps {
  searchParams: Promise<{ bulan?: string; kelas?: string }>;
}

const STATUS_LABEL: Record<string, string> = {
  present: "Hadir", late: "Terlambat", permitted: "Izin", sick: "Sakit", absent: "Alpha",
};
const STATUS_VARIANT: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  present: "default", late: "secondary", permitted: "outline", sick: "outline", absent: "destructive",
};

export default function MemberAbsensiPage({ searchParams }: PageProps) {
  return (
    <Suspense>
      <AbsensiContent searchParams={searchParams} />
    </Suspense>
  );
}

async function AbsensiContent({ searchParams }: PageProps) {
  const supabase = createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: member } = await supabase
    .from("members")
    .select("id")
    .eq("user_id", user.id)
    .single();
  if (!member) redirect("/login");

  const params = await searchParams;
  const now = new Date();
  const defaultBulan = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const bulan = params.bulan ?? defaultBulan;
  const kelasFilter = params.kelas ?? "";

  const [year, month] = bulan.split("-");
  const from = `${year}-${month}-01`;
  const lastDay = new Date(Number(year), Number(month), 0).getDate();
  const to = `${year}-${month}-${String(lastDay).padStart(2, "0")}`;

  // Get enrolled classes for filter dropdown
  const { data: enrollments } = await supabase
    .from("class_members")
    .select("class_id, classes(id, name)")
    .eq("member_id", member.id)
    .eq("status", "enrolled");

  const classes = (enrollments ?? []).map((e) => {
    const cls = Array.isArray(e.classes) ? e.classes[0] : e.classes;
    return { id: cls?.id ?? e.class_id, name: cls?.name ?? "—" };
  });

  let query = supabase
    .from("attendance_records")
    .select(`session_date, status, scan_method, classes(name), coaches:recorded_by_coach_id(coach_profiles(full_name))`)
    .eq("member_id", member.id)
    .gte("session_date", from)
    .lte("session_date", to)
    .order("session_date", { ascending: false });

  if (kelasFilter) query = query.eq("class_id", kelasFilter);

  const { data: records } = await query;

  // Stats for this month
  const stats = { present: 0, late: 0, permitted: 0, sick: 0, absent: 0 };
  (records ?? []).forEach((r) => {
    if (r.status in stats) stats[r.status as keyof typeof stats]++;
  });
  const total = Object.values(stats).reduce((a, b) => a + b, 0);
  const rate = total > 0 ? Math.round(((stats.present + stats.late) / total) * 100) : null;

  // Generate month options (last 6 months)
  const monthOptions = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleDateString("id-ID", { month: "long", year: "numeric" });
    return { val, label };
  });

  return (
    <div className="p-4 space-y-4 max-w-lg mx-auto">
      <div className="pt-2">
        <h1 className="text-xl font-semibold">Riwayat Absensi</h1>
      </div>

      {/* Filters */}
      <AbsensiFilter
        bulan={bulan}
        kelasFilter={kelasFilter}
        monthOptions={monthOptions}
        classes={classes}
      />

      {/* Stats */}
      {total > 0 && (
        <div className="rounded-xl border p-4 grid grid-cols-4 gap-2 text-center text-xs">
          {[
            { label: "Hadir", value: stats.present + stats.late, color: "text-green-600" },
            { label: "Izin", value: stats.permitted, color: "text-blue-600" },
            { label: "Sakit", value: stats.sick, color: "text-amber-600" },
            { label: "Alpha", value: stats.absent, color: "text-destructive" },
          ].map((s) => (
            <div key={s.label} className="space-y-1">
              <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-muted-foreground">{s.label}</p>
            </div>
          ))}
          {rate !== null && (
            <div className="col-span-4 pt-2 border-t text-sm font-medium text-muted-foreground">
              Kehadiran: <span className="text-foreground font-bold">{rate}%</span>
            </div>
          )}
        </div>
      )}

      {/* Records */}
      {!records || records.length === 0 ? (
        <div className="rounded-xl border px-4 py-10 text-center text-sm text-muted-foreground">
          Tidak ada data absensi untuk periode ini.
        </div>
      ) : (
        <ul className="space-y-2">
          {records.map((r, i) => {
            const cls = Array.isArray(r.classes) ? r.classes[0] : r.classes;
            const coachData = Array.isArray(r.coaches) ? r.coaches[0] : r.coaches;
            const coachProfile = Array.isArray(coachData?.coach_profiles)
              ? coachData.coach_profiles[0]
              : coachData?.coach_profiles;
            return (
              <li key={i} className="flex items-start justify-between rounded-xl border px-4 py-3 gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{cls?.name ?? "—"}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {new Date(r.session_date).toLocaleDateString("id-ID", {
                      weekday: "short", day: "numeric", month: "short", year: "numeric",
                    })}
                  </p>
                  {coachProfile?.full_name && (
                    <p className="text-xs text-muted-foreground">Dicatat: {coachProfile.full_name}</p>
                  )}
                </div>
                <Badge variant={STATUS_VARIANT[r.status] ?? "outline"} className="shrink-0">
                  {STATUS_LABEL[r.status] ?? r.status}
                </Badge>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
