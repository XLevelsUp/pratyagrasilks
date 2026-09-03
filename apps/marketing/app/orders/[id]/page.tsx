'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Package, Home, Calendar, CreditCard } from 'lucide-react';
import Image from 'next/image';

interface OrderData {
    order: {
        id: string;
        order_number: string;
        customer_name: string;
        customer_email: string;
        customer_phone: string;
        shipping_address: {
            line1: string;
            line2?: string;
            city: string;
            state: string;
            pincode: string;
        };
        subtotal: number;
        shipping_charge: number;
        total_amount: number;
        status: string;
        payment_status: string;
        created_at: string;
        items: Array<{
            id: string;
            quantity: number;
            unit_price: number;
            total_price: number;
            products: {
                id: string;
                name: string;
                images: string[];
                sku: string;
            };
        }>;
    };
}

export default function OrderDetailsPage() {
    const params = useParams();
    const orderId = params.id as string;
    const [orderData, setOrderData] = useState<OrderData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchOrder() {
            try {
                const response = await fetch(`/api/orders/${orderId}`);
                if (response.ok) {
                    const data = await response.json();
                    setOrderData(data);
                }
            } catch (error) {
                console.error('Error fetching order:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchOrder();
    }, [orderId]);

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(price);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'delivered':
                return 'bg-green-100 text-green-800';
            case 'shipped':
                return 'bg-blue-100 text-blue-800';
            case 'processing':
                return 'bg-yellow-100 text-yellow-800';
            case 'pending':
                return 'bg-gray-100 text-gray-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!orderData) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h1>
                    <Link href="/orders" className="text-primary hover:text-primary-light">
                        View All Orders
                    </Link>
                </div>
            </div>
        );
    }

    const { order } = orderData;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b">
                <div className="container mx-auto px-4 py-6">
                    <Link
                        href="/orders"
                        className="inline-flex items-center gap-2 text-primary hover:text-primary-light font-medium mb-4"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Back to Orders
                    </Link>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Order #{order.order_number}</h1>
                            <p className="text-textSecondary mt-1">{formatDate(order.created_at)}</p>
                        </div>
                        <div className="flex gap-2">
                            <span className={`px-4 py-2 rounded-lg text-sm font-medium ${getStatusColor(order.status)}`}>
                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </span>
                            <span className={`px-4 py-2 rounded-lg text-sm font-medium ${getStatusColor(order.payment_status)}`}>
                                Payment: {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Order Content */}
            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Order Items */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <Package className="w-5 h-5" />
                                Order Items
                            </h2>

                            <div className="space-y-4">
                                {order.items.map((item) => {
                                    const imageUrl = item.products.images?.[0] || '/placeholder-product.jpg';
                                    return (
                                        <div key={item.id} className="flex gap-4 pb-4 border-b last:border-0">
                                            <div className="relative w-20 h-20 flex-shrink-0 rounded-md overflow-hidden bg-gray-100">
                                                <Image
                                                    src={imageUrl}
                                                    alt={item.products.name}
                                                    fill
                                                    className="object-cover"
                                                    sizes="80px"
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-medium text-gray-900">{item.products.name}</h3>
                                                <p className="text-sm text-gray-500">SKU: {item.products.sku}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-semibold text-gray-900">
                                                    {formatPrice(item.total_price)}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Order Summary & Details */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Order Summary */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>
                            <div className="space-y-2">
                                <div className="flex justify-between text-textSecondary">
                                    <span>Subtotal</span>
                                    <span>{formatPrice(order.subtotal)}</span>
                                </div>
                                <div className="flex justify-between text-textSecondary">
                                    <span>Shipping</span>
                                    <span>{formatPrice(order.shipping_charge || 0)}</span>
                                </div>
                                <div className="border-t pt-2 mt-2">
                                    <div className="flex justify-between text-lg font-semibold">
                                        <span className="text-gray-900">Total</span>
                                        <span className="text-accent-700">{formatPrice(order.total_amount)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Shipping Address */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <Home className="w-5 h-5" />
                                Shipping Address
                            </h2>
                            <div className="">
                                <p className="font-medium">{order.customer_name}</p>
                                <p>{order.shipping_address.line1}</p>
                                {order.shipping_address.line2 && <p>{order.shipping_address.line2}</p>}
                                <p>
                                    {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.pincode}
                                </p>
                                <p className="mt-2">{order.customer_phone}</p>
                                <p className="text-sm text-gray-500 mt-1">{order.customer_email}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
