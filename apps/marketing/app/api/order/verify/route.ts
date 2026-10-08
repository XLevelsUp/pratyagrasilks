import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getServiceClient, markOrderPaid, OrderError } from '@/lib/orders/service';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    const supabaseAdmin = getServiceClient();

    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return NextResponse.json({ error: 'Missing payment verification fields' }, { status: 400 });
        }

        // ── 1. HMAC-SHA256 signature verification ────────────────────────────────
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest('hex');

        if (expectedSignature !== razorpay_signature) {
            console.error('[/api/order/verify] Signature mismatch');
            return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 });
        }

        // ── 2. Look up the order by Razorpay order ID ────────────────────────────
        const { data: order, error: findErr } = await supabaseAdmin
            .from('orders')
            .select('id')
            .eq('razorpay_order_id', razorpay_order_id)
            .single();

        if (findErr || !order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        // ── 3. Mark paid (idempotent) + confirmation email ───────────────────────
        // Note: the internal WhatsApp sale alert fires earlier, in /api/order/create,
        // as soon as the address + items are confirmed — not gated on payment success.
        const { alreadyPaid, orderNumber } = await markOrderPaid(supabaseAdmin, {
            orderId: order.id,
            paymentId: razorpay_payment_id,
            signature: razorpay_signature,
        });

        return NextResponse.json({
            success: true,
            ...(alreadyPaid && { message: 'Already verified' }),
            orderId: order.id,
            orderNumber,
        });
    } catch (err) {
        if (err instanceof OrderError) {
            return NextResponse.json({ error: err.message }, { status: err.status });
        }
        console.error('[/api/order/verify]', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
