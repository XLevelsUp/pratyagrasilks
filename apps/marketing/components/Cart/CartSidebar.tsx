'use client';

import { useCart } from '@/lib/context/CartContext';
import CartItemComponent from './CartItem';
import Link from 'next/link';
import { Drawer } from 'vaul';
import { X, ShoppingBag } from 'lucide-react';

// Controlled vaul drawer from the right — animation, Esc, focus trap, and
// body scroll lock come from vaul. z-[60]/[70] so it covers the site header.
export default function CartSidebar() {
    const { items, itemCount, totalPrice, removeItem, isOpen, closeCart } = useCart();

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(price);
    };

    return (
        <Drawer.Root direction="right" open={isOpen} onOpenChange={(open) => !open && closeCart()}>
            <Drawer.Portal>
                <Drawer.Overlay className="fixed inset-0 bg-black/50 z-[60]" />
                <Drawer.Content className="fixed right-0 top-0 h-full w-full max-w-md z-[70] bg-white rounded-l-3xl flex flex-col focus:outline-none shadow-2xl">
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-5 border-b border-primary-100">
                        <Drawer.Title asChild>
                            <h2 className="font-playfair text-xl font-semibold text-textPrimary">
                                Your Cart
                                <span className="ml-3 text-xs font-sans font-semibold tracking-[0.2em] uppercase text-textSecondary/60 align-middle">
                                    {itemCount} {itemCount === 1 ? 'piece' : 'pieces'}
                                </span>
                            </h2>
                        </Drawer.Title>
                        <button
                            onClick={closeCart}
                            className="p-2 rounded-full hover:bg-primary-50 transition-colors"
                            aria-label="Close cart"
                        >
                            <X className="w-5 h-5 text-textSecondary" />
                        </button>
                    </div>

                    {/* Items — data-lenis-prevent keeps wheel events from leaking
                        to the smooth-scroller on the home page */}
                    <div className="flex-1 overflow-y-auto px-6" data-lenis-prevent>
                        {items.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-center">
                                <ShoppingBag className="w-12 h-12 text-primary-200 mb-6" aria-hidden="true" />
                                <p className="text-xs font-semibold tracking-[0.25em] uppercase text-textSecondary/50 mb-3">
                                    Your cart is empty
                                </p>
                                <h3 className="font-playfair text-2xl font-semibold text-primary mb-8">
                                    Discover something timeless
                                </h3>
                                <button
                                    onClick={closeCart}
                                    className="px-8 py-3 bg-primary text-secondary font-semibold rounded-full hover:bg-primary-light transition-colors"
                                >
                                    Continue Shopping
                                </button>
                            </div>
                        ) : (
                            <div>
                                {items.map((item) => (
                                    <CartItemComponent
                                        key={item.id}
                                        item={item}
                                        onRemove={removeItem}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    {items.length > 0 && (
                        <div className="border-t border-primary-100 px-6 py-5 space-y-4">
                            <div className="flex items-baseline justify-between">
                                <span className="text-xs font-semibold tracking-[0.2em] uppercase text-textSecondary/60">
                                    Subtotal
                                </span>
                                <span className="text-xl font-semibold text-textPrimary">
                                    {formatPrice(totalPrice)}
                                </span>
                            </div>
                            <Link
                                href="/checkout"
                                onClick={closeCart}
                                className="block w-full bg-primary text-secondary text-center font-semibold rounded-full py-3.5 hover:bg-primary-light transition-colors"
                            >
                                Proceed to Checkout
                            </Link>
                            <div className="text-center">
                                <Link
                                    href="/cart"
                                    onClick={closeCart}
                                    className="text-sm text-textSecondary underline underline-offset-4 hover:text-primary transition-colors"
                                >
                                    View full cart
                                </Link>
                            </div>
                            <p className="text-xs text-textSecondary/60 text-center">
                                Shipping and taxes calculated at checkout
                            </p>
                        </div>
                    )}
                </Drawer.Content>
            </Drawer.Portal>
        </Drawer.Root>
    );
}
