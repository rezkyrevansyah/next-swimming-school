import type { Metadata } from "next";
import { Suspense } from "react";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { Waves } from "lucide-react";
import { RegisterForm } from "./register-form";

export const metadata: Metadata = { title: "Daftar Member" };

async function RegisterFormContent() {
  const supabase = createClient(await cookies());

  const { data: branches } = await supabase
    .from("branches")
    .select("id, name")
    .eq("status", "active")
    .is("deleted_at", null)
    .order("name");

  if (!branches || branches.length === 0) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-10 text-center text-sm text-amber-700">
        Tidak ada cabang aktif saat ini. Silakan hubungi kami langsung.
      </div>
    );
  }

  return <RegisterForm branches={branches} />;
}

export default function DaftarMemberPage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="relative py-12 px-5 overflow-hidden bg-gradient-to-b from-sky-50 to-white">
        <div className="absolute inset-0 pointer-events-none" aria-hidden>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-36 rounded-full bg-sky-100/80 blur-3xl" />
        </div>
        <div className="relative max-w-xl mx-auto text-center">
          <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700">
            <Waves className="h-3 w-3" />
            Pendaftaran Member
          </div>
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Mulai Bersama Kami</h1>
          <p className="mt-2 text-gray-500 text-sm">
            Isi formulir di bawah. Admin kami akan menghubungi kamu untuk konfirmasi kelas dan jadwal.
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-lg mx-auto px-5 pb-20 pt-2">
        <Suspense fallback={<div className="h-96 bg-muted rounded-2xl animate-pulse" />}>
          <RegisterFormContent />
        </Suspense>
      </div>
    </div>
  );
}
