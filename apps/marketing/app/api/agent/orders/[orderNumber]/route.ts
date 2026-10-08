import { NextRequest, NextResponse } from 'next/server';
import { normalizeToE164 } from '@pratyagra/core/utils/phone';
import { agentError, requireAgentKey } from '@/lib/agent/auth';
import { AGENT_ORDER_SELECT, customerIdsForPhone, toAgentOrder } from '@/lib/agent/orders';
import { getServiceClient } from '@/lib/orders/service';

export const dynamic = 'force-dynamic';

/**
 * GET /api/agent/orders/{order_number}?phone=+91…
 *
 * The phone must belong to the order's customer. A wrong phone gets the same
 * 404 as a missing order, so order numbers can't be probed.
 */
export async function GET(req: NextRequest, { params }: { params: { orderNumber: string } }) {
    const denied = requireAgentKey(req);
    if (denied) return denied;

    const phone = normalizeToE164(req.nextUrl.searchParams.get('phone'));
    if (!phone) return agentError(422, 'INVALID_PHONE', 'A valid phone number is required');

    try {
        const supabase = getServiceClient();
        const { data: order } = await supabase
            .from('orders')
            .select(`customer_id, ${AGENT_ORDER_SELECT}`)
            .eq('order_number', params.orderNumber)
            .maybeSingle();

        const owners = order ? await customerIdsForPhone(supabase, phone) : [];
        if (!order || !owners.includes(order.customer_id)) {
            return agentError(404, 'ORDER_NOT_FOUND', 'No order found for this number and phone');
        }

        return NextResponse.json({ order: toAgentOrder(order) });
    } catch (err) {
        console.error('[/api/agent/orders/[orderNumber]]', err);
        return agentError(500, 'INTERNAL', 'Internal server error');
    }
}
