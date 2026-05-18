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

interface ProductDetailClientProps {
    product: Product;
    productId: string;
}

async function getRelatedProducts(id: string): Promise<Product[]> {
    const res = await fetch(`/api/products/${id}/related`, {
        // WebSocket connection might prevent bfcache restoration, this is a known browser limitation
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.products;
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

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Breadcrumb */}
            <div className="bg-white border-b">
                <div className="container mx-auto px-4 py-4">
                    <nav className="flex items-center space-x-2 text-sm">
                        <Link href="/" className="text-gray-500 hover:text-primary">
                            Home
                        </Link>
                        <span className="text-gray-400">/</span>
                        <Link href="/collection" className="text-gray-500 hover:text-primary">
                            Collection
                        </Link>
                        <span className="text-gray-400">/</span>
                        <Link href={`/collection?category=${product.category}`} className="text-gray-500 hover:text-primary capitalize">
                            {product.category}
                        </Link>
                        <span className="text-gray-400">/</span>
                        <span className="text-gray-900 font-medium truncate max-w-xs">
                            {product.name}
                        </span>
                    </nav>
                </div>
            </div>

            {/* Product Details */}
            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                    {/* Image Gallery */}
                    <div>
                        <ProductGallery
                            images={product.images}
                            yt_link={product.yt_link}
                            productName={product.name}
                        />
                    </div>

                    {/* Product Info */}
                    <div className="space-y-6">
                        <div>
                            <h1 className="text-3xl lg:text-4xl font-bold mb-2">
                                {product.name}
                            </h1>
                            <p className="text-sm text-gray-500">SKU: {product.sku}</p>
                        </div>

                        {/* Price */}
                        <div className="border-t border-b py-4">
                            <p className="text-4xl font-bold text-accent-700">
                                {formatPrice(product.price)}
                            </p>
                        </div>

                        {/* Stock Status */}
                        <div>
                            {product.inStock ? (
                                <div className="flex items-center space-x-2">
                                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                    <span className="text-green-700 font-medium">Available</span>
                                </div>
                            ) : (
                                <div className="flex items-center space-x-2">
                                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                    <span className="text-red-700 font-medium">Sold Out</span>
                                </div>
                            )}
                        </div>

                        {/* Description */}
                        <div>
                            <h2 className="text-lg font-semibold mb-2">Description</h2>
                            <p className="text-textSecondary leading-relaxed">{product.description}</p>
                        </div>

                        {/* Material & Details */}
                        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                            <h3 className="font-semibold text-gray-900">Product Details</h3>

                            {product.material && (
                                <div className="flex justify-between">
                                    <span className="text-textSecondary">Material:</span>
                                    <span className="font-medium text-gray-900">{product.material}</span>
                                </div>
                            )}

                            {product.dimensions && (
                                <div className="flex justify-between">
                                    <span className="text-textSecondary">Length:</span>
                                    <span className="font-medium text-gray-900">
                                        {product.dimensions}
                                    </span>
                                </div>
                            )}

                            {product.weight && (
                                <div className="flex justify-between">
                                    <span className="text-textSecondary">Weight:</span>
                                    <span className="font-medium text-gray-900">{product.weight} kg</span>
                                </div>
                            )}

                            <div className="flex justify-between">
                                <span className="text-textSecondary">Category:</span>
                                <span className="font-medium text-gray-900 capitalize">{product.category?.replace(/-/g, ' ')}</span>
                            </div>
                        </div>

                        {/* Add to Cart / Sold Out */}
                        <div className="space-y-3">
                            {product.inStock ? (
                                <>
                                    <button
                                        onClick={handleAddToCart}
                                        disabled={isInCart(product.id)}
                                        className="w-full bg-primary text-secondary py-4 rounded-lg font-semibold text-lg hover:bg-primary-light transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
                                        className="w-full bg-stone-200 text-stone-500 py-4 rounded-lg font-semibold text-lg cursor-not-allowed flex items-center justify-center gap-2 border border-stone-300"
                                    >
                                        <Check className="w-5 h-5" />
                                        Recently Sold
                                    </button>
                                    <Link
                                        href="/collection"
                                        className="w-full border-2 border-primary text-primary py-3 rounded-lg font-semibold text-base hover:bg-primary hover:text-white transition-colors flex items-center justify-center gap-2"
                                    >
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
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">You May Also Like</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
