import { createClient } from '@/lib/supabase/server';
import { Product } from '@/lib/types';

// Products saved before the slug spelling correction still carry the old DB value.
// This map lets queries find them by either slug until a data migration runs.
export const SLUG_ALIASES: Record<string, string> = {
    'khadi-cotton': 'kadhi-cotton',
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function transformProduct(p: any): Product {
    return {
        id: p.id,
        name: p.name,
        description: p.description,
        price: p.price,
        category: p.category,
        images: p.images || [],
        blurMap: p.blur_map ?? {},
        imageVariants: p.image_variants ?? {},
        inStock: p.in_stock,
        isOnline: p.is_online ?? true,
        sku: p.sku,
        material: p.material,
        dimensions: p.dimensions,
        weight: p.weight,
        yt_link: p.yt_link,
        colorFamilies: p.color_families ?? [],
        createdAt: p.created_at,
        updatedAt: p.updated_at,
    };
}

export async function queryProductsByCategory(categorySlug: string): Promise<Product[]> {
    const supabase = createClient();
    const legacy = SLUG_ALIASES[categorySlug];
    const values = legacy ? [categorySlug, legacy] : [categorySlug];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const withCategory = (q: any) =>
        values.length > 1 ? q.in('category', values) : q.eq('category', values[0]);

    const [{ data: available }, { data: sold }] = await Promise.all([
        withCategory(
            supabase.from('products').select('*')
                .eq('is_online', true).eq('in_stock', true)
                .order('created_at', { ascending: false }).limit(8)
        ),
        withCategory(
            supabase.from('products').select('*')
                .eq('is_online', true).eq('in_stock', false)
                .order('updated_at', { ascending: false }).limit(4)
        ),
    ]);

    return [...(available ?? []), ...(sold ?? [])].map(transformProduct);
}

export async function queryProductsByMaxPrice(maxPrice: number, limit = 12): Promise<Product[]> {
    const supabase = createClient();

    const [{ data: available }, { data: sold }] = await Promise.all([
        supabase.from('products').select('*')
            .eq('is_online', true).eq('in_stock', true)
            .lte('price', maxPrice)
            .order('created_at', { ascending: false }).limit(limit),
        supabase.from('products').select('*')
            .eq('is_online', true).eq('in_stock', false)
            .lte('price', maxPrice)
            .order('updated_at', { ascending: false }).limit(4),
    ]);

    return [...(available ?? []), ...(sold ?? [])].map(transformProduct);
}
