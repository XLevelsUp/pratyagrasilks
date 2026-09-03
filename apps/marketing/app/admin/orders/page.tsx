'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Search, Filter, Eye, Package, Printer, Download } from 'lucide-react';
import * as XLSX from 'xlsx';
import Link from 'next/link';
import toast from 'react-hot-toast';
import BulkReceiptWrapper from '@/components/admin/BulkReceiptWrapper';
import { type PosReceiptData } from '@/components/admin/PosReceipt';

interface Order {
    id: string;
    order_number: string;
    invoice_number: string | null;
    customer_name: string;
    customer_email: string;
    customer_phone: string | null;
    total_amount: number;
    status: string;
    payment_status: string;
    payment_method: string | null;
    created_at: string;
}

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [paymentFilter, setPaymentFilter] = useState('all');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [isPrinting, setIsPrinting] = useState(false);
    const [printData, setPrintData] = useState<PosReceiptData[]>([]);

    useEffect(() => {
        fetchOrders();
    }, [statusFilter, paymentFilter, dateFrom, dateTo]);

    async function fetchOrders() {
        setLoading(true);
        const supabase = createClient();

        let query = supabase
            .from('orders')
            .select(`
        id,
        order_number,
        invoice_number,
        total_amount,
        status,
        payment_status,
        payment_method,
        created_at,
        customers (
          full_name,
          email,
          phone
        )
      `)
            .order('created_at', { ascending: false });

        if (statusFilter !== 'all') {
            query = query.eq('status', statusFilter);
        }

        if (paymentFilter !== 'all') {
            query = query.eq('payment_status', paymentFilter);
        }

        if (dateFrom) {
            query = query.gte('created_at', `${dateFrom}T00:00:00.000Z`);
        }

        if (dateTo) {
            query = query.lte('created_at', `${dateTo}T23:59:59.999Z`);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Error fetching orders:', error);
        } else {
            setOrders(
                data.map((order: any) => ({
                    ...order,
                    customer_name: order.customers?.full_name || 'Guest',
                    customer_email: order.customers?.email || '',
                    customer_phone: order.customers?.phone || null,
                }))
            );
        }

        setLoading(false);
    }

    const handleStatusUpdate = async (orderId: string, newStatus: string) => {
        const supabase = createClient();

        const { error } = await supabase
            .from('orders')
            .update({ status: newStatus })
            .eq('id', orderId);

        if (error) {
            console.error('Error updating status:', error);
            toast.error('Failed to update order status');
        } else {
            // Refresh orders
            fetchOrders();
        }
    };

    const toggleOne = (id: string) => setSelectedIds(prev => {
        const next = new Set(prev);
        next.has(id) ? next.delete(id) : next.add(id);
        return next;
    });

    const handlePrintReceipts = async () => {
        const supabase = createClient();
        const selected = filteredOrders.filter(o => selectedIds.has(o.id));

        const results = await Promise.all(
            selected.map(o =>
                supabase.from('order_items')
                    .select('product_name, product_sku, quantity, unit_price')
                    .eq('order_id', o.id)
            )
        );

        const receipts: PosReceiptData[] = selected.map((o, i) => {
            const items = results[i].data ?? [];
            const grand = o.total_amount;
            const taxable = Math.round((grand / 1.05) * 100) / 100;
            const half = Math.round(((grand - taxable) / 2) * 100) / 100;
            return {
                orderNumber: o.order_number,
                orderId: o.id,
                invoiceNumber: o.invoice_number ?? undefined,
                items: items.map((it: any) => ({
                    name: it.product_name,
                    sku: it.product_sku,
                    quantity: it.quantity,
                    unitPrice: it.unit_price,
                })),
                grandTotal: grand,
                taxableValue: taxable,
                cgst: half,
                sgst: half,
                paymentMethod: o.payment_method ?? 'Online',
                date: new Date(o.created_at).toLocaleDateString('en-IN', {
                    day: 'numeric', month: 'short', year: 'numeric',
                }),
                customerName: o.customer_name,
                customerPhone: o.customer_phone ?? undefined,
            };
        });

        setPrintData(receipts);
        setIsPrinting(true);
        setTimeout(() => {
            window.print();
            setIsPrinting(false);
            setSelectedIds(new Set());
        }, 300);
    };

    const handleDownloadExcel = () => {
        const selected = filteredOrders.filter(o => selectedIds.has(o.id));

        const rows = selected.map(o => ({
            'Invoice #': o.invoice_number ?? '',
            'Order #': o.order_number,
            'Customer Name': o.customer_name,
            'Customer Email': o.customer_email,
            'Customer Phone': o.customer_phone ?? '',
            'Date': new Date(o.created_at).toLocaleDateString('en-IN', {
                day: 'numeric', month: 'short', year: 'numeric',
            }),
            'Total (₹)': o.total_amount,
            'Payment Method': o.payment_method ?? '',
            'Payment Status': o.payment_status,
            'Order Status': o.status,
        }));

        const ws = XLSX.utils.json_to_sheet(rows);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Orders');

        const dateStr = new Date().toISOString().slice(0, 10);
        XLSX.writeFile(wb, `pratyagra-orders-${dateStr}.xlsx`);
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(price);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
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

    const getPaymentColor = (status: string) => {
        switch (status) {
            case 'paid':
                return 'bg-green-100 text-green-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'failed':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const filteredOrders = orders.filter((order) => {
        const searchLower = searchTerm.toLowerCase();
        return (
            order.order_number.toLowerCase().includes(searchLower) ||
            order.customer_name.toLowerCase().includes(searchLower) ||
            order.customer_email.toLowerCase().includes(searchLower)
        );
    });

    const allSelected = filteredOrders.length > 0 && filteredOrders.every(o => selectedIds.has(o.id));
    const toggleAll = () => setSelectedIds(allSelected ? new Set() : new Set(filteredOrders.map(o => o.id)));
    const someSelected = selectedIds.size > 0;

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
                <div className="flex items-center gap-2 text-sm text-textSecondary">
                    <Package className="w-4 h-4" />
                    <span>{filteredOrders.length} orders</span>
                </div>
            </div>

            {someSelected && (
                <div className="sticky top-4 z-10 flex items-center justify-between bg-[#550c72] text-white px-5 py-3 rounded-xl shadow-lg mb-4">
                    <span className="text-sm font-semibold">
                        {selectedIds.size} order{selectedIds.size > 1 ? 's' : ''} selected
                    </span>
                    <div className="flex items-center gap-3">
                        <button onClick={() => setSelectedIds(new Set())} className="text-xs underline opacity-80 hover:opacity-100">
                            Clear
                        </button>
                        <button
                            onClick={handleDownloadExcel}
                            className="flex items-center gap-2 px-4 py-1.5 bg-white text-[#550c72] rounded-lg text-sm font-bold hover:bg-gray-100 transition-colors"
                        >
                            <Download className="w-4 h-4" />
                            Export Excel
                        </button>
                        <button
                            onClick={handlePrintReceipts}
                            className="flex items-center gap-2 px-4 py-1.5 bg-white text-[#550c72] rounded-lg text-sm font-bold hover:bg-gray-100 transition-colors"
                        >
                            <Printer className="w-4 h-4" />
                            Print {selectedIds.size} Receipt{selectedIds.size > 1 ? 's' : ''}
                        </button>
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search orders, customers..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                        />
                    </div>

                    {/* Status Filter */}
                    <div>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                        >
                            <option value="all">All Statuses</option>
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>

                    {/* Payment Filter */}
                    <div>
                        <select
                            value={paymentFilter}
                            onChange={(e) => setPaymentFilter(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                        >
                            <option value="all">All Payments</option>
                            <option value="pending">Pending</option>
                            <option value="paid">Paid</option>
                            <option value="failed">Failed</option>
                        </select>
                    </div>
                </div>

                {/* Date Range Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-100">
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">From Date</label>
                        <input
                            type="date"
                            value={dateFrom}
                            onChange={(e) => setDateFrom(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">To Date</label>
                        <input
                            type="date"
                            value={dateTo}
                            onChange={(e) => setDateTo(e.target.value)}
                            min={dateFrom || undefined}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm"
                        />
                    </div>
                    {(dateFrom || dateTo) && (
                        <div className="flex items-end">
                            <button
                                onClick={() => { setDateFrom(''); setDateTo(''); }}
                                className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Clear Dates
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
                    </div>
                ) : filteredOrders.length === 0 ? (
                    <div className="text-center py-12">
                        <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">No orders found</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3">
                                        <input type="checkbox" checked={allSelected} onChange={toggleAll} className="rounded" />
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Order
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Customer
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Date
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Total
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Payment
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredOrders.map((order) => (
                                    <tr key={order.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.has(order.id)}
                                                onChange={() => toggleOne(order.id)}
                                                className="rounded"
                                            />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="font-medium text-gray-900">#{order.order_number}</div>
                                            {order.invoice_number && (
                                                <div className="text-xs text-purple-700 font-medium">{order.invoice_number}</div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-gray-900">{order.customer_name}</div>
                                            <div className="text-sm text-gray-500">{order.customer_email}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {formatDate(order.created_at)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-900 font-medium">
                                            {formatPrice(order.total_amount)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPaymentColor(order.payment_status)}`}>
                                                {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <select
                                                value={order.status}
                                                onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                                                className={`px-3 py-1 rounded-full text-xs font-medium border-0 cursor-pointer ${getStatusColor(order.status)}`}
                                            >
                                                <option value="pending">Pending</option>
                                                <option value="processing">Processing</option>
                                                <option value="shipped">Shipped</option>
                                                <option value="delivered">Delivered</option>
                                                <option value="cancelled">Cancelled</option>
                                            </select>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <Link
                                                href={`/orders/${order.id}`}
                                                className="text-amber-600 hover:text-amber-700 flex items-center gap-1"
                                            >
                                                <Eye className="w-4 h-4" />
                                                View
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
            {isPrinting && <BulkReceiptWrapper receipts={printData} />}
        </div>
    );
}
