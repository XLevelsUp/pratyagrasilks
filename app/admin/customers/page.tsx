'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Search, Users, ShoppingBag, DollarSign, Calendar } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Customer {
    id: string;
    email: string;
    full_name: string;
    phone: string | null;
    created_at: string;
    total_orders: number;
    total_spent: number;
    last_order_date: string | null;
}

interface CustomerStats {
    totalCustomers: number;
    newThisMonth: number;
    activeCustomers: number;
    averageOrderValue: number;
}

export default function AdminCustomersPage() {
    const router = useRouter();
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [stats, setStats] = useState<CustomerStats>({
        totalCustomers: 0,
        newThisMonth: 0,
        activeCustomers: 0,
        averageOrderValue: 0,
    });

    useEffect(() => {
        fetchCustomers();
    }, []);

    async function fetchCustomers() {
        setLoading(true);
        const supabase = createClient();

        // Fetch customers with their order statistics
        const { data: customersData, error: customersError } = await supabase
            .from('customers')
            .select(`
                id,
                email,
                full_name,
                phone,
                created_at
            `)
            .order('created_at', { ascending: false });

        if (customersError) {
            console.error('Error fetching customers:', customersError);
            setLoading(false);
            return;
        }

        // Fetch order statistics for each customer
        const customersWithStats = await Promise.all(
            (customersData || []).map(async (customer) => {
                const { data: orders } = await supabase
                    .from('orders')
                    .select('total_amount, created_at')
                    .eq('customer_id', customer.id);

                const totalOrders = orders?.length || 0;
                const totalSpent = orders?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0;
                const lastOrderDate = orders && orders.length > 0
                    ? orders.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0].created_at
                    : null;

                return {
                    ...customer,
                    total_orders: totalOrders,
                    total_spent: totalSpent,
                    last_order_date: lastOrderDate,
                };
            })
        );

        setCustomers(customersWithStats);

        // Calculate statistics
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const newThisMonth = customersWithStats.filter(
            (c) => new Date(c.created_at) >= firstDayOfMonth
        ).length;

        const activeCustomers = customersWithStats.filter((c) => c.total_orders > 0).length;

        const totalRevenue = customersWithStats.reduce((sum, c) => sum + c.total_spent, 0);
        const totalOrders = customersWithStats.reduce((sum, c) => sum + c.total_orders, 0);
        const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

        setStats({
            totalCustomers: customersWithStats.length,
            newThisMonth,
            activeCustomers,
            averageOrderValue,
        });

        setLoading(false);
    }

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
        });
    };

    const getCustomerStatus = (customer: Customer) => {
        if (customer.total_orders === 0) {
            return { label: 'New', color: 'bg-blue-100 text-blue-800' };
        }

        if (!customer.last_order_date) {
            return { label: 'Inactive', color: 'bg-gray-100 text-gray-800' };
        }

        const daysSinceLastOrder = Math.floor(
            (new Date().getTime() - new Date(customer.last_order_date).getTime()) / (1000 * 60 * 60 * 24)
        );

        if (daysSinceLastOrder <= 30) {
            return { label: 'Active', color: 'bg-green-100 text-green-800' };
        } else if (daysSinceLastOrder <= 90) {
            return { label: 'Regular', color: 'bg-yellow-100 text-yellow-800' };
        } else {
            return { label: 'Inactive', color: 'bg-gray-100 text-gray-800' };
        }
    };

    const filteredCustomers = customers.filter((customer) => {
        const searchLower = searchTerm.toLowerCase();
        return (
            customer.full_name.toLowerCase().includes(searchLower) ||
            customer.email.toLowerCase().includes(searchLower) ||
            (customer.phone && customer.phone.toLowerCase().includes(searchLower))
        );
    });

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
                <div className="flex items-center gap-2 text-sm text-textSecondary">
                    <Users className="w-4 h-4" />
                    <span>{filteredCustomers.length} customers</span>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-textSecondary">Total Customers</p>
                            <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalCustomers}</p>
                        </div>
                        <div className="p-3 bg-purple-100 rounded-lg">
                            <Users className="w-6 h-6 text-purple-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-textSecondary">New This Month</p>
                            <p className="text-3xl font-bold text-gray-900 mt-1">{stats.newThisMonth}</p>
                        </div>
                        <div className="p-3 bg-blue-100 rounded-lg">
                            <Calendar className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-textSecondary">Active Customers</p>
                            <p className="text-3xl font-bold text-gray-900 mt-1">{stats.activeCustomers}</p>
                        </div>
                        <div className="p-3 bg-green-100 rounded-lg">
                            <ShoppingBag className="w-6 h-6 text-green-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-textSecondary">Avg Order Value</p>
                            <p className="text-3xl font-bold text-gray-900 mt-1">
                                {formatPrice(stats.averageOrderValue)}
                            </p>
                        </div>
                        <div className="p-3 bg-amber-100 rounded-lg">
                            <DollarSign className="w-6 h-6 text-amber-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Search */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search customers by name, email, or phone..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    />
                </div>
            </div>

            {/* Customers Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
                    </div>
                ) : filteredCustomers.length === 0 ? (
                    <div className="text-center py-12">
                        <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">No customers found</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Customer
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Contact
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Registered
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Orders
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Total Spent
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Last Order
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredCustomers.map((customer) => {
                                    const status = getCustomerStatus(customer);
                                    return (
                                        <tr
                                            key={customer.id}
                                            onClick={() => router.push(`/admin/customers/${customer.id}`)}
                                            className="hover:bg-amber-50/60 cursor-pointer transition-colors"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-gray-900">{customer.full_name}</div>
                                                <div className="text-xs text-amber-700 mt-0.5">Measurements →</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-900">{customer.email}</div>
                                                {customer.phone && (
                                                    <div className="text-sm text-gray-500">{customer.phone}</div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {formatDate(customer.created_at)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                    {customer.total_orders} orders
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-gray-900 font-medium">
                                                {formatPrice(customer.total_spent)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {customer.last_order_date
                                                    ? formatDate(customer.last_order_date)
                                                    : 'Never'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${status.color}`}>
                                                    {status.label}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
