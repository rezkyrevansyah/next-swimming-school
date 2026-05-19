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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Branch {
  branch_id: string;
  is_primary: boolean;
  name: string;
}

interface Props {
  coach: { id: string; status: string };
  profile: {
    full_name: string;
    nickname?: string | null;
    dob?: string | null;
    gender?: string | null;
    phone?: string | null;
    specializations?: string[] | null;
    alamat?: string | null;
    pendidikan_nama?: string | null;
    pendidikan_tahun?: number | null;
    nomor_rekening?: string | null;
    nama_bank?: string | null;
    bio?: string | null;
  } | null;
  email: string | null;
  branches: Branch[];
}

export function CoachProfileTab({ coach, profile, email, branches }: Props) {
  const [editing, setEditing] = useState(false);
  const [isPending, startTransition] = useTransition();

  const { register, handleSubmit, setValue, formState: { errors } } =
    useForm<UpdateCoachInput>({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(updateCoachSchema) as any,
      defaultValues: {
        id: coach.id,
        full_name: profile?.full_name ?? "",
        nickname: profile?.nickname ?? "",
        dob: profile?.dob ?? "",
        gender: (profile?.gender as "male" | "female") ?? undefined,
        phone: profile?.phone ?? "",
        specializations: profile?.specializations?.join(", ") ?? "",
        alamat: profile?.alamat ?? "",
        pendidikan_nama: profile?.pendidikan_nama ?? "",
        pendidikan_tahun: profile?.pendidikan_tahun ?? undefined,
        nomor_rekening: profile?.nomor_rekening ?? "",
        nama_bank: profile?.nama_bank ?? "",
        bio: profile?.bio ?? "",
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
            <div className="sm:col-span-2">
              <dt className="text-muted-foreground">Bio</dt>
              <dd className="mt-0.5">{profile?.bio || "—"}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-muted-foreground">Alamat</dt>
              <dd className="mt-0.5">{profile?.alamat || "—"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Pendidikan</dt>
              <dd className="mt-0.5">
                {profile?.pendidikan_nama
                  ? `${profile.pendidikan_nama}${profile.pendidikan_tahun ? ` (${profile.pendidikan_tahun})` : ""}`
                  : "—"}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Rekening</dt>
              <dd className="mt-0.5">
                {profile?.nomor_rekening
                  ? `${profile.nomor_rekening}${profile.nama_bank ? ` — ${profile.nama_bank}` : ""}`
                  : "—"}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Email</dt>
              <dd className="mt-0.5 font-mono text-xs">{email ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Cabang</dt>
              <dd className="mt-0.5">
                {branches.length === 0
                  ? "—"
                  : branches.map((b) => (
                      <span key={b.branch_id} className="inline-flex items-center gap-1 mr-2">
                        {b.name}
                        {b.is_primary && (
                          <span className="text-xs bg-primary/10 text-primary rounded-full px-1.5 py-0.5">Utama</span>
                        )}
                      </span>
                    ))}
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

          <div className="sm:col-span-2 space-y-1.5">
            <Label htmlFor="bio">Bio</Label>
            <Textarea id="bio" {...register("bio")} rows={3} placeholder="Deskripsi singkat pelatih..." />
          </div>

          <div className="sm:col-span-2 space-y-1.5">
            <Label htmlFor="alamat">Alamat</Label>
            <Textarea id="alamat" {...register("alamat")} rows={2} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="pendidikan_nama">Pendidikan (Nama Instansi)</Label>
            <Input id="pendidikan_nama" {...register("pendidikan_nama")} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="pendidikan_tahun">Tahun Lulus</Label>
            <Input id="pendidikan_tahun" type="number" {...register("pendidikan_tahun")} min={1970} max={2100} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="nomor_rekening">Nomor Rekening</Label>
            <Input id="nomor_rekening" {...register("nomor_rekening")} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="nama_bank">Nama Bank</Label>
            <Input id="nama_bank" {...register("nama_bank")} />
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
