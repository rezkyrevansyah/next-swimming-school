"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { createCoachRateSchema, type CreateCoachRateInput } from "@/lib/schemas/coach-invoice";
import { upsertCoachRate, deleteCoachRate } from "@/lib/actions/coach-invoice";
import { getRateLevel, RATE_LEVEL_LABEL, type CoachRateRow } from "@/lib/types/coach-invoice";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Trash2, DollarSign } from "lucide-react";

interface Branch { id: string; name: string; }
interface ClassItem { id: string; name: string; branch_id: string; }
interface CoachItem { id: string; full_name: string; branch_id: string | null; }

interface Props {
  branches: Branch[];
  classes: ClassItem[];
  coaches: CoachItem[];
  rates: (CoachRateRow & { branch_name?: string; class_name?: string; coach_name?: string })[];
}

function formatRupiah(n: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);
}

const LEVEL_BADGE_VARIANT: Record<string, "default" | "secondary" | "outline"> = {
  spesifik:  "default",
  per_kelas: "secondary",
  per_coach: "outline",
  default:   "outline",
};

export function RateManager({ branches, classes, coaches, rates }: Props) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedBranch, setSelectedBranch] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CreateCoachRateInput>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(createCoachRateSchema) as any,
    defaultValues: { effective_from: new Date().toISOString().slice(0, 10) },
  });

  const filteredClasses = classes.filter((c) => !selectedBranch || c.branch_id === selectedBranch);
  const filteredCoaches = coaches.filter((c) => !selectedBranch || c.branch_id === selectedBranch);

  function onSubmit(data: CreateCoachRateInput) {
    startTransition(async () => {
      const formData = new FormData();
      Object.entries(data).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== "") formData.set(k, String(v));
      });

      const result = await upsertCoachRate(formData);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Tarif berhasil disimpan");
      reset({ effective_from: new Date().toISOString().slice(0, 10) });
      setSelectedBranch("");
      setOpen(false);
    });
  }

  function handleDelete(id: string) {
    setDeletingId(id);
    startTransition(async () => {
      const result = await deleteCoachRate(id);
      setDeletingId(null);
      if (result.error) { toast.error(result.error); return; }
      toast.success("Tarif dihapus");
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Tarif Pelatih</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Atur tarif per sesi mengajar. Sistem menggunakan hierarki: Coach+Kelas → Per Kelas → Per Coach → Default Cabang.
          </p>
        </div>
        <Button size="sm" className="gap-1.5" onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" />
          Tambah Tarif
        </Button>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tambah Tarif Pelatih</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
              <div className="space-y-1.5">
                <Label>Cabang <span className="text-destructive">*</span></Label>
                <Select
                  onValueChange={(v) => {
                    setSelectedBranch(v);
                    setValue("branch_id", v, { shouldValidate: true });
                    setValue("class_id", "");
                    setValue("coach_id", "");
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pilih cabang" />
                  </SelectTrigger>
                  <SelectContent>
                    {branches.map((b) => (
                      <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.branch_id && <p className="text-xs text-destructive">{errors.branch_id.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label>Kelas <span className="text-muted-foreground text-xs">(opsional)</span></Label>
                <Select onValueChange={(v) => setValue("class_id", v === "_none" ? "" : v)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Semua kelas (default)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_none">— Semua kelas —</SelectItem>
                    {filteredClasses.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Coach <span className="text-muted-foreground text-xs">(opsional)</span></Label>
                <Select onValueChange={(v) => setValue("coach_id", v === "_none" ? "" : v)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Semua coach (default)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_none">— Semua coach —</SelectItem>
                    {filteredCoaches.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.full_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="rate_per_session">Tarif per Sesi (Rp) <span className="text-destructive">*</span></Label>
                  <Input
                    id="rate_per_session"
                    type="number"
                    min="0"
                    step="1000"
                    {...register("rate_per_session")}
                    placeholder="50000"
                  />
                  {errors.rate_per_session && <p className="text-xs text-destructive">{errors.rate_per_session.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="effective_from">Berlaku Dari <span className="text-destructive">*</span></Label>
                  <Input id="effective_from" type="date" {...register("effective_from")} />
                  {errors.effective_from && <p className="text-xs text-destructive">{errors.effective_from.message}</p>}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="notes">Catatan (opsional)</Label>
                <Input id="notes" {...register("notes")} placeholder="Misal: kenaikan rate Q3 2025" />
              </div>

              <div className="flex gap-2 pt-1">
                <Button type="submit" size="sm" disabled={isPending}>
                  {isPending ? "Menyimpan..." : "Simpan Tarif"}
                </Button>
                <Button type="button" size="sm" variant="ghost" onClick={() => setOpen(false)} disabled={isPending}>
                  Batal
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {rates.length === 0 ? (
        <div className="rounded-xl border px-4 py-12 text-center">
          <DollarSign className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Belum ada tarif yang dikonfigurasi.</p>
          <p className="text-xs text-muted-foreground mt-1">
            Tambahkan minimal satu tarif default per cabang agar invoice bisa digenerate.
          </p>
        </div>
      ) : (
        <div className="rounded-xl border overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 border-b">
              <tr>
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Level</th>
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Kelas</th>
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Coach</th>
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Cabang</th>
                <th className="text-right px-4 py-2.5 font-medium text-muted-foreground">Tarif/Sesi</th>
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Berlaku</th>
                <th className="px-4 py-2.5" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {rates.map((r) => {
                const level = getRateLevel(r);
                return (
                  <tr key={r.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3">
                      <Badge variant={LEVEL_BADGE_VARIANT[level] ?? "outline"} className="text-xs">
                        {RATE_LEVEL_LABEL[level]}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">{r.class_name ?? <span className="text-muted-foreground">—</span>}</td>
                    <td className="px-4 py-3">{r.coach_name ?? <span className="text-muted-foreground">—</span>}</td>
                    <td className="px-4 py-3 text-muted-foreground">{r.branch_name ?? "—"}</td>
                    <td className="px-4 py-3 text-right font-medium tabular-nums">
                      {formatRupiah(Number(r.rate_per_session))}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                      {new Date(r.effective_from + "T00:00:00").toLocaleDateString("id-ID", {
                        day: "numeric", month: "short", year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        size="icon-sm"
                        variant="ghost"
                        className="text-destructive hover:text-destructive"
                        disabled={isPending && deletingId === r.id}
                        onClick={() => handleDelete(r.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
