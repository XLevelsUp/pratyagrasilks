-- ============================================================================
-- Fix: ADMIN cannot write to products
-- Run in Supabase SQL Editor
-- ============================================================================
--
-- The app identifies admins by profiles.role = 'ADMIN' (see role-guard.ts,
-- useAdmin, and the products_cashier_* policies). The older policy from
-- admin_setup.sql instead calls is_admin(), which checks customers.is_admin —
-- a different table that the app never writes.
--
-- Result: an ADMIN matched no write policy, so every UPDATE affected 0 rows.
-- Postgres reports that as success, not an error, so the UI showed
-- "Product updated successfully!" while nothing was saved.
--
-- This adds the missing policy. The legacy is_admin() policy is left in place;
-- policies are OR-ed, so anything it already permitted keeps working.
-- ============================================================================

DROP POLICY IF EXISTS "products_admin_all" ON public.products;

CREATE POLICY "products_admin_all"
    ON public.products
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'ADMIN'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'ADMIN'
        )
    );

-- ── Verify ──────────────────────────────────────────────────────────────────
-- Signed in as the admin, this should return one row (not zero):
--
--   UPDATE products SET updated_at = NOW()
--   WHERE id = '<some-product-id>'
--   RETURNING id;
