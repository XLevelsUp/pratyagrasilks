'use client';

import { useState, useEffect, useRef } from 'react';
import { useCart } from '@/lib/context/CartContext';
import ShippingForm from '@/components/Checkout/ShippingForm';
import OrderSummary from '@/components/Checkout/OrderSummary';
import RazorpayButton from '@/components/Checkout/RazorpayButton';
import { ShippingAddress } from '@/lib/validations/checkout';
import Link from 'next/link';
import { ArrowLeft, Check } from 'lucide-react';
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

// Presentational 3-step rail driven by existing checkout state
function StepRail({ current }: { current: 1 | 2 | 3 }) {
    const steps = ['Contact', 'Shipping', 'Payment'] as const;
    return (
        <ol className="flex items-center gap-3 md:gap-5" aria-label="Checkout progress">
            {steps.map((label, i) => {
                const stepNo = (i + 1) as 1 | 2 | 3;
                const done = stepNo < current;
                const active = stepNo === current;
                return (
                    <li key={label} className="flex items-center gap-3 md:gap-5">
                        {i > 0 && (
                            <span
                                className={`w-6 md:w-10 h-px ${done || active ? 'bg-primary' : 'bg-primary-200'}`}
                                aria-hidden="true"
                            />
                        )}
                        <span className="flex items-center gap-2">
                            <span
                                className={`flex items-center justify-center w-6 h-6 rounded-full text-[11px] font-semibold transition-colors ${
                                    done
                                        ? 'bg-primary text-secondary'
                                        : active
                                          ? 'border-2 border-primary text-primary'
                                          : 'border border-primary-200 text-textSecondary/50'
                                }`}
                                aria-hidden="true"
                            >
                                {done ? <Check className="w-3.5 h-3.5" /> : stepNo}
                            </span>
                            <span
                                className={`text-[11px] font-semibold tracking-[0.15em] uppercase ${
                                    active ? 'text-primary' : done ? 'text-textPrimary' : 'text-textSecondary/50'
                                }`}
                            >
                                {label}
                            </span>
                        </span>
                    </li>
                );
            })}
        </ol>
    );
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
                    if (data.addresses) {
                        setSavedAddresses(data.addresses);
                    }
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
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center px-4">
                    <p className="text-xs font-semibold tracking-[0.25em] uppercase text-textSecondary/50 mb-4">
                        Nothing to check out
                    </p>
                    <h1 className="font-playfair text-2xl md:text-3xl font-semibold text-primary mb-3">
                        Your cart is empty
                    </h1>
                    <p className="text-textSecondary mb-8">Add some items before checking out.</p>
                    <Link
                        href="/collection"
                        className="inline-block px-8 py-3 bg-primary text-secondary rounded-full font-semibold hover:bg-primary-light transition-colors"
                    >
                        Continue Shopping
                    </Link>
                </div>
            </div>
        );
    }

    const currentStep: 1 | 2 | 3 = !isEmailVerified ? 1 : !confirmedShipping ? 2 : 3;

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
        <div className="min-h-screen">
            {/* Header */}
            <div className="border-b border-primary-100">
                <div className="container mx-auto px-4 py-8">
                    <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
                        <div>
                            <p className="text-[11px] font-semibold tracking-[0.25em] uppercase text-accent-700 mb-3">
                                Secure Checkout
                            </p>
                            <h1 className="font-playfair text-3xl md:text-4xl font-bold text-primary">
                                Complete Your Order
                            </h1>
                        </div>
                        <Link
                            href="/cart"
                            className="flex items-center gap-2 text-sm text-textSecondary/70 hover:text-primary font-medium transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Cart
                        </Link>
                    </div>
                    <StepRail current={currentStep} />
                </div>
            </div>

            {/* Checkout Content */}
            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left — Shipping Form + Payment */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Contact Information Step */}
                        <div className="bg-white rounded-2xl border border-primary-100 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xs font-semibold tracking-[0.2em] uppercase text-textSecondary/60">
                                    <span className="font-playfair text-2xl font-bold text-primary/15 mr-3 normal-case tracking-normal align-middle" aria-hidden="true">01</span>
                                    Contact Information
                                </h2>
                                {isEmailVerified && !user && (
                                    <button
                                        onClick={() => {
                                            setIsEmailVerified(false);
                                            setConfirmedShipping(null); // Clear shipping confirmation on email change
                                        }}
                                        className="text-sm font-medium text-textSecondary underline underline-offset-4 hover:text-primary transition-colors"
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
                                <div className="flex items-center gap-3 bg-primary-50/60 border border-primary-100 rounded-xl p-4">
                                    <div className="w-8 h-8 rounded-full bg-white border border-primary-200 flex items-center justify-center text-primary shrink-0">
                                        <Check className="w-4 h-4" aria-hidden="true" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-textSecondary/60">
                                            {user ? 'Logged in as' : 'Contact Email'}
                                        </p>
                                        <p className="font-medium text-textPrimary text-sm">{verifiedEmail}</p>
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
                                    <div ref={paymentRef} className="bg-white rounded-2xl border border-primary-100 p-6">
                                        <h2 className="text-xs font-semibold tracking-[0.2em] uppercase text-textSecondary/60 mb-1">
                                            <span className="font-playfair text-2xl font-bold text-primary/15 mr-3 normal-case tracking-normal align-middle" aria-hidden="true">03</span>
                                            Payment
                                        </h2>
                                        <p className="text-sm text-textSecondary mb-6">
                                            Address confirmed. Complete your purchase securely via Razorpay.
                                        </p>

                                        {/* Trust micro-strip */}
                                        <div className="grid grid-cols-3 gap-4 mb-6">
                                            {[
                                                { title: '256-bit Encrypted', text: 'Your details stay private' },
                                                { title: 'Secured by Razorpay', text: 'PCI-DSS compliant payments' },
                                                { title: 'Authentic Handloom', text: 'Guaranteed genuine weaves' },
                                            ].map((item) => (
                                                <div key={item.title} className="border-t border-primary-100 pt-3">
                                                    <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-accent-700 mb-1">
                                                        {item.title}
                                                    </p>
                                                    <p className="text-xs text-textSecondary/70 leading-relaxed">{item.text}</p>
                                                </div>
                                            ))}
                                        </div>

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
                <div className="fixed inset-0 bg-primary-900/60 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-8 text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
                        <p className="text-xs font-semibold tracking-[0.2em] uppercase text-textSecondary/70">
                            Calculating shipping…
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
