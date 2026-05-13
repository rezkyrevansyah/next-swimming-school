-- Migration: Add columns needed for landing page data
-- classes: cover image, slug, description
ALTER TABLE classes
  ADD COLUMN IF NOT EXISTS cover_url    text,
  ADD COLUMN IF NOT EXISTS slug         text,
  ADD COLUMN IF NOT EXISTS description  text;

CREATE UNIQUE INDEX IF NOT EXISTS classes_slug_unique ON classes (slug) WHERE slug IS NOT NULL;

-- coach_profiles: featured flag for landing page highlight
ALTER TABLE coach_profiles
  ADD COLUMN IF NOT EXISTS is_featured boolean NOT NULL DEFAULT false;

-- branches: bank account info and operating hours for footer/register
ALTER TABLE branches
  ADD COLUMN IF NOT EXISTS bank_account_info  text,
  ADD COLUMN IF NOT EXISTS operating_hours    text;
