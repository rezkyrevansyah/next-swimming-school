import Link from "next/link";
import { BookOpen, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const DAYS = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

function formatTime(t: string) {
  return t.slice(0, 5);
}

interface Schedule {
  day_of_week: number;
  start_time: string;
  end_time: string;
}

interface ClassItem {
  id: string;
  name: string;
  status: string;
  class_schedules: Schedule[];
}

interface Props {
  classes: ClassItem[];
}

export function CoachClassTab({ classes }: Props) {
  if (classes.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-8 text-center border rounded-lg">
        Belum ditugaskan ke kelas manapun.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {classes.map((cls) => (
        <Link
          key={cls.id}
          href={`/a/kelas/${cls.id}`}
          className="flex items-start justify-between rounded-lg border px-4 py-3 hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-start gap-3">
            <BookOpen className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{cls.name}</span>
                <Badge variant={cls.status === "active" ? "default" : "outline"} className="text-xs">
                  {cls.status === "active" ? "Aktif" : cls.status}
                </Badge>
              </div>
              {cls.class_schedules.length > 0 && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {cls.class_schedules
                    .map((s) => `${DAYS[s.day_of_week]} ${formatTime(s.start_time)}–${formatTime(s.end_time)}`)
                    .join(" · ")}
                </p>
              )}
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
        </Link>
      ))}
    </div>
  );
}
