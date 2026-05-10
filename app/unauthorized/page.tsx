import type { Metadata } from "next";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Akses Ditolak",
};

export default function UnauthorizedPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold">403</h1>
        <h2 className="text-xl font-semibold">Akses Ditolak</h2>
        <p className="text-muted-foreground max-w-sm">
          Anda tidak memiliki izin untuk mengakses halaman ini. Silakan hubungi
          administrator jika Anda merasa ini adalah kesalahan.
        </p>
      </div>
      <Link href="/" className={cn(buttonVariants({ variant: "outline" }))}>
        Kembali ke Beranda
      </Link>
    </main>
  );
}
