'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Package, Home } from 'lucide-react';
import Image from 'next/image';
import { trackPurchase } from '@/lib/analytics/gtag';

interface OrderData {
    order: {
        id: string;
        customer_name: string;
        customer_email: string;
        customer_phone: string;
        shipping_address: {
            line1: string;
            line2?: string;
            city: string;
            state: string;
            pincode: string;
            country?: string;
        };
        subtotal: number;
        shipping_charge: number;
        total_amount: number;
        status: string;
        estimated_delivery_days: string;
        created_at: string;
        items: Array<{
            id: string;
            quantity: number;
            unit_price: number;
            total_price: number;
            products: {
                id: string;
                name: string;
                images: string[];
                sku: string;
            };
        }>;
    };
}

export default function OrderConfirmationPage() {
    const params = useParams();
    const orderId = params.id as string;
    const [orderData, setOrderData] = useState<OrderData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchOrder() {
            try {
                const response = await fetch(`/api/orders/${orderId}`);
                if (response.ok) {
                    const data = await response.json();
                    setOrderData(data);

                    // Track purchase in GA4
                    if (data?.order) {
                        trackPurchase(
                            data.order.id,
                            data.order.total_amount,
                            data.order.items,
                            data.order.shipping_charge
                        );
                    }
                }
            } catch (error) {
                console.error('Error fetching order:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchOrder();
    }, [orderId]);

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(price);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!orderData) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h1>
                    <Link href="/" className="text-primary hover:text-primary-light">
                        Return to Home
                    </Link>
                </div>
            </div>
        );
    }

    const { order } = orderData;
    const orderNumber = order.id.substring(0, 8).toUpperCase();

    return (
        <div className="min-h-screen py-12">
            <div className="container mx-auto px-4 max-w-3xl">
                {/* Success Message */}
                <div className="bg-white rounded-2xl border border-primary-100 p-8 mb-6 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-50 border border-primary-200 rounded-full mb-5">
                        <CheckCircle className="w-8 h-8 text-primary" />
                    </div>
                    <p className="text-xs font-semibold tracking-[0.25em] uppercase text-accent-700 mb-3">
                        Thank you for your order
                    </p>
                    <h1 className="font-playfair text-3xl md:text-4xl font-bold text-primary mb-3">
                        Order Confirmed
                    </h1>
                    <p className="text-textSecondary mb-6">
                        We&apos;ve sent a confirmation email to{' '}
                        <span className="font-medium text-textPrimary">{order.customer_email}</span>
                    </p>
                    <div className="bg-primary-50/60 border border-primary-100 rounded-xl px-6 py-3 inline-block">
                        <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-textSecondary/60">
                            Order Number
                        </p>
                        <p className="text-2xl font-semibold text-primary">{orderNumber}</p>
                    </div>
                </div>

                {/* Order Details */}
                <div className="bg-white rounded-2xl border border-primary-100 p-6 mb-6">
                    <h2 className="text-xs font-semibold tracking-[0.2em] uppercase text-textSecondary/60 mb-5 flex items-center gap-2">
                        <Package className="w-4 h-4" />
                        Order Details
                    </h2>

                    {/* Items */}
                    <div className="space-y-4 mb-6">
                        {order.items.map((item) => {
                            const imageUrl = item.products.images?.[0] || '/placeholder-product.jpg';
                            return (
                                <div key={item.id} className="flex gap-4 pb-4 border-b border-primary-100 last:border-0">
                                    <div className="relative w-16 aspect-[3/4] flex-shrink-0 rounded-lg overflow-hidden bg-primary-50">
                                        <Image
                                            src={imageUrl}
                                            alt={item.products.name}
                                            fill
                                            className="object-cover"
                                            sizes="80px"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-playfair text-textPrimary leading-snug">{item.products.name}</h3>
                                        <p className="text-[10px] tracking-[0.1em] uppercase text-textSecondary/50 mt-1">
                                            SKU · {item.products.sku}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold text-textPrimary">
                                            {formatPrice(item.unit_price || item.total_price || 0)}
                                        </p>
                                        <p className="text-sm text-textSecondary/60">Qty: {item.quantity}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Pricing Summary */}
                    <div className="border-t border-primary-100 pt-4 space-y-2.5">
                        <div className="flex justify-between items-baseline">
                            <span className="text-xs font-semibold tracking-[0.15em] uppercase text-textSecondary/60">Subtotal</span>
                            <span className="text-sm text-textPrimary">{formatPrice(order.subtotal)}</span>
                        </div>
                        <div className="flex justify-between items-baseline">
                            <span className="text-xs font-semibold tracking-[0.15em] uppercase text-textSecondary/60">Shipping *</span>
                            <span className="text-sm text-textPrimary">{formatPrice(order.shipping_charge)}</span>
                        </div>
                        <div className="flex justify-between items-baseline pt-3 border-t border-primary-100">
                            <span className="text-xs font-semibold tracking-[0.15em] uppercase text-textPrimary">Total Paid</span>
                            <span className="text-xl font-semibold text-primary">{formatPrice(order.total_amount)}</span>
                        </div>
                        {order.shipping_charge > 0 && (
                            <p className="text-xs text-accent-700 pt-2">
                                * Shipping cost is an estimate and may vary
                            </p>
                        )}
                    </div>
                </div>

                {/* Shipping Address */}
                <div className="bg-white rounded-2xl border border-primary-100 p-6 mb-6">
                    <h2 className="text-xs font-semibold tracking-[0.2em] uppercase text-textSecondary/60 mb-4 flex items-center gap-2">
                        <Home className="w-4 h-4" />
                        Shipping Address
                    </h2>
                    <div className="">
                        <p className="font-medium">{order.customer_name}</p>
                        <p>{order.shipping_address.line1}</p>
                        {order.shipping_address.line2 && <p>{order.shipping_address.line2}</p>}
                        <p>
                            {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.pincode}
                        </p>
                        {order.shipping_address.country && order.shipping_address.country !== 'India' && (
                            <p>{order.shipping_address.country}</p>
                        )}
                        <p className="mt-2">{order.customer_phone}</p>
                    </div>
                    {order.estimated_delivery_days && (
                        <div className="mt-4 p-3 bg-primary-50/60 border border-primary-100 rounded-xl">
                            <p className="text-sm text-textPrimary">
                                <span className="font-medium">Estimated Delivery:</span> {order.estimated_delivery_days}
                            </p>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <Link
                        href="/collection"
                        className="flex-1 bg-primary text-secondary text-center py-3.5 rounded-full font-semibold hover:bg-primary-light transition-colors"
                    >
                        Continue Shopping
                    </Link>
                    <Link
                        href={`/orders/${order.id}`}
                        className="flex-1 border border-primary-200 text-textPrimary text-center py-3.5 rounded-full font-semibold hover:border-primary hover:text-primary transition-colors"
                    >
                        View Order Details
                    </Link>
                </div>
            </div>
        </div>
    );
}
