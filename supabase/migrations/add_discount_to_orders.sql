-- ============================================================================
-- Add discount tracking to orders — POS "Apply Offer"
-- Run in Supabase SQL Editor
-- ============================================================================

-- Cart-wide discount given at the POS counter.
-- Stored alongside subtotal so the reason for a reduced total is never lost:
--   subtotal - discount_amount = total_amount
ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_amount NUMERIC(10, 2) DEFAULT 0 CHECK (discount_amount >= 0);

-- Pre-discount value. Already added by schema_updates_phase3.sql for web
-- orders; this is a no-op there, but POS orders left it NULL until now.
ALTER TABLE orders ADD COLUMN IF NOT EXISTS subtotal NUMERIC(10, 2);

COMMENT ON COLUMN orders.discount_amount IS 'Cart-wide discount applied at POS; 0 when no offer was used';
COMMENT ON COLUMN orders.subtotal IS 'Order value before discount; total_amount = subtotal - discount_amount';

-- Existing rows: no discount was ever applied, so 0 is correct.
UPDATE orders SET discount_amount = 0 WHERE discount_amount IS NULL;
