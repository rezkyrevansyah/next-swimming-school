import { z } from "zod";

export const createCoachSchema = z.object({
  // Profile
  full_name: z
    .string()
    .min(2, "Nama lengkap minimal 2 karakter")
    .max(100, "Nama lengkap maksimal 100 karakter"),
  nickname: z.string().max(50).optional().or(z.literal("")),
  dob: z.string().optional().or(z.literal("")),
  gender: z.enum(["male", "female"]).optional(),
  phone: z.string().max(20).optional().or(z.literal("")),
  specializations: z.string().optional().or(z.literal("")), // comma-separated

  // Account (required for coach)
  email: z.string().email("Format email tidak valid"),

  // Assignment
  branch_id: z.string().uuid("Cabang tidak valid"),
});

export const updateCoachSchema = createCoachSchema
  .omit({ email: true })
  .partial()
  .extend({
    id: z.string().uuid(),
  });

export type CreateCoachInput = z.infer<typeof createCoachSchema>;
export type UpdateCoachInput = z.infer<typeof updateCoachSchema>;
