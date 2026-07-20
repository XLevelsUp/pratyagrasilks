import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { BRAND_URL } from "@/lib/constants/brand";

interface ProductLayoutProps {
    children: React.ReactNode;
    params: { id: string };
}

// Server-side metadata for the client product page: page.tsx stays 'use
// client' for cart/wishlist interactivity, so it can't export metadata
// itself — without this layout every product page silently inherited the
// root layout's homepage canonical (flagged by Screaming Frog as every
// product "Canonicalised" to '/').
export async function generateMetadata({ params }: ProductLayoutProps): Promise<Metadata> {
    const supabase = createClient();
    const { data: product } = await supabase
        .from('products')
        .select('name, description, category')
        .eq('id', params.id)
        .eq('is_online', true)
        .single();

    const canonical = `${BRAND_URL}/product/${params.id}`;

    if (!product) {
        return { alternates: { canonical } };
    }

    const title = `${product.name} | Kandangi Sarees`;
    const description = product.description
        ? product.description.slice(0, 160)
        : `Shop ${product.name} — authentic handloom saree from Kandangi Sarees.`;

    return {
        title,
        description,
        alternates: { canonical },
        openGraph: { title, description, url: canonical, type: 'website' },
    };
}

export default function ProductLayout({ children }: ProductLayoutProps) {
    return children;
}
