'use client';

import { Product } from '@/lib/types';
import { useWishlist } from '@/lib/context/WishlistContext';
import { Heart } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

interface WishlistButtonProps {
    product: Product;
    variant?: 'default' | 'icon-only';
    className?: string;
}

export default function WishlistButton({ product, variant = 'default', className = '' }: WishlistButtonProps) {
    const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
    const [isLoading, setIsLoading] = useState(false);
    const inWishlist = isInWishlist(product.id);

    const handleToggleWishlist = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        setIsLoading(true);

        try {
            if (inWishlist) {
                const success = await removeFromWishlist(product.id);
                if (success) {
                    toast.success('Removed from wishlist');
                } else {
                    toast.error('Failed to remove from wishlist');
                }
            } else {
                const success = await addToWishlist(product);
                if (success) {
                    toast.success('Added to wishlist');
                } else {
                    // If not successful and not in wishlist, user might have been redirected to login
                    // Don't show error toast in this case
                }
            }
        } catch (error) {
            console.error('Error toggling wishlist:', error);
            toast.error('Something went wrong');
        } finally {
            setIsLoading(false);
        }
    };

    if (variant === 'icon-only') {
        return (
            <button
                onClick={handleToggleWishlist}
                disabled={isLoading}
                className={`p-2 rounded-full border border-slate/80 ${inWishlist ? 'bg-white' : 'bg-black/50'} hover:bg-white shadow-md text-slate hover:text-red-500 transition-all duration-200 disabled:opacity-50 ${className}`}
                aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
            >
                <Heart
                    className={`w-4 h-4 transition-all ${inWishlist ? 'fill-red-500 text-red-500' : 'text-inherit'
                        } ${isLoading ? 'animate-pulse' : ''}`}
                />
            </button>
        );
    }

    return (
        <button
            onClick={handleToggleWishlist}
            disabled={isLoading}
            className={`flex items-center justify-center gap-2 px-6 py-3 border-2 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 ${inWishlist
                ? 'border-red-500 text-red-500 hover:bg-red-50'
                : 'border-primary text-primary hover:border-primary-light hover:text-primary-light'
                } ${className}`}
        >
            <Heart
                className={`w-5 h-5 transition-all ${inWishlist ? 'fill-red-500' : ''
                    } ${isLoading ? 'animate-pulse' : ''}`}
            />
            {inWishlist ? 'In Wishlist' : 'Add to Wishlist'}
        </button>
    );
}
