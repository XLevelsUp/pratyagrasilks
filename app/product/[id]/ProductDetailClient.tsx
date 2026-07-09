'use client';

import { Product } from '@/lib/types';
import Link from 'next/link';
import ProductGallery from '@/components/products/ProductGallery';
import ProductCard from '@/components/ProductCard';
import WishlistButton from '@/components/Wishlist/WishlistButton';
import { useCart } from '@/lib/context/CartContext';
import { useState, useEffect } from 'react';
import { ShoppingCart, Check, MessageCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { trackViewItem, trackAddToCart } from '@/lib/analytics/gtag';
import { COLOR_FAMILIES, LIGHT_COLOR_IDS } from '@/lib/constants/colors';
import { siteMetadata } from '@/lib/seo/config';

interface ProductDetailClientProps {
    product: Product;
    productId: string;
}

const WHATSAPP_NUMBER = '+917358866646';

async function getRelatedProducts(id: string): Promise<Product[]> {
    const res = await fetch(`/api/products/${id}/related`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.products;
}

function SpecRow({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="flex items-center justify-between gap-4 border-t border-primary-100 py-3">
            <dt className="text-xs font-semibold tracking-[0.2em] uppercase text-textSecondary/60 shrink-0">
                {label}
            </dt>
            <dd className="text-sm text-textPrimary text-right">{children}</dd>
        </div>
    );
}

export default function ProductDetailClient({ product, productId }: ProductDetailClientProps) {
    const { addItem, isInCart } = useCart();
    const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);

    useEffect(() => {
        getRelatedProducts(productId).then(setRelatedProducts);
        trackViewItem(product);
    }, [product, productId]);

    const handleAddToCart = () => {
        const added = addItem(product);
        if (!added) {
            toast('This item is already in your cart!');
        } else {
            trackAddToCart(product);
        }
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(price);
    };

    const categoryLabel = product.category?.replace(/-/g, ' ');
    const productColors = (product.colorFamilies ?? [])
        .map((id) => COLOR_FAMILIES.find((c) => c.id === id))
        .filter((c): c is (typeof COLOR_FAMILIES)[number] => Boolean(c));

    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
        `Hello Pratyagra Silks, I'd like to know more about "${product.name}" — ${siteMetadata.baseUrl}/product/${product.id}`
    )}`;

    return (
        <div className="min-h-screen">
            <div className="container mx-auto px-4 py-8">
                {/* Breadcrumb */}
                <nav
                    aria-label="Breadcrumb"
                    className="flex items-center flex-wrap gap-x-2 gap-y-1 text-[11px] font-medium tracking-[0.15em] uppercase text-textSecondary/50 mb-8"
                >
                    <Link href="/" className="hover:text-primary transition-colors">Home</Link>
                    <span aria-hidden="true">/</span>
                    <Link href="/collection" className="hover:text-primary transition-colors">Collection</Link>
                    <span aria-hidden="true">/</span>
                    <Link
                        href={`/collection?category=${product.category}`}
                        className="hover:text-primary transition-colors"
                    >
                        {categoryLabel}
                    </Link>
                    <span aria-hidden="true">/</span>
                    <span className="text-textPrimary/70 truncate max-w-[16rem] normal-case tracking-normal">
                        {product.name}
                    </span>
                </nav>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
                    {/* Gallery — rides along while the info column scrolls */}
                    <div className="lg:sticky lg:top-24 lg:self-start">
                        <ProductGallery
                            images={product.images}
                            yt_link={product.yt_link}
                            productName={product.name}
                        />
                    </div>

                    {/* Product Info */}
                    <div>
                        {/* Identity */}
                        <p className="text-[11px] font-semibold tracking-[0.25em] uppercase text-accent-700 mb-3">
                            {categoryLabel}
                        </p>
                        <h1 className="font-playfair text-3xl lg:text-5xl font-bold text-textPrimary leading-tight mb-2">
                            {product.name}
                        </h1>
                        <p className="text-xs text-textSecondary/50 mb-6">SKU · {product.sku}</p>

                        {/* Price + stock */}
                        <div className="flex items-baseline gap-4 flex-wrap mb-8">
                            <p className="text-3xl font-semibold text-textPrimary">
                                {formatPrice(product.price)}
                            </p>
                            {product.inStock ? (
                                <span className="flex items-center gap-2 text-xs font-semibold tracking-[0.15em] uppercase text-green-700">
                                    <span className="w-2 h-2 rounded-full bg-green-500" aria-hidden="true" />
                                    Available
                                </span>
                            ) : (
                                <span className="flex items-center gap-2 text-xs font-semibold tracking-[0.15em] uppercase text-stone-500">
                                    <span className="w-2 h-2 rounded-full bg-stone-400" aria-hidden="true" />
                                    Recently Sold
                                </span>
                            )}
                        </div>

                        {/* Description */}
                        <p className="text-textSecondary leading-relaxed mb-10">{product.description}</p>

                        {/* Specs */}
                        <dl className="mb-10">
                            {product.material && <SpecRow label="Material">{product.material}</SpecRow>}
                            {product.dimensions && <SpecRow label="Length">{product.dimensions}</SpecRow>}
                            {product.weight ? <SpecRow label="Weight">{product.weight} kg</SpecRow> : null}
                            {productColors.length > 0 && (
                                <SpecRow label="Colour">
                                    <span className="flex items-center justify-end gap-2 flex-wrap">
                                        {productColors.map((color) => (
                                            <span key={color.id} className="flex items-center gap-1.5">
                                                <span
                                                    className={`w-3.5 h-3.5 rounded-full ${LIGHT_COLOR_IDS.has(color.id) ? 'ring-1 ring-gray-300' : ''}`}
                                                    style={{ backgroundColor: color.hex }}
                                                    aria-hidden="true"
                                                />
                                                {color.name}
                                            </span>
                                        ))}
                                    </span>
                                </SpecRow>
                            )}
                            <SpecRow label="Category">
                                <span className="capitalize">{categoryLabel}</span>
                            </SpecRow>
                        </dl>

                        {/* Actions */}
                        <div className="space-y-3 mb-10">
                            {product.inStock ? (
                                <>
                                    <button
                                        onClick={handleAddToCart}
                                        disabled={isInCart(product.id)}
                                        className="w-full bg-primary text-secondary py-4 rounded-full font-semibold text-lg hover:bg-primary-light transition-colors disabled:bg-gray-300 disabled:text-white disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {isInCart(product.id) ? (
                                            <>
                                                <Check className="w-5 h-5" />
                                                Already in Cart
                                            </>
                                        ) : (
                                            <>
                                                <ShoppingCart className="w-5 h-5" />
                                                Add to Cart
                                            </>
                                        )}
                                    </button>
                                    <WishlistButton product={product} className="w-full" />
                                </>
                            ) : (
                                <>
                                    <button
                                        disabled
                                        className="w-full bg-stone-200 text-stone-500 py-4 rounded-full font-semibold text-lg cursor-not-allowed flex items-center justify-center gap-2 border border-stone-300"
                                    >
                                        <Check className="w-5 h-5" />
                                        Recently Sold
                                    </button>
                                    <Link
                                        href="/collection"
                                        className="w-full border border-primary text-primary py-3.5 rounded-full font-semibold text-base hover:bg-primary hover:text-secondary transition-colors flex items-center justify-center gap-2"
                                    >
                                        Explore Similar Weaves →
                                    </Link>
                                </>
                            )}

                            {/* WhatsApp enquiry */}
                            <a
                                href={whatsappUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full border border-primary-200 text-textPrimary py-3.5 rounded-full font-medium text-base hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2"
                            >
                                <MessageCircle className="w-5 h-5" aria-hidden="true" />
                                Enquire on WhatsApp
                            </a>
                        </div>

                        {/* Trust micro-strip */}
                        <div className="grid grid-cols-3 gap-6">
                            {[
                                { title: 'Authentic Handloom', text: 'Woven by master artisans' },
                                { title: 'Ethically Sourced', text: 'Direct from the weaver' },
                                { title: 'Heirloom Quality', text: 'Made to be inherited' },
                            ].map((item) => (
                                <div key={item.title} className="border-t border-primary-100 pt-3">
                                    <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-accent-700 mb-1">
                                        {item.title}
                                    </p>
                                    <p className="text-xs text-textSecondary/70 leading-relaxed">{item.text}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Related Products */}
                {relatedProducts.length > 0 && (
                    <div className="mt-20 lg:mt-28">
                        <p className="text-[11px] font-semibold tracking-[0.25em] uppercase text-accent-700 mb-3">
                            Continue Exploring
                        </p>
                        <h2 className="font-playfair text-2xl md:text-4xl font-bold text-primary mb-10">
                            You May Also Like
                        </h2>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 md:gap-x-6 md:gap-y-12 xl:grid-cols-4">
                            {relatedProducts.map((relatedProduct: Product) => (
                                <ProductCard key={relatedProduct.id} product={relatedProduct} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
