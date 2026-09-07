'use server';

import { createClient } from '@supabase/supabase-js';
import { getCallerRole } from '@pratyagra/auth/role-guard';
import { assertAdminOnly } from '@pratyagra/auth/role-guard';

export interface DateRangeInput {
    from: string; // YYYY-MM-DD
    to: string;   // YYYY-MM-DD
}

/** 'collected' = payment_status completed. 'not_collected' = pending, failed, or refunded. */
export type PaymentFilter = 'collected' | 'not_collected';

const NOT_COLLECTED_STATUSES = ['pending', 'failed', 'refunded'];

export interface KpiSummary {
    totalRevenue: number;
    totalOrders: number;
    totalOrdersAllTime: number;
    totalCustomersAllTime: number;
    newCustomers: number;
    returningCustomers: number;
    ordersFromNewCustomers: number;
    ordersFromRepeatCustomers: number;
    revenueChangePct: number | null;
    revenueChangeAbs: number;
    ordersChangePct: number | null;
    ordersChangeAbs: number;
}

export interface RevenuePoint {
    date: string; // YYYY-MM-DD
    revenue: number;
    orders: number;
}

export interface CategorySlice {
    category: string;
    revenue: number;
    unitsSold: number;
}

export interface ChannelSlice {
    channel: 'Online' | 'In-Store';
    revenue: number;
    orders: number;
}

export interface BottleneckOrder {
    id: string;
    orderNumber: string;
    status: string;
    createdAt: string;
    daysInStatus: number;
}

export interface AnalyticsResult<T> {
    success: boolean;
    data?: T;
    error?: string;
}

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

function getServiceClient() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { autoRefreshToken: false, persistSession: false } }
    );
}

function toIstBounds(range: DateRangeInput): { start: string; end: string } {
    const start = new Date(`${range.from}T00:00:00+05:30`);
    const end = new Date(`${range.to}T23:59:59.999+05:30`);
    return { start: start.toISOString(), end: end.toISOString() };
}

/** Same-length window immediately preceding `range`, used for % change comparisons. */
function priorPeriod(range: DateRangeInput): DateRangeInput {
    const fromDate = new Date(`${range.from}T00:00:00+05:30`);
    const toDate = new Date(`${range.to}T00:00:00+05:30`);
    const spanMs = toDate.getTime() - fromDate.getTime();

    const priorTo = new Date(fromDate.getTime() - 24 * 60 * 60 * 1000);
    const priorFrom = new Date(priorTo.getTime() - spanMs);

    const fmt = (d: Date) => new Date(d.getTime() + IST_OFFSET_MS).toISOString().split('T')[0];
    return { from: fmt(priorFrom), to: fmt(priorTo) };
}

function pctChange(current: number, previous: number): number | null {
    if (previous === 0) return null;
    return ((current - previous) / previous) * 100;
}

async function requireAdmin() {
    const role = await getCallerRole();
    await assertAdminOnly(role, 'view analytics dashboard');
}

export async function getKpiSummary(range: DateRangeInput, paymentFilter: PaymentFilter): Promise<AnalyticsResult<KpiSummary>> {
    try {
        await requireAdmin();
        const supabase = getServiceClient();
        const { start, end } = toIstBounds(range);
        const prior = toIstBounds(priorPeriod(range));

        let currentQuery = supabase
            .from('orders')
            .select('total_amount, customer_id, payment_status')
            .gte('created_at', start)
            .lte('created_at', end)
            .neq('status', 'cancelled');
        let priorQuery = supabase
            .from('orders')
            .select('total_amount')
            .gte('created_at', prior.start)
            .lte('created_at', prior.end)
            .neq('status', 'cancelled');
        let orderCountQuery = supabase
            .from('orders')
            .select('id', { count: 'exact', head: true })
            .neq('status', 'cancelled');

        if (paymentFilter === 'collected') {
            currentQuery = currentQuery.eq('payment_status', 'completed');
            priorQuery = priorQuery.eq('payment_status', 'completed');
            orderCountQuery = orderCountQuery.eq('payment_status', 'completed');
        } else {
            currentQuery = currentQuery.in('payment_status', NOT_COLLECTED_STATUSES);
            priorQuery = priorQuery.in('payment_status', NOT_COLLECTED_STATUSES);
            orderCountQuery = orderCountQuery.in('payment_status', NOT_COLLECTED_STATUSES);
        }

        const [currentRes, priorRes, customerCountRes, orderCountRes] = await Promise.all([
            currentQuery,
            priorQuery,
            supabase.from('customers').select('id', { count: 'exact', head: true }),
            orderCountQuery,
        ]);

        if (currentRes.error) return { success: false, error: currentRes.error.message };
        if (priorRes.error) return { success: false, error: priorRes.error.message };
        if (customerCountRes.error) return { success: false, error: customerCountRes.error.message };
        if (orderCountRes.error) return { success: false, error: orderCountRes.error.message };

        const rows = currentRes.data ?? [];
        const totalRevenue = rows.reduce((sum, o) => sum + Number(o.total_amount), 0);
        const totalOrders = rows.length;

        const priorRows = priorRes.data ?? [];
        const priorRevenue = priorRows.reduce((sum, o) => sum + Number(o.total_amount), 0);

        // New vs returning: a customer is "returning" if they have orders before this range's start.
        const customerIds = Array.from(new Set(rows.map(r => r.customer_id).filter(Boolean)));
        let newCustomers = 0;
        let returningCustomers = 0;
        let ordersFromNewCustomers = 0;
        let ordersFromRepeatCustomers = 0;

        if (customerIds.length > 0) {
            let earlierQuery = supabase
                .from('orders')
                .select('customer_id')
                .in('customer_id', customerIds)
                .lt('created_at', start);
            earlierQuery = paymentFilter === 'collected'
                ? earlierQuery.eq('payment_status', 'completed')
                : earlierQuery.in('payment_status', NOT_COLLECTED_STATUSES);

            const { data: earlierOrders, error: earlierErr } = await earlierQuery;

            if (earlierErr) return { success: false, error: earlierErr.message };

            const returningSet = new Set((earlierOrders ?? []).map(o => o.customer_id));
            for (const id of customerIds) {
                if (returningSet.has(id)) returningCustomers += 1;
                else newCustomers += 1;
            }

            for (const order of rows) {
                if (returningSet.has(order.customer_id)) ordersFromRepeatCustomers += 1;
                else ordersFromNewCustomers += 1;
            }
        }

        return {
            success: true,
            data: {
                totalRevenue,
                totalOrders,
                totalOrdersAllTime: orderCountRes.count ?? 0,
                totalCustomersAllTime: customerCountRes.count ?? 0,
                newCustomers,
                returningCustomers,
                ordersFromNewCustomers,
                ordersFromRepeatCustomers,
                revenueChangePct: pctChange(totalRevenue, priorRevenue),
                revenueChangeAbs: totalRevenue - priorRevenue,
                ordersChangePct: pctChange(totalOrders, priorRows.length),
                ordersChangeAbs: totalOrders - priorRows.length,
            },
        };
    } catch (err) {
        console.error('getKpiSummary error:', err);
        return { success: false, error: err instanceof Error ? err.message : 'Internal server error' };
    }
}

export async function getRevenueOverTime(range: DateRangeInput, paymentFilter: PaymentFilter): Promise<AnalyticsResult<RevenuePoint[]>> {
    try {
        await requireAdmin();
        const supabase = getServiceClient();
        const { start, end } = toIstBounds(range);

        let query = supabase
            .from('orders')
            .select('total_amount, created_at')
            .gte('created_at', start)
            .lte('created_at', end)
            .neq('status', 'cancelled')
            .order('created_at', { ascending: true });
        query = paymentFilter === 'collected'
            ? query.eq('payment_status', 'completed')
            : query.in('payment_status', NOT_COLLECTED_STATUSES);

        const { data, error } = await query;

        if (error) return { success: false, error: error.message };

        const byDay = new Map<string, { revenue: number; orders: number }>();
        for (const order of data ?? []) {
            const istDate = new Date(new Date(order.created_at).getTime() + IST_OFFSET_MS)
                .toISOString()
                .split('T')[0];
            const entry = byDay.get(istDate) ?? { revenue: 0, orders: 0 };
            entry.revenue += Number(order.total_amount);
            entry.orders += 1;
            byDay.set(istDate, entry);
        }

        const points: RevenuePoint[] = Array.from(byDay.entries())
            .map(([date, v]) => ({ date, revenue: v.revenue, orders: v.orders }))
            .sort((a, b) => a.date.localeCompare(b.date));

        return { success: true, data: points };
    } catch (err) {
        console.error('getRevenueOverTime error:', err);
        return { success: false, error: err instanceof Error ? err.message : 'Internal server error' };
    }
}

export async function getCategoryBreakdown(range: DateRangeInput, paymentFilter: PaymentFilter): Promise<AnalyticsResult<CategorySlice[]>> {
    try {
        await requireAdmin();
        const supabase = getServiceClient();
        const { start, end } = toIstBounds(range);

        let ordersQuery = supabase
            .from('orders')
            .select('id')
            .gte('created_at', start)
            .lte('created_at', end)
            .neq('status', 'cancelled');
        ordersQuery = paymentFilter === 'collected'
            ? ordersQuery.eq('payment_status', 'completed')
            : ordersQuery.in('payment_status', NOT_COLLECTED_STATUSES);

        const { data: orders, error: ordersErr } = await ordersQuery;

        if (ordersErr) return { success: false, error: ordersErr.message };

        const orderIds = (orders ?? []).map(o => o.id);
        if (orderIds.length === 0) return { success: true, data: [] };

        const { data: items, error: itemsErr } = await supabase
            .from('order_items')
            .select('product_id, quantity, total_price')
            .in('order_id', orderIds);

        if (itemsErr) return { success: false, error: itemsErr.message };

        const productIds = Array.from(new Set((items ?? []).map(i => i.product_id)));
        const { data: products, error: productsErr } = await supabase
            .from('products')
            .select('id, category')
            .in('id', productIds);

        if (productsErr) return { success: false, error: productsErr.message };

        const categoryByProduct = new Map((products ?? []).map(p => [p.id, p.category || 'Uncategorized']));
        const byCategory = new Map<string, { revenue: number; unitsSold: number }>();

        for (const item of items ?? []) {
            const category = categoryByProduct.get(item.product_id) ?? 'Uncategorized';
            const entry = byCategory.get(category) ?? { revenue: 0, unitsSold: 0 };
            entry.revenue += Number(item.total_price);
            entry.unitsSold += Number(item.quantity);
            byCategory.set(category, entry);
        }

        const slices: CategorySlice[] = Array.from(byCategory.entries())
            .map(([category, v]) => ({ category, revenue: v.revenue, unitsSold: v.unitsSold }))
            .sort((a, b) => b.revenue - a.revenue);

        return { success: true, data: slices };
    } catch (err) {
        console.error('getCategoryBreakdown error:', err);
        return { success: false, error: err instanceof Error ? err.message : 'Internal server error' };
    }
}

export async function getChannelDistribution(range: DateRangeInput, paymentFilter: PaymentFilter): Promise<AnalyticsResult<ChannelSlice[]>> {
    try {
        await requireAdmin();
        const supabase = getServiceClient();
        const { start, end } = toIstBounds(range);

        let query = supabase
            .from('orders')
            .select('order_number, total_amount')
            .gte('created_at', start)
            .lte('created_at', end)
            .neq('status', 'cancelled');
        query = paymentFilter === 'collected'
            ? query.eq('payment_status', 'completed')
            : query.in('payment_status', NOT_COLLECTED_STATUSES);

        const { data, error } = await query;

        if (error) return { success: false, error: error.message };

        const totals = { Online: { revenue: 0, orders: 0 }, 'In-Store': { revenue: 0, orders: 0 } };
        for (const order of data ?? []) {
            const isPos = (order.order_number ?? '').toUpperCase().startsWith('POS-');
            const bucket = isPos ? totals['In-Store'] : totals.Online;
            bucket.revenue += Number(order.total_amount);
            bucket.orders += 1;
        }

        const slices: ChannelSlice[] = [
            { channel: 'Online', revenue: totals.Online.revenue, orders: totals.Online.orders },
            { channel: 'In-Store', revenue: totals['In-Store'].revenue, orders: totals['In-Store'].orders },
        ];

        return { success: true, data: slices };
    } catch (err) {
        console.error('getChannelDistribution error:', err);
        return { success: false, error: err instanceof Error ? err.message : 'Internal server error' };
    }
}

export async function getFulfillmentBottlenecks(paymentFilter: PaymentFilter): Promise<AnalyticsResult<BottleneckOrder[]>> {
    try {
        await requireAdmin();
        const supabase = getServiceClient();

        let query = supabase
            .from('orders')
            .select('id, order_number, status, created_at')
            .in('status', ['pending', 'processing'])
            .order('created_at', { ascending: true });
        query = paymentFilter === 'collected'
            ? query.eq('payment_status', 'completed')
            : query.in('payment_status', NOT_COLLECTED_STATUSES);

        const { data, error } = await query;

        if (error) return { success: false, error: error.message };

        const now = Date.now();
        const bottlenecks: BottleneckOrder[] = (data ?? [])
            .map(o => ({
                id: o.id as string,
                orderNumber: o.order_number as string,
                status: o.status as string,
                createdAt: o.created_at as string,
                daysInStatus: Math.floor((now - new Date(o.created_at).getTime()) / (1000 * 60 * 60 * 24)),
            }))
            .filter(o => o.daysInStatus >= 3)
            .sort((a, b) => b.daysInStatus - a.daysInStatus);

        return { success: true, data: bottlenecks };
    } catch (err) {
        console.error('getFulfillmentBottlenecks error:', err);
        return { success: false, error: err instanceof Error ? err.message : 'Internal server error' };
    }
}
