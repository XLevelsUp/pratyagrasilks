-- Track which authenticated user placed each order, independent of the customer email.
-- Nullable so guest orders (no auth session) are unaffected.
ALTER TABLE orders ADD COLUMN IF NOT EXISTS placed_by_user_id UUID REFERENCES auth.users(id);

-- Update SELECT RLS: visible when placed_by_user_id matches the current user,
-- OR via customer email fallback for historical orders (predate this column).
DROP POLICY IF EXISTS "Users can view own orders" ON orders;

CREATE POLICY "Users can view own orders"
    ON orders FOR SELECT
    USING (
        placed_by_user_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM public.customers c
            WHERE c.id = orders.customer_id
              AND c.email = (SELECT email FROM auth.users WHERE id = auth.uid())
        )
    );
