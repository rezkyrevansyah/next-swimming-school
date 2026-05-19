import { z } from "zod";

export const createMemberSchema = z.object({
  // Member profile
  full_name: z
    .string()
    .min(2, "Nama lengkap minimal 2 karakter")
    .max(100, "Nama lengkap maksimal 100 karakter"),
  nickname: z.string().max(50, "Nama panggilan maksimal 50 karakter").optional(),
  dob: z.string().min(1, "Tanggal lahir wajib diisi"),
  gender: z.enum(["male", "female"], { error: "Pilih jenis kelamin" }),
  phone: z
    .string()
    .max(20, "Nomor telepon maksimal 20 karakter")
    .optional()
    .or(z.literal("")),
  phone_owner: z.enum(["self", "parent"]).default("self"),
  parent_name: z
    .string()
    .max(100, "Nama wali maksimal 100 karakter")
    .optional()
    .or(z.literal("")),
  parent_phone: z
    .string()
    .max(20, "Nomor telepon wali maksimal 20 karakter")
    .optional()
    .or(z.literal("")),
  address: z
    .string()
    .max(300, "Alamat maksimal 300 karakter")
    .optional()
    .or(z.literal("")),
  health_history: z
    .string()
    .max(500, "Riwayat kesehatan maksimal 500 karakter")
    .optional()
    .or(z.literal("")),

  // Member record
  branch_id: z.string().uuid("Cabang tidak valid"),
  type: z.enum(["regular", "affiliate", "private"], { error: "Pilih jenis anggota" }),
  payment_handling: z.enum(["individual", "covered_by_school"]).default("individual"),
  school_id: z.string().uuid().optional().or(z.literal("")),

  // Private member package (only relevant when type === "private")
  private_sessions_total: z.coerce.number().int().min(1).max(999).optional().or(z.literal("")),
  private_package_price: z.coerce.number().min(0).optional().or(z.literal("")),

  // Optional: create auth account
  email: z
    .string()
    .email("Format email tidak valid")
    .optional()
    .or(z.literal("")),
  password: z
    .string()
    .min(8, "Kata sandi minimal 8 karakter")
    .max(72, "Kata sandi maksimal 72 karakter")
    .optional()
    .or(z.literal("")),
});

export const updateMemberSchema = createMemberSchema.partial().extend({
  id: z.string().uuid(),
});

export type CreateMemberInput = z.infer<typeof createMemberSchema>;
export type UpdateMemberInput = z.infer<typeof updateMemberSchema>;
