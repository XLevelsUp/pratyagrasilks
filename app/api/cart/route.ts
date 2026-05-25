import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Ensure this route is always treated as dynamic
export const dynamic = 'force-dynamic';

/**
 * GET /api/cart
 * Retrieve cart items for the authenticated user or guest
 */
export async function GET(request: NextRequest) {
    try {
        const supabase = createClient();

        // Try to get authenticated user
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
            // Authenticated user: fetch cart from database
            const { data: cartItems, error } = await supabase
                .from('cart_items')
                .select(`
                    id,
                    product_id,
                    quantity,
                    created_at,
                    updated_at,
                    products (
                        id,
                        name,
                        price,
                        description,
                        images,
                        in_stock,
                        is_online,
                        sku,
                        category
                    )
                `)
                .eq('customer_id', user.id);

            if (error) {
                console.error('Error fetching cart:', error);
                return NextResponse.json(
                    { error: 'Failed to fetch cart' },
                    { status: 500 }
                );
            }

            // Filter out any cart items whose product is POS-only (is_online = false)
            const onlineItems = (cartItems || []).filter(
                (item) => (item.products as any)?.is_online !== false
            );

            return NextResponse.json({
                source: 'database',
                customerId: user.id,
                items: onlineItems,
                totalItems: onlineItems.length,
            });
        } else {
            // Guest user: return empty cart (client will use localStorage)
            return NextResponse.json({
                source: 'guest',
                items: [],
                totalItems: 0,
                message: 'Not authenticated. Cart is stored in browser storage.',
            });
        }
    } catch (error) {
        console.error('Cart GET error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

/**
 * PUT /api/cart
 * Update cart items for authenticated user
 * Body: { items: [{ productId, quantity }, ...] }
 */
export async function PUT(request: NextRequest) {
    try {
        const supabase = createClient();

        // Check if user is authenticated
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { error: 'Unauthorized. Please log in to save cart.' },
                { status: 401 }
            );
        }

        const { items } = await request.json();

        if (!Array.isArray(items)) {
            return NextResponse.json(
                { error: 'Invalid request. Items must be an array.' },
                { status: 400 }
            );
        }

        // Clear existing cart for this user
        await supabase
            .from('cart_items')
            .delete()
            .eq('customer_id', user.id);

        // Prepare cart items to insert
        const cartItemsToInsert = items.map((item: any) => ({
            customer_id: user.id,
            product_id: item.productId,
            quantity: item.quantity || 1,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        }));

        // Validate products exist and have sufficient stock
        if (cartItemsToInsert.length > 0) {
            const productIds = cartItemsToInsert.map((item) => item.product_id);

            const { data: products, error: productErr } = await supabase
                .from('products')
                .select('id, in_stock, is_online, name, price')
                .in('id', productIds)
                .eq('is_online', true);

            if (productErr || !products) {
                return NextResponse.json(
                    { error: 'Failed to validate products' },
                    { status: 400 }
                );
            }

            // Check if all products are in stock
            const outOfStock = products.filter((p) => !p.in_stock);
            if (outOfStock.length > 0) {
                return NextResponse.json(
                    {
                        error: `Out of stock: ${outOfStock
                            .map((p) => p.name)
                            .join(', ')}`,
                    },
                    { status: 409 }
                );
            }

            // Insert cart items
            const { data: insertedItems, error: insertErr } = await supabase
                .from('cart_items')
                .insert(cartItemsToInsert)
                .select(`
                    id,
                    product_id,
                    quantity,
                    created_at,
                    updated_at,
                    products (
                        id,
                        name,
                        price,
                        description,
                        images,
                        in_stock,
                        sku,
                        category
                    )
                `);

            if (insertErr) {
                console.error('Error inserting cart items:', insertErr);
                return NextResponse.json(
                    { error: 'Failed to update cart' },
                    { status: 500 }
                );
            }

            return NextResponse.json({
                success: true,
                customerId: user.id,
                items: insertedItems || [],
                totalItems: insertedItems?.length || 0,
                message: 'Cart updated successfully',
            });
        }

        return NextResponse.json({
            success: true,
            customerId: user.id,
            items: [],
            totalItems: 0,
            message: 'Cart cleared successfully',
        });
    } catch (error) {
        console.error('Cart PUT error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
