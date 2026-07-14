import { NextRequest, NextResponse } from 'next/server';
import { sendSaleWhatsAppNotification } from '@/lib/utils/whatsapp';

// Internal WhatsApp alert for completed sales — no DB write, just a Meta Cloud API call.
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { orderId, customerName, totalAmount, items } = body ?? {};

        const missing: string[] = [];
        if (!orderId) missing.push('orderId');
        if (!customerName) missing.push('customerName');
        if (totalAmount === undefined || totalAmount === null || totalAmount === '') missing.push('totalAmount');
        if (!items) missing.push('items');

        if (missing.length > 0) {
            return NextResponse.json(
                { error: 'Missing required fields', details: missing },
                { status: 422 }
            );
        }

        const data = await sendSaleWhatsAppNotification({ orderId, customerName, totalAmount, items });

        return NextResponse.json(
            { success: true, message: 'Sale notification sent successfully', data },
            { status: 201 }
        );
    } catch (error) {
        console.error('Sale notification error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
