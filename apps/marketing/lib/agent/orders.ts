import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * The order shape the agent API returns. Deliberately leaves out email,
 * address and phone — the caller proved knowledge of the phone, nothing more.
 */
export const AGENT_ORDER_SELECT = `
    order_number, status, payment_status, created_at, subtotal, shipping_cost,
    total_amount, estimated_delivery_days, payment_link_url, payment_link_expires_at,
    order_items ( product_name, unit_price )
`;

/* eslint-disable @typescript-eslint/no-explicit-any */
export function toAgentOrder(o: any) {
    const items = (o.order_items ?? []).map((i: any) => ({
        name: i.product_name,
        unit_price: Number(i.unit_price),
    }));
    const subtotal = o.subtotal != null
        ? Number(o.subtotal)
        : items.reduce((s: number, i: { unit_price: number }) => s + i.unit_price, 0);

    return {
        order_number: o.order_number,
        status: o.status,
        payment_status: o.payment_status,
        placed_at: o.created_at,
        items,
        subtotal,
        shipping: Number(o.shipping_cost ?? 0),
        total: Number(o.total_amount),
        estimated_days: o.estimated_delivery_days ?? null,
        // Only useful while it can still be paid
        payment_link: o.payment_status === 'pending' ? o.payment_link_url ?? null : null,
        payment_link_expires_at: o.payment_status === 'pending' ? o.payment_link_expires_at ?? null : null,
    };
}

/**
 * Spellings the same number may be stored under. POS writes E.164, but the
 * website checkout stores the phone as typed (digits and '+' only), so
 * "+919876543210", "919876543210" and "9876543210" must all match.
 */
function phoneVariants(e164: string): string[] {
    const digits = e164.replace(/^\+/, '');
    const variants = [e164, digits];
    if (e164.startsWith('+91')) variants.push(e164.slice(3), `0${e164.slice(3)}`);
    return variants;
}

/**
 * Customer IDs whose phone matches — on the customer record or on any saved
 * address (guest checkouts keep the phone on both, POS walk-ins on the record).
 * `phone` must already be E.164.
 */
export async function customerIdsForPhone(supabase: SupabaseClient, phone: string): Promise<string[]> {
    const variants = phoneVariants(phone);
    const [{ data: customers }, { data: addresses }] = await Promise.all([
        supabase.from('customers').select('id').in('phone', variants),
        supabase.from('addresses').select('customer_id').in('phone', variants),
    ]);
    return Array.from(new Set([
        ...(customers ?? []).map((c) => c.id as string),
        ...(addresses ?? []).map((a) => a.customer_id as string),
    ]));
}
