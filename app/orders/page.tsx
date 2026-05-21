import Link from 'next/link';
import { Package, Calendar, CreditCard, ArrowLeft } from 'lucide-react';
import { getMyOrders } from '@/lib/actions/order.actions';

const fmt = (n: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

const fmtDate = (s: string) =>
    new Date(s).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });

const statusClass: Record<string, string> = {
    delivered:  'bg-green-100 text-green-800',
    shipped:    'bg-blue-100 text-blue-800',
    processing: 'bg-yellow-100 text-yellow-800',
    pending:    'bg-gray-100 text-gray-800',
    cancelled:  'bg-red-100 text-red-800',
};

export default async function OrdersPage() {
    const orders = await getMyOrders();

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b">
                <div className="container mx-auto px-4 py-6">
                    <Link
                        href="/profile"
                        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary transition-colors mb-4"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to My Account
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900">Order History</h1>
                    <p className="text-textSecondary mt-1">View and track your orders</p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8 pb-12">
                {orders.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-md p-12 text-center">
                        <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">No orders yet</h2>
                        <p className="text-textSecondary mb-6">
                            You haven&apos;t placed any orders yet. Explore our collection to find something you love.
                        </p>
                        <Link
                            href="/collection"
                            className="inline-block px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-light transition-colors"
                        >
                            Explore Collection
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {orders.map((order) => (
                            <Link
                                key={order.id}
                                href={`/orders/${order.id}`}
                                className="block bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
                            >
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <Package className="w-5 h-5 text-gray-400" />
                                            <h3 className="font-semibold text-gray-900">
                                                Order #{order.order_number}
                                            </h3>
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusClass[order.status] ?? 'bg-gray-100 text-gray-800'}`}>
                                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap gap-4 text-sm text-textSecondary">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-4 h-4" />
                                                {fmtDate(order.created_at)}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <CreditCard className="w-4 h-4" />
                                                {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-textSecondary">Total</p>
                                        <p className="text-2xl font-bold text-accent-700">{fmt(order.total_amount)}</p>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
