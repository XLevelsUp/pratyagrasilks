import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendOrderConfirmation } from '@/lib/mail/sender';
import { OrderEmailData } from '@/lib/mail/templates';

const TEST_EMAIL_DATA: OrderEmailData = {
    orderNumber: 'TEST-0001',
    customerName: 'Test Customer',
    customerEmail: 'pratyagra.in@gmail.com',
    items: [
        {
            name: 'Kanjivaram Pure Silk Saree (Test)',
            sku: 'KAN-TEST-001',
            quantity: 1,
            unitPrice: 15000,
            totalPrice: 15000,
        },
        {
            name: 'Banarasi Silk Saree (Test)',
            sku: 'BAN-TEST-002',
            quantity: 1,
            unitPrice: 12500,
            totalPrice: 12500,
        },
    ],
    subtotal: 27500,
    shippingCharge: 0,
    totalAmount: 27500,
    shippingAddress: {
        line1: '123 Test Street',
        line2: 'Near Silk Market',
        city: 'Chennai',
        state: 'Tamil Nadu',
        pincode: '600001',
    },
    estimatedDelivery: '7–10 business days',
};

export async function POST() {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        await sendOrderConfirmation('pratyagra.in@gmail.com', TEST_EMAIL_DATA);
        return NextResponse.json({ success: true });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to send test email';
        console.error('Test email error:', message);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
