import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { sendSaleWhatsAppNotification } from '@/lib/utils/whatsapp';
import { getActiveCampaignPublic } from '@/lib/data/public-products';
import { getFinalPrice } from '@pratyagra/core/utils/campaign';
import type { ShippingAddress } from '@pratyagra/core/validations/form.schemas';
import { sendOrderConfirmation } from '@/lib/mail/sender';
import type { OrderEmailData } from '@/lib/mail/templates';

/**
 * Order logic shared by the website checkout (/api/order/*), the agent API
 * (/api/agent/*) and the Razorpay webhook, so every path prices, ships and
 * marks orders paid the same way.
 */

export const INTERNATIONAL_SHIPPING_CHARGE = 2500;
export const INTERNATIONAL_ESTIMATED_DAYS = '10–15 business days';

export function getServiceClient(): SupabaseClient {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { autoRefreshToken: false, persistSession: false } }
    );
}

/** Failure the route should surface to the caller as-is. */
export class OrderError extends Error {
    constructor(
        public status: number,
        public code: string,
        message: string,
        public details?: unknown
    ) {
        super(message);
    }
}

export interface ShippingQuote {
    zoneId: string | null;
    charge: number;
    estimatedDays: string | null;
}

/**
 * Same rule as the checkout page: Indian orders pay the zone's base_charge,
 * everything else a flat international rate.
 */
export async function computeShipping(
    supabase: SupabaseClient,
    { country, state }: { country?: string | null; state?: string | null }
): Promise<ShippingQuote> {
    if ((country || 'India') !== 'India') {
        return { zoneId: null, charge: INTERNATIONAL_SHIPPING_CHARGE, estimatedDays: INTERNATIONAL_ESTIMATED_DAYS };
    }

    const { data: zones, error } = await supabase
        .from('shipping_zones')
        .select('id, states, base_charge, estimated_days')
        .eq('is_active', true);

    if (error) throw new OrderError(500, 'INTERNAL', 'Failed to fetch shipping zones');

    const zone = zones?.find((z) => (z.states as string[]).includes(state ?? ''));
    if (!zone) throw new OrderError(422, 'UNSERVICEABLE_STATE', 'Shipping not available for this state');

    return { zoneId: zone.id, charge: Number(zone.base_charge), estimatedDays: zone.estimated_days };
}

export interface PendingOrder {
    id: string;
    orderNumber: string;
    subtotal: number;
    shippingCost: number;
    totalAmount: number;
    items: Array<{ product_name: string; unit_price: number }>;
}

/**
 * Re-prices from the DB, rejects sold sarees, upserts the customer (by email)
 * and address, and writes a pending order + items. Inserting the items fires
 * the stock-deduction trigger.
 */
export async function createPendingOrder(
    supabase: SupabaseClient,
    {
        address,
        productIds,
        shipping,
        selectedAddressId,
        sourceChannel,
        idempotencyKey,
    }: {
        address: ShippingAddress;
        productIds: string[];
        shipping: ShippingQuote;
        selectedAddressId?: string | null;
        /** Agent orders only. Omitted for the website so it never depends on the agent migration. */
        sourceChannel?: string | null;
        idempotencyKey?: string | null;
    }
): Promise<PendingOrder> {
    // ── Re-fetch prices from DB to prevent price tampering ──────────────────
    const uniqueIds = Array.from(new Set(productIds));
    const { data: products, error: productErr } = await supabase
        .from('products')
        .select('id, name, price, sale_price, exclude_from_sales, category, is_online, in_stock, sku')
        .in('id', uniqueIds);

    if (productErr || !products || products.length !== uniqueIds.length) {
        throw new OrderError(400, 'PRODUCT_NOT_FOUND', 'Could not verify product details');
    }

    const outOfStock = products.filter((p) => !p.in_stock || !p.is_online);
    if (outOfStock.length > 0) {
        throw new OrderError(409, 'ITEM_SOLD', `Out of stock: ${outOfStock.map((p) => p.name).join(', ')}`, {
            sold: outOfStock.map((p) => p.id),
        });
    }

    // Prices resolve from the DB and the live campaign, never from the client,
    // so a tampered cart cannot invent its own offer or revive an ended sale.
    const campaign = await getActiveCampaignPublic();
    const priceFor = (p: (typeof products)[number]) => getFinalPrice(p, campaign);

    const subtotal = products.reduce((sum, p) => sum + priceFor(p), 0);
    const totalAmount = subtotal + shipping.charge;

    // ── Persist customer ─────────────────────────────────────────────────────
    let customerId: string;
    const { data: existingCustomer } = await supabase
        .from('customers')
        .select('id')
        .eq('email', address.email)
        .single();

    if (existingCustomer) {
        customerId = existingCustomer.id;
        // Keep name current in case it was entered differently before
        await supabase
            .from('customers')
            .update({ full_name: address.fullName, phone: address.phone })
            .eq('id', customerId);
    } else {
        const { data: newCustomer, error: custErr } = await supabase
            .from('customers')
            .insert({ email: address.email, full_name: address.fullName, phone: address.phone })
            .select()
            .single();

        if (custErr || !newCustomer) throw new OrderError(500, 'INTERNAL', 'Failed to create customer');
        customerId = newCustomer.id;
    }

    // ── Persist shipping address ─────────────────────────────────────────────
    let shippingAddressId: string;

    if (selectedAddressId) {
        // Verify that this address exists and belongs to the customer ID
        const { data: saved, error: addrErr } = await supabase
            .from('addresses')
            .select('id')
            .eq('id', selectedAddressId)
            .eq('customer_id', customerId)
            .single();

        if (addrErr || !saved) throw new OrderError(400, 'INVALID_ADDRESS', 'Selected address not found or invalid');
        shippingAddressId = saved.id;
    } else {
        const { data: inserted, error: addrErr } = await supabase
            .from('addresses')
            .insert({
                customer_id: customerId,
                full_name: address.fullName,
                address_line1: address.addressLine1,
                address_line2: address.addressLine2 || '',
                city: address.city,
                state: address.state || '',
                postal_code: address.postalCode,
                country: address.country || 'India',
                phone: address.phone,
                is_default: false,
            })
            .select()
            .single();

        if (addrErr || !inserted) throw new OrderError(500, 'INTERNAL', 'Failed to save address');
        shippingAddressId = inserted.id;
    }

    // ── Create pending order ─────────────────────────────────────────────────
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).slice(2, 9).toUpperCase()}`;

    const { data: order, error: orderErr } = await supabase
        .from('orders')
        .insert({
            customer_id: customerId,
            order_number: orderNumber,
            subtotal,
            total_amount: totalAmount,
            shipping_cost: shipping.charge,
            shipping_address_id: shippingAddressId,
            status: 'pending',
            payment_method: 'razorpay',
            payment_status: 'pending',
            ...(sourceChannel && { source_channel: sourceChannel }),
            ...(idempotencyKey && { idempotency_key: idempotencyKey }),
            ...(shipping.zoneId && { shipping_zone_id: shipping.zoneId }),
            ...(shipping.estimatedDays && { estimated_delivery_days: shipping.estimatedDays }),
        })
        .select()
        .single();

    if (orderErr || !order) {
        // 23505 = the idempotency key was taken by a concurrent request
        if (orderErr?.code === '23505') throw new OrderError(409, 'DUPLICATE_REQUEST', 'Request already in progress');
        throw new OrderError(500, 'INTERNAL', 'Failed to create order');
    }

    // ── Create order items (triggers stock deduction via DB trigger) ─────────
    const orderItems = products.map((p) => ({
        order_id: order.id,
        product_id: p.id,
        product_name: p.name,
        product_sku: p.sku,
        quantity: 1,
        unit_price: priceFor(p),
        total_price: priceFor(p),
    }));

    const { error: itemsErr } = await supabase.from('order_items').insert(orderItems);

    if (itemsErr) {
        // Rollback: delete the order
        await supabase.from('orders').delete().eq('id', order.id);
        throw new OrderError(500, 'INTERNAL', 'Failed to save order items');
    }

    // Internal WhatsApp sale alert — fires as soon as address + items are confirmed,
    // regardless of whether the payment that follows succeeds or fails.
    (async () => {
        try {
            await sendSaleWhatsAppNotification({
                orderId: orderNumber,
                customerName: address.fullName,
                totalAmount: new Intl.NumberFormat('en-IN').format(totalAmount),
                items: orderItems.map((oi) => `${oi.quantity}x ${oi.product_name}`).join(', '),
            });
            console.log(`[orders] WhatsApp sale alert sent for ${orderNumber}`);
        } catch (waErr) {
            console.error('[orders] WhatsApp send failed (non-fatal):', waErr);
        }
    })();

    return {
        id: order.id,
        orderNumber,
        subtotal,
        shippingCost: shipping.charge,
        totalAmount,
        items: orderItems.map(({ product_name, unit_price }) => ({ product_name, unit_price })),
    };
}

/**
 * Idempotently marks an order paid and sends the confirmation email.
 * Returns false when it was already paid.
 */
export async function markOrderPaid(
    supabase: SupabaseClient,
    {
        orderId,
        paymentId,
        signature,
        razorpayOrderId,
    }: { orderId: string; paymentId: string; signature?: string | null; razorpayOrderId?: string | null }
): Promise<{ alreadyPaid: boolean; orderNumber: string }> {
    const { data: order, error: findErr } = await supabase
        .from('orders')
        .select('id, order_number, payment_status, customer_id, shipping_address_id, subtotal, total_amount, shipping_cost, estimated_delivery_days')
        .eq('id', orderId)
        .single();

    if (findErr || !order) throw new OrderError(404, 'ORDER_NOT_FOUND', 'Order not found');

    if (order.payment_status === 'completed') {
        return { alreadyPaid: true, orderNumber: order.order_number };
    }

    const { error: updateErr } = await supabase
        .from('orders')
        .update({
            status: 'processing',
            payment_status: 'completed',
            razorpay_payment_id: paymentId,
            ...(signature && { razorpay_signature: signature }),
            ...(razorpayOrderId && { razorpay_order_id: razorpayOrderId }),
            payment_verified_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        })
        .eq('id', order.id);

    if (updateErr) {
        console.error('[orders] mark paid failed', updateErr);
        throw new OrderError(500, 'INTERNAL', 'Failed to update order status');
    }

    console.log(`[orders] Payment verified — order ${order.order_number}`);

    // Confirmation email (non-blocking)
    void (async () => {
        const { data: customer } = await supabase
            .from('customers')
            .select('full_name, email')
            .eq('id', order.customer_id)
            .single();

        if (!customer?.email) return;

        const { data: items } = await supabase
            .from('order_items')
            .select('product_name, product_sku, quantity, unit_price, total_price')
            .eq('order_id', order.id);

        const { data: address } = await supabase
            .from('addresses')
            .select('full_name, address_line1, address_line2, city, state, postal_code')
            .eq('id', order.shipping_address_id)
            .single();

        try {
            const emailData: OrderEmailData = {
                orderNumber: order.order_number,
                customerName: address?.full_name || customer.full_name || 'Valued Customer',
                customerEmail: customer.email,
                items: (items ?? []).map((i) => ({
                    name: i.product_name,
                    sku: i.product_sku,
                    quantity: i.quantity,
                    unitPrice: i.unit_price,
                    totalPrice: i.total_price,
                })),
                subtotal: order.subtotal ?? order.total_amount,
                shippingCharge: order.shipping_cost ?? 0,
                totalAmount: order.total_amount,
                shippingAddress: address ? {
                    line1: address.address_line1,
                    line2: address.address_line2,
                    city: address.city,
                    state: address.state,
                    pincode: address.postal_code,
                } : { line1: '', city: '', state: '', pincode: '' },
                estimatedDelivery: order.estimated_delivery_days ?? null,
            };

            await sendOrderConfirmation(customer.email, emailData);
            console.log(`[orders] Confirmation email sent → ${customer.email}`);
        } catch (emailErr) {
            console.error('[orders] Email send failed (non-fatal):', emailErr);
        }
    })();

    return { alreadyPaid: false, orderNumber: order.order_number };
}
