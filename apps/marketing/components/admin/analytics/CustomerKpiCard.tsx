import { Users } from 'lucide-react';
import SplitRing from './SplitRing';
import type { PaymentFilter } from '@/lib/actions/analytics.actions';

interface CustomerKpiCardProps {
    totalCustomers: number;
    newCustomers: number;
    repeatCustomers: number;
    paymentFilter: PaymentFilter;
}

export default function CustomerKpiCard({ totalCustomers, newCustomers, repeatCustomers, paymentFilter }: CustomerKpiCardProps) {
    const breakdownScope = paymentFilter === 'collected' ? 'paid' : 'unpaid';
    return (
        <div className="relative bg-white rounded-xl shadow-sm ring-1 ring-gray-900/5 pl-5 pr-5 pt-5 pb-4 overflow-hidden">
            <div className="absolute inset-y-0 left-0 w-1 bg-purple-500" aria-hidden="true" />

            <div className="flex items-center gap-2 text-gray-500">
                <Users className="w-4 h-4" strokeWidth={2} aria-hidden="true" />
                <p className="text-[13px] font-medium tracking-wide">Total Customers</p>
            </div>

            <p
                className="mt-2 text-[32px] leading-none font-semibold text-gray-900"
                style={{ fontVariantNumeric: 'tabular-nums' }}
            >
                {totalCustomers.toLocaleString('en-IN')}
            </p>
            <p className="mt-1 text-xs text-gray-400">customers since day one</p>

            <div className="mt-4 pt-4 border-t border-gray-100">
                <SplitRing
                    leftLabel="New"
                    leftValue={newCustomers}
                    rightLabel="Repeat"
                    rightValue={repeatCustomers}
                    leftColor="bg-purple-500"
                    rightColor="bg-purple-200"
                    leftHex="#a855f7"
                    rightHex="#e9d5ff"
                />
                <p className="mt-2.5 text-[11px] text-gray-400">Based on {breakdownScope} orders in the dates you've picked above</p>
            </div>
        </div>
    );
}
