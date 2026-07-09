'use client';

import { CartItem } from '@/lib/context/CartContext';
import Image from 'next/image';
import Link from 'next/link';
import { X } from 'lucide-react';

interface CartItemComponentProps {
    item: CartItem;
    onRemove: (productId: string) => void;
}

// Shared by CartSidebar and the /cart page.
export default function CartItemComponent({
    item,
    onRemove,
}: CartItemComponentProps) {
    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(price);
    };

    const imageUrl = item.product.images && item.product.images.length > 0
        ? item.product.images[0]
        : '/placeholder-product.jpg';

    return (
        <div className="flex gap-4 py-5 border-b border-primary-100">
            {/* Product Image */}
            <Link
                href={`/product/${item.product.id}`}
                className="relative w-20 aspect-[3/4] flex-shrink-0 rounded-lg overflow-hidden bg-primary-50 silk-shimmer"
            >
                <Image
                    src={imageUrl}
                    alt={item.product.name}
                    fill
                    className="object-cover"
                    sizes="80px"
                />
            </Link>

            {/* Product Info */}
            <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                <div>
                    <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-accent-700 mb-1">
                        {item.product.category?.replace(/-/g, ' ')}
                    </p>
                    <Link href={`/product/${item.product.id}`}>
                        <h3 className="font-playfair text-sm text-textPrimary leading-snug line-clamp-2 hover:text-primary transition-colors">
                            {item.product.name}
                        </h3>
                    </Link>
                </div>
                <p className="text-sm font-semibold text-textPrimary">
                    {formatPrice(item.product.price)}
                </p>
            </div>

            {/* Remove */}
            <div className="flex flex-col items-end">
                <button
                    onClick={() => onRemove(item.product.id)}
                    className="p-1.5 rounded-full text-textSecondary/40 hover:text-red-500 hover:bg-red-50 transition-colors"
                    aria-label={`Remove ${item.product.name} from cart`}
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
