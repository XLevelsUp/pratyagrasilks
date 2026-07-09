'use client';

import { useCart } from '@/lib/context/CartContext';
import { Lock } from 'lucide-react';

interface Props {
    shippingCost: number;
    estimatedDays: string;
}

export default function OrderSummary({ shippingCost, estimatedDays }: Props) {
    const { items } = useCart();
    const subtotal = items.reduce((sum, item) => sum + item.product.price, 0);
    const total = subtotal + shippingCost;

    return (
        <div className="bg-white rounded-2xl border border-primary-100 p-6 sticky top-24">
            <h2 className="font-playfair text-xl font-semibold text-textPrimary mb-5">
                Order Summary
            </h2>

            {/* Items */}
            <div className="divide-y divide-primary-100 mb-5">
                {items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 py-3 first:pt-0">
                        {item.product.images?.[0] && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={item.product.images[0]}
                                alt={item.product.name}
                                className="w-14 aspect-[3/4] object-cover rounded-lg bg-primary-50 flex-shrink-0"
                            />
                        )}
                        <div className="flex-1 min-w-0">
                            <p className="font-playfair text-sm text-textPrimary leading-snug line-clamp-2">
                                {item.product.name}
                            </p>
                            {item.product.sku && (
                                <p className="text-[10px] tracking-[0.1em] uppercase text-textSecondary/50 mt-0.5">
                                    {item.product.sku}
                                </p>
                            )}
                        </div>
                        <p className="text-sm font-semibold text-textPrimary flex-shrink-0">
                            ₹{item.product.price.toLocaleString('en-IN')}
                        </p>
                    </div>
                ))}
            </div>

            {/* Totals */}
            <div className="border-t border-primary-100 pt-4 space-y-2.5">
                <div className="flex justify-between items-baseline">
                    <span className="text-xs font-semibold tracking-[0.15em] uppercase text-textSecondary/60">
                        Subtotal · {items.length} {items.length === 1 ? 'piece' : 'pieces'}
                    </span>
                    <span className="text-sm text-textPrimary">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between items-baseline">
                    <span className="text-xs font-semibold tracking-[0.15em] uppercase text-textSecondary/60">
                        Shipping
                    </span>
                    <span className="text-sm">
                        {shippingCost === 0 ? (
                            <span className="text-green-700 font-medium">To be calculated</span>
                        ) : (
                            <span className="text-textPrimary">₹{shippingCost.toLocaleString('en-IN')}</span>
                        )}
                    </span>
                </div>
                {estimatedDays && (
                    <div className="flex justify-between items-baseline">
                        <span className="text-xs font-semibold tracking-[0.15em] uppercase text-textSecondary/60">
                            Estimated delivery
                        </span>
                        <span className="text-xs text-textSecondary">{estimatedDays}</span>
                    </div>
                )}
                <div className="flex justify-between items-baseline pt-3 border-t border-primary-100">
                    <span className="text-xs font-semibold tracking-[0.15em] uppercase text-textPrimary">
                        Total
                    </span>
                    <span className="text-xl font-semibold text-primary">
                        ₹{total.toLocaleString('en-IN')}
                    </span>
                </div>
            </div>

            <div className="mt-5 pt-4 border-t border-primary-100">
                <p className="flex items-center justify-center gap-1.5 text-xs text-textSecondary/60 text-center">
                    <Lock className="w-3 h-3" aria-hidden="true" />
                    Secure checkout · All sarees authentic &amp; handcrafted
                </p>
            </div>
        </div>
    );
}
