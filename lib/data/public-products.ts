import { createClient } from '@supabase/supabase-js';
import { Product } from '@/lib/types';

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

    return data.map((product) => ({
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
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
    }));
}
