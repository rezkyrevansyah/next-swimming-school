"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createSemester } from "@/lib/actions/rapot";

interface Branch {
  id: string;
  name: string;
}

export function CreateSemesterForm({ branches }: { branches: Branch[] }) {
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await createSemester(formData);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Semester berhasil dibuat.");
        (e.target as HTMLFormElement).reset();
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="name">Nama Semester</Label>
          <Input id="name" name="name" required placeholder="Semester 1 2025" />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="branch_id">Cabang</Label>
          <select
            id="branch_id"
            name="branch_id"
            required
            defaultValue=""
            className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="" disabled>Pilih cabang...</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="start_date">Tanggal Mulai</Label>
          <Input id="start_date" name="start_date" type="date" required />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="end_date">Tanggal Selesai</Label>
          <Input id="end_date" name="end_date" type="date" required />
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="input_deadline">Deadline Input Rapot Pelatih</Label>
          <Input id="input_deadline" name="input_deadline" type="date" required />
          <p className="text-xs text-muted-foreground">
            Setelah tanggal ini, pelatih tidak bisa lagi menginput atau mengubah rapot.
          </p>
        </div>
      </div>

      <Button type="submit" disabled={isPending} size="sm">
        {isPending ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Menyimpan...</> : "Buat Semester"}
      </Button>
    </form>
  );
}
