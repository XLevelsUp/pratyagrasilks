'use client';

import { Package } from 'lucide-react';

export interface Column<T> {
    key: string;
    header: React.ReactNode;
    className?: string;
    render: (item: T) => React.ReactNode;
}

interface ResponsiveDataTableProps<T> {
    columns: Column<T>[];
    data: T[];
    keyExtractor: (item: T) => string;
    renderCard: (item: T) => React.ReactNode;
    loading?: boolean;
    emptyState?: React.ReactNode;
}

export default function ResponsiveDataTable<T>({
    columns,
    data,
    keyExtractor,
    renderCard,
    loading = false,
    emptyState,
}: ResponsiveDataTableProps<T>) {
    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600" />
            </div>
        );
    }

    if (data.length === 0) {
        return (
            <div className="text-center py-12">
                {emptyState ?? (
                    <>
                        <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">No items found</p>
                    </>
                )}
            </div>
        );
    }

    return (
        <>
            {/* Desktop table (lg+) */}
            <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            {columns.map((col) => (
                                <th
                                    key={col.key}
                                    className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${col.className ?? ''}`}
                                >
                                    {col.header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {data.map((item) => (
                            <tr key={keyExtractor(item)} className="hover:bg-gray-50">
                                {columns.map((col) => (
                                    <td
                                        key={col.key}
                                        className={`px-6 py-4 ${col.className ?? ''}`}
                                    >
                                        {col.render(item)}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile card stack (<lg) */}
            <div className="lg:hidden divide-y divide-gray-100">
                {data.map((item) => (
                    <div key={keyExtractor(item)}>
                        {renderCard(item)}
                    </div>
                ))}
            </div>
        </>
    );
}
