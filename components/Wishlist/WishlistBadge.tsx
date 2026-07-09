'use client';

import { useWishlist } from '@/lib/context/WishlistContext';
import { Heart } from 'lucide-react';
import Link from 'next/link';

// `tone="light"` is used by the transparent header overlay on the home hero
export default function WishlistBadge({ tone = 'dark' }: { tone?: 'dark' | 'light' }) {
    const { itemCount } = useWishlist();

    return (
        <Link href="/wishlist" className="relative group" aria-label={`Wishlist with ${itemCount} items`}>
            <div className={`p-2 rounded-lg transition-colors ${tone === 'light' ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}>
                <Heart className={`w-6 h-6 transition-colors ${tone === 'light' ? 'text-white group-hover:text-secondary' : 'text-gray-700 group-hover:text-primary'}`} />
                {itemCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                        {itemCount > 9 ? '9+' : itemCount}
                    </span>
                )}
            </div>
        </Link>
    );
}
