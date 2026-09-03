'use server';

import { createClient } from '@/lib/supabase/server';
import { Product } from '@pratyagra/core/types';
import { revalidatePath } from 'next/cache';
import { getCallerRole, assertAdminOnly } from '@/lib/actions/role-guard';
import { triggerMetaCatalogSync } from '@/lib/trigger-meta-sync';

/**
 * Fetches the 8 most recently added products ordered by created_at DESC
 */
export async function getNewArrivals(): Promise<Product[]> {
    const supabase = createClient();

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

    // Transform snake_case to camelCase matching Product type
    return data.map((product) => ({
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
        createdAt: product.created_at,
        updatedAt: product.updated_at,
    }));
}

export interface VendorProduct {
    id: string;
    name: string;
    sku: string;
    price: number;
    category: string;
    inStock: boolean;
    thumbnail: string | null;
}

export async function getProductsByVendor(vendorId: string): Promise<VendorProduct[]> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('products')
        .select('id, name, sku, price, category, in_stock, images')
        .eq('vendor_id', vendorId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching products for vendor:', error);
        return [];
    }

    return (data ?? []).map((row) => ({
        id: row.id,
        name: row.name,
        sku: row.sku,
        price: row.price,
        category: row.category,
        inStock: row.in_stock,
        thumbnail: Array.isArray(row.images) && row.images.length > 0 ? row.images[0] : null,
    }));
}

export interface ProductUpdateInput {
    name: string;
    sku: string;
    price?: number;
    stock_quantity: number;
    category: string;
    material?: string | null;
    description?: string | null;
    dimensions?: string | null;
    weight?: string | null;
    images?: string[];
    yt_link?: string | null;
    is_online?: boolean;
    vendor_id?: string | null;
    color_families?: string[];
    // Procurement / pricing
    purchase_price?: number;
    purchase_tax_percent?: number;
    profit_margin_percent?: number;
    selling_tax_percent?: number;
    is_price_overridden?: boolean;
    // Per-product discount
    discount_type?: 'AMT' | 'PCT' | null;
    discount_value?: number;
    sale_price?: number | null;
    exclude_from_sales?: boolean;
}

export async function deleteProduct(id: string): Promise<void> {
    const role = await getCallerRole();
    await assertAdminOnly(role, 'delete products');

    const supabase = createClient();
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) throw new Error(error.message);

    revalidatePath('/admin/products');
    revalidatePath('/');
    revalidatePath('/collection');
    revalidatePath(`/product/${id}`);

    // Not awaited — the products trigger has already queued the removal, so
    // Meta latency must not delay the response.
    triggerMetaCatalogSync();
}

export async function updateProduct(id: string, data: ProductUpdateInput): Promise<void> {
    const role = await getCallerRole();

    const supabase = createClient();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const patch: Record<string, any> = {
        name: data.name,
        sku: data.sku,
        stock_quantity: data.stock_quantity,
        category: data.category,
        material: data.material ?? null,
        description: data.description ?? null,
        color_families: data.color_families ?? [],
        dimensions: data.dimensions ?? null,
        weight: data.weight ?? null,
        images: data.images ?? [],
        yt_link: data.yt_link ?? null,
        is_online: data.is_online ?? false,
        vendor_id: data.vendor_id ?? null,
    };

    // CASHIER cannot modify price or procurement data — silently strip them
    if (role === 'ADMIN') {
        if (data.price !== undefined)               patch.price = data.price;
        if (data.purchase_price !== undefined)      patch.purchase_price = data.purchase_price;
        if (data.purchase_tax_percent !== undefined) patch.purchase_tax_percent = data.purchase_tax_percent;
        if (data.profit_margin_percent !== undefined) patch.profit_margin_percent = data.profit_margin_percent;
        if (data.selling_tax_percent !== undefined)  patch.selling_tax_percent = data.selling_tax_percent;
        if (data.is_price_overridden !== undefined)  patch.is_price_overridden = data.is_price_overridden;
        // Discount is pricing — same ADMIN-only guard
        if (data.discount_type !== undefined)  patch.discount_type = data.discount_type;
        if (data.discount_value !== undefined) patch.discount_value = data.discount_value;
        if (data.sale_price !== undefined)     patch.sale_price = data.sale_price;
        if (data.exclude_from_sales !== undefined) patch.exclude_from_sales = data.exclude_from_sales;
    }

    // .select() makes the update return the rows it touched. Without it, an
    // update blocked by RLS reports success with 0 rows changed — which is how
    // saves silently did nothing while the UI said they had worked.
    const { data: updated, error } = await supabase
        .from('products')
        .update(patch)
        .eq('id', id)
        .select('id');

    if (error) throw new Error(error.message);
    if (!updated || updated.length === 0) {
        throw new Error(
            'Save was rejected by the database — no rows were updated. ' +
            'Your account may lack permission to edit products.'
        );
    }

    revalidatePath('/admin/products');
    revalidatePath(`/admin/products/${id}`);

    // Storefront caches too — without these, a price or discount change stays
    // invisible to customers until the page happens to rebuild.
    revalidatePath('/');
    revalidatePath('/collection');
    revalidatePath(`/product/${id}`);
    if (patch.category) revalidatePath(`/silk/${patch.category}`);

    // Not awaited — see deleteProduct above.
    triggerMetaCatalogSync();
}
