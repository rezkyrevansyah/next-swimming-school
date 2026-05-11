"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { createCoachSchema, type CreateCoachInput } from "@/lib/schemas/coach";
import { createCoach } from "@/lib/actions/coach";
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

export function CreateCoachForm({ branches }: { branches: Branch[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CreateCoachInput>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(createCoachSchema) as any,
  });

  function onSubmit(data: CreateCoachInput) {
    startTransition(async () => {
      const formData = new FormData();
      Object.entries(data).forEach(([k, v]) => {
        if (v !== undefined && v !== null) formData.set(k, String(v));
      });

      const result = await createCoach(formData);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Pelatih berhasil ditambahkan");
      router.push(`/a/coach/${result.data?.id}`);
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Identitas Pelatih</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2 space-y-1.5">
            <Label htmlFor="full_name">
              Nama Lengkap <span className="text-destructive">*</span>
            </Label>
            <Input id="full_name" {...register("full_name")} />
            {errors.full_name && (
              <p className="text-xs text-destructive">{errors.full_name.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="nickname">Nama Panggilan</Label>
            <Input id="nickname" {...register("nickname")} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="dob">Tanggal Lahir</Label>
            <Input id="dob" type="date" {...register("dob")} />
          </div>

          <div className="space-y-1.5">
            <Label>Jenis Kelamin</Label>
            <Select
              onValueChange={(v) =>
                setValue("gender", v as "male" | "female")
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Pilih jenis kelamin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Laki-laki</SelectItem>
                <SelectItem value="female">Perempuan</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="phone">Nomor Telepon</Label>
            <Input id="phone" {...register("phone")} type="tel" />
          </div>

          <div className="sm:col-span-2 space-y-1.5">
            <Label htmlFor="specializations">
              Spesialisasi{" "}
              <span className="text-muted-foreground text-xs">(pisahkan dengan koma)</span>
            </Label>
            <Input
              id="specializations"
              {...register("specializations")}
              placeholder="Gaya bebas, Gaya punggung, ..."
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Akun &amp; Penugasan</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">
              Email <span className="text-destructive">*</span>
            </Label>
            <Input id="email" type="email" {...register("email")} />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password">
              Kata Sandi <span className="text-destructive">*</span>
            </Label>
            <Input id="password" type="password" {...register("password")} placeholder="Min. 8 karakter" />
            {errors.password && (
              <p className="text-xs text-destructive">{errors.password.message}</p>
            )}
          </div>

          <div className="sm:col-span-2 space-y-1.5">
            <Label>
              Cabang <span className="text-destructive">*</span>
            </Label>
            <Select
              onValueChange={(v) =>
                setValue("branch_id", v, { shouldValidate: true })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Pilih cabang utama" />
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
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Menyimpan..." : "Simpan Pelatih"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/a/coach")}
          disabled={isPending}
        >
          Batal
        </Button>
      </div>
    </form>
  );
}
