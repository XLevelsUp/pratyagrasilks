import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createClient as createServerClient } from '@/lib/supabase/server';

// Ensure this route is always treated as dynamic
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    try {
        const { shippingAddress, items, shippingCost, shippingZoneId, estimatedDeliveryDays } = await request.json();

        if (!shippingAddress || !items || items.length === 0) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Use service role client to bypass RLS for guest checkout
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

        const supabase = createClient(supabaseUrl, supabaseServiceKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        });

        // Calculate totals (each item has quantity of 1)
        const subtotal = items.reduce((sum: number, item: any) => sum + item.price, 0);
        const total = subtotal + (shippingCost || 0);

        // Step 1: Create or find customer
        let customerId: string;

        // Check if customer exists
        const { data: existingCustomer } = await supabase
            .from('customers')
            .select('id')
            .eq('email', shippingAddress.email)
            .single();

        if (existingCustomer) {
            customerId = existingCustomer.id;
        } else {
            // Create new customer
            const { data: newCustomer, error: customerError } = await supabase
                .from('customers')
                .insert({
                    email: shippingAddress.email,
                    full_name: shippingAddress.fullName,
                    phone: shippingAddress.phone,
                })
                .select()
                .single();

            if (customerError || !newCustomer) {
                console.error('Customer creation error:', customerError);
                return NextResponse.json(
                    { error: 'Failed to create customer' },
                    { status: 500 }
                );
            }

            customerId = newCustomer.id;
        }

        // Step 2: Create shipping address
        const { data: address, error: addressError } = await supabase
            .from('addresses')
            .insert({
                customer_id: customerId,
                full_name: shippingAddress.fullName,
                address_line1: shippingAddress.addressLine1,
                address_line2: shippingAddress.addressLine2 || '',
                city: shippingAddress.city,
                state: shippingAddress.state || '',
                postal_code: shippingAddress.postalCode,
                country: shippingAddress.country || 'India',
                phone: shippingAddress.phone,
                is_default: false,
            })
            .select()
            .single();

        if (addressError || !address) {
            console.error('Address creation error:', addressError);
            return NextResponse.json(
                { error: 'Failed to create address' },
                { status: 500 }
            );
        }

        // Step 3: Generate order number
        const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

        // Step 4: Create order
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .insert({
                customer_id: customerId,
                order_number: orderNumber,
                total_amount: total,
                shipping_cost: shippingCost || 0,
                shipping_address_id: address.id,
                status: 'pending',
                payment_method: 'pending',
                payment_status: 'pending',
            })
            .select()
            .single();

        if (orderError) {
            console.error('Order creation error:', orderError);
            return NextResponse.json(
                { error: 'Failed to create order', details: orderError.message },
                { status: 500 }
            );
        }

        // Step 5: Create order items (each item has quantity of 1)
        const orderItems = items.map((item: any) => ({
            order_id: order.id,
            product_id: item.productId,
            product_name: item.name || 'Product',
            product_sku: item.sku || 'SKU',
            quantity: 1, // Always 1 for unique sarees
            unit_price: item.price,
            total_price: item.price, // Same as unit_price since quantity is 1
        }));

        const { error: itemsError } = await supabase
            .from('order_items')
            .insert(orderItems);

        if (itemsError) {
            console.error('Order items creation error:', itemsError);
            // Rollback: delete the order
            await supabase.from('orders').delete().eq('id', order.id);
            return NextResponse.json(
                { error: 'Failed to create order items', details: itemsError.message },
                { status: 500 }
            );
        }

        // Stock deduction would happen via database trigger if configured

        return NextResponse.json({
            orderId: order.id,
            orderNumber: order.order_number,
            message: 'Order created successfully',
        });
    } catch (error) {
        console.error('Order creation error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function GET() {
    try {
        const supabase = createServerClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data: orders, error } = await supabase
            .from('orders')
            .select('id, order_number, total_amount, status, payment_status, created_at')
            .eq('customer_id', user.id)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching orders:', error);
            return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
        }

        return NextResponse.json({ orders: orders ?? [] });
    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
