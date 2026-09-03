import { LucideIcon, Minus, ShoppingBag, TrendingDown, TrendingUp } from 'lucide-react';
import SplitRing from './SplitRing';
import type { PaymentFilter } from '@/lib/actions/analytics.actions';

interface OrdersKpiCardProps {
    totalOrdersAllTime: number;
    ordersFromNewCustomers: number;
    ordersFromRepeatCustomers: number;
    changeLabel?: string | null;
    changeDirection?: 'up' | 'down' | 'flat';
    paymentFilter: PaymentFilter;
}

const DIRECTION_ICON: Record<'up' | 'down' | 'flat', LucideIcon> = {
    up: TrendingUp,
    down: TrendingDown,
    flat: Minus,
};

export default function OrdersKpiCard({
    totalOrdersAllTime,
    ordersFromNewCustomers,
    ordersFromRepeatCustomers,
    changeLabel,
    changeDirection = 'flat',
    paymentFilter,
}: OrdersKpiCardProps) {
    const showChange = !!changeLabel;
    const DirectionIcon = DIRECTION_ICON[changeDirection];
    const scopeText = paymentFilter === 'collected' ? 'paid orders, since day one' : 'unpaid orders, since day one';

    return (
        <div className="relative bg-white rounded-xl shadow-sm ring-1 ring-gray-900/5 pl-5 pr-5 pt-5 pb-4 overflow-hidden">
            <div className="absolute inset-y-0 left-0 w-1 bg-blue-500" aria-hidden="true" />

            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-500">
                    <ShoppingBag className="w-4 h-4" strokeWidth={2} aria-hidden="true" />
                    <p className="text-[13px] font-medium tracking-wide">Total Orders</p>
                </div>
                {showChange && (
                    <div
                        className={`inline-flex items-center gap-1 text-[11px] font-semibold px-1.5 py-0.5 rounded-full ${
                            changeDirection === 'flat'
                                ? 'bg-gray-100 text-gray-600'
                                : changeDirection === 'up'
                                    ? 'bg-green-50 text-green-700'
                                    : 'bg-red-50 text-red-700'
                        }`}
                        title="Change vs. the same length period before this one"
                    >
                        <DirectionIcon className="w-2.5 h-2.5" />
                        {changeLabel}
                    </div>
                )}
            </div>

            <p
                className="mt-2 text-[32px] leading-none font-semibold text-gray-900"
                style={{ fontVariantNumeric: 'tabular-nums' }}
            >
                {totalOrdersAllTime.toLocaleString('en-IN')}
            </p>
            <p className="mt-1 text-xs text-gray-400">{scopeText}</p>

            <div className="mt-4 pt-4 border-t border-gray-100">
                <SplitRing
                    leftLabel="From first-time buyers"
                    leftValue={ordersFromNewCustomers}
                    rightLabel="From repeat buyers"
                    rightValue={ordersFromRepeatCustomers}
                    leftColor="bg-blue-500"
                    rightColor="bg-blue-200"
                    leftHex="#3b82f6"
                    rightHex="#bfdbfe"
                />
                <p className="mt-2.5 text-[11px] text-gray-400">Orders placed in the dates you've picked above</p>
            </div>
        </div>
    );
}
