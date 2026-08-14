'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { CategorySlice } from '@/lib/actions/analytics.actions';
import EmptyState from './EmptyState';

interface CategoryBarChartProps {
    data: CategorySlice[];
}

const BAR_COLORS = ['#d97706', '#b45309', '#92400e', '#78350f', '#f59e0b', '#fbbf24', '#fcd34d', '#fde68a'];

function formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);
}

export default function CategoryBarChart({ data }: CategoryBarChartProps) {
    const topCategories = data.slice(0, 8);

    if (topCategories.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">Top Categories</h2>
                </div>
                <EmptyState title="No category sales yet" message="Sold items will appear here grouped by category." />
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Top Categories by Revenue</h2>
            </div>
            <div className="p-6" style={{ width: '100%', height: 320 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topCategories} layout="vertical" margin={{ top: 8, right: 24, left: 8, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
                        <XAxis
                            type="number"
                            tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                            tick={{ fontSize: 12, fill: '#6b7280' }}
                            axisLine={false}
                        />
                        <YAxis
                            type="category"
                            dataKey="category"
                            width={110}
                            tick={{ fontSize: 12, fill: '#374151' }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <Tooltip
                            formatter={(value) => [formatCurrency(Number(value)), 'Revenue']}
                            contentStyle={{ borderRadius: 8, borderColor: '#e5e7eb', fontSize: 13 }}
                        />
                        <Bar dataKey="revenue" radius={[0, 4, 4, 0]}>
                            {topCategories.map((entry, index) => (
                                <Cell key={entry.category} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
