import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createClient as createSessionClient } from '@pratyagra/auth/server';

// Ensure this route is always treated as dynamic
export const dynamic = 'force-dynamic';

const GUEST_CONFIRMATION_WINDOW_MS = 60 * 60 * 1000;

async function canViewOrder(order: { customer_id: string; payment_verified_at: string | null }): Promise<boolean> {
    const { data: { user } } = await createSessionClient().auth.getUser();
    if (user && user.id === order.customer_id) return true;

    if (order.payment_verified_at) {
        const paidAgo = Date.now() - new Date(order.payment_verified_at).getTime();
        if (paidAgo >= 0 && paidAgo < GUEST_CONFIRMATION_WINDOW_MS) return true;
    }
    return false;
}

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        // Use service role client to bypass RLS
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // Fetch order
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .select('*')
            .eq('id', params.id)
            .single();

        if (orderError || !order) {
            return NextResponse.json(
                { error: 'Order not found' },
                { status: 404 }
            );
        }

        // The response carries the customer's name, email, phone and address,
        // so only the owner may read it — or a guest during the brief window
        // after paying, when the confirmation page loads it without a session.
        if (!(await canViewOrder(order))) {
            return NextResponse.json(
                { error: 'Order not found' },
                { status: 404 }
            );
        }

        // Fetch customer details
        const { data: customer } = await supabase
            .from('customers')
            .select('*')
            .eq('id', order.customer_id)
            .single();

        // Fetch shipping address
        const { data: address } = await supabase
            .from('addresses')
            .select('*')
            .eq('id', order.shipping_address_id)
            .single();

        // Fetch order items with product details
        const { data: items, error: itemsError } = await supabase
            .from('order_items')
            .select(`
        *,
        products (
          id,
          name,
          images,
          sku
        )
      `)
            .eq('order_id', params.id);

        if (itemsError) {
            console.error('Error fetching order items:', itemsError);
            return NextResponse.json(
                { error: 'Failed to fetch order items' },
                { status: 500 }
            );
        }

        // Calculate subtotal from items
        const subtotal = items?.reduce((sum, item) => sum + (item.total_price || 0), 0) || 0;

        // Get shipping cost from order or calculate
        // Check if order has shipping_cost field, otherwise default to 0
        const shippingCharge = order.shipping_cost || 0;

        // Combine all data
        return NextResponse.json({
            order: {
                ...order,
                customer_name: customer?.full_name || 'Guest',
                customer_email: customer?.email || '',
                customer_phone: customer?.phone || '',
                shipping_address: address ? {
                    line1: address.address_line1,
                    line2: address.address_line2,
                    city: address.city,
                    state: address.state,
                    pincode: address.postal_code,
                    country: address.country,
                } : null,
                subtotal: subtotal,
                shipping_charge: shippingCharge,
                items: items || [],
            },
        });
    } catch (error) {
        console.error('Error fetching order:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
