"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { createHolidaySchema, type CreateHolidayInput } from "@/lib/schemas/coach-invoice";
import { createHoliday, deleteHoliday } from "@/lib/actions/coach-invoice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Plus, Trash2, CalendarOff } from "lucide-react";

interface Branch {
  id: string;
  name: string;
}

interface ClassItem {
  id: string;
  name: string;
  branch_id: string;
}

interface HolidayRow {
  id: string;
  holiday_date: string;
  name: string;
  branch_id: string | null;
  class_id: string | null;
  branch_name: string | null;
  class_name: string | null;
}

interface Props {
  branches: Branch[];
  classes: ClassItem[];
  holidays: HolidayRow[];
}

function formatDate(d: string) {
  return new Date(d + "T00:00:00").toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function HolidayManager({ branches, classes, holidays }: Props) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [scopeType, setScopeType] = useState<"branch" | "class">("branch");
  const [selectedBranch, setSelectedBranch] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CreateHolidayInput>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(createHolidaySchema) as any,
  });

  const filteredClasses = classes.filter((c) =>
    selectedBranch ? c.branch_id === selectedBranch : true
  );

  function onSubmit(data: CreateHolidayInput) {
    startTransition(async () => {
      const formData = new FormData();
      if (data.branch_id) formData.set("branch_id", data.branch_id);
      if (data.class_id) formData.set("class_id", data.class_id);
      formData.set("holiday_date", data.holiday_date);
      formData.set("name", data.name);

      const result = await createHoliday(formData);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Hari libur berhasil ditambahkan");
      reset();
      setScopeType("branch");
      setSelectedBranch("");
      setOpen(false);
    });
  }

  function handleDelete(id: string) {
    setDeletingId(id);
    startTransition(async () => {
      const result = await deleteHoliday(id);
      setDeletingId(null);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Hari libur dihapus");
    });
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Hari Libur</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Kelola hari libur per cabang atau per kelas.
          </p>
        </div>
        <Button size="sm" className="gap-1.5" onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" />
          Tambah Libur
        </Button>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tambah Hari Libur</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
              {/* Scope */}
              <div className="space-y-1.5">
                <Label>Berlaku Untuk</Label>
                <Select
                  value={scopeType}
                  onValueChange={(v) => {
                    setScopeType(v as "branch" | "class");
                    setValue("branch_id", "");
                    setValue("class_id", "");
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="branch">Seluruh Cabang</SelectItem>
                    <SelectItem value="class">Kelas Tertentu</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {scopeType === "branch" ? (
                <div className="space-y-1.5">
                  <Label>Cabang</Label>
                  <Select
                    onValueChange={(v) => {
                      setSelectedBranch(v);
                      setValue("branch_id", v, { shouldValidate: true });
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
                  {errors.branch_id && (
                    <p className="text-xs text-destructive">{errors.branch_id.message}</p>
                  )}
                </div>
              ) : (
                <>
                  <div className="space-y-1.5">
                    <Label>Cabang (untuk filter kelas)</Label>
                    <Select
                      onValueChange={(v) => {
                        setSelectedBranch(v);
                        setValue("class_id", "");
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
                  </div>
                  <div className="space-y-1.5">
                    <Label>Kelas</Label>
                    <Select
                      onValueChange={(v) => setValue("class_id", v, { shouldValidate: true })}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Pilih kelas" />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredClasses.map((c) => (
                          <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.branch_id && (
                      <p className="text-xs text-destructive">{errors.branch_id.message}</p>
                    )}
                  </div>
                </>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="holiday_date">Tanggal</Label>
                <Input id="holiday_date" type="date" {...register("holiday_date")} />
                {errors.holiday_date && (
                  <p className="text-xs text-destructive">{errors.holiday_date.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="name">Keterangan</Label>
                <Input
                  id="name"
                  {...register("name")}
                  placeholder="Contoh: Hari Raya Idul Fitri"
                />
                {errors.name && (
                  <p className="text-xs text-destructive">{errors.name.message}</p>
                )}
              </div>

              <div className="flex gap-2 pt-1">
                <Button type="submit" size="sm" disabled={isPending}>
                  {isPending ? "Menyimpan..." : "Simpan"}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => setOpen(false)}
                  disabled={isPending}
                >
                  Batal
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* List */}
      {holidays.length === 0 ? (
        <div className="rounded-xl border px-4 py-12 text-center">
          <CalendarOff className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Belum ada hari libur yang ditambahkan.</p>
        </div>
      ) : (
        <div className="rounded-xl border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 border-b">
              <tr>
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Tanggal</th>
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Keterangan</th>
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Berlaku Untuk</th>
                <th className="px-4 py-2.5" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {holidays.map((h) => (
                <tr key={h.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 font-medium whitespace-nowrap">
                    {formatDate(h.holiday_date)}
                  </td>
                  <td className="px-4 py-3">{h.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {h.class_id
                      ? `Kelas: ${h.class_name ?? "—"}`
                      : `Cabang: ${h.branch_name ?? "—"}`}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      className="text-destructive hover:text-destructive"
                      disabled={isPending && deletingId === h.id}
                      onClick={() => handleDelete(h.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
