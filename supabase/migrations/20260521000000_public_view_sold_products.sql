-- Allow public to see recently sold online products (in_stock = false but is_online = true).
-- Previously, public could only see in_stock = true AND is_online = true, so sold products
-- were invisible to customers even though they're shown as "Recently Sold" for trust-building.
DROP POLICY IF EXISTS "Public can view online in-stock products" ON products;

CREATE POLICY "Public can view online products"
    ON products
    FOR SELECT
    USING (is_online = true);
