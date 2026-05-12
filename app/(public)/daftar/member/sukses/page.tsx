import { Suspense } from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

interface PageProps {
  searchParams: Promise<{ kode?: string }>;
}

async function SuksesContent({ searchParams }: PageProps) {
  const { kode } = await searchParams;
  const waNumber = process.env.NEXT_PUBLIC_WA_NUMBER?.replace(/\D/g, "");
  const waMessage = kode
    ? `Halo, saya ingin mengirimkan bukti pembayaran pendaftaran. Nomor registrasi saya: ${kode}`
    : "Halo, saya ingin mengirimkan bukti pembayaran pendaftaran.";
  const waUrl = waNumber
    ? `https://wa.me/${waNumber}?text=${encodeURIComponent(waMessage)}`
    : null;

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="rounded-2xl border border-sky-200 bg-sky-50 p-8 text-center space-y-4">
        <div className="flex justify-center">
          <CheckCircle2 className="h-14 w-14 text-sky-500" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Pendaftaran Berhasil!</h1>
          {kode && (
            <>
              <p className="text-sm text-gray-500 mt-1">Nomor registrasimu adalah:</p>
              <p className="text-3xl font-mono font-bold text-sky-600 mt-2">{kode}</p>
            </>
          )}
        </div>

        <div className="rounded-xl bg-white border border-sky-100 p-4 text-sm text-gray-600 text-left space-y-2">
          <p>Data kamu sudah kami terima.</p>
          <p>Langkah selanjutnya, kirimkan bukti pembayaran pendaftaran ke admin melalui WhatsApp.</p>
          <p>Admin akan mengaktifkan akun kamu setelah pembayaran dikonfirmasi.</p>
        </div>

        {waUrl && (
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full rounded-xl bg-green-500 hover:bg-green-600 text-white py-3 text-sm font-semibold transition-colors"
          >
            Kirim Bukti Bayar via WhatsApp
          </a>
        )}
      </div>

      <p className="text-center text-sm">
        <Link href="/" className="text-sky-600 hover:underline">
          Kembali ke Beranda
        </Link>
      </p>
    </div>
  );
}

export default function DaftarSuksesPage({ searchParams }: PageProps) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-16">
      <Suspense fallback={<div className="w-full max-w-md h-64 bg-muted rounded-2xl animate-pulse" />}>
        <SuksesContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
