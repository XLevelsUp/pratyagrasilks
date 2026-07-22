-- Per-image LQIP placeholders, keyed by public image URL.
-- Keyed by URL (not array index) so drag-reordering of products.images never desyncs.
ALTER TABLE public.products
    ADD COLUMN IF NOT EXISTS blur_map JSONB NOT NULL DEFAULT '{}'::jsonb;

COMMENT ON COLUMN public.products.blur_map IS
    'Map of image public URL -> base64 blurDataURL (tiny webp), generated at upload';
