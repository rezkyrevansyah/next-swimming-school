-- Grup E: Member leaves, invoice discounts, private member type

-- 1. Member leaves (izin anggota per kelas per tanggal)
CREATE TABLE IF NOT EXISTS public.member_leaves (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id    UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  class_id     UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  leave_date   DATE NOT NULL,
  reason       TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT member_leaves_unique UNIQUE (member_id, class_id, leave_date)
);

-- 2. Invoice discount fields
ALTER TABLE public.monthly_invoices
  ADD COLUMN IF NOT EXISTS discount_type    TEXT CHECK (discount_type IN ('nominal', 'percent')),
  ADD COLUMN IF NOT EXISTS discount_value   NUMERIC DEFAULT 0 CHECK (discount_value >= 0),
  ADD COLUMN IF NOT EXISTS discount_reason  TEXT,
  ADD COLUMN IF NOT EXISTS discounted_by    UUID REFERENCES auth.users(id);

-- 3. Private member package fields on members table
ALTER TABLE public.members
  ADD COLUMN IF NOT EXISTS private_sessions_total   INT,     -- total sessions in package, e.g. 12
  ADD COLUMN IF NOT EXISTS private_sessions_used    INT NOT NULL DEFAULT 0,  -- tracked via attendance
  ADD COLUMN IF NOT EXISTS private_package_price    NUMERIC CHECK (private_package_price >= 0);

-- Update member type enum to include 'private'
-- Note: Supabase USER-DEFINED types need ALTER TYPE
ALTER TYPE member_type ADD VALUE IF NOT EXISTS 'private';
