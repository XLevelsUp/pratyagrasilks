'use client';

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { ChannelSlice } from '@/lib/actions/analytics.actions';
import EmptyState from './EmptyState';

interface SalesDonutChartProps {
    data: ChannelSlice[];
}

const CHANNEL_COLORS: Record<string, string> = {
    Online: '#d97706',
    'In-Store': '#1f2937',
};

function formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);
}

export default function SalesDonutChart({ data }: SalesDonutChartProps) {
    const hasData = data.some((d) => d.revenue > 0);

    if (!hasData) {
        return (
            <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">Sales Distribution</h2>
                </div>
                <EmptyState title="No sales yet" message="Online vs. in-store split will appear here once orders come in." />
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Sales Distribution (Online vs. In-Store)</h2>
            </div>
            <div className="p-6" style={{ width: '100%', height: 320 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            dataKey="revenue"
                            nameKey="channel"
                            innerRadius={70}
                            outerRadius={110}
                            paddingAngle={2}
                        >
                            {data.map((entry) => (
                                <Cell key={entry.channel} fill={CHANNEL_COLORS[entry.channel]} />
                            ))}
                        </Pie>
                        <Tooltip formatter={(value) => formatCurrency(Number(value))} contentStyle={{ borderRadius: 8, borderColor: '#e5e7eb', fontSize: 13 }} />
                        <Legend verticalAlign="bottom" height={36} />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
