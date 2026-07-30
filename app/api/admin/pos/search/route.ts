import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

import { createClient } from '@/lib/supabase/server';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function transformProduct(product: Record<string, any>) {
    return {
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
        isOnline: product.is_online,
        sku: product.sku,
        material: product.material,
        dimensions: product.dimensions ?? null,
        weight: product.weight ?? null,
        yt_link: product.yt_link ?? null,
        createdAt: product.created_at,
        updatedAt: product.updated_at,
    };
}

export async function GET(request: NextRequest) {
    try {
        const supabase = createClient();

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const sku = searchParams.get('sku');
        const q = searchParams.get('q');

        if (!sku && !q) {
            return NextResponse.json({ error: 'Provide sku or q parameter' }, { status: 400 });
        }

        if (sku) {
            const { data: product, error } = await supabase
                .from('products')
                .select('*')
                .eq('sku', sku)
                .eq('in_stock', true)
                .single();

            if (error || !product) {
                return NextResponse.json({ error: 'Product not found' }, { status: 404 });
            }

            return NextResponse.json({ product: transformProduct(product) });
        }

        const { data: products, error } = await supabase
            .from('products')
            .select('*')
            .eq('in_stock', true)
            .or(`name.ilike.%${q}%,sku.ilike.%${q}%`)
            .order('name')
            .limit(10);

        if (error) {
            return NextResponse.json(
                { error: 'Failed to search products', details: error.message },
                { status: 500 }
            );
        }

        return NextResponse.json({ products: (products || []).map(transformProduct) });
    } catch (error) {
        console.error('POS search error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
