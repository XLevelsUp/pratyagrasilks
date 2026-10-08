-- ============================================================================
-- Agent API: payment links + attribution on orders
-- ============================================================================
-- Run once in the Supabase SQL editor BEFORE deploying the /api/agent/* routes
-- (they read and write these columns). The website checkout does not depend
-- on them.

ALTER TABLE orders
    ADD COLUMN IF NOT EXISTS source_channel TEXT,                 -- 'agent_web' | 'agent_whatsapp' | 'agent_instagram'; NULL = website
    ADD COLUMN IF NOT EXISTS razorpay_payment_link_id TEXT,
    ADD COLUMN IF NOT EXISTS payment_link_url TEXT,
    ADD COLUMN IF NOT EXISTS payment_link_expires_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS idempotency_key TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_idempotency_key
    ON orders(idempotency_key) WHERE idempotency_key IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
