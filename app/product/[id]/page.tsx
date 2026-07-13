'use client';

import { Product } from '@/lib/types';
import Link from 'next/link';
import ProductGallery from '@/components/products/ProductGallery';
import ProductCard from '@/components/ProductCard';
import WishlistButton from '@/components/Wishlist/WishlistButton';
import { useCart } from '@/lib/context/CartContext';
import { useState, useEffect } from 'react';
import { ShoppingCart, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { trackViewItem, trackAddToCart } from '@/lib/analytics/gtag';
import { generateProductSchema } from '@/lib/seo-config';
import { getCategoryBySlug } from '@/lib/seo-config';
import { getWhatsAppUrl } from '@/lib/utils/whatsapp';

interface ProductDetailPageProps {
    params: { id: string };
}

async function getProduct(id: string) {
    const res = await fetch(`/api/products/${id}`, { cache: 'no-store' });
    if (!res.ok) return null;
    return (await res.json()).product;
}

async function getRelatedProducts(id: string) {
    const res = await fetch(`/api/products/${id}/related`);
    if (!res.ok) return [];
    return (await res.json()).products;
}

export default function ProductDetailPage({ params }: ProductDetailPageProps) {
    const { addItem, isInCart } = useCart();
    const [product, setProduct] = useState<Product | null>(null);
    const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            const [productData, relatedData] = await Promise.all([
                getProduct(params.id),
                getRelatedProducts(params.id),
            ]);
            setProduct(productData);
            setRelatedProducts(relatedData);
            setLoading(false);
            if (productData) trackViewItem(productData);
        }
        loadData();
    }, [params.id]);

    const handleAddToCart = () => {
        if (!product) return;
        const added = addItem(product);
        if (!added) toast('This item is already in your cart!');
        else trackAddToCart(product);
    };

    const formatPrice = (price: number) =>
        new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-10 h-10 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#5F1300' }} />
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-2" style={{ color: '#1A0A00' }}>Product Not Found</h1>
                    <p className="mb-4" style={{ color: '#8C5A3C' }}>The product you&apos;re looking for doesn&apos;t exist.</p>
                    <Link href="/collection" className="font-medium hover:underline" style={{ color: '#5F1300' }}>
                        ← Back to Collection
                    </Link>
                </div>
            </div>
        );
    }

    const categoryInfo = getCategoryBySlug(product.category);
    const origin = categoryInfo?.origin ?? '';
    const waUrl = getWhatsAppUrl(
        `Hi, I'm interested in "${product.name}" from Kandangi Sarees. Can you share more details?`
    );

    return (
        // pb-24 on mobile prevents the sticky bar from covering content
        <div className="min-h-screen pb-24 lg:pb-0" style={{ backgroundColor: '#FDF6E3' }}>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(generateProductSchema({
                        name: product.name,
                        description: product.description,
                        price: product.price,
                        sku: product.sku,
                        category: product.category,
                        images: product.images,
                        inStock: product.inStock,
                        colorFamilies: product.colorFamilies,
                    })),
                }}
            />

            {/* Breadcrumb */}
            <div className="bg-white border-b">
                <div className="container mx-auto px-4 py-3">
                    <nav className="flex items-center gap-2 text-sm flex-wrap">
                        <Link href="/" className="hover:underline" style={{ color: '#8C5A3C' }}>Home</Link>
                        <span style={{ color: '#8C5A3C' }}>/</span>
                        <Link href="/collection" className="hover:underline" style={{ color: '#8C5A3C' }}>Collection</Link>
                        <span style={{ color: '#8C5A3C' }}>/</span>
                        <Link href={`/collection?category=${product.category}`} className="hover:underline capitalize" style={{ color: '#8C5A3C' }}>
                            {product.category?.replace(/-/g, ' ')}
                        </Link>
                        <span style={{ color: '#8C5A3C' }}>/</span>
                        <span className="truncate max-w-[180px] font-medium" style={{ color: '#1A0A00' }}>{product.name}</span>
                    </nav>
                </div>
            </div>

            {/* Main product grid */}
            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">

                    {/* Gallery */}
                    <div>
                        <ProductGallery images={product.images} blurMap={product.blurMap} imageVariants={product.imageVariants} yt_link={product.yt_link} productName={product.name} />
                    </div>

                    {/* Info panel */}
                    <div className="space-y-5">

                        {/* Name + origin */}
                        <div>
                            <h1 className="font-playfair text-2xl lg:text-3xl font-bold leading-snug" style={{ color: '#5F1300' }}>
                                {product.name}
                            </h1>
                            {origin && (
                                <p className="text-sm mt-1" style={{ color: '#104210' }}>
                                    Woven in {origin}
                                </p>
                            )}
                            <p className="text-xs mt-1" style={{ color: '#8C5A3C' }}>SKU: {product.sku}</p>
                        </div>

                        {/* Price */}
                        <div className="border-t border-b py-4">
                            <p className="text-3xl font-bold" style={{ color: product.inStock ? '#E8AB16' : '#9CA3AF' }}>
                                {formatPrice(product.price)}
                            </p>
                        </div>

                        {/* Stock status */}
                        <div className="flex items-center gap-2">
                            <div className={`w-2.5 h-2.5 rounded-full ${product.inStock ? 'bg-green-500' : 'bg-red-400'}`} />
                            <span className="text-sm font-medium" style={{ color: product.inStock ? '#104210' : '#D13120' }}>
                                {product.inStock ? 'Available' : 'Sold Out'}
                            </span>
                        </div>

                        {/* Description */}
                        <div>
                            <p className="text-sm leading-relaxed" style={{ color: '#1A0A00' }}>{product.description}</p>
                        </div>

                        {/* Category + material tags */}
                        <div className="flex flex-wrap gap-2">
                            {product.category && (
                                <span className="text-xs px-3 py-1 rounded-full border font-medium capitalize" style={{ borderColor: '#6B1910', color: '#6B1910' }}>
                                    {product.category.replace(/-/g, ' ')}
                                </span>
                            )}
                            {product.material && (
                                <span className="text-xs px-3 py-1 rounded-full border font-medium" style={{ borderColor: '#6B1910', color: '#6B1910' }}>
                                    {product.material}
                                </span>
                            )}
                        </div>

                        {/* Product details accordion */}
                        <div className="rounded-xl overflow-hidden border" style={{ borderColor: 'rgba(95,19,0,0.15)' }}>
                            <details className="group border-b" style={{ borderColor: 'rgba(95,19,0,0.1)' }}>
                                <summary className="flex items-center justify-between px-4 py-3 cursor-pointer select-none font-semibold text-sm list-none" style={{ color: '#5F1300' }}>
                                    Fabric &amp; Weave Details
                                    <span className="text-lg group-open:rotate-45 transition-transform duration-150">+</span>
                                </summary>
                                <div className="px-4 pb-4 text-sm space-y-2" style={{ color: '#1A0A00' }}>
                                    {product.material && <p><strong>Material:</strong> {product.material}</p>}
                                    {product.dimensions && <p><strong>Length:</strong> {product.dimensions}</p>}
                                    {product.weight && <p><strong>Weight:</strong> {product.weight} kg</p>}
                                    <p><strong>Weave type:</strong> {product.category?.replace(/-/g, ' ')}</p>
                                    {origin && <p><strong>Origin:</strong> {origin}</p>}
                                </div>
                            </details>

                            <details className="group border-b" style={{ borderColor: 'rgba(95,19,0,0.1)' }}>
                                <summary className="flex items-center justify-between px-4 py-3 cursor-pointer select-none font-semibold text-sm list-none" style={{ color: '#5F1300' }}>
                                    Care Instructions
                                    <span className="text-lg group-open:rotate-45 transition-transform duration-150">+</span>
                                </summary>
                                <div className="px-4 pb-4 text-sm space-y-1.5" style={{ color: '#1A0A00' }}>
                                    <p>• Dry clean recommended for silk sarees.</p>
                                    <p>• Cotton sarees: gentle machine wash, cold water, mild detergent.</p>
                                    <p>• Dry flat or hang in shade — avoid direct sunlight.</p>
                                    <p>• Iron on low heat with a pressing cloth over zari borders.</p>
                                </div>
                            </details>

                            <details className="group border-b" style={{ borderColor: 'rgba(95,19,0,0.1)' }}>
                                <summary className="flex items-center justify-between px-4 py-3 cursor-pointer select-none font-semibold text-sm list-none" style={{ color: '#5F1300' }}>
                                    Shipping Information
                                    <span className="text-lg group-open:rotate-45 transition-transform duration-150">+</span>
                                </summary>
                                <div className="px-4 pb-4 text-sm" style={{ color: '#1A0A00' }}>
                                    <p>Ships within 2–3 business days. Delivery in 5–7 business days across India.</p>
                                    <p className="mt-2">
                                        <Link href="/shipping" className="underline" style={{ color: '#5F1300' }}>
                                            Full shipping policy →
                                        </Link>
                                    </p>
                                </div>
                            </details>

                            <details className="group">
                                <summary className="flex items-center justify-between px-4 py-3 cursor-pointer select-none font-semibold text-sm list-none" style={{ color: '#5F1300' }}>
                                    Exchange Policy
                                    <span className="text-lg group-open:rotate-45 transition-transform duration-150">+</span>
                                </summary>
                                <div className="px-4 pb-4 text-sm" style={{ color: '#1A0A00' }}>
                                    <p>We do not accept returns. Exchanges are available only in cases of damage or missing items, provided the issue is raised within 7 days of receiving your order.</p>
                                    <p className="mt-2">Please contact us with unboxing photos or video for a smooth resolution.</p>
                                </div>
                            </details>
                        </div>

                        {/* Desktop CTA — Add to Cart / Wishlist */}
                        <div className="hidden lg:block space-y-3">
                            {product.inStock ? (
                                <>
                                    <button
                                        onClick={handleAddToCart}
                                        disabled={isInCart(product.id)}
                                        className="w-full py-4 rounded-lg font-semibold text-base transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                                        style={{ backgroundColor: '#5F1300', color: '#FDF6E3' }}
                                    >
                                        {isInCart(product.id) ? <><Check className="w-5 h-5" /> Already in Cart</> : <><ShoppingCart className="w-5 h-5" /> Add to Cart</>}
                                    </button>
                                    <a
                                        href={waUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-full py-3 rounded-lg font-semibold text-base border-2 flex items-center justify-center gap-2 transition-colors hover:opacity-80"
                                        style={{ borderColor: '#5F1300', color: '#5F1300' }}
                                    >
                                        <WhatsAppIcon /> Enquire on WhatsApp
                                    </a>
                                    <WishlistButton product={product} className="w-full" />
                                </>
                            ) : (
                                <>
                                    <button disabled className="w-full py-4 rounded-lg font-semibold text-base cursor-not-allowed bg-stone-200 text-stone-500 border border-stone-300 flex items-center justify-center gap-2">
                                        <Check className="w-5 h-5" /> Recently Sold
                                    </button>
                                    <Link href="/collection" className="w-full border-2 py-3 rounded-lg font-semibold text-base flex items-center justify-center gap-2 transition-colors hover:bg-primary hover:text-white" style={{ borderColor: '#5F1300', color: '#5F1300' }}>
                                        Explore Similar Weaves →
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Related Products */}
                {relatedProducts.length > 0 && (
                    <div className="mt-16">
                        <h2 className="font-playfair text-2xl font-bold mb-6" style={{ color: '#5F1300' }}>You May Also Like</h2>
                        {/* Horizontal scroll on mobile, grid on desktop */}
                        <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2 lg:grid lg:grid-cols-4 lg:overflow-visible">
                            {relatedProducts.map((p: Product) => (
                                <div key={p.id} className="min-w-[220px] lg:min-w-0">
                                    <ProductCard product={p} />
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* ── Sticky mobile bottom CTA bar ────────────────────────── */}
            {product.inStock && (
                <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t shadow-lg px-4 py-3" style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}>
                    <button
                        onClick={handleAddToCart}
                        disabled={isInCart(product.id)}
                        className="w-full py-4 rounded-lg font-semibold text-base transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                        style={{ backgroundColor: '#5F1300', color: '#FDF6E3' }}
                    >
                        {isInCart(product.id) ? <><Check className="w-5 h-5" /> Already in Cart</> : <><ShoppingCart className="w-5 h-5" /> Add to Cart</>}
                    </button>
                </div>
            )}
        </div>
    );
}

function WhatsAppIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 shrink-0">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
    );
}
