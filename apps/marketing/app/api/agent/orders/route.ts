import { NextRequest, NextResponse } from 'next/server';
import { normalizeToE164 } from '@pratyagra/core/utils/phone';
import { agentError, requireAgentKey } from '@/lib/agent/auth';
import { AGENT_ORDER_SELECT, customerIdsForPhone, toAgentOrder } from '@/lib/agent/orders';
import { getServiceClient } from '@/lib/orders/service';

export const dynamic = 'force-dynamic';

/** GET /api/agent/orders?phone=+91…&limit=5 — a customer's latest orders. */
export async function GET(req: NextRequest) {
    const denied = requireAgentKey(req);
    if (denied) return denied;

    const phone = normalizeToE164(req.nextUrl.searchParams.get('phone'));
    if (!phone) return agentError(422, 'INVALID_PHONE', 'A valid phone number is required');

    const limit = Math.min(Math.max(parseInt(req.nextUrl.searchParams.get('limit') || '5') || 5, 1), 20);

    try {
        const supabase = getServiceClient();
        const customerIds = await customerIdsForPhone(supabase, phone);
        if (customerIds.length === 0) return NextResponse.json({ orders: [] });

        const { data: orders, error } = await supabase
            .from('orders')
            .select(AGENT_ORDER_SELECT)
            .in('customer_id', customerIds)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) throw error;
        return NextResponse.json({ orders: (orders ?? []).map(toAgentOrder) });
    } catch (err) {
        console.error('[/api/agent/orders]', err);
        return agentError(500, 'INTERNAL', 'Internal server error');
    }
}
