'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { RevenuePoint } from '@/lib/actions/analytics.actions';
import EmptyState from './EmptyState';

interface RevenueLineChartProps {
    data: RevenuePoint[];
}

function formatShortDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
}

function formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);
}

export default function RevenueLineChart({ data }: RevenueLineChartProps) {
    if (data.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">Revenue Over Time</h2>
                </div>
                <EmptyState title="No revenue in this period" message="Try expanding the date range to see revenue trends." />
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Revenue Over Time</h2>
            </div>
            <div className="p-6" style={{ width: '100%', height: 320 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis
                            dataKey="date"
                            tickFormatter={formatShortDate}
                            tick={{ fontSize: 12, fill: '#6b7280' }}
                            tickLine={false}
                        />
                        <YAxis
                            tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                            tick={{ fontSize: 12, fill: '#6b7280' }}
                            tickLine={false}
                            axisLine={false}
                        />
                        <Tooltip
                            formatter={(value) => [formatCurrency(Number(value)), 'Revenue']}
                            labelFormatter={(label) => formatShortDate(label as string)}
                            contentStyle={{ borderRadius: 8, borderColor: '#e5e7eb', fontSize: 13 }}
                        />
                        <Line
                            type="monotone"
                            dataKey="revenue"
                            stroke="#d97706"
                            strokeWidth={2.5}
                            dot={{ r: 3, fill: '#d97706' }}
                            activeDot={{ r: 5 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
