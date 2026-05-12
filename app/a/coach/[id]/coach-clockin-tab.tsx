import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { AlertTriangle, MapPin, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Props {
  coachId: string;
}

export async function CoachClockinTab({ coachId }: Props) {
  const supabase = createClient(await cookies());

  const { data: records } = await supabase
    .from("coach_clock_records")
    .select("id, clock_in_date, clock_in_at, clock_in_distance_m, suspicious_flag, notes, branches(name)")
    .eq("coach_id", coachId)
    .order("clock_in_date", { ascending: false })
    .order("clock_in_at", { ascending: false })
    .limit(50);

  if (!records || records.length === 0) {
    return (
      <div className="rounded-xl border border-dashed px-6 py-12 text-center text-muted-foreground text-sm">
        Belum ada catatan clock-in.
      </div>
    );
  }

  const suspiciousCount = records.filter((r) => r.suspicious_flag).length;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm">
        <p className="text-muted-foreground">{records.length} catatan terakhir</p>
        {suspiciousCount > 0 && (
          <Badge variant="destructive" className="gap-1">
            <AlertTriangle className="h-3 w-3" />
            {suspiciousCount} mencurigakan
          </Badge>
        )}
      </div>

      <div className="rounded-lg border overflow-hidden divide-y">
        {records.map((r) => {
          const branch = Array.isArray(r.branches) ? r.branches[0] : r.branches;
          return (
            <div
              key={r.id}
              className={`flex items-center justify-between px-4 py-3 text-sm gap-3 ${r.suspicious_flag ? "bg-destructive/5" : ""}`}
            >
              <div className="space-y-0.5 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium">
                    {new Date(r.clock_in_date).toLocaleDateString("id-ID", {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                  {r.suspicious_flag && (
                    <AlertTriangle className="h-3.5 w-3.5 text-destructive shrink-0" />
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(r.clock_in_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                  {r.clock_in_distance_m != null && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {Math.round(r.clock_in_distance_m)} m
                    </span>
                  )}
                  {branch?.name && <span>{branch.name}</span>}
                </div>
                {r.notes && (
                  <p className="text-xs text-muted-foreground italic truncate max-w-xs">{r.notes}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
