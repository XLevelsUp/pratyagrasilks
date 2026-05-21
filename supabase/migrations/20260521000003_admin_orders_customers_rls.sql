-- Fix: Admin and Cashier roles were missing SELECT policies on orders, customers,
-- order_items, and addresses. Only user-scoped policies existed, so the admin
-- dashboard returned zero results even though data was present in the database.

-- ── Orders ────────────────────────────────────────────────────────────────────
CREATE POLICY "Admins can view all orders"
    ON orders FOR SELECT
    USING (is_admin_role());

CREATE POLICY "Cashiers can view all orders"
    ON orders FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'CASHIER'
    ));

-- Admins need to be able to update order status
CREATE POLICY "Admins can update orders"
    ON orders FOR UPDATE
    USING (is_admin_role());

-- ── Customers ─────────────────────────────────────────────────────────────────
CREATE POLICY "Admins can view all customers"
    ON customers FOR SELECT
    USING (is_admin_role());

CREATE POLICY "Cashiers can view all customers"
    ON customers FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'CASHIER'
    ));

-- ── Order Items ───────────────────────────────────────────────────────────────
CREATE POLICY "Admins can view all order items"
    ON order_items FOR SELECT
    USING (is_admin_role());

-- ── Addresses ─────────────────────────────────────────────────────────────────
CREATE POLICY "Admins can view all addresses"
    ON addresses FOR SELECT
    USING (is_admin_role());
