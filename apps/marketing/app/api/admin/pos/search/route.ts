import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

import { createClient } from '@/lib/supabase/server';
import { getActiveCampaignPublic } from '@/lib/data/public-products';
import { applyCampaignToProduct, applyCampaignToProducts } from '@pratyagra/core/utils/applyCampaign';

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
        excludeFromSales: product.exclude_from_sales ?? false,
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

            // Festival sale applies in-store too — the counter price must match
            // what the customer saw online.
            const campaign = await getActiveCampaignPublic();
            return NextResponse.json({
                product: applyCampaignToProduct(transformProduct(product), campaign),
            });
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

        const campaign = await getActiveCampaignPublic();
        return NextResponse.json({
            products: applyCampaignToProducts((products || []).map(transformProduct), campaign),
        });
    } catch (error) {
        console.error('POS search error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
