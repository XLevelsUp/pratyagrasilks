'use client';

import { useCart } from '@/lib/context/CartContext';
import { ShoppingCart } from 'lucide-react';

// `tone="light"` is used by the transparent header overlay on the home hero
export default function CartBadge({ tone = 'dark' }: { tone?: 'dark' | 'light' }) {
    const { itemCount, openCart } = useCart();

    return (
        <button
            onClick={openCart}
            className={`relative p-2 rounded-md transition-colors ${tone === 'light' ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
            aria-label={`Shopping cart with ${itemCount} items`}
        >
            <ShoppingCart className="w-6 h-6 " />
            {itemCount > 0 && (
                <span className={`absolute -top-1 -right-1 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center ${tone === 'light' ? 'bg-secondary text-primary' : 'bg-primary text-white'}`}>
                    {itemCount > 9 ? '9+' : itemCount}
                </span>
            )}
        </button>
    );
}
