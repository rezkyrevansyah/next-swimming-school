-- Migration 014: change_requests table
-- Digunakan untuk approval flow edit profil member & coach

CREATE TABLE public.change_requests (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id  uuid NOT NULL REFERENCES auth.users(id),
  resource_type text NOT NULL CHECK (resource_type IN ('member_profile', 'coach_profile')),
  resource_id   uuid NOT NULL,
  changes       jsonb NOT NULL,   -- { "field": { "old": "...", "new": "..." } }
  status        text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by   uuid REFERENCES auth.users(id),
  reviewed_at   timestamptz,
  note          text,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.change_requests ENABLE ROW LEVEL SECURITY;

-- Member/coach: bisa insert request sendiri, bisa lihat request sendiri
CREATE POLICY "change_requests_insert_own"
  ON public.change_requests FOR INSERT
  WITH CHECK (requester_id = auth.uid());

CREATE POLICY "change_requests_select_own"
  ON public.change_requests FOR SELECT
  USING (requester_id = auth.uid());

-- Admin/manager/owner: bisa baca dan update semua
CREATE POLICY "change_requests_admin_select"
  ON public.change_requests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
        AND r.name IN ('admin', 'manager', 'owner')
    )
  );

CREATE POLICY "change_requests_admin_update"
  ON public.change_requests FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
        AND r.name IN ('admin', 'manager', 'owner')
    )
  );

-- Index untuk query by status dan requester
CREATE INDEX change_requests_status_idx ON public.change_requests(status);
CREATE INDEX change_requests_requester_idx ON public.change_requests(requester_id);
CREATE INDEX change_requests_resource_idx ON public.change_requests(resource_type, resource_id);
