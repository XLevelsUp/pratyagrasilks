'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Product } from '@/lib/types';
import { useAuth } from './AuthContext';

export interface CartItem {
    id: string;
    product: Product;
}

interface CartContextType {
    items: CartItem[];
    itemCount: number;
    totalPrice: number;
    addItem: (product: Product) => boolean;
    removeItem: (productId: string) => void;
    clearCart: () => void;
    isOpen: boolean;
    openCart: () => void;
    closeCart: () => void;
    isInCart: (productId: string) => boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth();
    const [items, setItems] = useState<CartItem[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);

    // Load cart from localStorage on mount
    useEffect(() => {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            try {
                setItems(JSON.parse(savedCart));
            } catch (error) {
                console.error('Failed to load cart:', error);
            }
        }
        setIsInitialized(true);
    }, []);

    // Save cart to localStorage whenever it changes (only after initial load)
    useEffect(() => {
        if (isInitialized) {
            localStorage.setItem('cart', JSON.stringify(items));
        }
    }, [items, isInitialized]);

    // Clear cart on logout to prevent cart leak across different user accounts
    useEffect(() => {
        const wasLoggedIn = localStorage.getItem('was_logged_in') === 'true';
        if (isInitialized) {
            if (user) {
                localStorage.setItem('was_logged_in', 'true');
            } else if (wasLoggedIn && !user) {
                setItems([]);
                localStorage.removeItem('cart');
                localStorage.removeItem('was_logged_in');
            }
        }
    }, [user, isInitialized]);

    const addItem = (product: Product): boolean => {
        const existingItem = items.find((item) => item.product.id === product.id);

        if (existingItem) {
            // Item already in cart, don't add again
            return false;
        }

        // Add new item
        setItems((currentItems) => [...currentItems, { id: product.id, product }]);
        setIsOpen(true); // Open cart sidebar when item is added
        return true;
    };

    const removeItem = (productId: string) => {
        setItems((currentItems) => currentItems.filter((item) => item.product.id !== productId));
    };

    const clearCart = () => {
        setItems([]);
    };

    const isInCart = (productId: string): boolean => {
        return items.some((item) => item.product.id === productId);
    };

    const openCart = () => setIsOpen(true);
    const closeCart = () => setIsOpen(false);

    // Simple calculations - just count items and sum prices
    const itemCount = items.length;
    const totalPrice = items.reduce((total, item) => total + item.product.price, 0);

    return (
        <CartContext.Provider
            value={{
                items,
                itemCount,
                totalPrice,
                addItem,
                removeItem,
                clearCart,
                isOpen,
                openCart,
                closeCart,
                isInCart,
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}
