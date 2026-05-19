-- Grup A: Coach reviews by members (linked to published report cards)

CREATE TABLE IF NOT EXISTS public.coach_reviews (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_card_id  UUID NOT NULL REFERENCES public.report_cards(id) ON DELETE CASCADE,
  member_id       UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  coach_id        UUID NOT NULL REFERENCES public.coaches(id) ON DELETE CASCADE,
  rating          SMALLINT NOT NULL CHECK (rating >= 1 AND rating <= 10),
  comment         TEXT,
  edited_at       TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT coach_reviews_unique UNIQUE (report_card_id, member_id)
);
