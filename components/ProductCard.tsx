import { Product } from '@/lib/types';
import Image from 'next/image';
import Link from 'next/link';
import WishlistButton from '@/components/Wishlist/WishlistButton';

interface ProductCardProps {
    product: Product;
    showNewBadge?: boolean;
}

// Editorial luxury card — open composition (no box), 3:4 photography,
// slow kinematics. Server component; WishlistButton is the client island.
// Stays fully fluid: used in grids (3-up/4-up) and the home flex carousel.
export default function ProductCard({ product, showNewBadge = false }: ProductCardProps) {
    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(price);
    };

    const imageUrl = product.images && product.images.length > 0
        ? product.images[0]
        : '/placeholder-product.jpg';

    // Show "New In" badge if created within last 14 days and still in stock
    const isNewArrival = (() => {
        if (!product.createdAt || !product.inStock) return false;
        const fourteenDaysAgo = new Date();
        fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
        return new Date(product.createdAt) > fourteenDaysAgo;
    })();

    const displayNewBadge = (showNewBadge || isNewArrival) && product.inStock;
    const isSold = !product.inStock;

    return (
        <Link href={`/product/${product.id}`} className="group block">
            {/* Image block — aspect ratio locks layout, zero CLS */}
            <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-primary-50 silk-shimmer">
                <Image
                    src={imageUrl}
                    alt={product.name + ' Pure silk sarees online in India | Pratyagra Silks'}
                    fill
                    className={`object-cover transition-transform duration-700 ease-out ${isSold ? 'grayscale-[40%]' : 'group-hover:scale-[1.04]'}`}
                    sizes="(max-width: 640px) 45vw, (max-width: 1280px) 45vw, 30vw"
                    quality={65}
                />

                {/* Status chip — frosted, minimal */}
                {isSold ? (
                    <span className="absolute top-3 left-3 bg-stone-800/80 backdrop-blur text-stone-100 text-[10px] font-semibold tracking-[0.15em] uppercase px-3 py-1 rounded-full">
                        Recently Sold
                    </span>
                ) : displayNewBadge ? (
                    <span className="absolute top-3 left-3 bg-white/90 backdrop-blur text-primary text-[10px] font-semibold tracking-[0.15em] uppercase px-3 py-1 rounded-full">
                        ✦ New Arrival
                    </span>
                ) : null}

                {/* Wishlist — hover-revealed on desktop, always present on touch */}
                <div className="absolute top-3 right-3 z-10 lg:opacity-0 lg:group-hover:opacity-100 lg:focus-within:opacity-100 transition-opacity duration-300">
                    <WishlistButton product={product} variant="icon-only" />
                </div>

                {/* Hover reveal — gradient + rising label */}
                {!isSold && (
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-primary-900/70 to-transparent pt-16 pb-5 px-5 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                        <span className="inline-flex items-center gap-2 text-white text-xs font-semibold tracking-[0.2em] uppercase translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                            View Details
                            <span aria-hidden="true">→</span>
                        </span>
                    </div>
                )}
            </div>

            {/* Text stack — open, left-aligned, strict rhythm */}
            <div className="pt-4">
                <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-accent-700 mb-1.5">
                    {product.category?.replace(/-/g, ' ')}
                </p>
                <h3 className={`font-playfair text-lg leading-snug line-clamp-2 transition-colors duration-300 ${isSold ? 'text-gray-500' : 'text-textPrimary group-hover:text-primary'}`}>
                    {product.name}
                </h3>
                <p className={`text-lg font-semibold mt-1 ${isSold ? 'text-gray-400' : 'text-textPrimary'}`}>
                    {formatPrice(product.price)}
                </p>
            </div>
        </Link>
    );
}
