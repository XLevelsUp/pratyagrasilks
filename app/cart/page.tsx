'use client';

import { useCart } from '@/lib/context/CartContext';
import CartItemComponent from '@/components/Cart/CartItem';
import Link from 'next/link';
import { ShoppingBag, ArrowLeft } from 'lucide-react';

export default function CartPage() {
    const { items, itemCount, totalPrice, removeItem, clearCart } = useCart();

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(price);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b">
                <div className="container mx-auto px-4 py-6">
                    <div className="flex flex-wrap items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
                            <p className="text-textSecondary mt-1">{itemCount} {itemCount === 1 ? 'item' : 'items'}</p>
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

            {/* Cart Content */}
            <div className="container mx-auto px-4 py-8">
                {items.length === 0 ? (
                    /* Empty Cart */
                    <div className="bg-white rounded-lg shadow-md p-12 text-center">
                        <ShoppingBag className="w-24 h-24 text-gray-300 mx-auto mb-6" />
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
                        <p className="text-textSecondary mb-6">
                            Looks like you haven't added any items to your cart yet.
                        </p>
                        <Link
                            href="/collection"
                            className="inline-block px-8 py-3 bg-accent text-white rounded-lg font-semibold hover:bg-accent-hover transition-colors"
                        >
                            Start Shopping
                        </Link>
                    </div>
                ) : (
                    /* Cart with Items */
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Cart Items */}
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-lg shadow-md p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-xl font-semibold text-gray-900">Cart Items</h2>
                                    <button
                                        onClick={clearCart}
                                        className="text-sm text-red-600 hover:text-red-700 font-medium"
                                    >
                                        Clear All
                                    </button>
                                </div>

                                <div className="divide-y">
                                    {items.map((item) => (
                                        <CartItemComponent
                                            key={item.id}
                                            item={item}
                                            onRemove={removeItem}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Order Summary */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
                                <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>

                                <div className="space-y-3 mb-6">
                                    <div className="flex justify-between text-textSecondary">
                                        <span>Subtotal ({itemCount} items)</span>
                                        <span>{formatPrice(totalPrice)}</span>
                                    </div>

                                    <div className="flex justify-between text-textSecondary">
                                        <span>Shipping</span>
                                        <span className="text-sm text-accent-700">Calculated at checkout</span>
                                    </div>

                                    <div className="border-t pt-3">
                                        <div className="flex justify-between text-lg font-semibold">
                                            <span className="text-gray-900">Total</span>
                                            <span className="text-accent-700">{formatPrice(totalPrice)}</span>
                                        </div>
                                    </div>
                                </div>

                                <Link
                                    href="/checkout"
                                    className="block w-full bg-accent text-white text-center py-3 rounded-lg font-semibold hover:bg-accent-hover transition-colors mb-3"
                                >
                                    Proceed to Checkout
                                </Link>

                                <Link
                                    href="/collection"
                                    className="block w-full border-2 border-gray-300  text-center py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                                >
                                    Continue Shopping
                                </Link>

                                <p className="text-xs text-gray-500 text-center mt-4">
                                    Shipping and taxes calculated at checkout
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

