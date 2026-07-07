import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { CheckCircle, Package, Truck, ArrowRight, Download } from 'lucide-react';
import ConfettiEffect from '@/components/ui/ConfettiEffect';

export const metadata: Metadata = {
    title: 'Order Successful | Pratyagra Silks',
    description: 'Your order has been placed successfully',
};

interface PageProps {
    searchParams: Promise<{ order_id?: string }>;
}

export default async function OrderSuccessPage({ searchParams }: PageProps) {
    const params = await searchParams;
    const orderId = params.order_id;

    if (!orderId) {
        redirect('/');
    }

    const supabase = await createClient();

    // Fetch order details
    const { data: order } = await supabase
        .from('orders')
        .select(`
      *,
      order_items (
        *,
        products (
          name,
          images
        )
      ),
      addresses (
        full_name,
        address_line1,
        address_line2,
        city,
        state,
        postal_code,
        country,
        phone
      )
    `)
        .eq('id', orderId)
        .single();

    if (!order) {
        redirect('/');
    }

    // Calculate estimated delivery date (7-10 business days)
    const estimatedDelivery = new Date();
    estimatedDelivery.setDate(estimatedDelivery.getDate() + 10);
    const deliveryDateStr = estimatedDelivery.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 py-12 px-4 sm:px-6 lg:px-8">
            <ConfettiEffect />

            <div className="max-w-3xl mx-auto">
                {/* Success Header */}
                <div className="text-center mb-8 animate-fade-in">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full mb-6 shadow-lg animate-scale-in">
                        <CheckCircle className="w-12 h-12 text-white" />
                    </div>

                    <h1 className="text-4xl font-bold text-gray-900 mb-3">
                        Order Confirmed! 🎉
                    </h1>

                    <p className="text-lg text-gray-600 mb-2">
                        Thank you for your purchase from Pratyagra Silks
                    </p>

                    <div className="inline-block bg-white px-6 py-3 rounded-lg shadow-md border-2 border-purple-200">
                        <p className="text-sm text-gray-500 mb-1">Order Number</p>
                        <p className="text-2xl font-bold text-purple-600">{order.order_number}</p>
                    </div>
                </div>

                {/* Order Details Card */}
                <div className="bg-white rounded-2xl shadow-xl p-8 mb-6 border border-purple-100">
                    {/* Order Items */}
                    <div className="mb-8">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Package className="w-5 h-5 text-purple-600" />
                            Your Items
                        </h2>

                        <div className="space-y-4">
                            {order.order_items?.map((item: any) => (
                                <div key={item.id} className="flex gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                    {item.products?.images?.[0] && (
                                        <img
                                            src={item.products.images[0]}
                                            alt={item.product_name}
                                            className="w-20 h-20 object-cover rounded-lg shadow-sm"
                                        />
                                    )}
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-gray-900">{item.product_name}</h3>
                                        <p className="text-sm text-gray-500">SKU: {item.product_sku}</p>
                                        <p className="text-sm text-gray-600 mt-1">Quantity: {item.quantity}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold text-gray-900">₹{item.total_price.toLocaleString('en-IN')}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="border-t border-gray-200 pt-6 mb-6">
                        <div className="space-y-2">
                            <div className="flex justify-between text-gray-600">
                                <span>Subtotal</span>
                                <span>₹{order.total_amount.toLocaleString('en-IN')}</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Shipping</span>
                                <span>{order.shipping_cost > 0 ? `₹${order.shipping_cost}` : 'FREE'}</span>
                            </div>
                            <div className="flex justify-between text-xl font-bold text-gray-900 pt-2 border-t border-gray-200">
                                <span>Total Paid</span>
                                <span>₹{(order.total_amount + (order.shipping_cost || 0)).toLocaleString('en-IN')}</span>
                            </div>
                        </div>
                    </div>

                    {/* Payment Info */}
                    <div className="bg-green-50 rounded-lg p-4 mb-6 border border-green-200">
                        <div className="flex items-center gap-2 text-green-700">
                            <CheckCircle className="w-5 h-5" />
                            <div>
                                <p className="font-semibold">Payment Successful</p>
                                <p className="text-sm">Payment ID: {order.razorpay_payment_id}</p>
                            </div>
                        </div>
                    </div>

                    {/* Delivery Estimate */}
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 border border-purple-200">
                        <div className="flex items-start gap-3">
                            <Truck className="w-6 h-6 text-purple-600 mt-1 flex-shrink-0" />
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-1">Estimated Delivery</h3>
                                <p className="text-gray-700 font-medium">{deliveryDateStr}</p>
                                <p className="text-sm text-gray-600 mt-2">
                                    We'll send you tracking information once your order ships.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                        href="/account/orders"
                        className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-purple-600 font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 border-2 border-purple-200 hover:border-purple-300"
                    >
                        <Download className="w-5 h-5" />
                        View Order Details
                    </Link>

                    <Link
                        href="/collections"
                        className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105"
                    >
                        Continue Shopping
                        <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>
            </div>
        </div>
    );
}
