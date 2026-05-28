'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Script from 'next/script';
import toast from 'react-hot-toast';
import { ShieldCheck } from 'lucide-react';

declare global {
    interface Window {
        Razorpay: any;
    }
}

interface CartItem {
    productId: string;
    product: { name: string; price: number; sku: string };
}

interface ShippingAddress {
    fullName: string;
    email: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state?: string;
    postalCode: string;
    country: string;
}

interface Props {
    shippingAddress: ShippingAddress;
    selectedAddressId?: string;
    cartItems: CartItem[];
    shippingCost: number;
    shippingZoneId?: string;
    estimatedDeliveryDays?: string;
    onSuccess?: () => void;
}

export default function RazorpayButton({
    shippingAddress,
    selectedAddressId,
    cartItems,
    shippingCost,
    shippingZoneId,
    estimatedDeliveryDays,
    onSuccess,
}: Props) {
    const router = useRouter();
    const [scriptReady, setScriptReady] = useState(
        () => typeof window !== 'undefined' && typeof window.Razorpay !== 'undefined'
    );
    const [loading, setLoading] = useState(false);

    const totalAmount =
        cartItems.reduce((sum, i) => sum + i.product.price, 0) + shippingCost;

    const handlePayment = async () => {
        if (!scriptReady) {
            toast.error('Payment system is loading — please wait a moment.');
            return;
        }
        setLoading(true);

        try {
            // Step 1: Create order server-side
            const createRes = await fetch('/api/order/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    shippingAddress,
                    selectedAddressId,
                    items: cartItems.map((i) => ({ productId: i.productId })),
                    shippingCost,
                    shippingZoneId,
                    estimatedDeliveryDays,
                }),
            });
            const createData = await createRes.json();
            if (!createRes.ok || !createData.success) {
                throw new Error(createData.error || 'Could not initiate payment');
            }

            // Step 2: Open Razorpay modal
            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                amount: createData.amount,
                currency: createData.currency,
                name: 'Kandangi Sarees',
                description: `Order ${createData.orderNumber}`,
                order_id: createData.razorpayOrderId,
                prefill: {
                    name: shippingAddress.fullName,
                    email: shippingAddress.email,
                    contact: shippingAddress.phone,
                },
                notes: { order_number: createData.orderNumber },
                theme: { color: '#5F1300' },
                modal: {
                    ondismiss: () => {
                        setLoading(false);
                        toast('Payment cancelled.', { icon: 'ℹ️' });
                    },
                },
                handler: async (response: {
                    razorpay_order_id: string;
                    razorpay_payment_id: string;
                    razorpay_signature: string;
                }) => {
                    // Step 3: Verify server-side
                    try {
                        const verifyRes = await fetch('/api/order/verify', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(response),
                        });
                        const verifyData = await verifyRes.json();
                        if (!verifyRes.ok || !verifyData.success) {
                            throw new Error(verifyData.error || 'Payment verification failed');
                        }
                        onSuccess?.();
                        toast.success('Payment successful! 🎉');
                        router.push(`/orders/${verifyData.orderId}/confirmation`);
                    } catch (err) {
                        console.error('[RazorpayButton] verify', err);
                        toast.error(err instanceof Error ? err.message : 'Verification failed');
                        router.push('/order/failed');
                    } finally {
                        setLoading(false);
                    }
                },
            };

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', (e: any) => {
                toast.error(`Payment failed: ${e.error?.description ?? 'Unknown error'}`);
                setLoading(false);
            });
            rzp.open();
        } catch (err) {
            console.error('[RazorpayButton]', err);
            toast.error(err instanceof Error ? err.message : 'Something went wrong');
            setLoading(false);
        }
    };

    return (
        <>
            <Script
                src="https://checkout.razorpay.com/v1/checkout.js"
                strategy="lazyOnload"
                onLoad={() => setScriptReady(true)}
                onError={() => toast.error('Could not load payment system. Check your connection.')}
            />

            <button
                id="razorpay-pay-btn"
                onClick={handlePayment}
                disabled={loading || !scriptReady}
                className="
                    group relative w-full flex items-center justify-center gap-3
                    px-8 py-4 rounded-lg font-semibold text-base
                    bg-primary text-white
                    hover:bg-primary-light active:bg-primary-dark
                    disabled:opacity-60 disabled:cursor-not-allowed
                    transition-all duration-200 shadow-md hover:shadow-lg
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2
                "
            >
                {loading ? (
                    <>
                        <svg className="animate-spin h-5 w-5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Processing…
                    </>
                ) : (
                    <>
                        <ShieldCheck className="w-5 h-5 shrink-0" aria-hidden="true" />
                        Pay ₹{totalAmount.toLocaleString('en-IN')} Securely
                    </>
                )}
            </button>

            <p className="mt-2 text-center text-xs text-gray-400">
                Secured by Razorpay · UPI · Cards · NetBanking
            </p>
        </>
    );
}
