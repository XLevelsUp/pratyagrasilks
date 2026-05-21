-- Fix order history visibility: replace auth.uid() = customer_id check with email-based
-- lookup so orders are visible even when customer_id != auth.uid() (e.g. guest order
-- placed before account creation, or email-lookup creating a non-auth-uid customer record).
-- Uses auth.jwt() ->> 'email' instead of querying auth.users directly (no permission).
DROP POLICY IF EXISTS "Users can view own orders" ON orders;

CREATE POLICY "Users can view own orders"
    ON orders FOR SELECT
    USING (
        placed_by_user_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM public.customers c
            WHERE c.id = orders.customer_id
              AND c.email = auth.jwt() ->> 'email'
        )
    );
