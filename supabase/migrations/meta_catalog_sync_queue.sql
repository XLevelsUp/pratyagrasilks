-- Meta catalog sync queue
--
-- Why a database trigger rather than application hooks: products are written
-- from several places that application code cannot intercept —
--   * the admin "new product" form inserts from the browser
--     (app/admin/products/new/page.tsx, app/admin/products/add/page.tsx)
--   * stock_quantity is decremented by Postgres triggers when an order is
--     placed (supabase/quantity_removal.sql, migrations/fix_double_stock_deduction.sql),
--     so no app code runs when a saree sells
--   * in_stock is set by another trigger from stock_quantity
-- A trigger on products sits below all of them and cannot be bypassed.
--
-- The queue is drained by app/api/cron/meta-catalog-sync/route.ts.

CREATE TABLE IF NOT EXISTS meta_sync_queue (
    id          BIGSERIAL PRIMARY KEY,
    sku         TEXT        NOT NULL,
    -- UPSERT mirrors the row into the catalog; DELETE removes it. Recorded at
    -- enqueue time from is_online, but the drain re-reads the row so the latest
    -- state wins even if the product changed again while queued.
    operation   TEXT        NOT NULL CHECK (operation IN ('UPSERT', 'DELETE')),
    product_id  UUID,
    status      TEXT        NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'done', 'failed')),
    attempts    INTEGER     NOT NULL DEFAULT 0,
    last_error  TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- The drain reads pending rows oldest-first.
CREATE INDEX IF NOT EXISTS idx_meta_sync_queue_pending
    ON meta_sync_queue (status, created_at)
    WHERE status = 'pending';

-- Debounce support: collapsing repeated edits to one SKU needs a fast lookup.
CREATE INDEX IF NOT EXISTS idx_meta_sync_queue_sku
    ON meta_sync_queue (sku);

-- Only the service role touches this table; it is never read from the browser.
ALTER TABLE meta_sync_queue ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE meta_sync_queue IS
    'Pending Meta catalog pushes. Written by trigger on products, drained by the meta-catalog-sync cron.';


CREATE OR REPLACE FUNCTION enqueue_meta_catalog_sync()
RETURNS TRIGGER AS $$
DECLARE
    target_sku  TEXT;
    target_id   UUID;
    op          TEXT;
BEGIN
    IF (TG_OP = 'DELETE') THEN
        target_sku := OLD.sku;
        target_id  := OLD.id;
        op         := 'DELETE';
    ELSE
        target_sku := NEW.sku;
        target_id  := NEW.id;
        -- Mirrors storefront visibility: offline products are removed from the
        -- catalog, sold ones stay and are marked out of stock by the drain.
        op := CASE WHEN COALESCE(NEW.is_online, FALSE) THEN 'UPSERT' ELSE 'DELETE' END;
    END IF;

    -- No SKU means no retailer_id, so there is nothing Meta can key on.
    IF target_sku IS NULL OR btrim(target_sku) = '' THEN
        RETURN COALESCE(NEW, OLD);
    END IF;

    -- Skip no-op updates: only enqueue when a field the catalog actually shows
    -- has changed. Without this, unrelated column writes (view counters,
    -- procurement fields) would queue a redundant push on every save.
    IF (TG_OP = 'UPDATE') THEN
        IF  NEW.sku            IS NOT DISTINCT FROM OLD.sku
        AND NEW.name           IS NOT DISTINCT FROM OLD.name
        AND NEW.description    IS NOT DISTINCT FROM OLD.description
        AND NEW.price          IS NOT DISTINCT FROM OLD.price
        AND NEW.sale_price     IS NOT DISTINCT FROM OLD.sale_price
        AND NEW.images         IS NOT DISTINCT FROM OLD.images
        AND NEW.in_stock       IS NOT DISTINCT FROM OLD.in_stock
        AND NEW.is_online      IS NOT DISTINCT FROM OLD.is_online
        THEN
            RETURN NEW;
        END IF;
    END IF;

    INSERT INTO meta_sync_queue (sku, operation, product_id)
    VALUES (target_sku, op, target_id);

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


DROP TRIGGER IF EXISTS trigger_enqueue_meta_catalog_sync ON products;

-- AFTER, so a sync never blocks or fails the product write itself.
CREATE TRIGGER trigger_enqueue_meta_catalog_sync
    AFTER INSERT OR UPDATE OR DELETE ON products
    FOR EACH ROW
    EXECUTE FUNCTION enqueue_meta_catalog_sync();


-- Backfill: queue every product currently visible on the storefront so the
-- first cron run brings the catalog into line. Safe to re-run.
INSERT INTO meta_sync_queue (sku, operation, product_id)
SELECT sku, 'UPSERT', id
FROM products
WHERE is_online = TRUE
  AND sku IS NOT NULL
  AND btrim(sku) <> ''
  AND NOT EXISTS (
      SELECT 1 FROM meta_sync_queue q
      WHERE q.sku = products.sku AND q.status = 'pending'
  );
