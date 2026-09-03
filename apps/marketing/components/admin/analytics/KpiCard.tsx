import { LucideIcon, Minus, TrendingDown, TrendingUp } from 'lucide-react';

interface KpiCardProps {
    label: string;
    value: string;
    icon: LucideIcon;
    accentColor: string;
    /** Plain-language change vs. the previous period, e.g. "+₹65,890" or "+5 orders". Pass null/undefined to hide. */
    changeLabel?: string | null;
    changeDirection?: 'up' | 'down' | 'flat';
    helperText?: string;
}

export default function KpiCard({ label, value, icon: Icon, accentColor, changeLabel, changeDirection = 'flat', helperText }: KpiCardProps) {
    const showChange = !!changeLabel;

    return (
        <div className="relative bg-white rounded-xl shadow-sm ring-1 ring-gray-900/5 pl-5 pr-5 pt-5 pb-4 overflow-hidden">
            <div className={`absolute inset-y-0 left-0 w-1 ${accentColor}`} aria-hidden="true" />

            <div className="flex items-center gap-2 text-gray-500">
                <Icon className="w-4 h-4" strokeWidth={2} aria-hidden="true" />
                <p className="text-[13px] font-medium tracking-wide">{label}</p>
            </div>

            <p
                className="mt-2 text-[32px] leading-none font-semibold text-gray-900"
                style={{ fontVariantNumeric: 'tabular-nums' }}
            >
                {value}
            </p>

            <div className="mt-3 min-h-[20px] flex items-center">
                {showChange ? (
                    <div
                        className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
                            changeDirection === 'flat'
                                ? 'bg-gray-100 text-gray-600'
                                : changeDirection === 'up'
                                    ? 'bg-green-50 text-green-700'
                                    : 'bg-red-50 text-red-700'
                        }`}
                    >
                        {changeDirection === 'flat' ? (
                            <Minus className="w-3 h-3" />
                        ) : changeDirection === 'up' ? (
                            <TrendingUp className="w-3 h-3" />
                        ) : (
                            <TrendingDown className="w-3 h-3" />
                        )}
                        {changeLabel}
                        <span className="font-normal text-gray-400">vs. last period</span>
                    </div>
                ) : helperText ? (
                    <p className="text-xs text-gray-400">{helperText}</p>
                ) : null}
            </div>
        </div>
    );
}
