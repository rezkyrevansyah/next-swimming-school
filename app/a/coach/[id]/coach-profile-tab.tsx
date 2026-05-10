"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { updateCoachSchema, type UpdateCoachInput } from "@/lib/schemas/coach";
import { updateCoach } from "@/lib/actions/coach";
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

interface Props {
  coach: { id: string; status: string };
  profile: {
    full_name: string;
    nickname?: string | null;
    dob?: string | null;
    gender?: string | null;
    phone?: string | null;
    specializations?: string[] | null;
  } | null;
}

export function CoachProfileTab({ coach, profile }: Props) {
  const [editing, setEditing] = useState(false);
  const [isPending, startTransition] = useTransition();

  const { register, handleSubmit, setValue, formState: { errors } } =
    useForm<UpdateCoachInput>({
      resolver: zodResolver(updateCoachSchema),
      defaultValues: {
        id: coach.id,
        full_name: profile?.full_name ?? "",
        nickname: profile?.nickname ?? "",
        dob: profile?.dob ?? "",
        gender: (profile?.gender as "male" | "female") ?? undefined,
        phone: profile?.phone ?? "",
        specializations: profile?.specializations?.join(", ") ?? "",
      },
    });

  function onSubmit(data: UpdateCoachInput) {
    startTransition(async () => {
      const formData = new FormData();
      Object.entries(data).forEach(([k, v]) => {
        if (v !== undefined && v !== null) formData.set(k, String(v));
      });

      const result = await updateCoach(formData);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Profil berhasil diperbarui");
      setEditing(false);
    });
  }

  if (!editing) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Profil</span>
            <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
              Edit
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-muted-foreground">Nama Lengkap</dt>
              <dd className="font-medium mt-0.5">{profile?.full_name ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Nama Panggilan</dt>
              <dd className="mt-0.5">{profile?.nickname || "—"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Tanggal Lahir</dt>
              <dd className="mt-0.5">
                {profile?.dob
                  ? new Date(profile.dob).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })
                  : "—"}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Jenis Kelamin</dt>
              <dd className="mt-0.5">
                {profile?.gender === "male"
                  ? "Laki-laki"
                  : profile?.gender === "female"
                    ? "Perempuan"
                    : "—"}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Telepon</dt>
              <dd className="mt-0.5">{profile?.phone || "—"}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-muted-foreground">Spesialisasi</dt>
              <dd className="mt-0.5">
                {profile?.specializations?.join(", ") || "—"}
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Edit Profil</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input type="hidden" {...register("id")} />

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
              defaultValue={profile?.gender ?? undefined}
              onValueChange={(v) => setValue("gender", v as "male" | "female")}
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
              placeholder="Gaya bebas, Gaya punggung"
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
