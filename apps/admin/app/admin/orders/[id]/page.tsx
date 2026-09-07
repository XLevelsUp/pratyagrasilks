'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Calendar, CreditCard, Home, Loader2, Package } from 'lucide-react';
import { createClient } from '@pratyagra/auth/client';

/**
 * Admin order detail.
 *
 * Reads through the browser client under RLS, exactly like the orders list —
 * admin_setup.sql grants is_admin() SELECT on orders, order_items, customers
 * and addresses, so no service-role path is needed here.
 *
 * Deliberately not a link to the storefront's /orders/[id]: the two apps no
 * longer share a cookie domain, so sending staff there would bounce them to
 * the storefront's customer login.
 */

interface OrderItemRow {
    id: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    products: {
        id: string;
        name: string;
        images: string[] | null;
        sku: string | null;
    } | null;
}

interface OrderDetail {
    id: string;
    order_number: string;
    invoice_number: string | null;
    status: string;
    payment_status: string;
    payment_method: string | null;
    total_amount: number;
    shipping_cost: number | null;
    created_at: string;
    customer: { full_name: string | null; email: string | null; phone: string | null } | null;
    address: {
        address_line1: string | null;
        address_line2: string | null;
        city: string | null;
        state: string | null;
        postal_code: string | null;
        country: string | null;
    } | null;
    items: OrderItemRow[];
}

const formatPrice = (value: number) =>
    new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    }).format(value);

const statusColor = (status: string) => {
    switch (status) {
        case 'delivered': return 'bg-green-100 text-green-800';
        case 'shipped': return 'bg-blue-100 text-blue-800';
        case 'processing': return 'bg-amber-100 text-amber-800';
        case 'cancelled': return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
    }
};

export default function AdminOrderDetailPage() {
    const params = useParams();
    const orderId = params.id as string;

    const [order, setOrder] = useState<OrderDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [missing, setMissing] = useState(false);

    const fetchOrder = useCallback(async () => {
        const supabase = createClient();

        const { data: orderRow, error } = await supabase
            .from('orders')
            .select('*')
            .eq('id', orderId)
            .single();

        if (error || !orderRow) {
            setMissing(true);
            setLoading(false);
            return;
        }

        // Customer and address are separate lookups rather than embedded joins
        // because a counter sale may have neither set.
        const [{ data: customer }, { data: address }, { data: items }] = await Promise.all([
            orderRow.customer_id
                ? supabase.from('customers').select('full_name, email, phone').eq('id', orderRow.customer_id).single()
                : Promise.resolve({ data: null }),
            orderRow.shipping_address_id
                ? supabase
                      .from('addresses')
                      .select('address_line1, address_line2, city, state, postal_code, country')
                      .eq('id', orderRow.shipping_address_id)
                      .single()
                : Promise.resolve({ data: null }),
            supabase
                .from('order_items')
                .select('id, quantity, unit_price, total_price, products ( id, name, images, sku )')
                .eq('order_id', orderId),
        ]);

        setOrder({
            ...orderRow,
            customer: customer ?? null,
            address: address ?? null,
            items: (items ?? []) as unknown as OrderItemRow[],
        });
        setLoading(false);
    }, [orderId]);

    useEffect(() => {
        fetchOrder();
    }, [fetchOrder]);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-24">
                <Loader2 className="w-8 h-8 animate-spin text-amber-600" aria-hidden="true" />
            </div>
        );
    }

    if (missing || !order) {
        return (
            <div className="space-y-4">
                <Link href="/admin/orders" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-amber-700">
                    <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                    All Orders
                </Link>
                <div className="bg-white rounded-lg shadow p-8 text-center">
                    <Package className="w-10 h-10 mx-auto text-gray-300" aria-hidden="true" />
                    <p className="mt-3 text-gray-600">That order could not be found.</p>
                </div>
            </div>
        );
    }

    const subtotal = order.items.reduce((sum, i) => sum + (i.total_price || 0), 0);
    const shipping = order.shipping_cost || 0;

    return (
        <div className="space-y-6">
            <Link href="/admin/orders" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-amber-700 transition-colors">
                <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                All Orders
            </Link>

            {/* Header */}
            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <h1 className="font-playfair text-2xl font-bold text-gray-900">
                            {order.order_number}
                        </h1>
                        {order.invoice_number && (
                            <p className="text-sm text-gray-500">Invoice {order.invoice_number}</p>
                        )}
                        <p className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                            <Calendar className="w-4 h-4" aria-hidden="true" />
                            {new Date(order.created_at).toLocaleString('en-IN')}
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor(order.status)}`}>
                            {order.status}
                        </span>
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 flex items-center gap-1">
                            <CreditCard className="w-3 h-3" aria-hidden="true" />
                            {order.payment_status}
                            {order.payment_method ? ` · ${order.payment_method}` : ''}
                        </span>
                    </div>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Items */}
                <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
                    <h2 className="font-semibold text-gray-900 mb-4">Items</h2>
                    <ul className="divide-y divide-gray-100">
                        {order.items.map((item) => (
                            <li key={item.id} className="flex items-center gap-4 py-3">
                                <div className="relative w-14 h-14 flex-shrink-0 rounded overflow-hidden bg-gray-100">
                                    {item.products?.images?.[0] ? (
                                        <Image
                                            src={item.products.images[0]}
                                            alt={item.products?.name ?? 'Product'}
                                            fill
                                            sizes="56px"
                                            className="object-cover"
                                        />
                                    ) : (
                                        <Package className="w-5 h-5 m-auto text-gray-300" aria-hidden="true" />
                                    )}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="truncate font-medium text-gray-900">
                                        {item.products?.name ?? 'Product removed'}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        {item.products?.sku ? `${item.products.sku} · ` : ''}
                                        {item.quantity} × {formatPrice(item.unit_price)}
                                    </p>
                                </div>
                                <p className="font-medium text-gray-900">{formatPrice(item.total_price)}</p>
                            </li>
                        ))}
                    </ul>

                    <dl className="mt-4 border-t border-gray-100 pt-4 space-y-2 text-sm">
                        <div className="flex justify-between">
                            <dt className="text-gray-500">Subtotal</dt>
                            <dd className="text-gray-900">{formatPrice(subtotal)}</dd>
                        </div>
                        <div className="flex justify-between">
                            <dt className="text-gray-500">Shipping</dt>
                            <dd className="text-gray-900">{formatPrice(shipping)}</dd>
                        </div>
                        <div className="flex justify-between text-base font-semibold">
                            <dt className="text-gray-900">Total</dt>
                            <dd className="text-gray-900">{formatPrice(order.total_amount)}</dd>
                        </div>
                    </dl>
                </div>

                {/* Customer + shipping */}
                <div className="space-y-6">
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="font-semibold text-gray-900 mb-3">Customer</h2>
                        <p className="text-gray-900">{order.customer?.full_name ?? 'Guest'}</p>
                        {order.customer?.email && <p className="text-sm text-gray-500">{order.customer.email}</p>}
                        {order.customer?.phone && <p className="text-sm text-gray-500">{order.customer.phone}</p>}
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <Home className="w-4 h-4" aria-hidden="true" />
                            Shipping address
                        </h2>
                        {order.address ? (
                            <address className="not-italic text-sm text-gray-600 leading-relaxed">
                                {order.address.address_line1}<br />
                                {order.address.address_line2 && <>{order.address.address_line2}<br /></>}
                                {order.address.city}, {order.address.state} {order.address.postal_code}<br />
                                {order.address.country}
                            </address>
                        ) : (
                            <p className="text-sm text-gray-500">No shipping address (counter sale).</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
