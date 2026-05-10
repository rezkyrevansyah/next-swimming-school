-- ============================================================================
-- M2.1 — ENUMS
-- Run in Supabase SQL Editor FIRST before any other migration.
-- ============================================================================

CREATE TYPE member_status AS ENUM (
  'pending_payment',
  'active',
  'inactive'
);

CREATE TYPE member_type AS ENUM (
  'regular',
  'affiliate'  -- Phase 2
);

CREATE TYPE payment_handling AS ENUM (
  'individual',
  'covered_by_school'  -- Phase 2
);

CREATE TYPE phone_owner AS ENUM (
  'self',
  'parent'
);

CREATE TYPE coach_status AS ENUM (
  'pending',
  'active',
  'inactive'
);

CREATE TYPE certificate_status AS ENUM (
  'pending_approval',
  'approved',
  'rejected'
);

CREATE TYPE class_status AS ENUM (
  'active',
  'inactive'
);

CREATE TYPE attendance_status AS ENUM (
  'present',
  'late',
  'permitted',
  'sick',
  'absent'
);

CREATE TYPE scan_method AS ENUM (
  'qr',
  'manual'
);

CREATE TYPE invoice_status AS ENUM (
  'unpaid',
  'paid',
  'partial'
);

CREATE TYPE branch_status AS ENUM (
  'active',
  'inactive'
);

CREATE TYPE article_status AS ENUM (
  'draft',
  'published',
  'archived'
);

-- ============================================================================
-- ROLLBACK:
-- DROP TYPE IF EXISTS member_status, member_type, payment_handling, phone_owner,
--   coach_status, certificate_status, class_status, attendance_status,
--   scan_method, invoice_status, branch_status, article_status CASCADE;
-- ============================================================================
