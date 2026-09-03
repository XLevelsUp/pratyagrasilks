-- ============================================================================
-- MARKETING ROLE — scoped admin login for the marketing/content team
--
-- Run in the Supabase SQL Editor. Idempotent: safe to re-run.
--
-- Design notes:
--   * Adds MARKETING to the existing user_roles lookup table (see
--     rbac_update_roles.sql) with is_admin_level = true, so it can enter
--     /admin — but app-side (useAdmin.ts) restricts it to /admin/blog* only.
--   * profiles.role has a FK to user_roles(role) with ON UPDATE CASCADE, so
--     no ALTER on public.profiles is needed here.
-- ============================================================================

INSERT INTO public.user_roles (role, label, description, is_admin_level)
VALUES
    ('MARKETING', 'Marketing', 'Blog post authoring and comment moderation only', true)
ON CONFLICT (role) DO UPDATE
    SET label          = EXCLUDED.label,
        description    = EXCLUDED.description,
        is_admin_level = EXCLUDED.is_admin_level;

-- ============================================================================
-- Verification (run after the script)
-- ============================================================================
/*
-- Should now return 5 rows: ADMIN, CASHIER, CUSTOMER, MARKETING, VENDOR
SELECT * FROM public.user_roles ORDER BY is_admin_level DESC, role;

-- To promote a user to MARKETING (replace with real UUID):
-- UPDATE public.profiles SET role = 'MARKETING' WHERE id = '<marketing-user-uuid>';
*/
