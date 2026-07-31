-- ============================================================================
-- Bulk discount campaigns — festival sales (Aadi, Diwali, etc.)
-- Run in Supabase SQL Editor
-- ============================================================================
--
-- Nothing is ever written to product rows. A campaign is one row plus its
-- bands, and every price is computed at render time. Two consequences:
--
--   1. Per-product discounts (products.sale_price) survive a festival sale
--      untouched, and come back when it ends.
--   2. Expiry needs no cron job. Once ends_at passes, the campaign simply
--      stops matching and every page returns to normal by itself.
--
-- A saree takes the single BEST discount available to it — never the sum of
-- a band and its own discount, and never two bands added together.
-- ============================================================================

CREATE TABLE IF NOT EXISTS discount_campaigns (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name        TEXT NOT NULL,
    is_active   BOOLEAN NOT NULL DEFAULT true,
    -- Both optional. NULL start = live immediately; NULL end = until removed.
    starts_at   TIMESTAMPTZ,
    ends_at     TIMESTAMPTZ,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT valid_period CHECK (ends_at IS NULL OR starts_at IS NULL OR ends_at > starts_at)
);

-- One row per price band. A band with no min, no max and no category applies
-- to every product on the website.
CREATE TABLE IF NOT EXISTS discount_campaign_bands (
    id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id    UUID NOT NULL REFERENCES discount_campaigns(id) ON DELETE CASCADE,
    min_price      NUMERIC(10, 2),
    max_price      NUMERIC(10, 2),
    category       TEXT,
    discount_type  TEXT NOT NULL CHECK (discount_type IN ('AMT', 'PCT')),
    discount_value NUMERIC(10, 2) NOT NULL CHECK (discount_value > 0),
    created_at     TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT valid_band_range CHECK (max_price IS NULL OR min_price IS NULL OR max_price >= min_price)
);

CREATE INDEX IF NOT EXISTS idx_campaign_bands_campaign ON discount_campaign_bands(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_active ON discount_campaigns(is_active) WHERE is_active = true;

COMMENT ON TABLE  discount_campaigns          IS 'Site-wide festival sales; prices computed at render, never written to products';
COMMENT ON COLUMN discount_campaigns.ends_at  IS 'Sale stops matching once passed — no cleanup job required';
COMMENT ON TABLE  discount_campaign_bands     IS 'Price/category bands; a product takes the single best matching discount';

-- ── Row Level Security ──────────────────────────────────────────────────────
ALTER TABLE discount_campaigns      ENABLE ROW LEVEL SECURITY;
ALTER TABLE discount_campaign_bands ENABLE ROW LEVEL SECURITY;

-- Anyone may read: the storefront needs campaigns to price products.
DROP POLICY IF EXISTS "campaigns_public_select" ON discount_campaigns;
CREATE POLICY "campaigns_public_select" ON discount_campaigns
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "campaign_bands_public_select" ON discount_campaign_bands;
CREATE POLICY "campaign_bands_public_select" ON discount_campaign_bands
    FOR SELECT USING (true);

-- Only ADMIN may write — matching profiles.role, the identity the app uses.
DROP POLICY IF EXISTS "campaigns_admin_all" ON discount_campaigns;
CREATE POLICY "campaigns_admin_all" ON discount_campaigns
    FOR ALL TO authenticated
    USING      (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'ADMIN'))
    WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'ADMIN'));

DROP POLICY IF EXISTS "campaign_bands_admin_all" ON discount_campaign_bands;
CREATE POLICY "campaign_bands_admin_all" ON discount_campaign_bands
    FOR ALL TO authenticated
    USING      (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'ADMIN'))
    WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'ADMIN'));
