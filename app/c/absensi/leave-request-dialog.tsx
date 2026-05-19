"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { submitLeaveRequest } from "@/lib/actions/coach";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Props {
  classId: string;
  className: string;
  leaveDate: string;
  replacementCoaches: { id: string; full_name: string }[];
}

export function LeaveRequestDialog({ classId, className, leaveDate, replacementCoaches }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [replacementId, setReplacementId] = useState("");
  const [reason, setReason] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!replacementId) { toast.error("Pilih pelatih pengganti"); return; }

    startTransition(async () => {
      const result = await submitLeaveRequest({
        class_id: classId,
        leave_date: leaveDate,
        replacement_coach_id: replacementId,
        reason: reason || undefined,
      });
      if (result.error) { toast.error(result.error); return; }
      toast.success("Izin berhasil diajukan");
      setOpen(false);
      setReplacementId("");
      setReason("");
      router.refresh();
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium transition-colors hover:bg-muted/50 text-muted-foreground hover:text-foreground"
      >
        <LogOut className="h-3.5 w-3.5" />
        Izin
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-base">Ajukan Izin</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="text-sm text-muted-foreground">
            Kelas: <strong className="text-foreground">{className}</strong>
            <br />
            Tanggal: <strong className="text-foreground">
              {new Date(leaveDate).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
            </strong>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="replacement">Pelatih Pengganti <span className="text-destructive">*</span></Label>
            {replacementCoaches.length === 0 ? (
              <p className="text-xs text-muted-foreground">Tidak ada pelatih lain di cabang ini.</p>
            ) : (
              <Select value={replacementId} onValueChange={setReplacementId}>
                <SelectTrigger id="replacement" className="w-full">
                  <SelectValue placeholder="Pilih pelatih pengganti" />
                </SelectTrigger>
                <SelectContent>
                  {replacementCoaches.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="reason">Alasan <span className="text-muted-foreground text-xs">(opsional)</span></Label>
            <Input
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Contoh: Sakit, urusan keluarga..."
              maxLength={500}
            />
          </div>

          <div className="flex gap-2 justify-end pt-1">
            <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)} disabled={isPending}>
              Batal
            </Button>
            <Button type="submit" size="sm" disabled={isPending || !replacementId || replacementCoaches.length === 0}>
              {isPending ? "Mengajukan..." : "Ajukan Izin"}
            </Button>
          </div>
        </form>
      </DialogContent>
      </Dialog>
    </>
  );
}
