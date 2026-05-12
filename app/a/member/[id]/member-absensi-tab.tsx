import { Badge } from "@/components/ui/badge";
import { ClipboardList } from "lucide-react";

// ============================================================================
// Types
// ============================================================================
interface AttendanceRecord {
  id: string;
  session_date: string;
  status: string;
  scan_method: string | null;
  notes: string | null;
  classes: { name: string } | { name: string }[] | null;
  coaches: { coach_profiles: { full_name: string } | { full_name: string }[] | null } | null;
}

interface MemberAbsensiTabProps {
  records: AttendanceRecord[];
}

// ============================================================================
// Helpers
// ============================================================================
const STATUS_LABEL: Record<string, string> = {
  present: "Hadir",
  late: "Terlambat",
  permitted: "Izin",
  sick: "Sakit",
  absent: "Alpha",
};
const STATUS_VARIANT: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  present: "default",
  late: "secondary",
  permitted: "outline",
  sick: "outline",
  absent: "destructive",
};

// ============================================================================
// Component
// ============================================================================
export function MemberAbsensiTab({ records }: MemberAbsensiTabProps) {
  if (records.length === 0) {
    return (
      <div className="rounded-xl border bg-card p-8 text-center space-y-2">
        <ClipboardList className="h-8 w-8 text-muted-foreground mx-auto" />
        <p className="text-sm text-muted-foreground">Belum ada data absensi.</p>
      </div>
    );
  }

  // Summary stats
  const stats = { present: 0, late: 0, permitted: 0, sick: 0, absent: 0 };
  records.forEach((r) => {
    if (r.status in stats) stats[r.status as keyof typeof stats]++;
  });
  const totalPresent = stats.present + stats.late;

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="rounded-xl border bg-card p-4">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
          Ringkasan ({records.length} sesi terakhir)
        </p>
        <div className="grid grid-cols-4 gap-2 text-center text-xs">
          {[
            { label: "Hadir", value: totalPresent, color: "text-green-600" },
            { label: "Izin/Sakit", value: stats.permitted + stats.sick, color: "text-blue-600" },
            { label: "Terlambat", value: stats.late, color: "text-amber-600" },
            { label: "Alpha", value: stats.absent, color: "text-destructive" },
          ].map((s) => (
            <div key={s.label} className="space-y-1">
              <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Record list */}
      <div className="rounded-xl border divide-y overflow-hidden">
        {records.map((r) => {
          const cls = Array.isArray(r.classes) ? r.classes[0] : r.classes;
          const coach = Array.isArray(r.coaches) ? r.coaches[0] : r.coaches;
          const coachProfile = Array.isArray(coach?.coach_profiles)
            ? coach?.coach_profiles[0]
            : coach?.coach_profiles;

          return (
            <div key={r.id} className="px-4 py-3 flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-medium">
                    {new Date(r.session_date).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                  {r.scan_method && (
                    <span className="text-[10px] font-mono bg-muted text-muted-foreground px-1.5 py-0.5 rounded">
                      {r.scan_method}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{cls?.name ?? "—"}</p>
                {coachProfile?.full_name && (
                  <p className="text-xs text-muted-foreground">Pelatih: {coachProfile.full_name}</p>
                )}
                {r.notes && (
                  <p className="text-xs text-muted-foreground italic mt-0.5">{r.notes}</p>
                )}
              </div>
              <Badge variant={STATUS_VARIANT[r.status] ?? "outline"} className="shrink-0">
                {STATUS_LABEL[r.status] ?? r.status}
              </Badge>
            </div>
          );
        })}
      </div>
    </div>
  );
}
