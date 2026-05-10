"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { saveSchedules } from "@/lib/actions/class";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const DAYS = [
  "Minggu",
  "Senin",
  "Selasa",
  "Rabu",
  "Kamis",
  "Jumat",
  "Sabtu",
] as const;

// Generate time options every 30 minutes
const TIME_OPTIONS: string[] = [];
for (let h = 5; h <= 21; h++) {
  TIME_OPTIONS.push(`${String(h).padStart(2, "0")}:00`);
  TIME_OPTIONS.push(`${String(h).padStart(2, "0")}:30`);
}

interface ScheduleRow {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
}

interface Props {
  classId: string;
  initialSchedules: ScheduleRow[];
}

interface DraftSchedule {
  key: string; // local key for react
  day_of_week: number;
  start_time: string;
  end_time: string;
}

export function ScheduleTab({ classId, initialSchedules }: Props) {
  const [isPending, startTransition] = useTransition();
  const [schedules, setSchedules] = useState<DraftSchedule[]>(
    initialSchedules.length > 0
      ? initialSchedules.map((s) => ({
          key: s.id,
          day_of_week: s.day_of_week,
          start_time: s.start_time.slice(0, 5),
          end_time: s.end_time.slice(0, 5),
        }))
      : []
  );
  const [dirty, setDirty] = useState(false);

  function addRow() {
    setSchedules((prev) => [
      ...prev,
      {
        key: crypto.randomUUID(),
        day_of_week: 1,
        start_time: "07:00",
        end_time: "08:00",
      },
    ]);
    setDirty(true);
  }

  function removeRow(key: string) {
    setSchedules((prev) => prev.filter((s) => s.key !== key));
    setDirty(true);
  }

  function updateRow(key: string, field: keyof DraftSchedule, value: string | number) {
    setSchedules((prev) =>
      prev.map((s) => (s.key === key ? { ...s, [field]: value } : s))
    );
    setDirty(true);
  }

  function handleSave() {
    // Validate end > start
    for (const s of schedules) {
      if (s.end_time <= s.start_time) {
        toast.error(`Jam selesai harus lebih dari jam mulai (${DAYS[s.day_of_week]})`);
        return;
      }
    }

    startTransition(async () => {
      const result = await saveSchedules(classId, schedules);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Jadwal berhasil disimpan");
      setDirty(false);
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Jadwal Kelas</span>
          <Button variant="outline" size="sm" onClick={addRow}>
            <Plus className="h-4 w-4" />
            Tambah Hari
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {schedules.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-6">
            Belum ada jadwal. Klik "Tambah Hari" untuk menambahkan.
          </p>
        )}

        {schedules.map((s) => (
          <div
            key={s.key}
            className="flex flex-wrap items-center gap-2 p-3 rounded-lg border bg-muted/30"
          >
            {/* Day */}
            <Select
              value={String(s.day_of_week)}
              onValueChange={(v) => updateRow(s.key, "day_of_week", Number(v))}
            >
              <SelectTrigger className="w-28">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DAYS.map((d, i) => (
                  <SelectItem key={i} value={String(i)}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <span className="text-sm text-muted-foreground">Pukul</span>

            {/* Start time */}
            <Select
              value={s.start_time}
              onValueChange={(v) => updateRow(s.key, "start_time", v)}
            >
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIME_OPTIONS.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <span className="text-sm text-muted-foreground">–</span>

            {/* End time */}
            <Select
              value={s.end_time}
              onValueChange={(v) => updateRow(s.key, "end_time", v)}
            >
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIME_OPTIONS.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => removeRow(s.key)}
              className="text-destructive hover:text-destructive ml-auto"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}

        {(dirty || schedules.length > 0) && (
          <div className="pt-2">
            <Button onClick={handleSave} disabled={isPending || !dirty} size="sm">
              {isPending ? "Menyimpan..." : "Simpan Jadwal"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
