/**
 * Drains meta_sync_queue into the Meta catalog.
 *
 * Runs on a schedule (see vercel.json) rather than inside product saves, so
 * Meta API latency never blocks the admin UI or an order placement.
 *
 * Debouncing happens here by collapsing the queue to one entry per SKU and
 * re-reading the product's current row — a burst of edits to the same product
 * results in a single push carrying the latest state, which is more reliable
 * than an in-process timer (serverless functions freeze after responding).
 */

import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import {
    MAX_BATCH_SIZE,
    bulkUpsertProducts,
    checkBatchStatus,
    deleteProduct,
    type SyncableProduct,
} from '@/lib/meta-catalog-sync';

// Never prerender or cache — this mutates external state.
export const dynamic = 'force-dynamic';

// Drains up to DRAIN_LIMIT rows through sequential Meta API batches, which
// does not reliably fit in the 10s default.
export const maxDuration = 60;

// POST is the same drain, so product saves can trigger it on demand instead of
// waiting for the next scheduled run. Vercel's Hobby plan allows only one cron
// per day, so without this an admin edit would take up to 24h to reach
// WhatsApp. Creates and sales still wait for the cron — see the note in
// triggerMetaCatalogSync().
export async function POST(request: Request) {
    return GET(request);
}

/** Rows claimed per run. Keeps the function well inside its time limit. */
const DRAIN_LIMIT = 200;

interface QueueRow {
    id: number;
    sku: string;
    operation: 'UPSERT' | 'DELETE';
    attempts: number;
}

function serviceClient() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { persistSession: false } },
    );
}

/**
 * Vercel cron requests carry CRON_SECRET as a bearer token. Without this check
 * anyone could trigger a full catalog rewrite by hitting the URL.
 */
function isAuthorized(request: Request): boolean {
    const secret = process.env.CRON_SECRET;
    if (!secret) {
        // Fail closed: an unset secret would otherwise leave the route open.
        return false;
    }
    return request.headers.get('authorization') === `Bearer ${secret}`;
}

export async function GET(request: Request) {
    if (!isAuthorized(request)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = serviceClient();

    const { data: queued, error: queueError } = await supabase
        .from('meta_sync_queue')
        .select('id, sku, operation, attempts')
        .eq('status', 'pending')
        .order('created_at', { ascending: true })
        .limit(DRAIN_LIMIT);

    if (queueError) {
        console.error('[meta-catalog] Could not read queue:', queueError.message);
        return NextResponse.json({ error: 'Queue read failed' }, { status: 500 });
    }

    const rows = (queued ?? []) as QueueRow[];
    if (rows.length === 0) {
        return NextResponse.json({ processed: 0, message: 'Queue empty' });
    }

    // Debounce: keep only the newest entry per SKU, but remember every row id so
    // the superseded ones get closed out in the same pass.
    const latestBySku = new Map<string, QueueRow>();
    const rowIdsBySku = new Map<string, number[]>();

    for (const row of rows) {
        latestBySku.set(row.sku, row);
        rowIdsBySku.set(row.sku, [...(rowIdsBySku.get(row.sku) ?? []), row.id]);
    }

    const skus = [...latestBySku.keys()];

    // Re-read current state so the push reflects the row as it is now, not as it
    // was when queued.
    const { data: products, error: productError } = await supabase
        .from('products')
        .select('id, sku, name, description, price, sale_price, images, in_stock, is_online')
        .in('sku', skus);

    if (productError) {
        console.error('[meta-catalog] Could not read products:', productError.message);
        return NextResponse.json({ error: 'Product read failed' }, { status: 500 });
    }

    const bySku = new Map(
        (products ?? []).map((p) => [
            p.sku as string,
            {
                id: p.id,
                sku: p.sku,
                name: p.name,
                description: p.description,
                price: Number(p.price ?? 0),
                salePrice: p.sale_price != null ? Number(p.sale_price) : null,
                images: p.images ?? [],
                inStock: Boolean(p.in_stock),
                isOnline: Boolean(p.is_online),
            } satisfies SyncableProduct,
        ]),
    );

    const toUpsert: SyncableProduct[] = [];
    const toDelete: string[] = [];

    for (const sku of skus) {
        const product = bySku.get(sku);

        // Gone from the table, or offline → remove from the catalog. This also
        // covers hard deletes, where the row no longer exists to re-read.
        if (!product || !product.isOnline) {
            toDelete.push(sku);
            continue;
        }

        toUpsert.push(product);
    }

    const handles: string[] = [];
    const errors: string[] = [];
    let sent = 0;

    try {
        for (let i = 0; i < toUpsert.length; i += MAX_BATCH_SIZE) {
            const result = await bulkUpsertProducts(toUpsert.slice(i, i + MAX_BATCH_SIZE));
            sent += result.sent;
            if (result.handle) handles.push(result.handle);
        }

        for (const sku of toDelete) {
            const result = await deleteProduct(sku);
            sent += result.sent;
            if (result.handle) handles.push(result.handle);
        }
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error('[meta-catalog] Batch push failed:', message);

        // Leave the rows pending and count the attempt so a persistently broken
        // SKU can be spotted, rather than silently retried forever.
        await supabase
            .from('meta_sync_queue')
            .update({ attempts: rows[0].attempts + 1, last_error: message, updated_at: new Date().toISOString() })
            .in('id', rows.map((r) => r.id));

        return NextResponse.json({ error: 'Meta push failed', message }, { status: 502 });
    }

    // A 200 from items_batch only means the batch was accepted — per-item
    // failures show up here.
    for (const handle of handles) {
        try {
            errors.push(...(await checkBatchStatus(handle)));
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            errors.push(`status check failed: ${message}`);
        }
    }

    if (errors.length > 0) {
        console.error('[meta-catalog] Partial failures:', errors);
    }

    const processedIds = skus.flatMap((sku) => rowIdsBySku.get(sku) ?? []);

    await supabase
        .from('meta_sync_queue')
        .update({
            status: errors.length > 0 ? 'failed' : 'done',
            last_error: errors.length > 0 ? errors.slice(0, 5).join('; ') : null,
            updated_at: new Date().toISOString(),
        })
        .in('id', processedIds);

    return NextResponse.json({
        processed: processedIds.length,
        skus: skus.length,
        upserted: toUpsert.length,
        deleted: toDelete.length,
        sent,
        dryRun: process.env.META_CATALOG_DRY_RUN !== 'false',
        errors,
    });
}
