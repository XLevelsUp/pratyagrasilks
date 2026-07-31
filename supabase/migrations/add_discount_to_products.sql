-- ============================================================================
-- Per-product discount — website + POS offer pricing
-- Run in Supabase SQL Editor
-- ============================================================================
--
-- `price` remains the MRP and is never modified by the discount feature.
-- A discounted product carries:
--     discount_type  — whether the admin entered rupees or a percentage
--     discount_value — exactly what they typed (10 for 10%, 2000 for ₹2000),
--                      kept so the dialog reopens showing their intent
--     sale_price     — the computed price customers actually pay
--
-- No discount  →  discount_value = 0, sale_price = NULL.
-- Every surface reads: sale_price ?? price
-- ============================================================================

ALTER TABLE products ADD COLUMN IF NOT EXISTS discount_type  TEXT CHECK (discount_type IN ('AMT', 'PCT'));
ALTER TABLE products ADD COLUMN IF NOT EXISTS discount_value NUMERIC(10, 2) DEFAULT 0 CHECK (discount_value >= 0);
ALTER TABLE products ADD COLUMN IF NOT EXISTS sale_price     NUMERIC(10, 2) CHECK (sale_price >= 0);

COMMENT ON COLUMN products.discount_type  IS 'AMT = flat rupee discount, PCT = percentage; NULL when no discount';
COMMENT ON COLUMN products.discount_value IS 'Value as entered by the admin — 10 means 10% when type is PCT, ₹10 when AMT';
COMMENT ON COLUMN products.sale_price     IS 'Discounted price customers pay; NULL means no discount, use price';

-- Existing rows are undiscounted; the defaults above already cover new rows.
UPDATE products SET discount_value = 0 WHERE discount_value IS NULL;

-- Speeds up the admin "Discounted / No Discount" filter.
CREATE INDEX IF NOT EXISTS idx_products_sale_price ON products(sale_price) WHERE sale_price IS NOT NULL;
