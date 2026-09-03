import { Resend } from 'resend';
import { getOrderConfirmationHtml, OrderEmailData } from './templates';

export async function sendOrderConfirmation(
    toEmail: string,
    data: OrderEmailData
): Promise<void> {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const html = getOrderConfirmationHtml(data);
    await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL ?? 'orders@pratyagrasilks.com',
        to: toEmail,
        subject: `Order Confirmed — ${data.orderNumber} | Pratyagra Silks`,
        html,
    });
}
