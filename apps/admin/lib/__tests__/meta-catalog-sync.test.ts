import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
    bulkUpsertProducts,
    checkBatchStatus,
    deleteProduct,
    isSyncable,
    toMetaItem,
    upsertProduct,
    type SyncableProduct,
} from '../meta-catalog-sync';

const CATALOG_ID = '1666000000000000';
const TOKEN = 'test-token-value';

/** No sleeping in CI — retry delays are injected. */
const noSleep = { sleep: async () => {} };

function product(overrides: Partial<SyncableProduct> = {}): SyncableProduct {
    return {
        id: 'a1b2c3d4-0000-0000-0000-000000000001',
        sku: 'PS-KANJ-001',
        name: 'Emerald Mosaic Kanjivaram',
        description: 'Handwoven pure silk',
        price: 2500,
        salePrice: null,
        images: ['https://example.supabase.co/img1.jpg'],
        inStock: true,
        isOnline: true,
        ...overrides,
    };
}

function jsonResponse(body: unknown, status = 200): Response {
    return {
        ok: status >= 200 && status < 300,
        status,
        json: async () => body,
        text: async () => JSON.stringify(body),
    } as Response;
}

let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
    process.env.META_CATALOG_ID = CATALOG_ID;
    process.env.META_CATALOG_TOKEN = TOKEN;
    // Tests exercise the real request path, not the dry-run short-circuit.
    process.env.META_CATALOG_DRY_RUN = 'false';

    fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'info').mockImplementation(() => {});
});

afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
});

/** Decodes the form-encoded body the module posted. */
function sentRequests(call = 0) {
    const body = fetchMock.mock.calls[call][1].body as URLSearchParams;
    return JSON.parse(body.get('requests')!);
}

describe('item mapping', () => {
    it('sends price in minor units with a separate currency', () => {
        const item = toMetaItem(product({ price: 2500 }));

        expect(item.data.price).toBe('250000');
        expect(item.data.currency).toBe('INR');
    });

    it('prefers sale_price when a discount is active', () => {
        const item = toMetaItem(product({ price: 2500, salePrice: 1999 }));

        expect(item.data.price).toBe('199900');
    });

    it('ignores a sale_price that is not actually lower', () => {
        const item = toMetaItem(product({ price: 2500, salePrice: 3000 }));

        expect(item.data.price).toBe('250000');
    });

    it('maps in_stock to availability', () => {
        expect(toMetaItem(product({ inStock: true })).data.availability).toBe('in stock');
        expect(toMetaItem(product({ inStock: false })).data.availability).toBe('out of stock');
    });

    it('uses the SKU as retailer_id and links to the product page', () => {
        const item = toMetaItem(product({ sku: 'PS-9', id: 'abc' }));

        expect(item.data.id).toBe('PS-9');
        expect(item.data.link).toBe('https://pratyagrasilks.com/product/abc');
    });

    it('falls back to the title when description is blank', () => {
        const item = toMetaItem(product({ description: '   ' }));

        expect(item.data.description).toBe('Emerald Mosaic Kanjivaram');
    });

    it('rejects products without a SKU, title or image', () => {
        expect(isSyncable(product())).toBe(true);
        expect(isSyncable(product({ sku: '' }))).toBe(false);
        expect(isSyncable(product({ name: '' }))).toBe(false);
        expect(isSyncable(product({ images: [] }))).toBe(false);
    });
});

describe('successful upsert', () => {
    it('posts one UPDATE and returns the handle', async () => {
        fetchMock.mockResolvedValueOnce(jsonResponse({ handles: ['handle-123'] }));

        const result = await upsertProduct(product(), noSleep);

        expect(result.handle).toBe('handle-123');
        expect(result.sent).toBe(1);

        const [url, init] = fetchMock.mock.calls[0];
        expect(url).toBe(`https://graph.facebook.com/v25.0/${CATALOG_ID}/items_batch`);
        expect(init.method).toBe('POST');

        const requests = sentRequests();
        expect(requests).toHaveLength(1);
        expect(requests[0].method).toBe('UPDATE');
        expect(requests[0].data.id).toBe('PS-KANJ-001');
    });

    it('skips unsyncable products without calling Meta', async () => {
        const result = await upsertProduct(product({ images: [] }), noSleep);

        expect(fetchMock).not.toHaveBeenCalled();
        expect(result.sent).toBe(0);
    });
});

describe('successful delete', () => {
    it('posts a DELETE carrying only the id', async () => {
        fetchMock.mockResolvedValueOnce(jsonResponse({ handles: ['handle-del'] }));

        const result = await deleteProduct('PS-KANJ-001', noSleep);

        expect(result.handle).toBe('handle-del');

        const requests = sentRequests();
        expect(requests[0]).toEqual({ method: 'DELETE', data: { id: 'PS-KANJ-001' } });
    });

    it('turns offline products into DELETEs during a bulk push', async () => {
        fetchMock.mockResolvedValueOnce(jsonResponse({ handles: ['h'] }));

        await bulkUpsertProducts(
            [
                product({ sku: 'ONLINE-1' }),
                product({ sku: 'OFFLINE-1', isOnline: false }),
            ],
            noSleep,
        );

        const requests = sentRequests();
        expect(requests).toHaveLength(2);
        expect(requests.find((r: { data: { id: string } }) => r.data.id === 'OFFLINE-1').method)
            .toBe('DELETE');
        expect(requests.find((r: { data: { id: string } }) => r.data.id === 'ONLINE-1').method)
            .toBe('UPDATE');
    });

    it('keeps sold-out products in the catalog rather than deleting them', async () => {
        fetchMock.mockResolvedValueOnce(jsonResponse({ handles: ['h'] }));

        await bulkUpsertProducts([product({ inStock: false, isOnline: true })], noSleep);

        const requests = sentRequests();
        expect(requests[0].method).toBe('UPDATE');
        expect(requests[0].data.availability).toBe('out of stock');
    });
});

describe('partial batch failure', () => {
    it('surfaces per-item errors reported by the status check', async () => {
        fetchMock.mockResolvedValueOnce(
            jsonResponse({
                data: [
                    {
                        status: 'finished',
                        errors: [{ message: 'Invalid image_link for item PS-KANJ-002' }],
                        warnings: [{ message: 'Description truncated' }],
                    },
                ],
            }),
        );

        const errors = await checkBatchStatus('handle-123', { sleep: async () => {} });

        expect(errors).toContain('Invalid image_link for item PS-KANJ-002');
        expect(errors).toContain('warning: Description truncated');
    });

    it('reports no errors when the batch finishes clean', async () => {
        fetchMock.mockResolvedValueOnce(
            jsonResponse({ data: [{ status: 'finished', errors: [] }] }),
        );

        const errors = await checkBatchStatus('handle-ok', { sleep: async () => {} });

        expect(errors).toEqual([]);
    });

    it('keeps polling while the batch is still in progress', async () => {
        fetchMock
            .mockResolvedValueOnce(jsonResponse({ data: [{ status: 'in progress' }] }))
            .mockResolvedValueOnce(
                jsonResponse({ data: [{ status: 'finished', errors: [] }] }),
            );

        const errors = await checkBatchStatus('handle-slow', { sleep: async () => {} });

        expect(fetchMock).toHaveBeenCalledTimes(2);
        expect(errors).toEqual([]);
    });
});

describe('retry behaviour', () => {
    it('retries a network error then succeeds', async () => {
        fetchMock
            .mockRejectedValueOnce(new Error('ECONNRESET'))
            .mockResolvedValueOnce(jsonResponse({ handles: ['handle-after-retry'] }));

        const result = await upsertProduct(product(), noSleep);

        expect(fetchMock).toHaveBeenCalledTimes(2);
        expect(result.handle).toBe('handle-after-retry');
    });

    it('retries on 429 and on 5xx', async () => {
        fetchMock
            .mockResolvedValueOnce(jsonResponse({ error: 'rate limited' }, 429))
            .mockResolvedValueOnce(jsonResponse({ error: 'server' }, 503))
            .mockResolvedValueOnce(jsonResponse({ handles: ['ok'] }));

        const result = await upsertProduct(product(), noSleep);

        expect(fetchMock).toHaveBeenCalledTimes(3);
        expect(result.handle).toBe('ok');
    });

    it('does not retry a 400 — a malformed item will never succeed', async () => {
        fetchMock.mockResolvedValueOnce(jsonResponse({ error: 'bad request' }, 400));

        await expect(upsertProduct(product(), noSleep)).rejects.toThrow(/400/);
        expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it('gives up after exhausting attempts', async () => {
        fetchMock.mockResolvedValue(jsonResponse({ error: 'server' }, 500));

        await expect(upsertProduct(product(), { attempts: 3, sleep: async () => {} }))
            .rejects.toThrow();
        expect(fetchMock).toHaveBeenCalledTimes(3);
    });
});

describe('security', () => {
    it('never puts the token in the URL for batch posts', async () => {
        fetchMock.mockResolvedValueOnce(jsonResponse({ handles: ['h'] }));

        await upsertProduct(product(), noSleep);

        expect(fetchMock.mock.calls[0][0]).not.toContain(TOKEN);
    });

    it('throws when credentials are missing instead of half-syncing', async () => {
        delete process.env.META_CATALOG_ID;

        await expect(upsertProduct(product(), noSleep)).rejects.toThrow(/not configured/);
        expect(fetchMock).not.toHaveBeenCalled();
    });
});

describe('dry run', () => {
    it('sends nothing to Meta when dry run is on', async () => {
        process.env.META_CATALOG_DRY_RUN = 'true';

        const result = await upsertProduct(product(), noSleep);

        expect(fetchMock).not.toHaveBeenCalled();
        expect(result.dryRun).toBe(true);
        expect(result.sent).toBe(1);
    });
});
