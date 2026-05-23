'use client';

import { Product } from '@/lib/types';
import Image from 'next/image';
import Link from 'next/link';
import WishlistButton from '@/components/Wishlist/WishlistButton';
import WatermarkOverlay from '@/components/WatermarkOverlay';
import { getCategoryBySlug } from '@/lib/seo-config';

interface ProductCardProps {
    product: Product;
    showNewBadge?: boolean;
}

export default function ProductCard({ product, showNewBadge = false }: ProductCardProps) {
    const formatPrice = (price: number) =>
        new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(price);

    const imageUrl =
        product.images && product.images.length > 0
            ? product.images[0]
            : '/placeholder-product.jpg';

    const origin = getCategoryBySlug(product.category)?.origin ?? '';

    const isNewArrival = (() => {
        if (!product.createdAt || !product.inStock) return false;
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - 14);
        return new Date(product.createdAt) > cutoff;
    })();

    const displayNewBadge = (showNewBadge || isNewArrival) && product.inStock;
    const isSold = !product.inStock;

    return (
        <Link href={`/product/${product.id}`} className="group">
            <div
                className={`bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 ${
                    isSold ? 'hover:shadow-md' : 'hover:shadow-xl hover:-translate-y-1'
                }`}
            >
                {/* Product Image */}
                <div className="relative aspect-[3/4] overflow-hidden bg-primary-50 silk-shimmer">
                    <Image
                        src={imageUrl}
                        alt={product.name}
                        fill
                        className={`object-cover transition-transform duration-300 ${
                            isSold ? 'grayscale-[30%]' : 'group-hover:scale-105'
                        }`}
                        sizes="(max-width: 768px) 100vw, 296px"
                        // quality={60}
                    />
                    <WatermarkOverlay />

                    {/* Category badge — solid green */}
                    <div className="absolute top-2 left-2">
                        <span
                            className="inline-block px-2.5 py-1 text-white text-xs font-semibold rounded-md uppercase tracking-wide"
                            style={{ backgroundColor: '#104210' }}
                        >
                            {product.category?.replace(/-/g, ' ')}
                        </span>
                    </div>

                    {/* Sold / New Arrival badge */}
                    {isSold ? (
                        <div className="absolute bottom-2 left-2">
                            <span className="inline-block px-3 py-1 border border-stone-400 bg-stone-800/70 text-stone-200 text-xs font-semibold rounded-md tracking-wide shadow-md">
                                Recently Sold
                            </span>
                        </div>
                    ) : displayNewBadge ? (
                        <div className="absolute bottom-2 left-2">
                            <span className="inline-block px-3 py-1 border border-primary bg-primary/70 text-white text-xs font-semibold rounded-md tracking-wide shadow-md">
                                ✦ New Arrival
                            </span>
                        </div>
                    ) : null}

                    {/* Wishlist */}
                    <div className="absolute top-2 right-2 z-10">
                        <WishlistButton product={product} variant="icon-only" />
                    </div>
                </div>

                {/* Product Info */}
                <div className="p-4">
                    <h3
                        className={`text-base font-semibold line-clamp-2 transition-colors min-h-[48px] ${
                            isSold ? 'text-gray-500' : 'text-[#1A0A00] group-hover:text-primary'
                        }`}
                    >
                        {product.name}
                    </h3>

                    {/* Region origin */}
                    {origin && (
                        <p className="text-xs mt-0.5 mb-2 truncate" style={{ color: '#8C5A3C' }}>
                            {origin}
                        </p>
                    )}

                    <div className='flex justify-between items-center'>

                    {/* Price */}
                    <p
                        className={`text-xl font-bold ${isSold ? 'text-gray-400' : ''}`}
                        style={isSold ? {} : { color: '#E8AB16' }}
                    >
                        {formatPrice(product.price)}
                    </p>

                    {!isSold && (
                        <div className="px-3 py-2 bg-primary text-white rounded-md text-sm font-medium text-center group-hover:bg-primary-light transition-colors">
                            View Details
                        </div>
                    )}
                    </div>
                </div>
            </div>
        </Link>
    );
}
