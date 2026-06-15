'use client';

import { useWishlist } from '@/lib/context/WishlistContext';
import { useCart } from '@/lib/context/CartContext';
import { useAuth } from '@/lib/context/AuthContext';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Trash2, Heart, ArrowLeft } from 'lucide-react';
import { isSupabaseImage } from '@/lib/utils/image';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function WishlistPage() {
    const { items, loading, removeFromWishlist } = useWishlist();
    const { addItem, isInCart } = useCart();
    const { user } = useAuth();
    const router = useRouter();

    // Redirect to login if not authenticated
    if (!user && !loading) {
        router.push('/auth/login');
        return null;
    }

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

    const handleAddToCart = (product: any) => {
        const added = addItem(product);
        if (!added) {
            toast('This item is already in your cart!');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-textSecondary">Loading your wishlist...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b">
                <div className="container mx-auto px-4 py-8">
                    <Link
                        href="/profile"
                        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary transition-colors mb-4"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to My Account
                    </Link>
                    <div className="flex flex-wrap items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">My Wishlist</h1>
                            <p className="text-textSecondary mt-1">
                                {items.length} {items.length === 1 ? 'item' : 'items'} saved
                            </p>
                        </div>
                        <Link
                            href="/collection"
                            className="flex items-center gap-2 text-primary hover:text-primary-light font-medium ml-auto"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            Continue Shopping
                        </Link>
                    </div>
                </div>
            </div>

            {/* Wishlist Content */}
            <div className="container mx-auto px-4 py-8">
                {items.length === 0 ? (
                    // Empty State
                    <div className="bg-white rounded-lg shadow-md p-12 text-center">
                        <Heart className="w-24 h-24 text-gray-300 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Wishlist is Empty</h2>
                        <p className="text-textSecondary mb-6">
                            Save items you love to your wishlist and shop them later!
                        </p>
                        <Link
                            href="/collection"
                            className="inline-block px-8 py-3 bg-primary text-secondary rounded-lg font-semibold hover:bg-primary-light transition-colors"
                        >
                            Explore Our Collection
                        </Link>
                    </div>
                ) : (
                    // Wishlist Grid
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {items.map((item) => {
                            const product = item.product;
                            const imageUrl = product.images && product.images.length > 0
                                ? product.images[0]
                                : '/placeholder-product.jpg';

                            return (
                                <div
                                    key={item.id}
                                    className="bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl"
                                >
                                    {/* Product Image */}
                                    <Link href={`/product/${product.id}`} className="block relative aspect-square overflow-hidden bg-gray-100">
                                        <Image
                                            src={imageUrl}
                                            alt={product.name}
                                            fill
                                            className="object-cover transition-transform duration-300 hover:scale-105"
                                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                            unoptimized={isSupabaseImage(imageUrl)}
                                        />
                                        {!product.inStock && (
                                            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                                                <span className="text-white font-semibold text-lg">Out of Stock</span>
                                            </div>
                                        )}
                                    </Link>

                                    {/* Product Info */}
                                    <div className="p-4">
                                        <Link href={`/product/${product.id}`}>
                                            <h3 className="text-lg font-semibold mb-2 line-clamp-2 hover:text-primary-light transition-colors">
                                                {product.name}
                                            </h3>
                                        </Link>

                                        <p className="text-2xl font-bold text-accent-700 mb-4">
                                            {formatPrice(product.price)}
                                        </p>

                                        {/* Action Buttons */}
                                        <div className="space-y-2">
                                            <button
                                                onClick={() => handleAddToCart(product)}
                                                disabled={!product.inStock || isInCart(product.id)}
                                                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary text-secondary rounded-lg font-medium hover:bg-primary-light transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                                            >
                                                <ShoppingCart className="w-4 h-4" />
                                                {isInCart(product.id) ? 'In Cart' : product.inStock ? 'Add to Cart' : 'Out of Stock'}
                                            </button>

                                            <button
                                                onClick={() => handleRemoveFromWishlist(product.id)}
                                                className="w-full flex items-center justify-center gap-2 px-4 py-2 border-2 border-red-500 text-red-500 rounded-lg font-medium hover:bg-red-50 transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                                Remove
                                            </button>
                                        </div>
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

