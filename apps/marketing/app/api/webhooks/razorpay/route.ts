import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getServiceClient, markOrderPaid } from '@/lib/orders/service';

export const dynamic = 'force-dynamic';

/**
 * POST /api/webhooks/razorpay
 *
 * Configure in Razorpay Dashboard → Webhooks with RAZORPAY_WEBHOOK_SECRET and
 * the events payment_link.paid, payment_link.expired, payment_link.cancelled.
 *
 * Razorpay retries anything that isn't 2xx, and every handler here is
 * idempotent, so redeliveries are harmless.
 */
export async function POST(req: NextRequest) {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!secret) {
        console.error('[/api/webhooks/razorpay] RAZORPAY_WEBHOOK_SECRET is not set');
        return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 });
    }

    // Signature is over the raw body, so read it before parsing
    const raw = await req.text();
    const signature = req.headers.get('x-razorpay-signature') ?? '';
    const expected = crypto.createHmac('sha256', secret).update(raw).digest('hex');

    const valid =
        signature.length === expected.length &&
        crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
    if (!valid) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    /* eslint-disable @typescript-eslint/no-explicit-any */
    let event: any;
    try {
        event = JSON.parse(raw);
    } catch {
        return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const link = event?.payload?.payment_link?.entity;
    const orderId: string | undefined = link?.notes?.db_order_id;

    // Only payment-link events carry our order id; ignore everything else.
    if (!orderId) return NextResponse.json({ received: true });

    const supabase = getServiceClient();

    try {
        switch (event.event) {
            case 'payment_link.paid': {
                const payment = event.payload?.payment?.entity;
                await markOrderPaid(supabase, {
                    orderId,
                    paymentId: payment?.id ?? link.id,
                    razorpayOrderId: payment?.order_id ?? link.order_id ?? null,
                });
                break;
            }
            case 'payment_link.expired':
            case 'payment_link.cancelled': {
                // Only an unpaid pending order is cancelled; the status change
                // fires restore_stock_on_cancel and the saree is back on sale.
                await supabase
                    .from('orders')
                    .update({ status: 'cancelled', payment_status: 'failed', updated_at: new Date().toISOString() })
                    .eq('id', orderId)
                    .eq('status', 'pending')
                    .neq('payment_status', 'completed');
                break;
            }
        }
    } catch (err) {
        console.error(`[/api/webhooks/razorpay] ${event.event} failed for ${orderId}`, err);
        return NextResponse.json({ error: 'Handler failed' }, { status: 500 });
    }

    return NextResponse.json({ received: true });
}
