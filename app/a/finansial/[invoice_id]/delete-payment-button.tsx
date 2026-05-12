"use client";

import { useTransition } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { deletePayment } from "@/lib/actions/finance";

interface DeletePaymentButtonProps {
  paymentId: string;
}

export function DeletePaymentButton({ paymentId }: DeletePaymentButtonProps) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    if (!confirm("Yakin hapus catatan pembayaran ini?")) return;
    const formData = new FormData();
    formData.set("payment_id", paymentId);
    startTransition(async () => {
      await deletePayment(formData);
    });
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className="h-7 w-7 inline-flex items-center justify-center rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50"
      title="Hapus pembayaran"
    >
      {isPending ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <Trash2 className="h-3.5 w-3.5" />
      )}
    </button>
  );
}
