'use client';

import { useState, useEffect, useRef } from 'react';
import { useCart } from '@/lib/context/CartContext';
import ShippingForm from '@/components/Checkout/ShippingForm';
import OrderSummary from '@/components/Checkout/OrderSummary';
import RazorpayButton from '@/components/Checkout/RazorpayButton';
import { ShippingAddress } from '@/lib/validations/checkout';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { trackBeginCheckout } from '@/lib/analytics/gtag';
import EmailVerificationForm from '@/components/Auth/EmailVerificationForm';

interface ShippingZone {
    id: string;
    name: string;
    base_charge: number;
    estimated_days: string;
}

export default function CheckoutPage() {
    const { items, clearCart } = useCart();
    const [shippingCost, setShippingCost] = useState(0);
    const [estimatedDays, setEstimatedDays] = useState('');
    const [shippingZoneId, setShippingZoneId] = useState<string | undefined>();
    const [isProcessing, setIsProcessing] = useState(false);

    // Email verification state
    const [isEmailVerified, setIsEmailVerified] = useState(false);
    const [verifiedEmail, setVerifiedEmail] = useState('');

    // Once the shipping form is submitted, show the payment button
    const [confirmedShipping, setConfirmedShipping] = useState<ShippingAddress | null>(null);
    const paymentRef = useRef<HTMLDivElement>(null);

    // Track begin checkout in GA4
    useEffect(() => {
        if (items.length > 0) {
            const subtotal = items.reduce((sum, item) => sum + item.product.price, 0);
            trackBeginCheckout(items, subtotal);
        }
    }, []); // Only fire once on mount

    // Redirect if cart is empty
    if (items.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h1>
                    <p className="text-textSecondary mb-4">Add some items before checking out.</p>
                    <Link
                        href="/collection"
                        className="inline-block px-6 py-3 bg-accent text-white rounded-lg font-semibold hover:bg-accent-hover transition-colors"
                    >
                        Continue Shopping
                    </Link>
                </div>
            </div>
        );
    }

    const handleShippingSubmit = async (shippingData: ShippingAddress) => {
        setIsProcessing(true);

        try {
            let shippingInfo: ShippingZone;

            if (shippingData.country === 'India') {
                const shippingResponse = await fetch('/api/shipping/calculate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ state: shippingData.state || '' }),
                });

                if (!shippingResponse.ok) throw new Error('Failed to calculate shipping');
                shippingInfo = await shippingResponse.json();
            } else {
                shippingInfo = {
                    id: 'international',
                    name: `International Shipping – ${shippingData.country}`,
                    base_charge: 2500,
                    estimated_days: '10–15 business days',
                };
            }

            setShippingCost(shippingInfo.base_charge);
            setEstimatedDays(shippingInfo.estimated_days);
            setShippingZoneId(shippingInfo.id !== 'international' ? shippingInfo.id : undefined);
            setConfirmedShipping(shippingData);
            // Scroll to payment section after a brief paint delay
            setTimeout(() => {
                paymentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
        } catch (error) {
            console.error('Shipping error:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to calculate shipping.');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b">
                <div className="container mx-auto px-4 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
                            <p className="text-textSecondary mt-1">Complete your order</p>
                        </div>
                        <Link
                            href="/cart"
                            className="flex items-center gap-2 text-accent-700 hover:text-accent-hover font-medium"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            Back to Cart
                        </Link>
                    </div>
                </div>
            </div>

            {/* Checkout Content */}
            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left — Email Verification → Shipping Form + Payment */}
                    <div className="lg:col-span-2 space-y-6">
                        {!isEmailVerified ? (
                            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                                <h2 className="text-lg font-semibold text-gray-900 mb-6">Contact Information</h2>
                                <EmailVerificationForm onSuccess={(email) => {
                                    setIsEmailVerified(true);
                                    setVerifiedEmail(email);
                                }} />
                            </div>
                        ) : (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                                <ShippingForm onSubmit={handleShippingSubmit} initialEmail={verifiedEmail} />

                                {/* Payment section — revealed after shipping is confirmed */}
                                {confirmedShipping && (
                                    <div ref={paymentRef} className="bg-white rounded-xl border border-primary-100 p-6 shadow-sm">
                                        <h2 className="text-lg font-semibold text-gray-900 mb-1">
                                            Payment
                                        </h2>
                                        <p className="text-sm text-textSecondary mb-5">
                                            Address confirmed. Complete your purchase securely via Razorpay.
                                        </p>
                                        <RazorpayButton
                                            shippingAddress={confirmedShipping}
                                            cartItems={items.map((i) => ({
                                                productId: i.product.id,
                                                product: {
                                                    name: i.product.name,
                                                    price: i.product.price,
                                                    sku: i.product.sku,
                                                },
                                            }))}
                                            shippingCost={shippingCost}
                                            shippingZoneId={shippingZoneId}
                                            estimatedDeliveryDays={estimatedDays}
                                            onSuccess={clearCart}
                                        />
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Right — Order Summary */}
                    <div className="lg:col-span-1">
                        <OrderSummary shippingCost={shippingCost} estimatedDays={estimatedDays} />
                    </div>
                </div>
            </div>

            {/* Processing Overlay (shipping calculation) */}
            {isProcessing && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-8 text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
                        <p className="text-gray-900 font-medium">Calculating shipping…</p>
                    </div>
                </div>
            )}
        </div>
    );
}
