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
import { useAuth } from '@/lib/context/AuthContext';
import { Address } from '@/components/profile/AddressCard';

interface ShippingZone {
    id: string;
    name: string;
    base_charge: number;
    estimated_days: string;
}

export default function CheckoutPage() {
    const { items, clearCart } = useCart();
    const { user, loading: authLoading } = useAuth();
    const [shippingCost, setShippingCost] = useState(0);
    const [estimatedDays, setEstimatedDays] = useState('');
    const [shippingZoneId, setShippingZoneId] = useState<string | undefined>();
    const [isProcessing, setIsProcessing] = useState(false);

    // Email verification state
    const [isEmailVerified, setIsEmailVerified] = useState(false);
    const [verifiedEmail, setVerifiedEmail] = useState('');

    // Saved Addresses state
    const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
    const [isAddressesLoading, setIsAddressesLoading] = useState(false);
    const [selectedAddressId, setSelectedAddressId] = useState<string | undefined>();

    // Once the shipping form is submitted, show the payment button
    const [confirmedShipping, setConfirmedShipping] = useState<ShippingAddress | null>(null);
    const paymentRef = useRef<HTMLDivElement>(null);

    // Bypass contact verification if user is logged in
    useEffect(() => {
        if (!authLoading && user?.email) {
            setIsEmailVerified(true);
            setVerifiedEmail(user.email);
        }
    }, [user, authLoading]);

    // Fetch user's saved addresses
    useEffect(() => {
        if (user) {
            setIsAddressesLoading(true);
            fetch(`/api/profile/addresses?t=${Date.now()}`, { cache: 'no-store' })
                .then((res) => res.json())
                .then((data) => {
                    if (data.addresses) setSavedAddresses(data.addresses);
                })
                .catch((err) => console.error('Error fetching checkout addresses:', err))
                .finally(() => setIsAddressesLoading(false));
        }
    }, [user]);

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

    const handleShippingSubmit = async (shippingData: ShippingAddress, selAddressId?: string, saveToProfile?: boolean) => {
        setIsProcessing(true);
        let finalAddressId = selAddressId;

        try {
            // Save address to user profile if requested and user is logged in
            if (saveToProfile && !selAddressId && user) {
                try {
                    const saveRes = await fetch('/api/profile/addresses', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            label: 'Home',
                            full_name: shippingData.fullName,
                            phone: shippingData.phone,
                            address_line1: shippingData.addressLine1,
                            address_line2: shippingData.addressLine2 || null,
                            city: shippingData.city,
                            state: shippingData.state || '',
                            postal_code: shippingData.postalCode,
                            country: shippingData.country,
                            is_default: false,
                        }),
                    });
                    const saveData = await saveRes.json();
                    if (saveRes.ok && saveData.success && saveData.address?.id) {
                        finalAddressId = saveData.address.id;
                        toast.success('Address saved to your profile! 🏠');
                    } else {
                        console.error('Failed to auto-save address to profile:', saveData.error);
                    }
                } catch (err) {
                    console.error('Error auto-saving address to profile:', err);
                }
            }

            setSelectedAddressId(finalAddressId);

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
                    {/* Left — Shipping Form + Payment */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Contact Information Step */}
                        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold text-gray-900">Contact Information</h2>
                                {isEmailVerified && !user && (
                                    <button
                                        onClick={() => {
                                            setIsEmailVerified(false);
                                            setConfirmedShipping(null);
                                        }}
                                        className="text-sm font-semibold text-accent hover:text-accent-hover transition-colors"
                                    >
                                        Edit
                                    </button>
                                )}
                            </div>

                            {!isEmailVerified ? (
                                <EmailVerificationForm onSuccess={(email) => {
                                    setIsEmailVerified(true);
                                    setVerifiedEmail(email);
                                }} />
                            ) : (
                                <div className="flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-lg p-4">
                                    <div className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-xs text-textSecondary font-medium">
                                            {user ? 'Logged in as' : 'Contact Email'}
                                        </p>
                                        <p className="font-semibold text-gray-900 text-sm">{verifiedEmail}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Shipping details step — visible only when email is verified */}
                        {isEmailVerified && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                                <ShippingForm
                                    onSubmit={handleShippingSubmit}
                                    initialEmail={verifiedEmail}
                                    savedAddresses={savedAddresses}
                                    isAddressesLoading={isAddressesLoading}
                                    isLoggedIn={!!user}
                                />

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
                                            selectedAddressId={selectedAddressId}
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
