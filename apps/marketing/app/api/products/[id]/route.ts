import { NextRequest, NextResponse } from 'next/server';
import { getActiveCampaignPublic } from '@/lib/data/public-products';
import { applyCampaignToProduct } from '@pratyagra/core/utils/applyCampaign';

// Ensure this route is always treated as dynamic (uses cookies / auth)
export const dynamic = 'force-dynamic';
import { createClient } from '@pratyagra/auth/server';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const supabase = createClient();

        // Fetch product by ID
        const { data: product, error } = await supabase
            .from('products')
            .select('*')
            .eq('id', params.id)
            .eq('is_online', true)
            .single();

        if (error || !product) {
            return NextResponse.json(
                { error: 'Product not found' },
                { status: 404 }
            );
        }

        const campaign = await getActiveCampaignPublic();

        // Transform snake_case to camelCase for frontend
        const transformedProduct = applyCampaignToProduct({
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
            stockQuantity: product.stock_quantity || 0,
            lowStockThreshold: product.low_stock_threshold || 5,
            trackInventory: product.track_inventory,
            sku: product.sku,
            material: product.material,
            dimensions: product.dimensions,
            weight: product.weight,
            yt_link: product.yt_link,
            createdAt: product.created_at,
            updatedAt: product.updated_at,
        }, campaign);

        return NextResponse.json({ product: transformedProduct });
    } catch (error) {
        console.error('Error fetching product:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
