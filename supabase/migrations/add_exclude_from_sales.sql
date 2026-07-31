-- ============================================================================
-- Per-product opt-out from bulk/festival sales
-- Run in Supabase SQL Editor
-- ============================================================================
--
-- A band matches on price, so a saree you want held at full price would
-- otherwise be swept into every campaign. This flag exempts it: bulk sales
-- skip it entirely, while its own sale_price (if any) still applies.
-- ============================================================================

ALTER TABLE products ADD COLUMN IF NOT EXISTS exclude_from_sales BOOLEAN NOT NULL DEFAULT false;

COMMENT ON COLUMN products.exclude_from_sales IS 'When true, bulk discount campaigns skip this product; its own sale_price still applies';

CREATE INDEX IF NOT EXISTS idx_products_exclude_from_sales
    ON products(exclude_from_sales) WHERE exclude_from_sales = true;
