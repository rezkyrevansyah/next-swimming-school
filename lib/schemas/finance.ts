import { z } from "zod";

// ============================================================================
// Generate Invoice Schema
// Used when admin manually generates invoices for a specific month
// ============================================================================
export const generateInvoicesSchema = z.object({
  branch_id: z.string().uuid("Cabang tidak valid"),
  period_month: z
    .string()
    .regex(/^\d{4}-\d{2}$/, "Format bulan tidak valid (gunakan YYYY-MM)")
    .refine((v) => {
      const [y, m] = v.split("-").map(Number);
      return y >= 2020 && y <= 2100 && m >= 1 && m <= 12;
    }, "Bulan tidak valid"),
  due_date: z.string().optional().or(z.literal("")),
  notes: z.string().max(500).optional().or(z.literal("")),
});

export type GenerateInvoicesInput = z.infer<typeof generateInvoicesSchema>;

// ============================================================================
// Record Payment Schema
// ============================================================================
export const recordPaymentSchema = z.object({
  invoice_id: z.string().uuid("Invoice tidak valid"),
  amount: z
    .string()
    .min(1, "Jumlah pembayaran wajib diisi")
    .transform((v) => parseFloat(v.replace(/[^0-9.]/g, "")))
    .refine((v) => !isNaN(v) && v > 0, "Jumlah harus lebih dari 0"),
  paid_at: z.string().optional().or(z.literal("")),
  notes: z.string().max(500).optional().or(z.literal("")),
  proof_url: z.string().optional().or(z.literal("")),
});

export type RecordPaymentInput = z.infer<typeof recordPaymentSchema>;

// ============================================================================
// Delete Payment Schema
// ============================================================================
export const deletePaymentSchema = z.object({
  payment_id: z.string().uuid("Payment tidak valid"),
});

export type DeletePaymentInput = z.infer<typeof deletePaymentSchema>;

// ============================================================================
// Update Invoice Notes Schema
// ============================================================================
export const updateInvoiceNotesSchema = z.object({
  invoice_id: z.string().uuid(),
  notes: z.string().max(500).optional().or(z.literal("")),
  due_date: z.string().optional().or(z.literal("")),
});

export type UpdateInvoiceNotesInput = z.infer<typeof updateInvoiceNotesSchema>;
