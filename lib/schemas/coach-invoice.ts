import { z } from "zod";

// ============================================================================
// Holiday Schemas
// ============================================================================
export const createHolidaySchema = z
  .object({
    branch_id:    z.string().uuid().optional().or(z.literal("")),
    class_id:     z.string().uuid().optional().or(z.literal("")),
    holiday_date: z.string().min(1, "Tanggal wajib diisi"),
    name:         z.string().min(1, "Nama/keterangan libur wajib diisi").max(200),
  })
  .refine(
    (d) => (!!d.branch_id && d.branch_id !== "") || (!!d.class_id && d.class_id !== ""),
    { message: "Pilih cabang atau kelas yang libur", path: ["branch_id"] }
  );

export const updateHolidaySchema = createHolidaySchema.and(
  z.object({ id: z.string().uuid() })
);

export type CreateHolidayInput = z.infer<typeof createHolidaySchema>;
export type UpdateHolidayInput = z.infer<typeof updateHolidaySchema>;

// ============================================================================
// Coach Rate Schemas
// ============================================================================
export const createCoachRateSchema = z.object({
  branch_id:        z.string().uuid("Cabang wajib diisi"),
  class_id:         z.string().uuid().optional().or(z.literal("")),
  coach_id:         z.string().uuid().optional().or(z.literal("")),
  rate_per_session: z.coerce.number().min(0, "Tarif tidak boleh negatif"),
  effective_from:   z.string().min(1, "Tanggal berlaku wajib diisi"),
  notes:            z.string().max(300).optional().or(z.literal("")),
});

export const updateCoachRateSchema = createCoachRateSchema.extend({
  id: z.string().uuid(),
});

export type CreateCoachRateInput = z.infer<typeof createCoachRateSchema>;
export type UpdateCoachRateInput = z.infer<typeof updateCoachRateSchema>;

// ============================================================================
// Generate Coach Invoice Schema
// ============================================================================
export const generateCoachInvoiceSchema = z.object({
  period_month: z
    .string()
    .regex(/^\d{4}-\d{2}$/, "Format bulan tidak valid (YYYY-MM)")
    .refine((v) => {
      const [y, m] = v.split("-").map(Number);
      return y >= 2020 && y <= 2100 && m >= 1 && m <= 12;
    }, "Bulan tidak valid"),
  // JSON-encoded array of { class_id, session_date, rate_per_session }
  selected_sessions: z.string().min(1, "Pilih minimal satu sesi"),
});

export type GenerateCoachInvoiceInput = z.infer<typeof generateCoachInvoiceSchema>;

export const selectedSessionItemSchema = z.object({
  class_id:         z.string().uuid(),
  session_date:     z.string(),
  rate_per_session: z.number().min(0),
});

export type SelectedSessionItem = z.infer<typeof selectedSessionItemSchema>;
