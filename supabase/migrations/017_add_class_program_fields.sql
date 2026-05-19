-- Add class goals and program spreadsheet URL fields
ALTER TABLE public.classes
  ADD COLUMN IF NOT EXISTS tujuan_title       TEXT,
  ADD COLUMN IF NOT EXISTS tujuan_description TEXT,
  ADD COLUMN IF NOT EXISTS program_url        TEXT;
