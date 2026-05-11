-- ============================================================================
-- RAPOT SYSTEM — Semesters & Report Cards
-- Run AFTER 008_rls_anon_register.sql
-- ============================================================================

-- ============================================================================
-- §1  ENUM
-- ============================================================================
CREATE TYPE public.semester_status AS ENUM ('draft', 'active', 'closed');
CREATE TYPE public.report_card_status AS ENUM ('draft', 'published');

-- ============================================================================
-- §2  semesters
-- ============================================================================
CREATE TABLE public.semesters (
  id             uuid    NOT NULL DEFAULT gen_random_uuid(),
  branch_id      uuid    NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
  name           text    NOT NULL,                        -- e.g. "Semester 1 2025"
  start_date     date    NOT NULL,
  end_date       date    NOT NULL,
  input_deadline date    NOT NULL,                        -- Coach can't input after this date
  status         public.semester_status NOT NULL DEFAULT 'draft',
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT semesters_pkey PRIMARY KEY (id),
  CONSTRAINT semesters_dates_check CHECK (end_date > start_date AND input_deadline >= end_date)
);

-- Only one active semester per branch at a time
CREATE UNIQUE INDEX semesters_branch_active_unique
  ON public.semesters (branch_id)
  WHERE status = 'active';

-- ============================================================================
-- §3  report_cards
-- ============================================================================
CREATE TABLE public.report_cards (
  id              uuid    NOT NULL DEFAULT gen_random_uuid(),
  semester_id     uuid    NOT NULL REFERENCES public.semesters(id) ON DELETE CASCADE,
  member_id       uuid    NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  class_id        uuid    NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  coach_id        uuid    NOT NULL REFERENCES public.coaches(id),
  -- Attendance (calculated from attendance_records, stored for snapshot)
  sessions_total  integer NOT NULL DEFAULT 0,
  sessions_present integer NOT NULL DEFAULT 0,
  sessions_late   integer NOT NULL DEFAULT 0,
  sessions_permitted integer NOT NULL DEFAULT 0,
  sessions_sick   integer NOT NULL DEFAULT 0,
  sessions_absent integer NOT NULL DEFAULT 0,
  attendance_rate numeric(5,2) GENERATED ALWAYS AS (
    CASE WHEN sessions_total > 0
      THEN ROUND(((sessions_present + sessions_late)::numeric / sessions_total) * 100, 2)
      ELSE 0
    END
  ) STORED,
  -- Skill assessment (flexible jsonb — coaches can add any skills)
  -- Example: { "teknik_napas": 4, "koordinasi": 3, "kecepatan": 4 }
  skill_scores    jsonb   NOT NULL DEFAULT '{}',
  -- Narrative
  coach_notes     text,                                   -- Coach's overall notes
  goals_achieved  text,                                   -- Goals achieved this semester
  next_goals      text,                                   -- Goals for next semester
  -- Status & publishing
  status          public.report_card_status NOT NULL DEFAULT 'draft',
  published_at    timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT report_cards_pkey PRIMARY KEY (id),
  CONSTRAINT report_cards_unique UNIQUE (semester_id, member_id, class_id)
);

-- ============================================================================
-- §4  RLS — semesters
-- ============================================================================
ALTER TABLE public.semesters ENABLE ROW LEVEL SECURITY;

-- Admin/owner can manage semesters for their branch
CREATE POLICY "semesters_select" ON public.semesters
FOR SELECT TO authenticated
USING (
  public.is_owner()
  OR (public.is_admin() AND branch_id = public.user_branch_id())
  OR EXISTS (
    SELECT 1 FROM public.coach_branches cb
    JOIN public.coaches c ON c.id = cb.coach_id
    WHERE cb.branch_id = semesters.branch_id
      AND c.user_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM public.members m
    WHERE m.branch_id = semesters.branch_id
      AND m.user_id = auth.uid()
  )
);

CREATE POLICY "semesters_modify" ON public.semesters
FOR ALL TO authenticated
USING (
  public.is_owner()
  OR (public.is_admin() AND branch_id = public.user_branch_id())
)
WITH CHECK (
  public.is_owner()
  OR (public.is_admin() AND branch_id = public.user_branch_id())
);

-- ============================================================================
-- §5  RLS — report_cards
-- ============================================================================
ALTER TABLE public.report_cards ENABLE ROW LEVEL SECURITY;

-- Coach can see & modify report cards for members they teach, in active semester
CREATE POLICY "report_cards_coach_select" ON public.report_cards
FOR SELECT TO authenticated
USING (
  coach_id = public.user_coach_id()
  OR public.is_owner()
  OR (public.is_admin() AND EXISTS (
    SELECT 1 FROM public.classes c WHERE c.id = report_cards.class_id
      AND c.branch_id = public.user_branch_id()
  ))
  OR EXISTS (
    SELECT 1 FROM public.members m
    WHERE m.id = report_cards.member_id
      AND m.user_id = auth.uid()
      AND report_cards.status = 'published'
  )
);

CREATE POLICY "report_cards_coach_insert" ON public.report_cards
FOR INSERT TO authenticated
WITH CHECK (
  coach_id = public.user_coach_id()
  AND public.is_coach_of_class(class_id)
  -- Enforce deadline: can only insert during active semester within deadline
  AND EXISTS (
    SELECT 1 FROM public.semesters s
    WHERE s.id = report_cards.semester_id
      AND s.status = 'active'
      AND s.input_deadline >= CURRENT_DATE
  )
);

CREATE POLICY "report_cards_coach_update" ON public.report_cards
FOR UPDATE TO authenticated
USING (
  (
    coach_id = public.user_coach_id()
    AND public.is_coach_of_class(class_id)
    AND status = 'draft'
    AND EXISTS (
      SELECT 1 FROM public.semesters s
      WHERE s.id = report_cards.semester_id
        AND s.status = 'active'
        AND s.input_deadline >= CURRENT_DATE
    )
  )
  OR public.is_owner()
  OR public.is_admin()
)
WITH CHECK (
  (
    coach_id = public.user_coach_id()
    AND public.is_coach_of_class(class_id)
    AND status = 'draft'
  )
  OR public.is_owner()
  OR public.is_admin()
);

CREATE POLICY "report_cards_admin_delete" ON public.report_cards
FOR DELETE TO authenticated
USING (
  public.is_owner()
  OR public.is_admin()
);

-- ============================================================================
-- §6  updated_at auto-trigger
-- ============================================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER semesters_updated_at
  BEFORE UPDATE ON public.semesters
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER report_cards_updated_at
  BEFORE UPDATE ON public.report_cards
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
