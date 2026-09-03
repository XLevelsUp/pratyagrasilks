'use server';

import { createClient } from '@supabase/supabase-js';

export interface EodTransaction {
    id: string;
    orderNumber: string;
    totalAmount: number;
    paymentMethod: string;
    createdAt: string;
}

export interface EodSettlement {
    date: string;
    totalRevenue: number;
    totalOrders: number;
    breakdown: {
        CASH: number;
        UPI: number;
        CARD: number;
    };
    transactions: EodTransaction[];
}

export interface EodResult {
    success: boolean;
    data?: EodSettlement;
    error?: string;
}

function getServiceClient() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { autoRefreshToken: false, persistSession: false } }
    );
}

export async function getTodaySettlement(): Promise<EodResult> {
    try {
        // Compute today's date range in IST (UTC+5:30)
        const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
        const istNow = new Date(Date.now() + IST_OFFSET_MS);
        const dateStr = istNow.toISOString().split('T')[0]; // YYYY-MM-DD

        const todayStart = new Date(`${dateStr}T00:00:00+05:30`);
        const todayEnd = new Date(`${dateStr}T23:59:59.999+05:30`);

        const supabase = getServiceClient();

        const { data: orders, error } = await supabase
            .from('orders')
            .select('id, order_number, total_amount, payment_method, created_at')
            .ilike('order_number', 'POS-%')
            .gte('created_at', todayStart.toISOString())
            .lte('created_at', todayEnd.toISOString())
            .order('created_at', { ascending: false });

        if (error) {
            return { success: false, error: error.message };
        }

        const rows = orders ?? [];
        const breakdown = { CASH: 0, UPI: 0, CARD: 0 };
        let totalRevenue = 0;

        for (const order of rows) {
            const amount = order.total_amount as number;
            const method = ((order.payment_method as string) ?? '').toUpperCase();
            totalRevenue += amount;
            if (method === 'CASH' || method === 'UPI' || method === 'CARD') {
                breakdown[method as keyof typeof breakdown] += amount;
            }
        }

        const transactions: EodTransaction[] = rows.map(o => ({
            id: o.id as string,
            orderNumber: o.order_number as string,
            totalAmount: o.total_amount as number,
            paymentMethod: ((o.payment_method as string) ?? '').toUpperCase(),
            createdAt: o.created_at as string,
        }));

        return {
            success: true,
            data: {
                date: dateStr,
                totalRevenue,
                totalOrders: rows.length,
                breakdown,
                transactions,
            },
        };
    } catch (err) {
        console.error('getTodaySettlement error:', err);
        return { success: false, error: 'Internal server error' };
    }
}
