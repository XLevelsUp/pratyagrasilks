import Link from 'next/link';
import type { BottleneckOrder } from '@/lib/actions/analytics.actions';
import EmptyState from './EmptyState';
import { PackageCheck } from 'lucide-react';

interface FulfillmentBottlenecksProps {
    data: BottleneckOrder[];
}

function getStatusColor(status: string): string {
    switch (status) {
        case 'processing':
            return 'bg-yellow-100 text-yellow-800';
        case 'pending':
        default:
            return 'bg-gray-100 text-gray-800';
    }
}

export default function FulfillmentBottlenecks({ data }: FulfillmentBottlenecksProps) {
    if (data.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">Fulfillment Bottlenecks</h2>
                </div>
                <EmptyState
                    icon={PackageCheck}
                    title="Nothing stuck"
                    message="No orders have been pending or processing for 3+ days."
                />
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Fulfillment Bottlenecks</h2>
                <p className="text-sm text-gray-500 mt-0.5">Orders pending or processing for 3+ days</p>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Days Stuck</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {data.map((order) => (
                            <tr key={order.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <Link href={`/admin/orders/${order.id}`} className="text-amber-600 hover:text-amber-700 font-medium">
                                        #{order.orderNumber}
                                    </Link>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-gray-900 font-medium">
                                    {order.daysInStatus} {order.daysInStatus === 1 ? 'day' : 'days'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
