import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { z } from 'zod';
import { shippingAddressSchema } from '@pratyagra/core/validations/form.schemas';
import { normalizeToE164 } from '@pratyagra/core/utils/phone';
import { agentError, requireAgentKey } from '@/lib/agent/auth';
import { computeShipping, createPendingOrder, getServiceClient, OrderError } from '@/lib/orders/service';

export const dynamic = 'force-dynamic';

const bodySchema = z.object({
    customer: z.object({
        full_name: z.string(),
        email: z.string(),
        phone: z.string(),
    }),
    address: z.object({
        address_line1: z.string(),
        address_line2: z.string().nullish(),
        city: z.string(),
        state: z.string().nullish(),
        postal_code: z.string(),
        country: z.string().nullish(),
    }),
    product_ids: z.array(z.string().uuid()).min(1).max(10),
    channel: z.enum(['web', 'whatsapp', 'instagram']),
});

/** Link lifetime in minutes; Razorpay requires at least 15. */
function linkTtlMinutes(): number {
    const ttl = parseInt(process.env.AGENT_LINK_TTL_MIN || '1440');
    return Number.isFinite(ttl) && ttl >= 16 ? ttl : 1440;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function linkResponse(order: any, status: number) {
    return NextResponse.json(
        {
            order_number: order.order_number,
            amount: Number(order.total_amount),
            amount_display: `₹${new Intl.NumberFormat('en-IN').format(Number(order.total_amount))}`,
            subtotal: Number(order.subtotal ?? 0),
            shipping: Number(order.shipping_cost ?? 0),
            estimated_days: order.estimated_delivery_days ?? null,
            items: (order.order_items ?? []).map((i: any) => ({ name: i.product_name, unit_price: Number(i.unit_price) })),
            payment_link: order.payment_link_url,
            expires_at: order.payment_link_expires_at,
        },
        { status }
    );
}

const ORDER_FIELDS =
    'id, order_number, total_amount, subtotal, shipping_cost, estimated_delivery_days, payment_link_url, payment_link_expires_at, order_items ( product_name, unit_price )';

/**
 * POST /api/agent/checkout-link
 *
 * Creates a pending order (which takes the sarees out of stock) and a Razorpay
 * Payment Link for it. The /api/webhooks/razorpay handler marks it paid, or
 * cancels it and restores stock when the link expires.
 *
 * Send an Idempotency-Key header: a retry with the same key returns the
 * original link instead of creating a second order.
 */
export async function POST(req: NextRequest) {
    const denied = requireAgentKey(req);
    if (denied) return denied;

    const idempotencyKey = req.headers.get('idempotency-key')?.trim().slice(0, 200) || null;
    const supabase = getServiceClient();

    if (idempotencyKey) {
        const { data: existing } = await supabase
            .from('orders')
            .select(ORDER_FIELDS)
            .eq('idempotency_key', idempotencyKey)
            .maybeSingle();
        if (existing?.payment_link_url) return linkResponse(existing, 200);
        if (existing) return agentError(409, 'DUPLICATE_REQUEST', 'A request with this Idempotency-Key is still in progress');
    }

    let body: z.infer<typeof bodySchema>;
    try {
        const parsedBody = bodySchema.safeParse(await req.json());
        if (!parsedBody.success) {
            return agentError(422, 'INVALID_REQUEST', 'Invalid request body', parsedBody.error.flatten().fieldErrors);
        }
        body = parsedBody.data;
    } catch {
        return agentError(400, 'INVALID_JSON', 'Body must be JSON');
    }

    const phone = normalizeToE164(body.customer.phone);
    if (!phone) return agentError(422, 'INVALID_ADDRESS', 'Invalid phone number', { phone: ['Invalid phone number'] });

    const parsed = shippingAddressSchema.safeParse({
        fullName: body.customer.full_name,
        email: body.customer.email,
        phone,
        addressLine1: body.address.address_line1,
        addressLine2: body.address.address_line2 ?? undefined,
        city: body.address.city,
        state: body.address.state ?? undefined,
        postalCode: body.address.postal_code,
        country: body.address.country || 'India',
    });
    if (!parsed.success) {
        return agentError(422, 'INVALID_ADDRESS', 'Invalid shipping details', parsed.error.flatten().fieldErrors);
    }
    const address = parsed.data;

    try {
        const shipping = await computeShipping(supabase, { country: address.country, state: address.state });

        const order = await createPendingOrder(supabase, {
            address,
            productIds: body.product_ids,
            shipping,
            sourceChannel: `agent_${body.channel}`,
            idempotencyKey,
        });

        const expireBy = Math.floor(Date.now() / 1000) + linkTtlMinutes() * 60;

        let link: { id: string; short_url: string };
        try {
            const razorpay = new Razorpay({
                key_id: process.env.RAZORPAY_KEY_ID!,
                key_secret: process.env.RAZORPAY_KEY_SECRET!,
            });
            link = await razorpay.paymentLink.create({
                amount: Math.round(order.totalAmount * 100), // paise
                currency: 'INR',
                accept_partial: false,
                reference_id: order.orderNumber,
                description: `Pratyagra Silks order ${order.orderNumber}`,
                customer: { name: address.fullName, email: address.email, contact: phone },
                notify: { sms: false, email: false },
                reminder_enable: false,
                expire_by: expireBy,
                notes: { order_number: order.orderNumber, db_order_id: order.id },
            });
        } catch (rzpErr) {
            // No link means nobody can pay — release the sarees straight away.
            console.error('[/api/agent/checkout-link] Razorpay error', rzpErr);
            await supabase
                .from('orders')
                .update({ status: 'cancelled', payment_status: 'failed', updated_at: new Date().toISOString() })
                .eq('id', order.id);
            return agentError(502, 'PAYMENT_PROVIDER_ERROR', 'Could not create the payment link');
        }

        const { data: saved, error: saveErr } = await supabase
            .from('orders')
            .update({
                razorpay_payment_link_id: link.id,
                payment_link_url: link.short_url,
                payment_link_expires_at: new Date(expireBy * 1000).toISOString(),
            })
            .eq('id', order.id)
            .select(ORDER_FIELDS)
            .single();

        if (saveErr || !saved) throw saveErr ?? new Error('Failed to save payment link');

        return linkResponse(saved, 201);
    } catch (err) {
        if (err instanceof OrderError) return agentError(err.status, err.code, err.message, err.details);
        console.error('[/api/agent/checkout-link]', err);
        return agentError(500, 'INTERNAL', 'Internal server error');
    }
}
