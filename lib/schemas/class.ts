import { z } from "zod";

const ageRangeField = z.preprocess(
  (v) => (v === "" || v === null || v === undefined ? undefined : Number(v)),
  z.number().int().min(0).optional()
);

export const createClassSchema = z.object({
  name: z
    .string()
    .min(2, "Nama kelas minimal 2 karakter")
    .max(100, "Nama kelas maksimal 100 karakter"),
  slug: z
    .string()
    .min(2, "Slug minimal 2 karakter")
    .max(100)
    .regex(/^[a-z0-9-]+$/, "Slug hanya boleh huruf kecil, angka, dan tanda hubung"),
  description: z.string().max(500).optional().or(z.literal("")),
  branch_id: z.string().uuid("Cabang tidak valid"),
  capacity: z.coerce.number().int().min(1, "Kapasitas minimal 1").default(20),
  monthly_price: z.coerce
    .number()
    .min(0, "Harga tidak boleh negatif")
    .default(0),
  sessions_per_month: z.coerce
    .number()
    .int()
    .min(1, "Minimal 1 sesi per bulan")
    .default(8),
  age_range_min: ageRangeField,
  age_range_max: ageRangeField,
  location_name: z.string().max(200).optional().or(z.literal("")),
  status: z.enum(["active", "inactive"]).default("active"),
});

export const updateClassSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(2).max(100).optional(),
  slug: z.string().min(2).max(100).regex(/^[a-z0-9-]+$/).optional(),
  description: z.string().max(500).optional().or(z.literal("")),
  branch_id: z.string().uuid().optional(),
  capacity: z.coerce.number().int().min(1).optional(),
  monthly_price: z.coerce.number().min(0).optional(),
  sessions_per_month: z.coerce.number().int().min(1).optional(),
  age_range_min: ageRangeField,
  age_range_max: ageRangeField,
  location_name: z.string().max(200).optional().or(z.literal("")),
  status: z.enum(["active", "inactive"]).optional(),
});

export const scheduleItemSchema = z.object({
  day_of_week: z.coerce.number().int().min(0).max(6),
  start_time: z.string().regex(/^\d{2}:\d{2}$/, "Format waktu HH:MM"),
  end_time: z.string().regex(/^\d{2}:\d{2}$/, "Format waktu HH:MM"),
});

export const saveSchedulesSchema = z.object({
  class_id: z.string().uuid(),
  schedules: z.array(scheduleItemSchema).min(1, "Minimal 1 jadwal"),
});

export type CreateClassInput = z.infer<typeof createClassSchema>;
export type UpdateClassInput = z.infer<typeof updateClassSchema>;
export type ScheduleItem = z.infer<typeof scheduleItemSchema>;
export type SaveSchedulesInput = z.infer<typeof saveSchedulesSchema>;
