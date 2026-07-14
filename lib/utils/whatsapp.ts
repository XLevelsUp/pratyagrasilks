import type { PosActionItem } from '@/lib/actions/pos.actions';
import type { PosCustomer } from '@/lib/actions/crm.actions';

export interface WhatsAppReceiptParams {
    orderNumber: string;
    items: PosActionItem[];
    customerName?: string | null;
    grandTotal: number;
    taxableValue?: number;
    cgst?: number;
    sgst?: number;
    paymentMethod?: string;
    storeName?: string;
    storePhone?: string;
    storeGSTIN?: string;
}

export function generateWhatsAppReceipt({
    orderNumber,
    items,
    customerName,
    grandTotal,
    taxableValue,
    cgst,
    sgst,
    paymentMethod = 'Cash',
    storeName = 'Pratyagra Silks',
    storePhone = '+91-XXXXXXXXXX',
    storeGSTIN = '09XXXXXXXXXXXXX',
}: WhatsAppReceiptParams): string {
    const fmt = (n: number) =>
        new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(n);

    const now = new Date().toLocaleString('en-IN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
    });

    let message = '';

    // Header
    message += `*${storeName}*\n`;
    message += `🛍️ Digital Receipt\n`;
    message += `━━━━━━━━━━━━━━━━━━━━\n\n`;

    // Order Details
    message += `📋 Order #: ${orderNumber}\n`;
    message += `📅 Date & Time: ${now}\n`;
    if (customerName) {
        message += `👤 Customer: ${customerName}\n`;
    }
    message += `💳 Payment: ${paymentMethod}\n`;
    message += `📞 Contact: ${storePhone}\n`;
    message += `🏢 GSTIN: ${storeGSTIN}\n\n`;

    // Items
    message += `*Purchased Items:*\n`;
    message += `━━━━━━━━━━━━━━━━━━━━\n`;
    items.forEach((item, idx) => {
        message += `${idx + 1}. ${item.name}\n`;
        message += `   SKU: ${item.sku} | Qty: ${item.quantity}\n`;
        message += `   ₹${fmt(item.unitPrice * item.quantity)}\n\n`;
    });

    // Totals
    message += `━━━━━━━━━━━━━━━━━━━━\n`;
    if (taxableValue && cgst && sgst) {
        message += `Taxable Value: ${fmt(taxableValue)}\n`;
        message += `CGST (2.5%): ${fmt(cgst)}\n`;
        message += `SGST (2.5%): ${fmt(sgst)}\n`;
    }
    message += `*Grand Total: ${fmt(grandTotal)}*\n`;
    message += `━━━━━━━━━━━━━━━━━━━━\n\n`;

    // Silk Care Tip
    message += `✨ *Silk Care Tip:*\n`;
    message += `• Wash in cold water with silk detergent\n`;
    message += `• Dry flat or hang in shade\n`;
    message += `• Iron on low heat with a cloth layer\n\n`;

    // Footer
    message += `Thank you for choosing ${storeName}!\n`;
    message += `We appreciate your visit.\n\n`;
    message += `*Authentic Varanasi Silk Sarees*\n`;

    return message;
}

export function generateWhatsAppMessage(
    customerPhone: string,
    receiptText: string
): { to: string; body: string } {
    return {
        to: `+91${customerPhone.replace(/\D/g, '').slice(-10)}`,
        body: receiptText,
    };
}

export interface SaleNotificationPayload {
    orderId: string;
    customerName: string;
    totalAmount: string | number;
    items: string;
}

/**
 * Sends an internal "sale completed" alert via Meta's WhatsApp Cloud API using an
 * approved message template (works regardless of the 24h customer-session window,
 * unlike a freeform text message).
 *
 * Template must be pre-approved in Meta Business Manager with a body that has
 * 3 named variables: {{customer}}, {{amount}}, {{items}} (matched via parameter_name below).
 * orderId is kept in the payload for logging/tracking only — it is not sent to the template.
 */
export async function sendSaleWhatsAppNotification({
    orderId,
    customerName,
    totalAmount,
    items,
}: SaleNotificationPayload): Promise<any> {
    const phoneId = process.env.WHATSAPP_PHONE_ID;
    const token = process.env.WHATSAPP_API_TOKEN;
    const to = process.env.WHATSAPP_SALES_RECIPIENT_NUMBER || process.env.WHATSAPP_TEST_NUMBER;
    const templateName = process.env.WHATSAPP_SALE_TEMPLATE_NAME || 'pratyagra_sale_alerts';

    if (!phoneId || !token || !to) {
        throw new Error(
            'WhatsApp sale notification is not configured (missing WHATSAPP_PHONE_ID, WHATSAPP_API_TOKEN, or WHATSAPP_SALES_RECIPIENT_NUMBER)'
        );
    }

    const res = await fetch(`https://graph.facebook.com/v20.0/${phoneId}/messages`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            messaging_product: 'whatsapp',
            to: to.replace(/[^\d]/g, ''),
            type: 'template',
            template: {
                name: templateName,
                language: { code: 'en' },
                components: [
                    {
                        type: 'body',
                        parameters: [
                            { type: 'text', parameter_name: 'customer', text: String(customerName) },
                            { type: 'text', parameter_name: 'amount', text: String(totalAmount) },
                            { type: 'text', parameter_name: 'items', text: String(items) },
                        ],
                    },
                ],
            },
        }),
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
        console.error('[whatsapp] Sale notification failed:', data ?? res.statusText);
        throw new Error(data?.error?.message || `WhatsApp API error (${res.status})`);
    }

    console.log(`[whatsapp] Sale notification sent for order ${orderId}:`, data);
    return data;
}
