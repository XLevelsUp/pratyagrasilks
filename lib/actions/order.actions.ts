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

    // Email-based fallback: find customer records sharing this auth email
    // (covers historical orders where placed_by_user_id was not yet recorded)
    const { data: customers } = await supabase
        .from('customers')
        .select('id')
        .eq('email', user.email!);
    const customerIds = (customers ?? []).map(c => c.id);

    // Build OR filter: placed_by_user_id match (primary) + customer email fallback
    const orParts = [`placed_by_user_id.eq.${user.id}`];
    if (customerIds.length > 0) {
        orParts.push(`customer_id.in.(${customerIds.join(',')})`);
    }

    const { data, error } = await supabase
        .from('orders')
        .select('id, order_number, total_amount, status, payment_status, created_at')
        .or(orParts.join(','))
        .order('created_at', { ascending: false });

    if (error) {
        console.error('[getMyOrders]', error.message);
        return [];
    }

    return data ?? [];
}
