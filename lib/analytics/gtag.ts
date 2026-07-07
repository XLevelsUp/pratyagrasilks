// GA4 Ecommerce Event Tracking Helper Functions
// Follows official GA4 Items array schema

import { Product } from '@/lib/types';

// Declare gtag function for TypeScript
declare global {
    interface Window {
        gtag: (...args: any[]) => void;
    }
}

// Helper to check if gtag is available
const isGtagAvailable = (): boolean => {
    return typeof window !== 'undefined' && typeof window.gtag === 'function';
};

/**
 * Track product view event
 * Fires when user views a product detail page
 */
export const trackViewItem = (product: Product) => {
    if (!isGtagAvailable()) return;

    window.gtag('event', 'view_item', {
        currency: 'INR',
        value: product.price,
        items: [
            {
                item_id: product.id,
                item_name: product.name,
                price: product.price,
                item_category: product.category,
                item_brand: 'Pratyagra Silks',
                quantity: 1,
            },
        ],
    });
};

/**
 * Track add to cart event
 * Fires when user adds a product to their cart
 */
export const trackAddToCart = (product: Product) => {
    if (!isGtagAvailable()) return;

    window.gtag('event', 'add_to_cart', {
        currency: 'INR',
        value: product.price,
        items: [
            {
                item_id: product.id,
                item_name: product.name,
                price: product.price,
                item_category: product.category,
                item_brand: 'Pratyagra Silks',
                quantity: 1,
            },
        ],
    });
};

/**
 * Track begin checkout event
 * Fires when user starts the checkout process
 */
export const trackBeginCheckout = (cartItems: Array<{ product: Product }>, totalPrice: number) => {
    if (!isGtagAvailable()) return;

    window.gtag('event', 'begin_checkout', {
        currency: 'INR',
        value: totalPrice,
        items: cartItems.map((item) => ({
            item_id: item.product.id,
            item_name: item.product.name,
            price: item.product.price,
            item_category: item.product.category,
            item_brand: 'Pratyagra Silks',
            quantity: 1,
        })),
    });
};

/**
 * Track purchase event
 * Fires on order confirmation page
 */
export const trackPurchase = (
    orderId: string,
    total: number,
    items: Array<{
        products: {
            id: string;
            name: string;
            sku: string;
        };
        price: number;
        quantity: number;
    }>,
    shippingCost: number = 0
) => {
    if (!isGtagAvailable()) return;

    window.gtag('event', 'purchase', {
        transaction_id: orderId,
        currency: 'INR',
        value: total,
        shipping: shippingCost,
        items: items.map((item) => ({
            item_id: item.products.id,
            item_name: item.products.name,
            price: item.price,
            item_brand: 'Pratyagra Silks',
            quantity: item.quantity,
        })),
    });
};
