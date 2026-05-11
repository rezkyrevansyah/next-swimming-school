"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Save, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { upsertReportCard, publishReportCard } from "@/lib/actions/rapot";

// Default swimming skills to assess
const DEFAULT_SKILLS = [
  { key: "teknik_dasar", label: "Teknik Dasar" },
  { key: "teknik_napas", label: "Teknik Napas" },
  { key: "koordinasi", label: "Koordinasi Gerak" },
  { key: "kecepatan", label: "Kecepatan" },
  { key: "ketahanan", label: "Ketahanan" },
  { key: "kedisiplinan", label: "Kedisiplinan" },
];

const SCORE_LABELS: Record<number, string> = {
  1: "1 - Perlu Banyak Latihan",
  2: "2 - Berkembang",
  3: "3 - Cukup",
  4: "4 - Baik",
  5: "5 - Sangat Baik",
};

interface AttendanceStats {
  present: number;
  late: number;
  permitted: number;
  sick: number;
  absent: number;
  sessions_total: number;
}

interface ExistingReport {
  id: string;
  sessions_total: number;
  sessions_present: number;
  sessions_late: number;
  sessions_permitted: number;
  sessions_sick: number;
  sessions_absent: number;
  skill_scores: Record<string, number>;
  coach_notes: string | null;
  goals_achieved: string | null;
  next_goals: string | null;
  status: string;
}

interface Props {
  memberId: string;
  classId: string;
  semesterId: string;
  coachId: string;
  coachAuthId: string;
  memberName: string;
  semesterName: string;
  attendanceStats: AttendanceStats;
  existing: ExistingReport | null;
  canEdit: boolean;
}

export function ReportCardForm({
  memberId, classId, semesterId, coachId,
  memberName, attendanceStats, existing, canEdit,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Use auto-calculated attendance from records, or allow manual override
  const [useManuaAttendance, setUseManualAttendance] = useState(!!existing);
  const [skillScores, setSkillScores] = useState<Record<string, number>>(
    existing?.skill_scores ?? {}
  );

  const attendanceRate = attendanceStats.sessions_total > 0
    ? Math.round(((attendanceStats.present + attendanceStats.late) / attendanceStats.sessions_total) * 100)
    : 0;

  function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    // Inject hidden fields
    formData.set("semester_id", semesterId);
    formData.set("member_id", memberId);
    formData.set("class_id", classId);
    formData.set("coach_id", coachId);

    // Inject skill scores
    Object.entries(skillScores).forEach(([key, value]) => {
      formData.set(`skill_${key}`, String(value));
    });

    startTransition(async () => {
      const res = await upsertReportCard(formData);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Rapot disimpan sebagai draft.");
        router.push("/c/rapot");
      }
    });
  }

  function handlePublish() {
    if (!existing?.id) {
      toast.error("Simpan draft dulu sebelum dipublikasikan.");
      return;
    }
    if (!confirm(`Publikasikan rapot ${memberName}? Setelah dipublikasikan, rapot tidak bisa diubah.`)) return;

    startTransition(async () => {
      const res = await publishReportCard(existing.id);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Rapot berhasil dipublikasikan! Member dapat melihatnya.");
        router.push("/c/rapot");
      }
    });
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* Attendance stats (read-only from records) */}
      <div className="rounded-xl border p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-sm">Rekap Kehadiran</h2>
          <span className={`text-base font-bold ${attendanceRate >= 80 ? "text-green-600" : attendanceRate >= 60 ? "text-amber-600" : "text-destructive"}`}>
            {attendanceRate}%
          </span>
        </div>
        <div className="grid grid-cols-5 gap-1 text-center text-xs">
          {[
            { label: "Hadir", value: attendanceStats.present + attendanceStats.late, name: "sessions_present", hidden_name: "sessions_late", color: "text-green-600" },
          ].map(() => null)}
          <div>
            <p className="text-lg font-bold text-green-600">{attendanceStats.present + attendanceStats.late}</p>
            <p className="text-muted-foreground">Hadir</p>
          </div>
          <div>
            <p className="text-lg font-bold text-blue-600">{attendanceStats.permitted}</p>
            <p className="text-muted-foreground">Izin</p>
          </div>
          <div>
            <p className="text-lg font-bold text-amber-600">{attendanceStats.sick}</p>
            <p className="text-muted-foreground">Sakit</p>
          </div>
          <div>
            <p className="text-lg font-bold text-destructive">{attendanceStats.absent}</p>
            <p className="text-muted-foreground">Alpha</p>
          </div>
          <div>
            <p className="text-lg font-bold">{attendanceStats.sessions_total}</p>
            <p className="text-muted-foreground">Total</p>
          </div>
        </div>

        {/* Hidden inputs for form submission */}
        <input type="hidden" name="sessions_total" value={attendanceStats.sessions_total} />
        <input type="hidden" name="sessions_present" value={attendanceStats.present} />
        <input type="hidden" name="sessions_late" value={attendanceStats.late} />
        <input type="hidden" name="sessions_permitted" value={attendanceStats.permitted} />
        <input type="hidden" name="sessions_sick" value={attendanceStats.sick} />
        <input type="hidden" name="sessions_absent" value={attendanceStats.absent} />
      </div>

      {/* Skill assessment */}
      <div className="space-y-3">
        <h2 className="font-semibold text-sm">Penilaian Kemampuan</h2>
        {DEFAULT_SKILLS.map((skill) => (
          <div key={skill.key} className="space-y-1.5">
            <Label className="text-sm">{skill.label}</Label>
            <select
              value={skillScores[skill.key] ?? ""}
              onChange={(e) => {
                const val = e.target.value ? Number(e.target.value) : undefined;
                setSkillScores((prev) => {
                  const next = { ...prev };
                  if (val === undefined) delete next[skill.key];
                  else next[skill.key] = val;
                  return next;
                });
              }}
              disabled={!canEdit}
              className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-60"
            >
              <option value="">— Pilih nilai —</option>
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>{SCORE_LABELS[n]}</option>
              ))}
            </select>
          </div>
        ))}
      </div>

      {/* Narrative fields */}
      <div className="space-y-4">
        <h2 className="font-semibold text-sm">Catatan Pelatih</h2>

        <div className="space-y-1.5">
          <Label htmlFor="goals_achieved">Pencapaian Semester Ini</Label>
          <textarea
            id="goals_achieved"
            name="goals_achieved"
            rows={3}
            disabled={!canEdit}
            defaultValue={existing?.goals_achieved ?? ""}
            placeholder="Tuliskan pencapaian yang sudah dicapai siswa..."
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-60"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="next_goals">Target Semester Berikutnya</Label>
          <textarea
            id="next_goals"
            name="next_goals"
            rows={3}
            disabled={!canEdit}
            defaultValue={existing?.next_goals ?? ""}
            placeholder="Tuliskan target yang ingin dicapai semester berikutnya..."
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-60"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="coach_notes">Catatan Umum</Label>
          <textarea
            id="coach_notes"
            name="coach_notes"
            rows={4}
            disabled={!canEdit}
            defaultValue={existing?.coach_notes ?? ""}
            placeholder="Catatan tambahan untuk orang tua / siswa..."
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-60"
          />
        </div>
      </div>

      {/* Actions */}
      {canEdit && (
        <div className="flex gap-3 pb-4">
          <Button type="submit" disabled={isPending} className="flex-1 gap-2">
            <Save className="h-4 w-4" />
            Simpan Draft
          </Button>
          {existing && (
            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              onClick={handlePublish}
              className="flex-1 gap-2"
            >
              <Send className="h-4 w-4" />
              Publikasikan
            </Button>
          )}
        </div>
      )}
    </form>
  );
}
