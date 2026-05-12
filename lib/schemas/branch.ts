import { z } from "zod";

export const createBranchSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter").max(100),
  address: z.string().max(300).optional().or(z.literal("")),
  contact_phone: z.string().max(20).optional().or(z.literal("")),
  contact_email: z.string().email("Format email tidak valid").optional().or(z.literal("")),
  location_lat: z.preprocess(
    (v) => (v === "" || v == null ? null : Number(v)),
    z.number().min(-90).max(90).nullable().optional()
  ),
  location_lng: z.preprocess(
    (v) => (v === "" || v == null ? null : Number(v)),
    z.number().min(-180).max(180).nullable().optional()
  ),
  status: z.enum(["active", "inactive"]).default("active"),
});

export type CreateBranchInput = z.infer<typeof createBranchSchema>;

export const updateBranchSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(2, "Nama minimal 2 karakter").max(100),
  address: z.string().max(300).optional().or(z.literal("")),
  contact_phone: z.string().max(20).optional().or(z.literal("")),
  contact_email: z.string().email("Format email tidak valid").optional().or(z.literal("")),
  location_lat: z.preprocess(
    (v) => (v === "" || v == null ? null : Number(v)),
    z.number().min(-90).max(90).nullable().optional()
  ),
  location_lng: z.preprocess(
    (v) => (v === "" || v == null ? null : Number(v)),
    z.number().min(-180).max(180).nullable().optional()
  ),
  status: z.enum(["active", "inactive"]).default("active"),
});

export type UpdateBranchInput = z.infer<typeof updateBranchSchema>;
