"use client";

import { useState, useTransition } from "react";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { generateMonthlyInvoices } from "@/lib/actions/finance";
import { useRouter } from "next/navigation";

interface GenerateFormProps {
  branchId: string;
  branchName: string;
  eligibleMemberCount: number;
}

export function GenerateForm({
  branchId,
  branchName,
  eligibleMemberCount,
}: GenerateFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{
    type: "success" | "error";
    message: string;
    detail?: string;
  } | null>(null);

  // Default to current month
  const now = new Date();
  const defaultPeriod = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  // Default due date: end of current month
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const defaultDueDate = lastDay.toISOString().split("T")[0];

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setResult(null);
    const data = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = await generateMonthlyInvoices(data);
      if (res.error) {
        setResult({ type: "error", message: res.error });
      } else {
        const { created, skipped } = res.data!;
        setResult({
          type: "success",
          message: `${created} tagihan berhasil dibuat.`,
          detail:
            skipped > 0
              ? `${skipped} anggota dilewati (sudah ada tagihan untuk bulan ini).`
              : undefined,
        });
      }
    });
  }

  if (result?.type === "success") {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-6 space-y-3">
        <div className="flex items-center gap-2 text-green-800">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <p className="font-semibold">{result.message}</p>
        </div>
        {result.detail && (
          <p className="text-sm text-green-700">{result.detail}</p>
        )}
        <div className="flex gap-2 pt-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => router.push("/a/finansial")}
          >
            Lihat Daftar Tagihan
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setResult(null)}
          >
            Generate Lagi
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <input type="hidden" name="branch_id" value={branchId} />

      {/* Info */}
      <div className="rounded-lg border bg-muted/30 px-4 py-3 text-sm space-y-1">
        <p className="font-medium">Cabang: {branchName}</p>
        <p className="text-muted-foreground">
          {eligibleMemberCount > 0
            ? `${eligibleMemberCount} anggota aktif reguler memenuhi syarat untuk mendapat tagihan.`
            : "Tidak ada anggota aktif reguler di cabang ini."}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Hanya anggota dengan status <strong>aktif</strong>, tipe <strong>reguler</strong>,
          dan pembayaran <strong>individual</strong> yang akan ditagih.
          Anggota afiliasi (covered by school) tidak termasuk.
        </p>
      </div>

      {/* Period */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium">
          Bulan Tagihan <span className="text-destructive">*</span>
        </label>
        <input
          name="period_month"
          type="month"
          required
          defaultValue={defaultPeriod}
          className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <p className="text-xs text-muted-foreground">
          Format: Tahun-Bulan. Contoh: 2025-01 untuk Januari 2025.
        </p>
      </div>

      {/* Due date */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium">Tanggal Jatuh Tempo</label>
        <input
          name="due_date"
          type="date"
          defaultValue={defaultDueDate}
          className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {/* Notes */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium">Catatan (opsional)</label>
        <textarea
          name="notes"
          rows={2}
          placeholder="Contoh: Tagihan bulan Januari 2025"
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
        />
      </div>

      {/* Warning */}
      <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 flex items-start gap-2">
        <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
        <div>
          <p className="font-medium">Perhatian</p>
          <p className="text-amber-700 text-xs mt-0.5">
            Anggota yang sudah memiliki tagihan untuk bulan yang dipilih akan otomatis dilewati.
            Anda dapat menjalankan generate ulang tanpa takut duplikat.
          </p>
        </div>
      </div>

      {result?.type === "error" && (
        <div className="rounded-md bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive flex items-start gap-2">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          {result.message}
        </div>
      )}

      <Button
        type="submit"
        className="w-full gap-2"
        disabled={isPending || eligibleMemberCount === 0}
      >
        {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
        Generate Tagihan
      </Button>
    </form>
  );
}
