/**
 * Fires the Meta catalog drain immediately after a product write, so admin
 * edits reach the WhatsApp catalog in seconds rather than waiting for the
 * scheduled run.
 *
 * Coverage is deliberately partial. This only helps writes that go through a
 * server action:
 *   - covered:     admin edit / delete (lib/actions/product.actions.ts)
 *   - NOT covered: product creation, which inserts straight from the browser
 *                  (app/admin/products/new/page.tsx)
 *   - NOT covered: a saree selling, which decrements stock_quantity via a
 *                  Postgres trigger, so no application code runs at all
 * Those two still rely on the scheduled cron. Closing the gap needs a
 * scheduler that runs more often than once a day — Vercel's Hobby plan caps
 * crons at daily, so an external scheduler (or Pro) is the eventual fix.
 *
 * The queue row is written by the products trigger before this runs, so a
 * failure here costs nothing: the next cron run picks the row up.
 */

/**
 * Never awaited by callers — a slow or failing Meta call must not delay or
 * break a product save. Errors are logged and swallowed for the same reason.
 */
export function triggerMetaCatalogSync(): void {
    const secret = process.env.CRON_SECRET;
    if (!secret) {
        // Not configured — the scheduled run will handle the queue.
        return;
    }

    // Vercel exposes the deployment host; fall back to localhost in dev.
    const base = process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000');

    void fetch(`${base}/api/cron/meta-catalog-sync`, {
        method: 'POST',
        headers: { authorization: `Bearer ${secret}` },
        // Belongs to no page's cache — this is a side-effecting call.
        cache: 'no-store',
    }).catch((error) => {
        console.warn(
            '[meta-catalog] On-demand sync could not be triggered; the scheduled ' +
                'run will pick it up.',
            error instanceof Error ? error.message : error,
        );
    });
}
