-- Grup F: Coach Invoice — hari libur, tarif coach, invoice pelatih

-- ============================================================================
-- 1. Tabel class_holidays
-- Libur bisa per cabang (semua kelas) atau per kelas spesifik
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.class_holidays (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id    UUID REFERENCES public.branches(id) ON DELETE CASCADE,
  class_id     UUID REFERENCES public.classes(id)  ON DELETE CASCADE,
  holiday_date DATE NOT NULL,
  name         TEXT NOT NULL,
  created_by   UUID NOT NULL REFERENCES auth.users(id),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Minimal salah satu branch_id atau class_id harus diisi
  CONSTRAINT holiday_scope_check CHECK (
    branch_id IS NOT NULL OR class_id IS NOT NULL
  )
);

-- Partial unique indexes (lebih portable dari NULLS NOT DISTINCT)
CREATE UNIQUE INDEX IF NOT EXISTS idx_holiday_branch_date
  ON public.class_holidays(branch_id, holiday_date)
  WHERE branch_id IS NOT NULL AND class_id IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_holiday_class_date
  ON public.class_holidays(class_id, holiday_date)
  WHERE class_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_holidays_date ON public.class_holidays(holiday_date);

-- ============================================================================
-- 2. Tabel coach_rates
-- Hierarki fallback: coach+kelas > kelas only > coach only > branch default
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.coach_rates (
  id               UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id        UUID    NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
  class_id         UUID    REFERENCES public.classes(id)  ON DELETE CASCADE,
  coach_id         UUID    REFERENCES public.coaches(id)  ON DELETE CASCADE,
  rate_per_session NUMERIC NOT NULL CHECK (rate_per_session >= 0),
  effective_from   DATE    NOT NULL DEFAULT CURRENT_DATE,
  notes            TEXT,
  created_by       UUID    NOT NULL REFERENCES auth.users(id),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Partial unique indexes per level hierarki
CREATE UNIQUE INDEX IF NOT EXISTS idx_coach_rates_l1
  ON public.coach_rates(branch_id, class_id, coach_id, effective_from)
  WHERE class_id IS NOT NULL AND coach_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_coach_rates_l2
  ON public.coach_rates(branch_id, class_id, effective_from)
  WHERE class_id IS NOT NULL AND coach_id IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_coach_rates_l3
  ON public.coach_rates(branch_id, coach_id, effective_from)
  WHERE class_id IS NULL AND coach_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_coach_rates_l4
  ON public.coach_rates(branch_id, effective_from)
  WHERE class_id IS NULL AND coach_id IS NULL;

CREATE INDEX IF NOT EXISTS idx_coach_rates_branch  ON public.coach_rates(branch_id);
CREATE INDEX IF NOT EXISTS idx_coach_rates_coach   ON public.coach_rates(coach_id) WHERE coach_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_coach_rates_class   ON public.coach_rates(class_id) WHERE class_id IS NOT NULL;

-- ============================================================================
-- 3. Tabel coach_invoices
-- Satu invoice aktif per coach per bulan (deleted_at untuk re-generate)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.coach_invoices (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id       UUID        NOT NULL REFERENCES public.coaches(id)  ON DELETE RESTRICT,
  branch_id      UUID        NOT NULL REFERENCES public.branches(id) ON DELETE RESTRICT,
  period_month   TEXT        NOT NULL,  -- 'YYYY-MM'
  total_sessions INT         NOT NULL DEFAULT 0 CHECK (total_sessions >= 0),
  total_amount   NUMERIC     NOT NULL DEFAULT 0 CHECK (total_amount >= 0),
  status         TEXT        NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted')),
  generated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at     TIMESTAMPTZ,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Hanya satu invoice aktif per coach per bulan
CREATE UNIQUE INDEX IF NOT EXISTS idx_coach_invoices_active
  ON public.coach_invoices(coach_id, period_month)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_coach_invoices_coach  ON public.coach_invoices(coach_id);
CREATE INDEX IF NOT EXISTS idx_coach_invoices_branch ON public.coach_invoices(branch_id);
CREATE INDEX IF NOT EXISTS idx_coach_invoices_period ON public.coach_invoices(period_month);

-- Trigger updated_at (pakai fungsi yang sudah ada)
DO $$ BEGIN
  CREATE TRIGGER set_coach_invoices_updated_at
    BEFORE UPDATE ON public.coach_invoices
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================================
-- 4. Tabel coach_invoice_items
-- Satu baris per sesi yang diklaim coach
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.coach_invoice_items (
  id               UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id       UUID    NOT NULL REFERENCES public.coach_invoices(id) ON DELETE CASCADE,
  class_id         UUID    NOT NULL REFERENCES public.classes(id) ON DELETE RESTRICT,
  session_date     DATE    NOT NULL,
  rate_per_session NUMERIC NOT NULL CHECK (rate_per_session >= 0),
  notes            TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT coach_invoice_items_unique UNIQUE (invoice_id, class_id, session_date)
);

CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice ON public.coach_invoice_items(invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoice_items_date    ON public.coach_invoice_items(session_date);

-- ============================================================================
-- 5. RLS Policies
-- ============================================================================

-- class_holidays
ALTER TABLE public.class_holidays ENABLE ROW LEVEL SECURITY;

CREATE POLICY "holidays_select_all" ON public.class_holidays
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "holidays_modify_admin_owner" ON public.class_holidays
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
        AND r.name IN ('admin', 'owner')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
        AND r.name IN ('admin', 'owner')
    )
  );

-- coach_rates
ALTER TABLE public.coach_rates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "coach_rates_select" ON public.coach_rates
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
        AND r.name IN ('admin', 'owner')
    )
    OR EXISTS (
      SELECT 1 FROM public.coaches c
      WHERE c.id = coach_rates.coach_id AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "coach_rates_modify_admin_owner" ON public.coach_rates
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
        AND r.name IN ('admin', 'owner')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
        AND r.name IN ('admin', 'owner')
    )
  );

-- coach_invoices
ALTER TABLE public.coach_invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "coach_invoices_select" ON public.coach_invoices
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
        AND r.name IN ('admin', 'owner')
    )
    OR EXISTS (
      SELECT 1 FROM public.coaches c
      WHERE c.id = coach_invoices.coach_id AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "coach_invoices_modify" ON public.coach_invoices
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
        AND r.name IN ('admin', 'owner')
    )
    OR EXISTS (
      SELECT 1 FROM public.coaches c
      WHERE c.id = coach_invoices.coach_id AND c.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
        AND r.name IN ('admin', 'owner')
    )
    OR EXISTS (
      SELECT 1 FROM public.coaches c
      WHERE c.id = coach_invoices.coach_id AND c.user_id = auth.uid()
    )
  );

-- coach_invoice_items
ALTER TABLE public.coach_invoice_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "invoice_items_select" ON public.coach_invoice_items
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.coach_invoices ci
      WHERE ci.id = coach_invoice_items.invoice_id
        AND (
          EXISTS (
            SELECT 1 FROM public.user_roles ur
            JOIN public.roles r ON r.id = ur.role_id
            WHERE ur.user_id = auth.uid()
              AND r.name IN ('admin', 'owner')
          )
          OR EXISTS (
            SELECT 1 FROM public.coaches c
            WHERE c.id = ci.coach_id AND c.user_id = auth.uid()
          )
        )
    )
  );

CREATE POLICY "invoice_items_modify" ON public.coach_invoice_items
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.coach_invoices ci
      WHERE ci.id = coach_invoice_items.invoice_id
        AND (
          EXISTS (
            SELECT 1 FROM public.user_roles ur
            JOIN public.roles r ON r.id = ur.role_id
            WHERE ur.user_id = auth.uid()
              AND r.name IN ('admin', 'owner')
          )
          OR EXISTS (
            SELECT 1 FROM public.coaches c
            WHERE c.id = ci.coach_id AND c.user_id = auth.uid()
          )
        )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.coach_invoices ci
      WHERE ci.id = coach_invoice_items.invoice_id
        AND (
          EXISTS (
            SELECT 1 FROM public.user_roles ur
            JOIN public.roles r ON r.id = ur.role_id
            WHERE ur.user_id = auth.uid()
              AND r.name IN ('admin', 'owner')
          )
          OR EXISTS (
            SELECT 1 FROM public.coaches c
            WHERE c.id = ci.coach_id AND c.user_id = auth.uid()
          )
        )
    )
  );
