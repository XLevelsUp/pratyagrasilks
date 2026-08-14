'use client';

import type { PaymentFilter } from '@/lib/actions/analytics.actions';

interface PaymentFilterToggleProps {
    value: PaymentFilter;
    onChange: (value: PaymentFilter) => void;
}

export default function PaymentFilterToggle({ value, onChange }: PaymentFilterToggleProps) {
    return (
        <div className="inline-flex items-center bg-gray-100 rounded-lg p-1" role="tablist" aria-label="Payment status filter">
            <button
                role="tab"
                aria-selected={value === 'collected'}
                onClick={() => onChange('collected')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    value === 'collected'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                }`}
            >
                Payment Collected
            </button>
            <button
                role="tab"
                aria-selected={value === 'not_collected'}
                onClick={() => onChange('not_collected')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    value === 'not_collected'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                }`}
            >
                Payment Not Collected
            </button>
        </div>
    );
}
