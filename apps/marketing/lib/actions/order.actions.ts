'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export interface OrderSummary {
    id: string;
    order_number: string;
    total_amount: number;
    status: string;
    payment_status: string;
    created_at: string;
}

export async function getMyOrders(): Promise<OrderSummary[]> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/auth/login?next=/orders');
    }

    const { data, error } = await supabase
        .from('orders')
        .select('id, order_number, total_amount, status, payment_status, created_at')
        .eq('customer_id', user.id)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('[getMyOrders]', error.message);
        return [];
    }

    return data ?? [];
}
