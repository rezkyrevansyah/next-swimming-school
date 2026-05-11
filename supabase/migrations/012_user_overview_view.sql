-- ============================================================================
-- View: user_overview
--
-- Menggabungkan auth.users + user_roles + roles + profiles sehingga
-- mudah dibaca di Supabase Table Editor / Dashboard.
-- Gunakan: SELECT * FROM public.user_overview;
-- ============================================================================

CREATE OR REPLACE VIEW public.user_overview AS
SELECT
  u.id                          AS user_id,
  u.email,
  u.created_at                  AS registered_at,
  u.last_sign_in_at,
  r.name                        AS role,
  ur.branch_id,
  b.name                        AS branch_name,

  -- Member info (jika ada)
  m.id                          AS member_id,
  m.member_id_code,
  m.status                      AS member_status,
  mp.full_name                  AS member_name,

  -- Coach info (jika ada)
  c.id                          AS coach_id,
  c.coach_id_code,
  c.status                      AS coach_status,
  cp.full_name                  AS coach_name

FROM auth.users u

-- Role (ambil role tertinggi)
LEFT JOIN public.user_roles ur ON ur.user_id = u.id
LEFT JOIN public.roles r ON r.id = ur.role_id
LEFT JOIN public.branches b ON b.id = ur.branch_id

-- Member profile
LEFT JOIN public.members m ON m.user_id = u.id
LEFT JOIN public.member_profiles mp ON mp.member_id = m.id

-- Coach profile
LEFT JOIN public.coaches c ON c.user_id = u.id
LEFT JOIN public.coach_profiles cp ON cp.coach_id = c.id

ORDER BY u.created_at DESC;

-- Grant read access to authenticated users (admin/owner only via RLS pada tabel aslinya)
-- View ini hanya bisa diakses via SQL Editor / service role, tidak lewat anon key
GRANT SELECT ON public.user_overview TO service_role;
