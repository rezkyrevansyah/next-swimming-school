"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { updateClassSchema, type UpdateClassInput } from "@/lib/schemas/class";
import { updateClass } from "@/lib/actions/class";
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
import { Textarea } from "@/components/ui/textarea";
import { ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ClassData {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  status: string;
  capacity: number;
  sessions_per_month: number;
  monthly_price: number;
  age_range_min?: number | null;
  age_range_max?: number | null;
  location_name?: string | null;
  tujuan_title?: string | null;
  tujuan_description?: string | null;
  program_url?: string | null;
}

interface Props {
  cls: ClassData;
  branch: { id: string; name: string } | null;
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function ClassDetailTab({ cls, branch }: Props) {
  const [editing, setEditing] = useState(false);
  const [isPending, startTransition] = useTransition();

  const { register, handleSubmit, setValue, formState: { errors } } =
    useForm<UpdateClassInput>({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      resolver: zodResolver(updateClassSchema) as any,
      defaultValues: {
        id: cls.id,
        name: cls.name,
        slug: cls.slug,
        description: cls.description ?? "",
        status: (cls.status as "active" | "inactive") ?? "active",
        capacity: cls.capacity,
        sessions_per_month: cls.sessions_per_month,
        monthly_price: cls.monthly_price,
        age_range_min: cls.age_range_min ?? undefined,
        age_range_max: cls.age_range_max ?? undefined,
        location_name: cls.location_name ?? "",
        tujuan_title: cls.tujuan_title ?? "",
        tujuan_description: cls.tujuan_description ?? "",
        program_url: cls.program_url ?? "",
      },
    });

  function onSubmit(data: UpdateClassInput) {
    startTransition(async () => {
      const formData = new FormData();
      Object.entries(data).forEach(([k, v]) => {
        if (v !== undefined && v !== null) formData.set(k, String(v));
      });

      const result = await updateClass(formData);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Kelas berhasil diperbarui");
      setEditing(false);
    });
  }

  if (!editing) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Informasi Kelas</span>
              <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
                Edit
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-muted-foreground">Nama</dt>
                <dd className="font-medium mt-0.5">{cls.name}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Slug</dt>
                <dd className="font-mono mt-0.5">{cls.slug}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-muted-foreground">Deskripsi</dt>
                <dd className="mt-0.5">{cls.description || "—"}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Cabang</dt>
                <dd className="mt-0.5">{branch?.name ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Lokasi / Kolam</dt>
                <dd className="mt-0.5">{cls.location_name || "—"}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Kapasitas</dt>
                <dd className="mt-0.5">{cls.capacity} peserta</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Sesi per Bulan</dt>
                <dd className="mt-0.5">{cls.sessions_per_month} sesi</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Harga Bulanan</dt>
                <dd className="mt-0.5">
                  {cls.monthly_price > 0 ? formatCurrency(cls.monthly_price) : "Gratis"}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Rentang Usia</dt>
                <dd className="mt-0.5">
                  {cls.age_range_min != null && cls.age_range_max != null
                    ? `${cls.age_range_min} – ${cls.age_range_max} tahun`
                    : cls.age_range_min != null
                      ? `Min. ${cls.age_range_min} tahun`
                      : cls.age_range_max != null
                        ? `Maks. ${cls.age_range_max} tahun`
                        : "—"}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-muted-foreground">Tujuan Kelas</dt>
                <dd className="font-medium mt-0.5">{cls.tujuan_title || "—"}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-muted-foreground">Deskripsi Tujuan</dt>
                <dd className="mt-0.5 whitespace-pre-wrap text-sm">{cls.tujuan_description || "—"}</dd>
              </div>
              {cls.program_url && (
                <div className="sm:col-span-2">
                  <dt className="text-muted-foreground mb-1">Program Latihan</dt>
                  <dd>
                    <a
                      href={cls.program_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      Lihat Spreadsheet Program
                    </a>
                  </dd>
                </div>
              )}
            </dl>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Edit Kelas</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input type="hidden" {...register("id")} />

          <div className="sm:col-span-2 space-y-1.5">
            <Label htmlFor="name">Nama Kelas</Label>
            <Input id="name" {...register("name")} />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="sm:col-span-2 space-y-1.5">
            <Label htmlFor="slug">Slug</Label>
            <Input id="slug" {...register("slug")} />
            {errors.slug && (
              <p className="text-xs text-destructive">{errors.slug.message}</p>
            )}
          </div>

          <div className="sm:col-span-2 space-y-1.5">
            <Label htmlFor="description">Deskripsi</Label>
            <Input id="description" {...register("description")} />
          </div>

          <div className="space-y-1.5">
            <Label>Status</Label>
            <Select
              defaultValue={cls.status}
              onValueChange={(v) =>
                setValue("status", v as "active" | "inactive")
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Aktif</SelectItem>
                <SelectItem value="inactive">Tidak Aktif</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="location_name">Lokasi / Kolam</Label>
            <Input id="location_name" {...register("location_name")} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="capacity">Kapasitas</Label>
            <Input id="capacity" type="number" min={1} {...register("capacity")} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="sessions_per_month">Sesi per Bulan</Label>
            <Input
              id="sessions_per_month"
              type="number"
              min={1}
              {...register("sessions_per_month")}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="monthly_price">Harga Bulanan (Rp)</Label>
            <Input
              id="monthly_price"
              type="number"
              min={0}
              step={1000}
              {...register("monthly_price")}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="age_range_min">Usia Minimum</Label>
            <Input
              id="age_range_min"
              type="number"
              min={0}
              {...register("age_range_min")}
              placeholder="Opsional"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="age_range_max">Usia Maksimum</Label>
            <Input
              id="age_range_max"
              type="number"
              min={0}
              {...register("age_range_max")}
              placeholder="Opsional"
            />
          </div>

          <div className="sm:col-span-2 space-y-1.5">
            <Label htmlFor="tujuan_title">Tujuan Kelas</Label>
            <Input
              id="tujuan_title"
              {...register("tujuan_title")}
              placeholder="Contoh: Menguasai gaya bebas dasar"
            />
            {errors.tujuan_title && (
              <p className="text-xs text-destructive">{errors.tujuan_title.message}</p>
            )}
          </div>

          <div className="sm:col-span-2 space-y-1.5">
            <Label htmlFor="tujuan_description">Deskripsi Tujuan</Label>
            <Textarea
              id="tujuan_description"
              {...register("tujuan_description")}
              rows={3}
              placeholder="Jelaskan tujuan dan target pencapaian kelas ini..."
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Menyimpan..." : "Simpan Perubahan"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => setEditing(false)}
          disabled={isPending}
        >
          Batal
        </Button>
      </div>
    </form>
  );
}
