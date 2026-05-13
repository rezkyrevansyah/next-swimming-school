"use client";

import { useState, useTransition } from "react";
import { Loader2, Plus, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { recordPayment } from "@/lib/actions/finance";

interface RecordPaymentFormProps {
  invoiceId: string;
  outstanding: number;
  disabled?: boolean;
}

function formatRupiah(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

export function RecordPaymentForm({
  invoiceId,
  outstanding,
  disabled = false,
}: RecordPaymentFormProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [amount, setAmount] = useState(outstanding);

  function handleOpen(fullPay: boolean) {
    setAmount(fullPay ? outstanding : outstanding);
    setOpen(true);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const data = new FormData(form);

    startTransition(async () => {
      const result = await recordPayment(data);
      if (result.error) {
        setError(result.error);
      } else {
        setSuccess(true);
        setOpen(false);
        form.reset();
        setAmount(outstanding);
        setTimeout(() => setSuccess(false), 3000);
      }
    });
  }

  if (disabled) return null;

  if (success) {
    return (
      <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-3">
        <CheckCircle2 className="h-4 w-4 shrink-0" />
        Pembayaran berhasil dicatat.
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold">Catat Pembayaran</p>
        {!open && (
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              variant="default"
              className="gap-2"
              onClick={() => handleOpen(true)}
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              Lunas ({formatRupiah(outstanding)})
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="gap-2"
              onClick={() => {
                setAmount(0);
                setOpen(true);
              }}
            >
              <Plus className="h-3.5 w-3.5" />
              Sebagian
            </Button>
          </div>
        )}
      </div>

      {open && (
        <form onSubmit={handleSubmit} className="space-y-3 pt-1">
          <input type="hidden" name="invoice_id" value={invoiceId} />

          <div className="space-y-1.5">
            <label className="text-xs font-medium">
              Jumlah Dibayar <span className="text-destructive">*</span>
            </label>
            <input
              name="amount"
              type="number"
              min="1"
              step="any"
              required
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              placeholder="0"
              className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <p className="text-xs text-muted-foreground">
              Sisa tagihan: {formatRupiah(outstanding)}
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium">Tanggal Bayar</label>
            <input
              name="paid_at"
              type="date"
              defaultValue={new Date().toISOString().split("T")[0]}
              className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium">Catatan</label>
            <input
              name="notes"
              type="text"
              placeholder="Transfer BCA, tunai, dll."
              className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {error && (
            <p className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => {
                setOpen(false);
                setError(null);
              }}
            >
              Batal
            </Button>
            <Button type="submit" size="sm" className="flex-1 gap-2" disabled={isPending}>
              {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Simpan
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
