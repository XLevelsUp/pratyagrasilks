'use client';

import { useEffect, useState, useCallback } from 'react';
import { DollarSign } from 'lucide-react';
import {
    getKpiSummary,
    getRevenueOverTime,
    getCategoryBreakdown,
    getChannelDistribution,
    getFulfillmentBottlenecks,
    type KpiSummary,
    type RevenuePoint,
    type CategorySlice,
    type ChannelSlice,
    type BottleneckOrder,
    type PaymentFilter,
} from '@/lib/actions/analytics.actions';
import KpiCard from '@/components/admin/analytics/KpiCard';
import CustomerKpiCard from '@/components/admin/analytics/CustomerKpiCard';
import OrdersKpiCard from '@/components/admin/analytics/OrdersKpiCard';
import DateRangeFilter from '@/components/admin/analytics/DateRangeFilter';
import PaymentFilterToggle from '@/components/admin/analytics/PaymentFilterToggle';
import RevenueLineChart from '@/components/admin/analytics/RevenueLineChart';
import CategoryBarChart from '@/components/admin/analytics/CategoryBarChart';
import SalesDonutChart from '@/components/admin/analytics/SalesDonutChart';
import FulfillmentBottlenecks from '@/components/admin/analytics/FulfillmentBottlenecks';

function istTodayStr(): string {
    const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
    return new Date(Date.now() + IST_OFFSET_MS).toISOString().split('T')[0];
}

function daysAgoStr(days: number): string {
    const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
    return new Date(Date.now() + IST_OFFSET_MS - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
}

function formatPrice(price: number): string {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price);
}

function revenueChangeLabel(abs: number): string {
    if (abs === 0) return 'No change';
    const sign = abs > 0 ? '+' : '−';
    return `${sign}${formatPrice(Math.abs(abs))}`;
}

function ordersChangeLabel(abs: number): string {
    if (abs === 0) return 'No change';
    const sign = abs > 0 ? '+' : '−';
    return `${sign}${Math.abs(abs)} order${Math.abs(abs) === 1 ? '' : 's'}`;
}

function changeDirection(abs: number): 'up' | 'down' | 'flat' {
    if (abs === 0) return 'flat';
    return abs > 0 ? 'up' : 'down';
}

export default function AnalyticsDashboard() {
    const [range, setRange] = useState({ from: daysAgoStr(29), to: istTodayStr() });
    const [paymentFilter, setPaymentFilter] = useState<PaymentFilter>('collected');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [kpi, setKpi] = useState<KpiSummary | null>(null);
    const [revenuePoints, setRevenuePoints] = useState<RevenuePoint[]>([]);
    const [categories, setCategories] = useState<CategorySlice[]>([]);
    const [channels, setChannels] = useState<ChannelSlice[]>([]);
    const [bottlenecks, setBottlenecks] = useState<BottleneckOrder[]>([]);

    const fetchData = useCallback(async (r: { from: string; to: string }, pf: PaymentFilter) => {
        setLoading(true);
        setError(null);

        const [kpiRes, revenueRes, categoryRes, channelRes, bottleneckRes] = await Promise.all([
            getKpiSummary(r, pf),
            getRevenueOverTime(r, pf),
            getCategoryBreakdown(r, pf),
            getChannelDistribution(r, pf),
            getFulfillmentBottlenecks(pf),
        ]);

        const firstError = [kpiRes, revenueRes, categoryRes, channelRes, bottleneckRes].find((res) => !res.success);
        if (firstError) {
            setError(firstError.error ?? 'Failed to load analytics data.');
            setLoading(false);
            return;
        }

        setKpi(kpiRes.data ?? null);
        setRevenuePoints(revenueRes.data ?? []);
        setCategories(categoryRes.data ?? []);
        setChannels(channelRes.data ?? []);
        setBottlenecks(bottleneckRes.data ?? []);
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchData(range, paymentFilter);
    }, [range, paymentFilter, fetchData]);

    return (
        <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
                <PaymentFilterToggle value={paymentFilter} onChange={setPaymentFilter} />
            </div>

            <div className="mb-6">
                <DateRangeFilter from={range.from} to={range.to} onChange={setRange} />
            </div>

            {error && (
                <div className="mb-6 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
                        <KpiCard
                            label="Revenue (selected dates)"
                            value={formatPrice(kpi?.totalRevenue ?? 0)}
                            icon={DollarSign}
                            accentColor="bg-green-500"
                            changeLabel={kpi ? revenueChangeLabel(kpi.revenueChangeAbs) : null}
                            changeDirection={kpi ? changeDirection(kpi.revenueChangeAbs) : 'flat'}
                        />
                        <OrdersKpiCard
                            totalOrdersAllTime={kpi?.totalOrdersAllTime ?? 0}
                            ordersFromNewCustomers={kpi?.ordersFromNewCustomers ?? 0}
                            ordersFromRepeatCustomers={kpi?.ordersFromRepeatCustomers ?? 0}
                            changeLabel={kpi ? ordersChangeLabel(kpi.ordersChangeAbs) : null}
                            changeDirection={kpi ? changeDirection(kpi.ordersChangeAbs) : 'flat'}
                            paymentFilter={paymentFilter}
                        />
                        <CustomerKpiCard
                            totalCustomers={kpi?.totalCustomersAllTime ?? 0}
                            newCustomers={kpi?.newCustomers ?? 0}
                            repeatCustomers={kpi?.returningCustomers ?? 0}
                            paymentFilter={paymentFilter}
                        />
                    </div>

                    <div className="mb-6">
                        <RevenueLineChart data={revenuePoints} />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                        <CategoryBarChart data={categories} />
                        <SalesDonutChart data={channels} />
                    </div>

                    <FulfillmentBottlenecks data={bottlenecks} />
                </>
            )}
        </div>
    );
}
