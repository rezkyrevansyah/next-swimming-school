"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { selfRegisterMember } from "@/lib/actions/public";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Branch {
  id: string;
  name: string;
}

function Field({
  label,
  required,
  children,
  hint,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-gray-400">{hint}</p>}
    </div>
  );
}

const inputCls =
  "w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-400/20 transition-colors";

const selectCls =
  "w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-400/20 transition-colors";

export function RegisterForm({ branches }: { branches: Branch[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [phoneOwner, setPhoneOwner] = useState<string>("");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await selfRegisterMember(formData);
      if (res.error) {
        setError(res.error);
      } else {
        router.push(`/daftar/member/sukses?kode=${encodeURIComponent(res.data!.memberCode)}`);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Data Diri */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide pb-1 border-b">
          Data Diri
        </h3>

        <Field label="Nama Lengkap" required>
          <input
            name="full_name"
            type="text"
            required
            placeholder="Nama sesuai KTP / Kartu Pelajar"
            className={inputCls}
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Tanggal Lahir" required>
            <input name="dob" type="date" required className={inputCls} />
          </Field>

          <Field label="Jenis Kelamin" required>
            <select name="gender" required className={selectCls} defaultValue="">
              <option value="" disabled>Pilih...</option>
              <option value="male">Laki-laki</option>
              <option value="female">Perempuan</option>
            </select>
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="No. HP" required hint="Aktif di WhatsApp">
            <input
              name="phone"
              type="tel"
              required
              placeholder="08xx-xxxx-xxxx"
              className={inputCls}
            />
          </Field>

          <Field label="HP Milik" required>
            <select
              name="phone_owner"
              required
              className={selectCls}
              value={phoneOwner}
              onChange={(e) => setPhoneOwner(e.target.value)}
            >
              <option value="" disabled>Pilih...</option>
              <option value="self">Sendiri</option>
              <option value="parent">Orang Tua / Wali</option>
            </select>
          </Field>
        </div>

        <Field label="Alamat">
          <textarea
            name="address"
            rows={2}
            placeholder="Alamat lengkap (opsional)"
            className={cn(inputCls, "resize-none")}
          />
        </Field>

        <Field label="Riwayat Kesehatan / Alergi" hint="Opsional — informasikan kondisi yang perlu diketahui pelatih">
          <textarea
            name="health_history"
            rows={2}
            placeholder="Misal: asma, alergi klorin, dll."
            className={cn(inputCls, "resize-none")}
          />
        </Field>
      </div>

      {/* Data Orang Tua — muncul hanya jika HP milik orang tua */}
      {phoneOwner === "parent" && (
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide pb-1 border-b">
            Data Orang Tua / Wali <span className="font-normal normal-case text-gray-400 ml-1">*</span>
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Nama Orang Tua" required>
              <input
                name="parent_name"
                type="text"
                required
                placeholder="Nama orang tua"
                className={inputCls}
              />
            </Field>

            <Field label="No. HP Orang Tua" required hint="Nomor yang terdaftar di atas">
              <input
                name="parent_phone"
                type="tel"
                required
                placeholder="08xx-xxxx-xxxx"
                className={inputCls}
              />
            </Field>
          </div>
        </div>
      )}

      {/* Pilihan Kelas */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide pb-1 border-b">
          Pilihan Program
        </h3>

        <Field label="Cabang" required>
          <select name="branch_id" required className={selectCls} defaultValue="">
            <option value="" disabled>Pilih cabang...</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </Field>

        <Field label="Tipe Anggota">
          <select name="type" className={selectCls} defaultValue="regular">
            <option value="regular">Reguler</option>
            <option value="special">Khusus</option>
          </select>
        </Field>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full flex items-center justify-center gap-2 rounded-xl bg-gray-900 text-white py-3 text-sm font-semibold hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Mendaftarkan...
          </>
        ) : (
          "Kirim Pendaftaran"
        )}
      </button>

      <p className="text-xs text-center text-gray-400">
        Dengan mendaftar, kamu setuju dengan syarat & ketentuan kami.
        Admin akan menghubungi kamu dalam 1×24 jam.
      </p>
    </form>
  );
}
