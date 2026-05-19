"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Tag, ChevronDown, ChevronUp } from "lucide-react";
import { applyDiscountSchema, type ApplyDiscountInput } from "@/lib/schemas/finance";
import { applyDiscount } from "@/lib/actions/finance";
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

interface Props {
  invoiceId: string;
  currentDiscount: {
    type: "nominal" | "percent" | null;
    value: number;
    reason: string | null;
  };
}

export function ApplyDiscountForm({ invoiceId, currentDiscount }: Props) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ApplyDiscountInput>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(applyDiscountSchema) as any,
    defaultValues: {
      invoice_id: invoiceId,
      discount_type: currentDiscount.type ?? "nominal",
      discount_value: currentDiscount.value > 0 ? currentDiscount.value : undefined,
      discount_reason: currentDiscount.reason ?? "",
    },
  });

  function onSubmit(data: ApplyDiscountInput) {
    startTransition(async () => {
      const formData = new FormData();
      Object.entries(data).forEach(([k, v]) => {
        if (v !== undefined && v !== null) formData.set(k, String(v));
      });

      const result = await applyDiscount(formData);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Diskon berhasil diterapkan");
      setOpen(false);
    });
  }

  const hasDiscount = currentDiscount.value > 0;

  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Tag className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">
            {hasDiscount
              ? `Diskon ${currentDiscount.type === "percent" ? `${currentDiscount.value}%` : `Rp ${currentDiscount.value.toLocaleString("id-ID")}`}`
              : "Tambah Diskon"}
          </span>
          {hasDiscount && (
            <span className="text-xs text-amber-600 font-medium">· Aktif</span>
          )}
        </div>
        {open ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
      </button>

      {open && (
        <form onSubmit={handleSubmit(onSubmit)} className="border-t px-4 py-4 space-y-3">
          <input type="hidden" {...register("invoice_id")} />

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Tipe Diskon</Label>
              <Select
                defaultValue={currentDiscount.type ?? "nominal"}
                onValueChange={(v) =>
                  setValue("discount_type", v as "nominal" | "percent", { shouldValidate: true })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nominal">Nominal (Rp)</SelectItem>
                  <SelectItem value="percent">Persentase (%)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="discount_value">Nilai Diskon</Label>
              <Input
                id="discount_value"
                type="number"
                min="0"
                step="any"
                {...register("discount_value")}
                placeholder="0"
              />
              {errors.discount_value && (
                <p className="text-xs text-destructive">{errors.discount_value.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="discount_reason">Alasan Diskon (opsional)</Label>
            <Input
              id="discount_reason"
              {...register("discount_reason")}
              placeholder="Contoh: Promo liburan, beasiswa, dll."
            />
          </div>

          <div className="flex gap-2 pt-1">
            <Button type="submit" size="sm" disabled={isPending}>
              {isPending ? "Menyimpan..." : hasDiscount ? "Update Diskon" : "Terapkan Diskon"}
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => setOpen(false)} disabled={isPending}>
              Batal
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
