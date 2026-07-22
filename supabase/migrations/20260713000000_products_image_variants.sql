-- Per-image responsive width variants, keyed by the image's public (2560px canonical) URL.
-- Value is a width -> public-URL map for the smaller pre-generated tiers, e.g.
-- { "<canonicalUrl>": { "640": "<url640>", "1080": "<url1080>", "1600": "<url1600>" } }.
-- 2560/canonical is intentionally omitted from the value — it equals the map's own key.
-- Keyed by URL (not array index) so drag-reordering of products.images never desyncs,
-- exactly like blur_map.
ALTER TABLE public.products
    ADD COLUMN IF NOT EXISTS image_variants JSONB NOT NULL DEFAULT '{}'::jsonb;

COMMENT ON COLUMN public.products.image_variants IS
    'Map of canonical image public URL -> { width(px as string): variant public URL }, generated at upload. Missing/empty for legacy images or small source photos where a tier would duplicate canonical.';
