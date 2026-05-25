import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Ensure this route is always treated as dynamic
export const dynamic = 'force-dynamic';

/**
 * GET /api/wishlist
 * Fetch all wishlist items for the authenticated user
 */
export async function GET() {
    try {
        const supabase = createClient();

        // Check authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { error: 'Unauthorized. Please log in to view your wishlist.' },
                { status: 401 }
            );
        }

        // Fetch wishlist items with product details
        const { data: wishlistItems, error } = await supabase
            .from('wishlist')
            .select(`
                id,
                product_id,
                created_at,
                products (
                    id,
                    name,
                    description,
                    price,
                    category,
                    images,
                    in_stock,
                    is_online,
                    sku,
                    material,
                    dimensions,
                    weight,
                    created_at,
                    updated_at
                )
            `)
            .eq('customer_id', user.id)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Supabase error fetching wishlist:', error);
            return NextResponse.json(
                { error: 'Failed to fetch wishlist', details: error.message },
                { status: 500 }
            );
        }

        // Transform data to match frontend types
        const transformedItems = wishlistItems?.map(item => {
            // Type assertion for the products relation
            const product = item.products as any;

            return {
                id: item.id,
                customerId: user.id,
                productId: item.product_id,
                product: product ? {
                    id: product.id,
                    name: product.name,
                    description: product.description,
                    price: product.price,
                    category: product.category,
                    images: product.images || [],
                    inStock: product.in_stock,
                    isOnline: product.is_online,
                    sku: product.sku,
                    material: product.material,
                    dimensions: product.dimensions,
                    weight: product.weight,
                    createdAt: product.created_at,
                    updatedAt: product.updated_at,
                } : null,
                createdAt: item.created_at,
            };
        }).filter(item => item.product !== null && (item.product as any).isOnline !== false) || [];

        return NextResponse.json({
            items: transformedItems,
            count: transformedItems.length,
        });
    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

/**
 * POST /api/wishlist
 * Add a product to the user's wishlist
 * Body: { productId: string }
 */
export async function POST(request: NextRequest) {
    try {
        const supabase = createClient();

        // Check authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { error: 'Unauthorized. Please log in to add items to your wishlist.' },
                { status: 401 }
            );
        }

        // Parse request body
        const body = await request.json();
        const { productId } = body;

        if (!productId) {
            return NextResponse.json(
                { error: 'Product ID is required' },
                { status: 400 }
            );
        }

        // Check if product exists, is online, and is in stock
        const { data: product, error: productError } = await supabase
            .from('products')
            .select('id, in_stock')
            .eq('id', productId)
            .eq('is_online', true)
            .single();

        if (productError || !product) {
            return NextResponse.json(
                { error: 'Product not found' },
                { status: 404 }
            );
        }

        // Insert into wishlist (will fail if already exists due to unique constraint)
        const { data: wishlistItem, error: insertError } = await supabase
            .from('wishlist')
            .insert({
                customer_id: user.id,
                product_id: productId,
            })
            .select()
            .single();

        if (insertError) {
            // Check if it's a duplicate entry error
            if (insertError.code === '23505') {
                return NextResponse.json(
                    { error: 'Product is already in your wishlist' },
                    { status: 409 }
                );
            }

            console.error('Supabase error adding to wishlist:', insertError);
            return NextResponse.json(
                { error: 'Failed to add to wishlist', details: insertError.message },
                { status: 500 }
            );
        }

        return NextResponse.json({
            message: 'Product added to wishlist',
            item: {
                id: wishlistItem.id,
                customerId: user.id,
                productId: wishlistItem.product_id,
                createdAt: wishlistItem.created_at,
            },
        }, { status: 201 });
    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/wishlist
 * Remove a product from the user's wishlist
 * Query param: productId
 */
export async function DELETE(request: NextRequest) {
    try {
        const supabase = createClient();

        // Check authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { error: 'Unauthorized. Please log in to modify your wishlist.' },
                { status: 401 }
            );
        }

        // Get productId from query params
        const { searchParams } = new URL(request.url);
        const productId = searchParams.get('productId');

        if (!productId) {
            return NextResponse.json(
                { error: 'Product ID is required' },
                { status: 400 }
            );
        }

        // Delete from wishlist
        const { error: deleteError } = await supabase
            .from('wishlist')
            .delete()
            .eq('customer_id', user.id)
            .eq('product_id', productId);

        if (deleteError) {
            console.error('Supabase error removing from wishlist:', deleteError);
            return NextResponse.json(
                { error: 'Failed to remove from wishlist', details: deleteError.message },
                { status: 500 }
            );
        }

        return NextResponse.json({
            message: 'Product removed from wishlist',
        });
    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
