-- ============================================================================
-- Fix Products RLS: Allow public to see "Recently Sold" products
-- Run ONCE in Supabase SQL Editor.
--
-- Problem: the original RLS policy blocks all rows where in_stock = false
-- for non-service-role users, so sold products are invisible to visitors.
-- The application API already filters visibility via is_online = true and
-- caps sold products at 9, so broadening the RLS is safe.
-- ============================================================================

-- Drop the restrictive policy that hides out-of-stock products
DROP POLICY IF EXISTS "Public can view in-stock products" ON products;

-- Allow public read access to all products (application handles visibility)
CREATE POLICY "Public can view products" ON products
    FOR SELECT USING (true);

-- ============================================================================
-- Verification: this should now return rows for non-admin users
-- ============================================================================
SELECT id, name, in_stock FROM products WHERE in_stock = false LIMIT 5;
