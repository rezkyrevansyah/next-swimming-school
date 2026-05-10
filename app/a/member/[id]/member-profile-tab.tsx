"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { updateMemberSchema, type UpdateMemberInput } from "@/lib/schemas/member";
import { updateMember } from "@/lib/actions/member";
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
  member: {
    id: string;
    type: string;
    payment_handling: string;
    status: string;
  };
  profile: {
    full_name: string;
    nickname?: string | null;
    dob: string;
    gender?: string | null;
    phone?: string | null;
    phone_owner: string;
    parent_name?: string | null;
    parent_phone?: string | null;
    address?: string | null;
    health_history?: string | null;
  } | null;
  branch: { id: string; name: string } | null;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function MemberProfileTab({ member, profile, branch }: Props) {
  const [editing, setEditing] = useState(false);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<UpdateMemberInput>({
    resolver: zodResolver(updateMemberSchema),
    defaultValues: {
      id: member.id,
      full_name: profile?.full_name ?? "",
      nickname: profile?.nickname ?? "",
      dob: profile?.dob ?? "",
      gender: (profile?.gender as "male" | "female") ?? undefined,
      phone: profile?.phone ?? "",
      phone_owner: (profile?.phone_owner as "self" | "parent") ?? "self",
      parent_name: profile?.parent_name ?? "",
      parent_phone: profile?.parent_phone ?? "",
      address: profile?.address ?? "",
      health_history: profile?.health_history ?? "",
      type: (member.type as "regular" | "affiliate") ?? "regular",
      payment_handling:
        (member.payment_handling as "individual" | "covered_by_school") ??
        "individual",
    },
  });

  const phoneOwner = watch("phone_owner");

  function onSubmit(data: UpdateMemberInput) {
    startTransition(async () => {
      const formData = new FormData();
      Object.entries(data).forEach(([k, v]) => {
        if (v !== undefined && v !== null) formData.set(k, String(v));
      });

      const result = await updateMember(formData);
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
      <div className="space-y-6">
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
                  {profile?.dob ? formatDate(profile.dob) : "—"}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Jenis Kelamin</dt>
                <dd className="mt-0.5 capitalize">
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
              <div>
                <dt className="text-muted-foreground">Pemilik Telepon</dt>
                <dd className="mt-0.5">
                  {profile?.phone_owner === "parent" ? "Orang Tua / Wali" : "Diri Sendiri"}
                </dd>
              </div>
              {profile?.phone_owner === "parent" && (
                <>
                  <div>
                    <dt className="text-muted-foreground">Nama Wali</dt>
                    <dd className="mt-0.5">{profile?.parent_name || "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Telepon Wali</dt>
                    <dd className="mt-0.5">{profile?.parent_phone || "—"}</dd>
                  </div>
                </>
              )}
              <div className="sm:col-span-2">
                <dt className="text-muted-foreground">Alamat</dt>
                <dd className="mt-0.5">{profile?.address || "—"}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-muted-foreground">Riwayat Kesehatan</dt>
                <dd className="mt-0.5">{profile?.health_history || "—"}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Data Keanggotaan</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-muted-foreground">Cabang</dt>
                <dd className="font-medium mt-0.5">{branch?.name ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Tipe</dt>
                <dd className="mt-0.5 capitalize">
                  {member.type === "regular" ? "Reguler" : "Afiliasi"}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Pembayaran</dt>
                <dd className="mt-0.5">
                  {member.payment_handling === "individual"
                    ? "Mandiri"
                    : "Ditanggung Sekolah"}
                </dd>
              </div>
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
              onValueChange={(v) =>
                setValue("gender", v as "male" | "female", { shouldValidate: true })
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
            <Label>Pemilik Telepon</Label>
            <Select
              defaultValue={profile?.phone_owner ?? "self"}
              onValueChange={(v) =>
                setValue("phone_owner", v as "self" | "parent")
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="self">Diri Sendiri</SelectItem>
                <SelectItem value="parent">Orang Tua / Wali</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="phone">Nomor Telepon</Label>
            <Input id="phone" {...register("phone")} type="tel" />
          </div>

          {phoneOwner === "parent" && (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="parent_name">Nama Wali</Label>
                <Input id="parent_name" {...register("parent_name")} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="parent_phone">Telepon Wali</Label>
                <Input id="parent_phone" {...register("parent_phone")} type="tel" />
              </div>
            </>
          )}

          <div className="sm:col-span-2 space-y-1.5">
            <Label htmlFor="address">Alamat</Label>
            <Input id="address" {...register("address")} />
          </div>

          <div className="sm:col-span-2 space-y-1.5">
            <Label htmlFor="health_history">Riwayat Kesehatan</Label>
            <Input id="health_history" {...register("health_history")} />
          </div>

          <div className="space-y-1.5">
            <Label>Tipe Anggota</Label>
            <Select
              defaultValue={member.type}
              onValueChange={(v) =>
                setValue("type", v as "regular" | "affiliate")
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="regular">Reguler</SelectItem>
                <SelectItem value="affiliate">Afiliasi (Sekolah)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Penanganan Pembayaran</Label>
            <Select
              defaultValue={member.payment_handling}
              onValueChange={(v) =>
                setValue(
                  "payment_handling",
                  v as "individual" | "covered_by_school"
                )
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="individual">Mandiri</SelectItem>
                <SelectItem value="covered_by_school">Ditanggung Sekolah</SelectItem>
              </SelectContent>
            </Select>
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
