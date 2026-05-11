"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { requestPasswordReset } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const schema = z.object({
  email: z.string().min(1, "Email wajib diisi").email("Format email tidak valid"),
});
type Input = z.infer<typeof schema>;

export function ForgotPasswordForm() {
  const [isPending, startTransition] = useTransition();
  const [sent, setSent] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<Input>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema) as any,
  });

  function onSubmit(values: Input) {
    startTransition(async () => {
      await requestPasswordReset(values.email);
      // Always show success to avoid email enumeration
      setSent(true);
    });
  }

  if (sent) {
    return (
      <div className="rounded-lg border bg-muted/40 px-5 py-6 text-center space-y-3">
        <p className="text-sm font-medium">Email terkirim!</p>
        <p className="text-sm text-muted-foreground">
          Jika email tersebut terdaftar, Anda akan menerima link untuk mengatur ulang password. Periksa folder spam jika tidak ada di kotak masuk.
        </p>
        <Link href="/login" className="text-sm text-primary underline underline-offset-4">
          Kembali ke halaman masuk
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="nama@email.com"
          {...register("email")}
        />
        {errors.email && (
          <p className="text-xs text-destructive">{errors.email.message}</p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Mengirim..." : "Kirim Link Reset Password"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Ingat password?{" "}
        <Link href="/login" className="text-primary underline underline-offset-4">
          Masuk
        </Link>
      </p>
    </form>
  );
}
