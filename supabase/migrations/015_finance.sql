-- ============================================================================
-- M5.1 — FINANCE MODULE
-- Tables: monthly_invoices, invoice_items, payments
-- Run AFTER 014_change_requests.sql
--
-- invoice_status enum ('unpaid' | 'paid' | 'partial') already exists
-- from 001_enums.sql — do NOT recreate it.
-- ============================================================================

-- ============================================================================
-- §5.1  monthly_invoices
-- One invoice per member per period_month (e.g. '2025-01').
-- Only for members with payment_handling = 'individual'.
-- ============================================================================
CREATE TABLE public.monthly_invoices (
  id             uuid        NOT NULL DEFAULT gen_random_uuid(),
  member_id      uuid        NOT NULL,
  branch_id      uuid        NOT NULL,
  period_month   text        NOT NULL,  -- 'YYYY-MM', e.g. '2025-01'
  total_amount   numeric     NOT NULL DEFAULT 0 CHECK (total_amount >= 0),
  amount_paid    numeric     NOT NULL DEFAULT 0 CHECK (amount_paid >= 0),
  status         invoice_status NOT NULL DEFAULT 'unpaid',
  due_date       date,
  notes          text,
  generated_at   timestamp with time zone NOT NULL DEFAULT now(),
  created_at     timestamp with time zone NOT NULL DEFAULT now(),
  updated_at     timestamp with time zone NOT NULL DEFAULT now(),

  CONSTRAINT monthly_invoices_pkey PRIMARY KEY (id),
  CONSTRAINT monthly_invoices_member_id_fkey
    FOREIGN KEY (member_id) REFERENCES public.members(id) ON DELETE CASCADE,
  CONSTRAINT monthly_invoices_branch_id_fkey
    FOREIGN KEY (branch_id) REFERENCES public.branches(id),
  -- Prevent duplicate invoice for same member + month
  CONSTRAINT monthly_invoices_member_period_unique
    UNIQUE (member_id, period_month)
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_monthly_invoices_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_monthly_invoices_updated_at
  BEFORE UPDATE ON public.monthly_invoices
  FOR EACH ROW EXECUTE FUNCTION public.update_monthly_invoices_updated_at();

-- ============================================================================
-- §5.2  invoice_items
-- Line items per invoice (one row per class enrolled).
-- ============================================================================
CREATE TABLE public.invoice_items (
  id          uuid    NOT NULL DEFAULT gen_random_uuid(),
  invoice_id  uuid    NOT NULL,
  class_id    uuid,   -- nullable: allow manual line items without a class
  description text    NOT NULL,
  amount      numeric NOT NULL DEFAULT 0 CHECK (amount >= 0),
  created_at  timestamp with time zone NOT NULL DEFAULT now(),

  CONSTRAINT invoice_items_pkey PRIMARY KEY (id),
  CONSTRAINT invoice_items_invoice_id_fkey
    FOREIGN KEY (invoice_id) REFERENCES public.monthly_invoices(id) ON DELETE CASCADE,
  CONSTRAINT invoice_items_class_id_fkey
    FOREIGN KEY (class_id) REFERENCES public.classes(id) ON DELETE SET NULL
);

-- ============================================================================
-- §5.3  payments
-- One or more payments per invoice (supports partial payments).
-- ============================================================================
CREATE TABLE public.payments (
  id            uuid    NOT NULL DEFAULT gen_random_uuid(),
  invoice_id    uuid    NOT NULL,
  amount        numeric NOT NULL CHECK (amount > 0),
  paid_at       timestamp with time zone NOT NULL DEFAULT now(),
  proof_url     text,                -- R2: payment-proofs/
  recorded_by   uuid,               -- auth.users who input this
  notes         text,
  created_at    timestamp with time zone NOT NULL DEFAULT now(),

  CONSTRAINT payments_pkey PRIMARY KEY (id),
  CONSTRAINT payments_invoice_id_fkey
    FOREIGN KEY (invoice_id) REFERENCES public.monthly_invoices(id) ON DELETE CASCADE,
  CONSTRAINT payments_recorded_by_fkey
    FOREIGN KEY (recorded_by) REFERENCES auth.users(id) ON DELETE SET NULL
);

-- ============================================================================
-- §5.4  Function: sync invoice status after payment insert/update/delete
-- Recalculates amount_paid and status automatically.
-- ============================================================================
CREATE OR REPLACE FUNCTION public.sync_invoice_status()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_total    numeric;
  v_paid     numeric;
  v_status   invoice_status;
  v_inv_id   uuid;
BEGIN
  -- Determine affected invoice_id (handle INSERT/UPDATE/DELETE)
  IF TG_OP = 'DELETE' THEN
    v_inv_id := OLD.invoice_id;
  ELSE
    v_inv_id := NEW.invoice_id;
  END IF;

  -- Sum all payments for this invoice
  SELECT
    mi.total_amount,
    COALESCE(SUM(p.amount), 0)
  INTO v_total, v_paid
  FROM public.monthly_invoices mi
  LEFT JOIN public.payments p ON p.invoice_id = mi.id
  WHERE mi.id = v_inv_id
  GROUP BY mi.total_amount;

  -- Determine new status
  IF v_paid <= 0 THEN
    v_status := 'unpaid';
  ELSIF v_paid >= v_total THEN
    v_status := 'paid';
  ELSE
    v_status := 'partial';
  END IF;

  -- Update the invoice
  UPDATE public.monthly_invoices
  SET
    amount_paid = v_paid,
    status      = v_status,
    updated_at  = now()
  WHERE id = v_inv_id;

  RETURN NULL; -- AFTER trigger, return value ignored
END;
$$;

CREATE TRIGGER trg_sync_invoice_status_insert
  AFTER INSERT ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.sync_invoice_status();

CREATE TRIGGER trg_sync_invoice_status_update
  AFTER UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.sync_invoice_status();

CREATE TRIGGER trg_sync_invoice_status_delete
  AFTER DELETE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.sync_invoice_status();

-- ============================================================================
-- §5.5  Performance indexes
-- ============================================================================
CREATE INDEX idx_monthly_invoices_member_id    ON public.monthly_invoices(member_id);
CREATE INDEX idx_monthly_invoices_branch_id    ON public.monthly_invoices(branch_id);
CREATE INDEX idx_monthly_invoices_period_month ON public.monthly_invoices(period_month);
CREATE INDEX idx_monthly_invoices_status       ON public.monthly_invoices(status);
CREATE INDEX idx_invoice_items_invoice_id      ON public.invoice_items(invoice_id);
CREATE INDEX idx_payments_invoice_id           ON public.payments(invoice_id);
CREATE INDEX idx_payments_paid_at              ON public.payments(paid_at);

-- ============================================================================
-- §5.6  RLS
-- ============================================================================
ALTER TABLE public.monthly_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments         ENABLE ROW LEVEL SECURITY;

-- monthly_invoices: owner global, admin/manager own branch, member own invoices
CREATE POLICY "invoices_select" ON public.monthly_invoices
FOR SELECT TO authenticated
USING (
  public.is_owner()
  OR (public.is_admin() AND branch_id = public.user_branch_id())
  OR EXISTS (
    SELECT 1 FROM public.members m
    WHERE m.id = monthly_invoices.member_id
      AND m.user_id = auth.uid()
  )
);

CREATE POLICY "invoices_insert" ON public.monthly_invoices
FOR INSERT TO authenticated
WITH CHECK (
  public.is_owner()
  OR (public.is_admin() AND branch_id = public.user_branch_id())
);

CREATE POLICY "invoices_update" ON public.monthly_invoices
FOR UPDATE TO authenticated
USING (
  public.is_owner()
  OR (public.is_admin() AND branch_id = public.user_branch_id())
)
WITH CHECK (
  public.is_owner()
  OR (public.is_admin() AND branch_id = public.user_branch_id())
);

-- No hard DELETE on invoices — use notes to annotate corrections

-- invoice_items: follows parent invoice access
CREATE POLICY "invoice_items_select" ON public.invoice_items
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.monthly_invoices mi
    WHERE mi.id = invoice_items.invoice_id
      AND (
        public.is_owner()
        OR (public.is_admin() AND mi.branch_id = public.user_branch_id())
        OR EXISTS (
          SELECT 1 FROM public.members m
          WHERE m.id = mi.member_id AND m.user_id = auth.uid()
        )
      )
  )
);

CREATE POLICY "invoice_items_modify" ON public.invoice_items
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.monthly_invoices mi
    WHERE mi.id = invoice_items.invoice_id
      AND (
        public.is_owner()
        OR (public.is_admin() AND mi.branch_id = public.user_branch_id())
      )
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.monthly_invoices mi
    WHERE mi.id = invoice_items.invoice_id
      AND (
        public.is_owner()
        OR (public.is_admin() AND mi.branch_id = public.user_branch_id())
      )
  )
);

-- payments: admin/owner can insert, member can only view own
CREATE POLICY "payments_select" ON public.payments
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.monthly_invoices mi
    WHERE mi.id = payments.invoice_id
      AND (
        public.is_owner()
        OR (public.is_admin() AND mi.branch_id = public.user_branch_id())
        OR EXISTS (
          SELECT 1 FROM public.members m
          WHERE m.id = mi.member_id AND m.user_id = auth.uid()
        )
      )
  )
);

CREATE POLICY "payments_insert" ON public.payments
FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.monthly_invoices mi
    WHERE mi.id = payments.invoice_id
      AND (
        public.is_owner()
        OR (public.is_admin() AND mi.branch_id = public.user_branch_id())
      )
  )
);

CREATE POLICY "payments_update" ON public.payments
FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.monthly_invoices mi
    WHERE mi.id = payments.invoice_id
      AND (
        public.is_owner()
        OR (public.is_admin() AND mi.branch_id = public.user_branch_id())
      )
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.monthly_invoices mi
    WHERE mi.id = payments.invoice_id
      AND (
        public.is_owner()
        OR (public.is_admin() AND mi.branch_id = public.user_branch_id())
      )
  )
);

CREATE POLICY "payments_delete" ON public.payments
FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.monthly_invoices mi
    WHERE mi.id = payments.invoice_id
      AND (
        public.is_owner()
        OR (public.is_admin() AND mi.branch_id = public.user_branch_id())
      )
  )
);

-- ============================================================================
-- ROLLBACK:
-- DROP TRIGGER IF EXISTS trg_sync_invoice_status_delete ON public.payments;
-- DROP TRIGGER IF EXISTS trg_sync_invoice_status_update ON public.payments;
-- DROP TRIGGER IF EXISTS trg_sync_invoice_status_insert ON public.payments;
-- DROP TRIGGER IF EXISTS trg_monthly_invoices_updated_at ON public.monthly_invoices;
-- DROP FUNCTION IF EXISTS public.sync_invoice_status();
-- DROP FUNCTION IF EXISTS public.update_monthly_invoices_updated_at();
-- DROP TABLE IF EXISTS public.payments;
-- DROP TABLE IF EXISTS public.invoice_items;
-- DROP TABLE IF EXISTS public.monthly_invoices;
-- ============================================================================
