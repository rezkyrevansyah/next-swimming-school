"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { createMemberSchema, type CreateMemberInput } from "@/lib/schemas/member";
import { createMember } from "@/lib/actions/member";
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

interface Props {
  branches: Branch[];
}

export function CreateMemberForm({ branches }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateMemberInput>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(createMemberSchema) as any,
    defaultValues: {
      phone_owner: "self",
      type: "regular",
      payment_handling: "individual",
    },
  });

  const phoneOwner = watch("phone_owner");
  const memberType = watch("type");

  function onSubmit(data: CreateMemberInput) {
    startTransition(async () => {
      const formData = new FormData();
      Object.entries(data).forEach(([k, v]) => {
        if (v !== undefined && v !== null) formData.set(k, String(v));
      });

      const result = await createMember(formData);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Anggota berhasil ditambahkan");
      router.push(`/a/member/${result.data?.id}`);
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Identitas */}
      <Card>
        <CardHeader>
          <CardTitle>Identitas Anggota</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2 space-y-1.5">
            <Label htmlFor="full_name">
              Nama Lengkap <span className="text-destructive">*</span>
            </Label>
            <Input
              id="full_name"
              {...register("full_name")}
              placeholder="Nama sesuai KTP / akta lahir"
            />
            {errors.full_name && (
              <p className="text-xs text-destructive">{errors.full_name.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="nickname">Nama Panggilan</Label>
            <Input
              id="nickname"
              {...register("nickname")}
              placeholder="Opsional"
            />
            {errors.nickname && (
              <p className="text-xs text-destructive">{errors.nickname.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="dob">
              Tanggal Lahir <span className="text-destructive">*</span>
            </Label>
            <Input id="dob" type="date" {...register("dob")} />
            {errors.dob && (
              <p className="text-xs text-destructive">{errors.dob.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label>
              Jenis Kelamin <span className="text-destructive">*</span>
            </Label>
            <Select
              onValueChange={(v) =>
                setValue("gender", v as "male" | "female", {
                  shouldValidate: true,
                })
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
            {errors.gender && (
              <p className="text-xs text-destructive">{errors.gender.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label>Pemilik Telepon</Label>
            <Select
              defaultValue="self"
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
            <Label htmlFor="phone">
              {phoneOwner === "parent" ? "Telepon Wali" : "Nomor Telepon"}
            </Label>
            <Input
              id="phone"
              {...register("phone")}
              placeholder="08xx-xxxx-xxxx"
              type="tel"
            />
            {errors.phone && (
              <p className="text-xs text-destructive">{errors.phone.message}</p>
            )}
          </div>

          {phoneOwner === "parent" && (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="parent_name">Nama Wali</Label>
                <Input
                  id="parent_name"
                  {...register("parent_name")}
                  placeholder="Nama orang tua / wali"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="parent_phone">Telepon Wali (alternatif)</Label>
                <Input
                  id="parent_phone"
                  {...register("parent_phone")}
                  placeholder="08xx-xxxx-xxxx"
                  type="tel"
                />
              </div>
            </>
          )}

          <div className="sm:col-span-2 space-y-1.5">
            <Label htmlFor="address">Alamat</Label>
            <Input
              id="address"
              {...register("address")}
              placeholder="Alamat tempat tinggal"
            />
          </div>

          <div className="sm:col-span-2 space-y-1.5">
            <Label htmlFor="health_history">Riwayat Kesehatan</Label>
            <Input
              id="health_history"
              {...register("health_history")}
              placeholder="Alergi, kondisi khusus, dll."
            />
          </div>
        </CardContent>
      </Card>

      {/* Data Keanggotaan */}
      <Card>
        <CardHeader>
          <CardTitle>Data Keanggotaan</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            <Label>
              Tipe Anggota <span className="text-destructive">*</span>
            </Label>
            <Select
              defaultValue="regular"
              onValueChange={(v) =>
                setValue("type", v as "regular" | "affiliate" | "private", {
                  shouldValidate: true,
                })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="regular">Reguler</SelectItem>
                <SelectItem value="affiliate">Afiliasi (Sekolah)</SelectItem>
                <SelectItem value="private">Private (1-on-1)</SelectItem>
              </SelectContent>
            </Select>
            {errors.type && (
              <p className="text-xs text-destructive">{errors.type.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label>Penanganan Pembayaran</Label>
            <Select
              defaultValue="individual"
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

          {memberType === "private" && (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="private_sessions_total">
                  Total Sesi Paket <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="private_sessions_total"
                  type="number"
                  min="1"
                  max="999"
                  {...register("private_sessions_total")}
                  placeholder="Contoh: 12"
                />
                {errors.private_sessions_total && (
                  <p className="text-xs text-destructive">{errors.private_sessions_total.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="private_package_price">Harga Paket (Rp)</Label>
                <Input
                  id="private_package_price"
                  type="number"
                  min="0"
                  {...register("private_package_price")}
                  placeholder="Contoh: 1500000"
                />
                {errors.private_package_price && (
                  <p className="text-xs text-destructive">{errors.private_package_price.message}</p>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Akun (opsional) */}
      <Card>
        <CardHeader>
          <CardTitle>Akun Aplikasi (Opsional)</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <p className="sm:col-span-2 text-sm text-muted-foreground">
            Jika diisi, anggota akan mendapatkan akun untuk login ke aplikasi.
            Isi email dan kata sandi yang bisa digunakan untuk login.
          </p>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              {...register("email")}
              placeholder="email@contoh.com"
            />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Kata Sandi</Label>
            <Input
              id="password"
              type="password"
              {...register("password")}
              placeholder="Min. 8 karakter"
            />
            {errors.password && (
              <p className="text-xs text-destructive">{errors.password.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Menyimpan..." : "Simpan Anggota"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/a/member")}
          disabled={isPending}
        >
          Batal
        </Button>
      </div>
    </form>
  );
}
