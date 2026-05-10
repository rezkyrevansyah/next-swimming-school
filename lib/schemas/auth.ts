import { z } from "zod";
import { PASSWORD_MIN_LENGTH } from "@/lib/constants";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email wajib diisi")
    .email("Format email tidak valid"),
  password: z
    .string()
    .min(PASSWORD_MIN_LENGTH, `Password minimal ${PASSWORD_MIN_LENGTH} karakter`),
});

export type LoginInput = z.infer<typeof loginSchema>;
