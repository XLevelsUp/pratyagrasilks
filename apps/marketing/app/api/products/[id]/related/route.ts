import { NextRequest, NextResponse } from 'next/server';
import { getActiveCampaignPublic } from '@/lib/data/public-products';
import { applyCampaignToProducts } from '@/lib/utils/applyCampaign';

// Ensure this route is always treated as dynamic (uses cookies / auth)
export const dynamic = 'force-dynamic';
import { createClient } from '@/lib/supabase/server';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const supabase = createClient();
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '4');

        // Get the current product to find its category
        const { data: currentProduct } = await supabase
            .from('products')
            .select('category')
            .eq('id', params.id)
            .single();

        if (!currentProduct) {
            return NextResponse.json({ products: [] });
        }

        // Fetch related products from the same category
        const { data: products, error } = await supabase
            .from('products')
            .select('*')
            .eq('category', currentProduct.category)
            .eq('is_online', true)
            .eq('in_stock', true)
            .neq('id', params.id)
            .limit(limit);

        if (error) {
            console.error('Error fetching related products:', error);
            return NextResponse.json({ products: [] });
        }

        const campaign = await getActiveCampaignPublic();

        // Transform to camelCase
        const transformedProducts = applyCampaignToProducts(products?.map(product => ({
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
            sku: product.sku,
            material: product.material,
        })) || [], campaign);

        return NextResponse.json({ products: transformedProducts });
    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json({ products: [] });
    }
}
