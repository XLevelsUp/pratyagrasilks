'use client';

import { useWishlist } from '@/lib/context/WishlistContext';
import { useCart } from '@/lib/context/CartContext';
import { useAuth } from '@/lib/context/AuthContext';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect } from 'react';
import { ShoppingCart, Trash2, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Product } from '@/lib/types';
import toast from 'react-hot-toast';

export default function WishlistPage() {
    const { items, loading, removeFromWishlist } = useWishlist();
    const { addItem, isInCart } = useCart();
    const { user } = useAuth();
    const router = useRouter();

    // Redirect to login if not authenticated — in an effect, never during render
    useEffect(() => {
        if (!user && !loading) {
            router.push('/auth/login');
        }
    }, [user, loading, router]);

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(price);
    };

    const handleRemoveFromWishlist = async (productId: string) => {
        const success = await removeFromWishlist(productId);
        if (success) {
            toast.success('Removed from wishlist');
        } else {
            toast.error('Failed to remove from wishlist');
        }
    };

    const handleAddToCart = (product: Product) => {
        const added = addItem(product);
        if (!added) {
            toast('This item is already in your cart!');
        }
    };

    if (!user && !loading) return null;

    if (loading) {
        return (
            <div className="min-h-screen container mx-auto px-4 py-12">
                <div className="h-3 w-32 rounded bg-gray-200 animate-pulse mb-4" />
                <div className="h-10 w-64 rounded-lg bg-primary/10 animate-pulse mb-12" />
                <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 md:gap-x-6 md:gap-y-12 xl:grid-cols-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i}>
                            <div className="aspect-[3/4] rounded-xl bg-gradient-to-br from-primary-100 to-primary-200 relative overflow-hidden">
                                <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/50 to-transparent" />
                            </div>
                            <div className="pt-4 space-y-2 animate-pulse">
                                <div className="h-3 w-1/3 rounded bg-gray-200" />
                                <div className="h-5 w-3/4 rounded bg-gray-200" />
                                <div className="h-5 w-1/3 rounded bg-gray-200" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            {/* Header */}
            <div className="border-b border-primary-100">
                <div className="container mx-auto px-4 py-10">
                    <Link
                        href="/profile"
                        className="inline-flex items-center gap-1 text-sm text-textSecondary/70 hover:text-primary transition-colors mb-5"
                    >
                        <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                        Back to My Account
                    </Link>
                    <div className="flex flex-wrap items-end justify-between gap-4">
                        <div>
                            <p className="text-[11px] font-semibold tracking-[0.25em] uppercase text-accent-700 mb-3">
                                Saved for later
                            </p>
                            <h1 className="font-playfair text-3xl md:text-4xl font-bold text-primary">
                                My Wishlist
                            </h1>
                            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-textSecondary/60 mt-3">
                                {items.length} {items.length === 1 ? 'piece' : 'pieces'}
                            </p>
                        </div>
                        <Link
                            href="/collection"
                            className="inline-flex items-center gap-2 text-primary font-semibold hover:text-primary-light transition-colors group pb-1 border-b-2 border-primary/20 hover:border-primary-light"
                        >
                            Continue Shopping
                            <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1">
                                →
                            </span>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Wishlist Content */}
            <div className="container mx-auto px-4 py-10">
                {items.length === 0 ? (
                    /* Empty State — editorial, centered */
                    <div className="flex flex-col items-center justify-center text-center min-h-[50vh]">
                        <p className="text-xs font-semibold tracking-[0.25em] uppercase text-textSecondary/50 mb-4">
                            Nothing saved yet
                        </p>
                        <h2 className="font-playfair text-2xl md:text-3xl font-semibold text-primary mb-3">
                            Your wishlist awaits its first treasure
                        </h2>
                        <p className="text-textSecondary mb-8 max-w-sm">
                            Save the pieces you love and return to them whenever you&apos;re ready.
                        </p>
                        <Link
                            href="/collection"
                            className="inline-block px-8 py-3 bg-primary text-secondary rounded-full font-semibold hover:bg-primary-light transition-colors"
                        >
                            Explore Our Collection
                        </Link>
                    </div>
                ) : (
                    /* Wishlist Grid — editorial card anatomy */
                    <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 md:gap-x-6 md:gap-y-12 xl:grid-cols-4">
                        {items.map((item) => {
                            const product = item.product;
                            const imageUrl = product.images && product.images.length > 0
                                ? product.images[0]
                                : '/placeholder-product.jpg';

                            return (
                                <div key={item.id} className="group">
                                    {/* Image block */}
                                    <Link
                                        href={`/product/${product.id}`}
                                        className="block relative aspect-[3/4] overflow-hidden rounded-xl bg-primary-50 silk-shimmer"
                                    >
                                        <Image
                                            src={imageUrl}
                                            alt={product.name}
                                            fill
                                            className={`object-cover transition-transform duration-700 ease-out ${product.inStock ? 'group-hover:scale-[1.04]' : 'grayscale-[40%]'}`}
                                            sizes="(max-width: 640px) 45vw, (max-width: 1280px) 30vw, 24vw"
                                        />
                                        {!product.inStock && (
                                            <span className="absolute top-3 left-3 bg-stone-800/80 backdrop-blur text-stone-100 text-[10px] font-semibold tracking-[0.15em] uppercase px-3 py-1 rounded-full">
                                                Out of Stock
                                            </span>
                                        )}
                                    </Link>

                                    {/* Text stack */}
                                    <div className="pt-4">
                                        <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-accent-700 mb-1.5">
                                            {product.category?.replace(/-/g, ' ')}
                                        </p>
                                        <Link href={`/product/${product.id}`}>
                                            <h3 className="font-playfair text-lg leading-snug line-clamp-2 text-textPrimary hover:text-primary transition-colors duration-300">
                                                {product.name}
                                            </h3>
                                        </Link>
                                        <p className="text-lg font-semibold mt-1 text-textPrimary">
                                            {formatPrice(product.price)}
                                        </p>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2 mt-3">
                                        <button
                                            onClick={() => handleAddToCart(product)}
                                            disabled={!product.inStock || isInCart(product.id)}
                                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-secondary rounded-full text-sm font-semibold hover:bg-primary-light transition-colors disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
                                        >
                                            <ShoppingCart className="w-4 h-4" aria-hidden="true" />
                                            {isInCart(product.id) ? 'In Cart' : product.inStock ? 'Add to Cart' : 'Out of Stock'}
                                        </button>
                                        <button
                                            onClick={() => handleRemoveFromWishlist(product.id)}
                                            className="p-2.5 rounded-full border border-primary-200 text-textSecondary/60 hover:border-red-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                                            aria-label={`Remove ${product.name} from wishlist`}
                                        >
                                            <Trash2 className="w-4 h-4" aria-hidden="true" />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
