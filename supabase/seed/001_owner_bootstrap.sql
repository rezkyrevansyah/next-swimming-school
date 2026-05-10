-- ============================================================================
-- M2.5 — OWNER BOOTSTRAP (Run ONCE after creating owner via Auth Dashboard)
-- ============================================================================

DO $$
DECLARE
  owner_user_id     UUID := 'cd4b3f00-12b4-4b78-8ed6-d96764ab41d1';
  owner_role_id     UUID;
  default_branch_id UUID;
BEGIN
  SELECT id INTO owner_role_id FROM public.roles WHERE name = 'owner';
  IF owner_role_id IS NULL THEN
    RAISE EXCEPTION 'Owner role not found. Run 002_branches_roles.sql first.';
  END IF;

  INSERT INTO public.user_roles (user_id, role_id, branch_id)
  VALUES (owner_user_id, owner_role_id, NULL)
  ON CONFLICT DO NOTHING;

  INSERT INTO public.branches (name, slug, is_default, manager_id, status)
  VALUES ('Next Swimming School Pusat', 'pusat', TRUE, owner_user_id, 'active')
  ON CONFLICT (slug) DO NOTHING
  RETURNING id INTO default_branch_id;

  RAISE NOTICE 'Owner bootstrap complete. Branch id: %', default_branch_id;
END $$;

-- Verify
SELECT
  u.email,
  r.name AS role,
  b.name AS branch
FROM auth.users u
LEFT JOIN public.user_roles ur ON ur.user_id = u.id
LEFT JOIN public.roles       r  ON r.id = ur.role_id
LEFT JOIN public.branches    b  ON b.id = ur.branch_id
WHERE u.email = 'rezky.revansyah@gmail.com';

-- ============================================================================
-- ROLLBACK (if needed):
--   DELETE FROM public.user_roles WHERE user_id = 'cd4b3f00-12b4-4b78-8ed6-d96764ab41d1';
--   DELETE FROM public.branches   WHERE slug = 'pusat';
-- ============================================================================
