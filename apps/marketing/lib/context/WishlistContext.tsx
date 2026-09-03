'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Product, WishlistItem } from '@/lib/types';
import { useAuth } from './AuthContext';
import { useRouter } from 'next/navigation';

interface WishlistContextType {
    items: WishlistItem[];
    itemCount: number;
    loading: boolean;
    addToWishlist: (product: Product) => Promise<boolean>;
    removeFromWishlist: (productId: string) => Promise<boolean>;
    isInWishlist: (productId: string) => boolean;
    clearWishlist: () => void;
    refreshWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<WishlistItem[]>([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const router = useRouter();

    // Fetch wishlist items when user logs in
    const fetchWishlist = async () => {
        if (!user) {
            setItems([]);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const response = await fetch('/api/wishlist', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const data = await response.json();
                setItems(data.items || []);
            } else {
                console.error('Failed to fetch wishlist');
                setItems([]);
            }
        } catch (error) {
            console.error('Error fetching wishlist:', error);
            setItems([]);
        } finally {
            setLoading(false);
        }
    };

    // Load wishlist when user changes
    useEffect(() => {
        let mounted = true;

        if (user) {
            // Defer fetch to not block critical rendering path (LCP) and deduplicate
            const timer = setTimeout(() => {
                if (mounted) fetchWishlist();
            }, 1000);

            return () => {
                mounted = false;
                clearTimeout(timer);
            };
        } else {
            fetchWishlist();
        }
    }, [user]);

    const addToWishlist = async (product: Product): Promise<boolean> => {
        // Check if user is authenticated
        if (!user) {
            // Redirect to login page
            router.push('/auth/login');
            return false;
        }

        // Check if already in wishlist
        if (isInWishlist(product.id)) {
            return false;
        }

        try {
            const response = await fetch('/api/wishlist', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ productId: product.id }),
            });

            if (response.ok) {
                const data = await response.json();
                // Optimistically add to local state
                const newItem: WishlistItem = {
                    id: data.item.id,
                    customerId: data.item.customerId,
                    productId: product.id,
                    product: product,
                    createdAt: new Date(data.item.createdAt),
                };
                setItems((currentItems) => [newItem, ...currentItems]);
                return true;
            } else {
                const error = await response.json();
                console.error('Failed to add to wishlist:', error);
                return false;
            }
        } catch (error) {
            console.error('Error adding to wishlist:', error);
            return false;
        }
    };

    const removeFromWishlist = async (productId: string): Promise<boolean> => {
        if (!user) {
            return false;
        }

        try {
            const response = await fetch(`/api/wishlist?productId=${productId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                // Remove from local state
                setItems((currentItems) => currentItems.filter((item) => item.productId !== productId));
                return true;
            } else {
                const error = await response.json();
                console.error('Failed to remove from wishlist:', error);
                return false;
            }
        } catch (error) {
            console.error('Error removing from wishlist:', error);
            return false;
        }
    };

    const isInWishlist = (productId: string): boolean => {
        return items.some((item) => item.productId === productId);
    };

    const clearWishlist = () => {
        setItems([]);
    };

    const refreshWishlist = async () => {
        await fetchWishlist();
    };

    const itemCount = items.length;

    return (
        <WishlistContext.Provider
            value={{
                items,
                itemCount,
                loading,
                addToWishlist,
                removeFromWishlist,
                isInWishlist,
                clearWishlist,
                refreshWishlist,
            }}
        >
            {children}
        </WishlistContext.Provider>
    );
}

export function useWishlist() {
    const context = useContext(WishlistContext);
    if (context === undefined) {
        throw new Error('useWishlist must be used within a WishlistProvider');
    }
    return context;
}
