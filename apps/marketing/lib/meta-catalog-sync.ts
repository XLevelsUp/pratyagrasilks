/**
 * Meta (Facebook) Catalog sync — pushes our products into the Meta catalog
 * connected to the WhatsApp Business Account.
 *
 * Direction is one-way: Supabase is the source of truth, the Meta catalog is a
 * downstream mirror. Edits made in Commerce Manager are overwritten by the next
 * sync of that SKU.
 *
 * Visibility mirrors the storefront (see lib/data/public-products.ts):
 *   is_online = true   → item present in the catalog
 *   is_online = false  → item deleted from the catalog
 *   in_stock  = false  → kept, but availability "out of stock" (each saree is
 *                        one-of-a-kind, so a sold piece stays listed the same
 *                        way the website keeps showing it)
 *
 * Never called inside a request/response cycle — writes land in the
 * meta_sync_queue table via a Postgres trigger and are drained by
 * app/api/cron/meta-catalog-sync/route.ts.
 */

const GRAPH_VERSION = 'v25.0';

/** Meta rejects batches larger than this; the drain chunks to fit. */
export const MAX_BATCH_SIZE = 100;

/** Set META_CATALOG_DRY_RUN=false to allow real writes. Safe by default. */
function isDryRun(): boolean {
    return process.env.META_CATALOG_DRY_RUN !== 'false';
}

export interface MetaCatalogConfig {
    catalogId: string;
    accessToken: string;
}

/**
 * Reads credentials from the environment. Throws rather than half-syncing so a
 * misconfigured deploy fails loudly in the cron log instead of silently
 * skipping every product.
 */
export function getConfig(): MetaCatalogConfig {
    const catalogId = process.env.META_CATALOG_ID;
    const accessToken = process.env.META_CATALOG_TOKEN;

    if (!catalogId || !accessToken) {
        throw new Error(
            'Meta catalog sync is not configured: META_CATALOG_ID and ' +
                'META_CATALOG_TOKEN must both be set.',
        );
    }

    return { catalogId, accessToken };
}

/** The product shape this module needs — a subset of the products table. */
export interface SyncableProduct {
    sku: string;
    name: string;
    description?: string | null;
    /** Base price in rupees */
    price: number;
    /** Discounted price in rupees, when a discount applies */
    salePrice?: number | null;
    images?: string[] | null;
    inStock: boolean;
    isOnline: boolean;
    /** products.id — used to build the storefront link */
    id: string;
}

interface MetaItemData {
    id: string;
    title?: string;
    description?: string;
    availability?: 'in stock' | 'out of stock';
    price?: string;
    currency?: string;
    image_link?: string;
    link?: string;
    brand?: string;
}

interface MetaBatchRequest {
    method: 'UPDATE' | 'DELETE';
    data: MetaItemData;
}

const BRAND = 'Pratyagra Silks';
const CURRENCY = 'INR';
const SITE_URL = 'https://pratyagrasilks.com';

/**
 * Meta wants price in minor units as a string ("250000" = ₹2,500.00) alongside
 * a separate `currency`. The older "<amount> <currency>" form belongs to the
 * CSV/Feed API and is rejected by items_batch.
 */
function toMinorUnits(rupees: number): string {
    return String(Math.round(rupees * 100));
}

/**
 * Price the customer actually pays: sale_price when a discount is active,
 * otherwise the base price. Sending `price` unconditionally would advertise
 * pre-discount amounts in WhatsApp.
 */
function effectivePrice(product: SyncableProduct): number {
    const { salePrice, price } = product;
    if (salePrice != null && salePrice > 0 && salePrice < price) {
        return salePrice;
    }
    return price;
}

/** Maps one product row onto Meta's item shape. */
export function toMetaItem(product: SyncableProduct): MetaBatchRequest {
    const image = product.images?.find((url) => Boolean(url));

    return {
        method: 'UPDATE',
        data: {
            id: product.sku,
            title: product.name,
            // Meta requires a non-empty description; fall back to the title.
            description: product.description?.trim() || product.name,
            availability: product.inStock ? 'in stock' : 'out of stock',
            price: toMinorUnits(effectivePrice(product)),
            currency: CURRENCY,
            image_link: image ?? '',
            link: `${SITE_URL}/product/${product.id}`,
            brand: BRAND,
        },
    };
}

/** A SKU with no image or no title cannot be listed — skip it loudly. */
export function isSyncable(product: SyncableProduct): boolean {
    return Boolean(
        product.sku?.trim() && product.name?.trim() && product.images?.some((u) => Boolean(u)),
    );
}

export interface BatchResult {
    /** Meta's async job handle, used to poll for completion */
    handle: string | null;
    /** Number of items actually sent */
    sent: number;
    dryRun: boolean;
    /** Populated once the status poll completes */
    errors?: string[];
}

const RETRYABLE_STATUS = (status: number) => status === 429 || status >= 500;

interface RetryOptions {
    attempts?: number;
    baseDelayMs?: number;
    /** Injectable for tests so retry logic doesn't sleep in CI */
    sleep?: (ms: number) => Promise<void>;
}

const defaultSleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

/**
 * Retries on 429 and 5xx with exponential backoff. 4xx other than 429 are
 * permanent (bad token, malformed item) and fail immediately — retrying them
 * just burns rate limit.
 */
async function fetchWithRetry(
    url: string,
    init: RequestInit,
    { attempts = 4, baseDelayMs = 500, sleep = defaultSleep }: RetryOptions = {},
): Promise<Response> {
    let lastError: unknown;

    for (let attempt = 0; attempt < attempts; attempt++) {
        if (attempt > 0) {
            await sleep(baseDelayMs * 2 ** (attempt - 1));
        }

        try {
            const res = await fetch(url, init);

            if (res.ok || !RETRYABLE_STATUS(res.status)) {
                return res;
            }

            lastError = new Error(`Meta API ${res.status}`);
        } catch (error) {
            // Network-level failure (DNS, socket reset) — also worth retrying
            lastError = error;
        }
    }

    throw lastError instanceof Error
        ? lastError
        : new Error('Meta API request failed after retries');
}

/**
 * POSTs a batch of item mutations. Returns the handle so the caller can
 * confirm the job actually applied — a 200 here only means Meta accepted the
 * batch, not that every item succeeded.
 */
async function postBatch(
    requests: MetaBatchRequest[],
    retry?: RetryOptions,
): Promise<BatchResult> {
    if (requests.length === 0) {
        return { handle: null, sent: 0, dryRun: isDryRun() };
    }

    const { catalogId, accessToken } = getConfig();

    if (isDryRun()) {
        console.info(
            `[meta-catalog] DRY RUN — would send ${requests.length} item(s):`,
            JSON.stringify(
                requests.map((r) => ({ method: r.method, id: r.data.id })),
                null,
                2,
            ),
        );
        return { handle: null, sent: requests.length, dryRun: true };
    }

    // Form-encoded, not JSON — items_batch expects `requests` as a JSON string.
    const body = new URLSearchParams({
        requests: JSON.stringify(requests),
        access_token: accessToken,
    });

    const res = await fetchWithRetry(
        `https://graph.facebook.com/${GRAPH_VERSION}/${catalogId}/items_batch`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body,
        },
        retry,
    );

    if (!res.ok) {
        // Body may contain the token if Meta echoes the request — never log raw.
        throw new Error(`Meta items_batch failed with ${res.status}`);
    }

    const json: { handles?: string[]; handle?: string } = await res.json();
    const handle = json.handle ?? json.handles?.[0] ?? null;

    return { handle, sent: requests.length, dryRun: false };
}

/**
 * Polls check_batch_request_status until the job finishes. A batch can return
 * 200 and still fail per-item, so this is where partial failures surface.
 */
export async function checkBatchStatus(
    handle: string,
    { attempts = 5, baseDelayMs = 1000, sleep = defaultSleep }: RetryOptions = {},
): Promise<string[]> {
    const { catalogId, accessToken } = getConfig();
    const errors: string[] = [];

    for (let attempt = 0; attempt < attempts; attempt++) {
        await sleep(baseDelayMs * 2 ** attempt);

        const url =
            `https://graph.facebook.com/${GRAPH_VERSION}/${catalogId}/check_batch_request_status` +
            `?handle=${encodeURIComponent(handle)}&access_token=${encodeURIComponent(accessToken)}`;

        const res = await fetchWithRetry(url, { method: 'GET' }, { sleep });
        if (!res.ok) continue;

        const json: {
            data?: Array<{
                status?: string;
                errors?: Array<{ message?: string }>;
                warnings?: Array<{ message?: string }>;
            }>;
        } = await res.json();

        const entry = json.data?.[0];
        if (!entry) continue;

        // "in progress" → keep polling; anything else is terminal
        if (entry.status && /in.?progress/i.test(entry.status)) {
            continue;
        }

        for (const e of entry.errors ?? []) {
            if (e.message) errors.push(e.message);
        }
        for (const w of entry.warnings ?? []) {
            if (w.message) errors.push(`warning: ${w.message}`);
        }

        return errors;
    }

    return ['Batch status still in progress after final poll attempt'];
}

/** Adds or updates a single product. */
export async function upsertProduct(
    product: SyncableProduct,
    retry?: RetryOptions,
): Promise<BatchResult> {
    if (!isSyncable(product)) {
        console.warn(
            `[meta-catalog] Skipping ${product.sku || '(no sku)'} — needs a SKU, title and image.`,
        );
        return { handle: null, sent: 0, dryRun: isDryRun() };
    }

    return postBatch([toMetaItem(product)], retry);
}

/** Removes a product from the catalog by SKU (retailer_id). */
export async function deleteProduct(sku: string, retry?: RetryOptions): Promise<BatchResult> {
    if (!sku?.trim()) {
        return { handle: null, sent: 0, dryRun: isDryRun() };
    }

    return postBatch([{ method: 'DELETE', data: { id: sku } }], retry);
}

/**
 * Batch upsert. Offline products become DELETEs so the catalog matches the
 * storefront in a single pass. Chunks above MAX_BATCH_SIZE are the caller's
 * responsibility — see the cron drain.
 */
export async function bulkUpsertProducts(
    products: SyncableProduct[],
    retry?: RetryOptions,
): Promise<BatchResult> {
    const requests: MetaBatchRequest[] = [];

    for (const product of products) {
        if (!product.isOnline) {
            requests.push({ method: 'DELETE', data: { id: product.sku } });
            continue;
        }

        if (!isSyncable(product)) {
            console.warn(
                `[meta-catalog] Skipping ${product.sku || '(no sku)'} — needs a SKU, title and image.`,
            );
            continue;
        }

        requests.push(toMetaItem(product));
    }

    return postBatch(requests, retry);
}
