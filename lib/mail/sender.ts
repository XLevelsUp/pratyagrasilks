import { Resend } from 'resend';
import { getOrderConfirmationHtml, OrderEmailData } from './templates';

// const resend = new Resend(process.env.RESEND_API_KEY);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function sendOrderConfirmation(
    toEmail: string,
    data: OrderEmailData
): Promise<void> {
    // Email receipt disabled — uncomment below to re-enable
    // const html = getOrderConfirmationHtml(data);
    // await resend.emails.send({
    //     from: process.env.RESEND_FROM_EMAIL ?? 'orders@kandangisarees.com',
    //     to: toEmail,
    //     subject: `Order Confirmed — ${data.orderNumber} | Kandangi Sarees`,
    //     html,
    // });
}
