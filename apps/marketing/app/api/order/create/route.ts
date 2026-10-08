import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { shippingAddressSchema } from '@pratyagra/core/validations/form.schemas';
import { computeShipping, createPendingOrder, getServiceClient, OrderError } from '@/lib/orders/service';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    const supabaseAdmin = getServiceClient();

    try {
        const body = await req.json();
        // shippingCost from the client is ignored — shipping is computed server-side.
        const { shippingAddress, items, selectedAddressId } = body;

        // ── 1. Validate request shape ────────────────────────────────────────────
        if (!shippingAddress || !items || items.length === 0) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // ── 1b. Sanitize + validate shipping address with Zod ────────────────────
        const sanitizedPhone = (shippingAddress.phone ?? '').replace(/[^\d+]/g, '');
        const parsed = shippingAddressSchema.safeParse({ ...shippingAddress, phone: sanitizedPhone });
        if (!parsed.success) {
            return NextResponse.json(
                { error: 'Invalid shipping details', details: parsed.error.flatten().fieldErrors },
                { status: 422 }
            );
        }
        const validatedAddress = parsed.data;

        // ── 2. Shipping + pending order (prices re-fetched from DB) ──────────────
        const shipping = await computeShipping(supabaseAdmin, {
            country: validatedAddress.country,
            state: validatedAddress.state,
        });

        const order = await createPendingOrder(supabaseAdmin, {
            address: validatedAddress,
            productIds: items.map((i: { productId: string }) => i.productId),
            shipping,
            selectedAddressId,
        });

        // ── 3. Create Razorpay order ──────────────────────────────────────────────
        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID!,
            key_secret: process.env.RAZORPAY_KEY_SECRET!,
        });

        const rzpOrder = await razorpay.orders.create({
            amount: Math.round(order.totalAmount * 100), // paise
            currency: 'INR',
            receipt: order.id.slice(0, 40), // Razorpay receipt max 40 chars
            notes: {
                order_number: order.orderNumber,
                db_order_id: order.id,
            },
        });

        // Persist Razorpay order ID against our order
        await supabaseAdmin
            .from('orders')
            .update({ razorpay_order_id: rzpOrder.id })
            .eq('id', order.id);

        return NextResponse.json({
            success: true,
            razorpayOrderId: rzpOrder.id,
            amount: rzpOrder.amount,
            currency: rzpOrder.currency,
            dbOrderId: order.id,
            orderNumber: order.orderNumber,
        });
    } catch (err) {
        if (err instanceof OrderError) {
            return NextResponse.json({ error: err.message }, { status: err.status });
        }
        console.error('[/api/order/create]', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
