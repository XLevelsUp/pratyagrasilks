import { NextRequest, NextResponse } from 'next/server';

// Ensure this route is always treated as dynamic (uses cookies / auth)
export const dynamic = 'force-dynamic';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
    try {
        const supabase = createClient();
        const { searchParams } = new URL(request.url);

        // Extract query parameters
        const category = searchParams.get('category');
        const colorFamily = searchParams.get('color');
        const minPrice = searchParams.get('minPrice');
        const maxPrice = searchParams.get('maxPrice');
        const search = searchParams.get('search');
        const limit = parseInt(searchParams.get('limit') || '50');
        const offset = parseInt(searchParams.get('offset') || '0');

        // Helper to apply shared filters to a query builder
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        function applyFilters(q: any) {
            if (category)     q = q.eq('category', category);
            if (colorFamily)  q = q.contains('color_families', [colorFamily]);
            if (minPrice)     q = q.gte('price', parseFloat(minPrice));
            if (maxPrice)     q = q.lte('price', parseFloat(maxPrice));
            if (search)       q = q.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
            return q;
        }

        // Query 1: all available products (paginated)
        const availableQuery = applyFilters(
            supabase
                .from('products')
                .select('*')
                .eq('is_online', true)
                .eq('in_stock', true)
                .order('created_at', { ascending: false })
                .range(offset, offset + limit - 1)
        );

        // Query 2: up to 9 most recently sold products (ordered by updated_at — when in_stock was set false)
        const soldQuery = applyFilters(
            supabase
                .from('products')
                .select('*')
                .eq('is_online', true)
                .eq('in_stock', false)
                .order('updated_at', { ascending: false })
                .limit(9)
        );

        const [{ data: available, error: availError }, { data: sold, error: soldError }] =
            await Promise.all([availableQuery, soldQuery]);

        if (availError || soldError) {
            const err = availError || soldError;
            console.error('Supabase error:', err);
            return NextResponse.json(
                { error: 'Failed to fetch products', details: err!.message },
                { status: 500 }
            );
        }

        // Combine: available first, then recently sold (capped at 6)
        const products = [...(available ?? []), ...(sold ?? [])];

        // Transform snake_case to camelCase for frontend
        const transformedProducts = products?.map(product => ({
            id: product.id,
            name: product.name,
            description: product.description,
            price: product.price,
            discountType: product.discount_type ?? null,
            discountValue: product.discount_value != null ? Number(product.discount_value) : null,
            salePrice: product.sale_price != null ? Number(product.sale_price) : null,
            category: product.category,
            images: product.images || [],
            inStock: product.in_stock,
            isOnline: product.is_online ?? true,
            sku: product.sku,
            material: product.material,
            dimensions: product.dimensions,
            weight: product.weight,
            yt_link: product.yt_link,
            colorFamilies: product.color_families ?? [],
            createdAt: product.created_at,
            updatedAt: product.updated_at,
        })) || [];

        return NextResponse.json({
            products: transformedProducts,
            count: transformedProducts.length,
            offset,
            limit,
        });
    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
