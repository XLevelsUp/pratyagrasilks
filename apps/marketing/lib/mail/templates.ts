export interface OrderEmailData {
    orderNumber: string;
    customerName: string;
    customerEmail: string;
    items: Array<{
        name: string;
        sku: string;
        quantity: number;
        unitPrice: number;
        totalPrice: number;
    }>;
    subtotal: number;
    shippingCharge: number;
    totalAmount: number;
    shippingAddress: {
        line1: string;
        line2?: string | null;
        city: string;
        state: string;
        pincode: string;
    };
    estimatedDelivery?: string | null;
}

function formatINR(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    }).format(amount);
}

export function getOrderConfirmationHtml(data: OrderEmailData): string {
    const itemRows = data.items
        .map(
            (item) => `
        <tr>
            <td style="padding: 14px 0; border-bottom: 1px solid #f0e6d3; vertical-align: top;">
                <p style="margin: 0; font-size: 15px; font-weight: bold; color: #221D10;">${item.name}</p>
                <p style="margin: 4px 0 0; font-size: 12px; color: #888;">SKU: ${item.sku}</p>
            </td>
            <td style="padding: 14px 8px; border-bottom: 1px solid #f0e6d3; text-align: center; vertical-align: top;">
                <span style="font-size: 14px; color: #555;">${item.quantity}</span>
            </td>
            <td style="padding: 14px 0; border-bottom: 1px solid #f0e6d3; text-align: right; vertical-align: top;">
                <span style="font-size: 14px; font-weight: bold; color: #720C5C;">${formatINR(item.totalPrice)}</span>
            </td>
        </tr>`
        )
        .join('');

    const shippingRow =
        data.shippingCharge > 0
            ? `<tr>
                <td colspan="2" style="padding: 6px 0; font-size: 14px; color: #555;">Shipping</td>
                <td style="padding: 6px 0; text-align: right; font-size: 14px; color: #555;">${formatINR(data.shippingCharge)}</td>
               </tr>`
            : `<tr>
                <td colspan="2" style="padding: 6px 0; font-size: 14px; color: #555;">Shipping</td>
                <td style="padding: 6px 0; text-align: right; font-size: 14px; color: #2d8a4e;">Free</td>
               </tr>`;

    const deliveryBadge = data.estimatedDelivery
        ? `<p style="margin: 16px 0 0; display: inline-block; background: #FEF3C7; color: #92400E; font-size: 13px; padding: 6px 14px; border-radius: 20px; font-family: Georgia, serif;">
                Estimated Delivery: ${data.estimatedDelivery}
           </p>`
        : '';

    const addressLine2 = data.shippingAddress.line2
        ? `<p style="margin: 2px 0; font-size: 14px; color: #444;">${data.shippingAddress.line2}</p>`
        : '';

    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Order Confirmed — Pratyagra Silks</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8f5f0; font-family: Georgia, 'Times New Roman', serif;">

<table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f5f0; padding: 32px 16px;">
    <tr>
        <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 4px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">

                <!-- Header -->
                <tr>
                    <td style="background-color: #550c72; padding: 36px 40px; text-align: center;">
                        <h1 style="margin: 0; font-size: 28px; font-weight: normal; letter-spacing: 3px; color: #ffffff; text-transform: uppercase; font-family: Georgia, serif;">
                            Pratyagra Silks
                        </h1>
                        <p style="margin: 8px 0 0; font-size: 12px; letter-spacing: 2px; color: #D97706; text-transform: uppercase; font-family: Georgia, serif;">
                            Handcrafted with Love
                        </p>
                    </td>
                </tr>

                <!-- Gold divider -->
                <tr>
                    <td style="background-color: #D97706; height: 2px; font-size: 0; line-height: 0;">&nbsp;</td>
                </tr>

                <!-- Body -->
                <tr>
                    <td style="padding: 40px 40px 32px;">

                        <!-- Greeting -->
                        <p style="margin: 0 0 8px; font-size: 22px; color: #550c72; font-family: Georgia, serif;">
                            Dear ${data.customerName},
                        </p>
                        <p style="margin: 0 0 28px; font-size: 15px; color: #555; line-height: 1.6;">
                            Thank you for your order. We are delighted to confirm your purchase and are preparing your saree with the utmost care.
                        </p>

                        <!-- Order number badge -->
                        <table cellpadding="0" cellspacing="0" style="margin-bottom: 32px;">
                            <tr>
                                <td style="background-color: #F5EEF8; border-left: 3px solid #550c72; padding: 14px 20px; border-radius: 0 4px 4px 0;">
                                    <p style="margin: 0; font-size: 11px; letter-spacing: 1.5px; color: #888; text-transform: uppercase;">Order Number</p>
                                    <p style="margin: 4px 0 0; font-size: 18px; font-family: 'Courier New', monospace; letter-spacing: 2px; color: #550c72; font-weight: bold;">
                                        ${data.orderNumber}
                                    </p>
                                </td>
                            </tr>
                        </table>

                        <!-- Items -->
                        <p style="margin: 0 0 12px; font-size: 13px; letter-spacing: 1.5px; text-transform: uppercase; color: #888;">Your Items</p>
                        <table width="100%" cellpadding="0" cellspacing="0" style="border-top: 1px solid #f0e6d3;">
                            <thead>
                                <tr>
                                    <th style="padding: 10px 0; text-align: left; font-size: 11px; letter-spacing: 1px; text-transform: uppercase; color: #aaa; font-weight: normal;">Product</th>
                                    <th style="padding: 10px 8px; text-align: center; font-size: 11px; letter-spacing: 1px; text-transform: uppercase; color: #aaa; font-weight: normal;">Qty</th>
                                    <th style="padding: 10px 0; text-align: right; font-size: 11px; letter-spacing: 1px; text-transform: uppercase; color: #aaa; font-weight: normal;">Price</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${itemRows}
                            </tbody>
                        </table>

                        <!-- Pricing summary -->
                        <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 8px;">
                            <tr>
                                <td colspan="2" style="padding: 6px 0; font-size: 14px; color: #555;">Subtotal</td>
                                <td style="padding: 6px 0; text-align: right; font-size: 14px; color: #555;">${formatINR(data.subtotal)}</td>
                            </tr>
                            ${shippingRow}
                            <tr>
                                <td colspan="3" style="padding: 4px 0;"><hr style="border: none; border-top: 1px solid #e8d5e0; margin: 4px 0;" /></td>
                            </tr>
                            <tr>
                                <td colspan="2" style="padding: 8px 0; font-size: 17px; font-weight: bold; color: #550c72;">Total</td>
                                <td style="padding: 8px 0; text-align: right; font-size: 17px; font-weight: bold; color: #550c72;">${formatINR(data.totalAmount)}</td>
                            </tr>
                        </table>

                    </td>
                </tr>

                <!-- Gold divider -->
                <tr>
                    <td style="background-color: #f0e6d3; height: 1px; font-size: 0; line-height: 0;">&nbsp;</td>
                </tr>

                <!-- Shipping address -->
                <tr>
                    <td style="padding: 28px 40px 32px;">
                        <p style="margin: 0 0 12px; font-size: 13px; letter-spacing: 1.5px; text-transform: uppercase; color: #888;">Shipping To</p>
                        <div style="background-color: #f8f5f0; border-radius: 4px; padding: 16px 20px;">
                            <p style="margin: 0 0 2px; font-size: 15px; font-weight: bold; color: #221D10;">${data.customerName}</p>
                            <p style="margin: 2px 0; font-size: 14px; color: #444;">${data.shippingAddress.line1}</p>
                            ${addressLine2}
                            <p style="margin: 2px 0; font-size: 14px; color: #444;">${data.shippingAddress.city}, ${data.shippingAddress.state} — ${data.shippingAddress.pincode}</p>
                        </div>
                        ${deliveryBadge}
                    </td>
                </tr>

                <!-- Footer -->
                <tr>
                    <td style="background-color: #550c72; padding: 28px 40px; text-align: center;">
                        <p style="margin: 0; font-size: 14px; color: #ffffff; letter-spacing: 1px;">Pratyagra Silks</p>
                        <p style="margin: 6px 0 0; font-size: 12px; color: #D97706; letter-spacing: 1px;">Handcrafted with Love</p>
                        <p style="margin: 16px 0 0; font-size: 11px; color: #c9a8d8;">
                            If you have any questions, reply to this email or contact us [ +91 73588 66646].
                        </p>
                    </td>
                </tr>

            </table>
        </td>
    </tr>
</table>

</body>
</html>`;
}
