"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { createManualAttendance } from "@/lib/actions/attendance";

interface Member { id: string; label: string; }
interface Class { id: string; name: string; }

const STATUS_OPTIONS = [
  { value: "permitted", label: "Izin" },
  { value: "sick", label: "Sakit" },
  { value: "present", label: "Hadir" },
  { value: "late", label: "Terlambat" },
  { value: "absent", label: "Alpha" },
];

export function ManualAttendanceForm({ members, classes }: { members: Member[]; classes: Class[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await createManualAttendance(formData);
      if (res.error) {
        setError(res.error);
      } else {
        toast.success("Absensi berhasil disimpan.");
        router.push("/a/absensi");
      }
    });
  }

  const selectCls =
    "w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-ring";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="member_id">Anggota *</Label>
        <select id="member_id" name="member_id" required defaultValue="" className={selectCls}>
          <option value="" disabled>Pilih anggota...</option>
          {members.map((m) => (
            <option key={m.id} value={m.id}>{m.label}</option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="class_id">Kelas *</Label>
        <select id="class_id" name="class_id" required defaultValue="" className={selectCls}>
          <option value="" disabled>Pilih kelas...</option>
          {classes.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="session_date">Tanggal Sesi *</Label>
          <input
            id="session_date"
            name="session_date"
            type="date"
            required
            defaultValue={new Date().toISOString().slice(0, 10)}
            className={selectCls}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="status">Status *</Label>
          <select id="status" name="status" required defaultValue="permitted" className={selectCls}>
            {STATUS_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="notes">Keterangan</Label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          placeholder="Alasan izin / sakit / catatan tambahan..."
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {error && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={isPending} className="flex-1">
          {isPending ? (
            <><Loader2 className="h-4 w-4 animate-spin mr-2" />Menyimpan...</>
          ) : (
            "Simpan Absensi"
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/a/absensi")}
        >
          Batal
        </Button>
      </div>
    </form>
  );
}
