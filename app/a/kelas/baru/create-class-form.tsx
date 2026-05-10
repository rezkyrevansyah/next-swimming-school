"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { createClassSchema, type CreateClassInput } from "@/lib/schemas/class";
import { createClass } from "@/lib/actions/class";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Branch {
  id: string;
  name: string;
}

export function CreateClassForm({ branches }: { branches: Branch[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateClassInput>({
    resolver: zodResolver(createClassSchema),
    defaultValues: {
      capacity: 20,
      sessions_per_month: 8,
      monthly_price: 0,
      status: "active",
    },
  });

  const nameValue = watch("name");

  function onNameBlur() {
    if (nameValue) {
      const slug = nameValue
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");
      setValue("slug", slug, { shouldValidate: true });
    }
  }

  function onSubmit(data: CreateClassInput) {
    startTransition(async () => {
      const formData = new FormData();
      Object.entries(data).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== "") {
          formData.set(k, String(v));
        }
      });

      const result = await createClass(formData);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Kelas berhasil ditambahkan");
      router.push(`/a/kelas/${result.data?.id}`);
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Informasi Kelas</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2 space-y-1.5">
            <Label htmlFor="name">
              Nama Kelas <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              {...register("name")}
              onBlur={onNameBlur}
              placeholder="Kelas Renang Pemula A"
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="sm:col-span-2 space-y-1.5">
            <Label htmlFor="slug">
              Slug <span className="text-destructive">*</span>
            </Label>
            <Input
              id="slug"
              {...register("slug")}
              placeholder="kelas-renang-pemula-a"
            />
            {errors.slug && (
              <p className="text-xs text-destructive">{errors.slug.message}</p>
            )}
          </div>

          <div className="sm:col-span-2 space-y-1.5">
            <Label htmlFor="description">Deskripsi</Label>
            <Input
              id="description"
              {...register("description")}
              placeholder="Kelas renang untuk pemula usia 6-12 tahun"
            />
          </div>

          <div className="space-y-1.5">
            <Label>
              Cabang <span className="text-destructive">*</span>
            </Label>
            <Select
              onValueChange={(v) =>
                setValue("branch_id", v, { shouldValidate: true })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Pilih cabang" />
              </SelectTrigger>
              <SelectContent>
                {branches.map((b) => (
                  <SelectItem key={b.id} value={b.id}>
                    {b.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.branch_id && (
              <p className="text-xs text-destructive">{errors.branch_id.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label>Status</Label>
            <Select
              defaultValue="active"
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Detail Kelas</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="capacity">Kapasitas</Label>
            <Input
              id="capacity"
              type="number"
              min={1}
              {...register("capacity")}
            />
            {errors.capacity && (
              <p className="text-xs text-destructive">{errors.capacity.message}</p>
            )}
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
              placeholder="0"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="location_name">Lokasi / Kolam</Label>
            <Input
              id="location_name"
              {...register("location_name")}
              placeholder="Kolam A, Lantai 1"
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
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Menyimpan..." : "Simpan Kelas"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/a/kelas")}
          disabled={isPending}
        >
          Batal
        </Button>
      </div>
    </form>
  );
}
