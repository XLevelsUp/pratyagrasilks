import { createClient } from '@supabase/supabase-js';
import { Product } from '@/lib/types';
import { DiscountCampaign } from '@/lib/utils/campaign';
import { applyCampaignToProducts } from '@/lib/utils/applyCampaign';

// Cookie-free anon client for public catalog data. Using this (instead of the
// cookie-bound server client) keeps pages that only read public data eligible
// for static rendering + ISR — the home page depends on it.
function publicClient() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { auth: { persistSession: false } }
    );
}

/**
 * The running festival sale, or null. Uses the same cookie-free client so
 * pages that call it stay eligible for static rendering.
 */
export async function getActiveCampaignPublic(): Promise<DiscountCampaign | null> {
    const supabase = publicClient();

    const { data, error } = await supabase
        .from('discount_campaigns')
        .select('*, discount_campaign_bands(*)')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

    // A missing table (migration not yet run) must not break the storefront
    if (error || !data) return null;

    /* eslint-disable @typescript-eslint/no-explicit-any */
    return {
        id: data.id,
        name: data.name,
        isActive: data.is_active,
        startsAt: data.starts_at ?? null,
        endsAt: data.ends_at ?? null,
        bands: (data.discount_campaign_bands ?? []).map((b: any) => ({
            id: b.id,
            minPrice: b.min_price != null ? Number(b.min_price) : null,
            maxPrice: b.max_price != null ? Number(b.max_price) : null,
            category: b.category ?? null,
            discountType: b.discount_type,
            discountValue: Number(b.discount_value),
        })),
    };
}

/**
 * The 8 newest online products — in-stock first, then most recent.
 * Same query/mapping as the old server-action version, minus cookies.
 */
export async function getNewArrivalsPublic(): Promise<Product[]> {
    const supabase = publicClient();

    const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_online', true)
        .order('in_stock', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(8);

    if (error) {
        console.error('Error fetching new arrivals:', error);
        return [];
    }
    if (!data) return [];

    const campaign = await getActiveCampaignPublic();

    return applyCampaignToProducts(data.map((product) => ({
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
        isOnline: product.is_online ?? true,
        sku: product.sku,
        material: product.material,
        dimensions: product.dimensions,
        weight: product.weight,
        yt_link: product.yt_link,
        createdAt: product.created_at,
        updatedAt: product.updated_at,
    })), campaign);
}
