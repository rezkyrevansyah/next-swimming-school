"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { createClient } from "@/utils/supabase/client";
import { submitMemberLeave, cancelMemberLeave } from "@/lib/actions/member-leave";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarOff, Trash2 } from "lucide-react";

interface EnrolledClass {
  class_id: string;
  name: string;
}

interface LeaveRecord {
  id: string;
  class_id: string;
  leave_date: string;
  reason: string | null;
  class_name: string;
}

interface Props {
  memberId: string;
  initialClasses: EnrolledClass[];
  initialLeaves: LeaveRecord[];
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
}

export function IzinClient({ memberId, initialClasses, initialLeaves }: Props) {
  const supabase = createClient();
  const [classes] = useState<EnrolledClass[]>(initialClasses);
  const [leaves, setLeaves] = useState<LeaveRecord[]>(initialLeaves);
  const [selectedClass, setSelectedClass] = useState("");
  const [isPending, startTransition] = useTransition();
  const [cancelId, setCancelId] = useState<string | null>(null);
  const { register, handleSubmit, reset, setValue } = useForm<{
    class_id: string;
    leave_date: string;
    reason: string;
  }>({
    defaultValues: { reason: "" },
  });

  async function refreshLeaves() {
    const todayDate = new Date().toISOString().slice(0, 10);
    const { data: leaveData } = await supabase
      .from("member_leaves")
      .select("id, class_id, leave_date, reason, classes(name)")
      .eq("member_id", memberId)
      .gte("leave_date", todayDate)
      .order("leave_date", { ascending: true });

    setLeaves(
      (leaveData ?? []).map((l) => {
        const cls = Array.isArray(l.classes) ? l.classes[0] : l.classes;
        return {
          id: l.id,
          class_id: l.class_id,
          leave_date: l.leave_date,
          reason: l.reason,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          class_name: (cls as any)?.name ?? "—",
        };
      })
    );
  }

  function onSubmit(data: { class_id: string; leave_date: string; reason: string }) {
    if (!data.class_id) { toast.error("Pilih kelas terlebih dahulu"); return; }
    if (!data.leave_date) { toast.error("Pilih tanggal izin"); return; }

    startTransition(async () => {
      const formData = new FormData();
      formData.set("class_id", data.class_id);
      formData.set("leave_date", data.leave_date);
      if (data.reason) formData.set("reason", data.reason);

      const result = await submitMemberLeave(formData);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Izin berhasil diajukan");
      reset({ reason: "", leave_date: "", class_id: "" });
      setSelectedClass("");
      await refreshLeaves();
    });
  }

  function handleCancel(id: string) {
    setCancelId(id);
    startTransition(async () => {
      const result = await cancelMemberLeave(id);
      setCancelId(null);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Izin dibatalkan");
      await refreshLeaves();
    });
  }

  return (
    <div className="p-4 space-y-6 max-w-lg mx-auto pb-24">
      <div className="pt-2">
        <h1 className="text-xl font-semibold">Izin Tidak Hadir</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Ajukan izin untuk kelas yang tidak bisa kamu hadiri.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 rounded-xl border bg-card p-4">
        <h2 className="text-sm font-semibold">Ajukan Izin Baru</h2>

        <div className="space-y-1.5">
          <Label>Kelas</Label>
          <Select
            value={selectedClass}
            onValueChange={(v) => {
              setSelectedClass(v);
              setValue("class_id", v);
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Pilih kelas" />
            </SelectTrigger>
            <SelectContent>
              {classes.map((c) => (
                <SelectItem key={c.class_id} value={c.class_id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="leave_date">Tanggal Izin</Label>
          <Input
            id="leave_date"
            type="date"
            {...register("leave_date")}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="reason">Alasan (opsional)</Label>
          <Input
            id="reason"
            {...register("reason")}
            placeholder="Contoh: sakit, acara keluarga, dll."
          />
        </div>

        <Button type="submit" size="sm" disabled={isPending}>
          {isPending ? "Menyimpan..." : "Ajukan Izin"}
        </Button>
      </form>

      {/* Upcoming leaves */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">
          Izin Mendatang
        </h2>
        {leaves.length === 0 ? (
          <div className="rounded-xl border px-4 py-8 text-center">
            <CalendarOff className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Tidak ada izin yang diajukan.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {leaves.map((l) => (
              <div key={l.id} className="rounded-xl border bg-card px-4 py-3 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{l.class_name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{formatDate(l.leave_date)}</p>
                  {l.reason && (
                    <p className="text-xs text-muted-foreground mt-0.5 italic">{l.reason}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant="outline" className="text-xs">Izin</Badge>
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    className="text-destructive hover:text-destructive"
                    disabled={isPending && cancelId === l.id}
                    onClick={() => handleCancel(l.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
