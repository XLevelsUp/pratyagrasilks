import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Product } from '@/lib/types';
import { siteMetadata } from '@/lib/seo/config';
import ProductDetailClient from './ProductDetailClient';

async function getProduct(id: string): Promise<Product | null> {
    const supabase = createClient();
    const { data } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .eq('is_online', true)
        .single();

    if (!data) return null;

    return {
        id: data.id,
        name: data.name,
        description: data.description,
        price: data.price,
        category: data.category,
        images: data.images ?? [],
        inStock: data.in_stock,
        isOnline: data.is_online,
        sku: data.sku,
        material: data.material ?? null,
        dimensions: data.dimensions ?? undefined,
        weight: data.weight ?? undefined,
        yt_link: data.yt_link ?? null,
        colorFamilies: data.color_families ?? [],
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
    };
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
    const product = await getProduct(params.id);

    if (!product) {
        return { title: `Product Not Found | ${siteMetadata.siteName}` };
    }

    const luxuryModifier = product.material ?? product.category?.replace(/-/g, ' ') ?? 'Silk';
    const title = `${product.name} | Premium ${luxuryModifier} Saree`;
    const description = `${product.description} — A handwoven heirloom ${luxuryModifier} saree from Pratyagra Silks. Investment-quality craftsmanship by India's finest master weavers, built to be treasured across generations.`;

    return {
        title,
        description,
        keywords: [
            `luxury ${luxuryModifier} saree`,
            `premium ${product.category} silk`,
            'heirloom handwoven saree',
            'luxury silk saree India',
            'pure silk saree investment',
            'master weaver silk collection',
        ],
        openGraph: {
            title,
            description,
            images: product.images.length > 0 ? [{ url: product.images[0] }] : [],
            url: `${siteMetadata.baseUrl}/product/${product.id}`,
            type: 'website',
            siteName: siteMetadata.siteName,
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: product.images.length > 0 ? [product.images[0]] : [],
        },
        alternates: {
            canonical: `${siteMetadata.baseUrl}/product/${product.id}`,
        },
    };
}

function ProductSchema({ product }: { product: Product }) {
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        description: product.description,
        image: product.images,
        sku: product.sku,
        ...(product.colorFamilies?.length
            ? { color: product.colorFamilies.map(c => c.charAt(0).toUpperCase() + c.slice(1)).join(', ') }
            : {}),
        brand: {
            '@type': 'Brand',
            name: 'Pratyagra Silks',
        },
        offers: {
            '@type': 'Offer',
            priceCurrency: 'INR',
            price: product.price,
            availability: product.inStock
                ? 'https://schema.org/InStock'
                : 'https://schema.org/OutOfStock',
            itemCondition: 'https://schema.org/NewCondition',
            url: `${siteMetadata.baseUrl}/product/${product.id}`,
        },
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}

export default async function ProductPage({ params }: { params: { id: string } }) {
    const product = await getProduct(params.id);

    if (!product) notFound();

    return (
        <>
            <ProductSchema product={product} />
            <ProductDetailClient product={product} productId={params.id} />
        </>
    );
}
