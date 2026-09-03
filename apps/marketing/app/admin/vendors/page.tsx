'use client';

import { useEffect, useState } from 'react';
import { Plus, Search, Building2, PackagePlus, Edit, Phone, User, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { getVendors, deleteVendor, VendorType } from '@/lib/actions/vendor.actions';
import { Vendor } from '@/lib/types';
import { useAdmin } from '@/lib/hooks/useAdmin';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import toast from 'react-hot-toast';

const TYPE_STYLES: Record<VendorType, string> = {
    Artisan:    'bg-amber-100 text-amber-800',
    City:       'bg-blue-100 text-blue-800',
    Wholesaler: 'bg-purple-100 text-purple-800',
};

export default function VendorsPage() {
    const { isAdmin } = useAdmin();
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [vendorToDelete, setVendorToDelete] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            try {
                const data = await getVendors();
                setVendors(data);
            } catch (err) {
                console.error('Failed to load vendors:', err);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const handleDelete = (id: string) => {
        setVendorToDelete(id);
        setDeleteConfirmOpen(true);
    };

    const confirmDelete = async () => {
        if (!vendorToDelete) return;
        try {
            await deleteVendor(vendorToDelete);
            setVendors((prev) => prev.filter((v) => v.id !== vendorToDelete));
            toast.success('Vendor deleted');
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed to delete vendor');
        }
        setVendorToDelete(null);
    };

    const filtered = vendors.filter((v) => {
        const q = search.toLowerCase();
        return (
            v.name.toLowerCase().includes(q) ||
            (v.contactPerson ?? '').toLowerCase().includes(q) ||
            (v.phone ?? '').includes(q)
        );
    });

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Vendors</h1>
                <Link
                    href="/admin/vendors/new"
                    className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700 transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    Add Vendor
                </Link>
            </div>

            {/* Search */}
            <div className="bg-white rounded-lg shadow p-4 mb-6">
                <div className="relative max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by name, contact, phone…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600" />
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-16">
                        <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 mb-4">
                            {search ? 'No vendors match your search.' : 'No vendors yet.'}
                        </p>
                        {!search && (
                            <Link
                                href="/admin/vendors/new"
                                className="inline-block text-amber-600 hover:text-amber-700 font-medium"
                            >
                                Add your first vendor
                            </Link>
                        )}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Vendor
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Type
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Contact
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Docs
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filtered.map((vendor) => {
                                    const vendorType = (vendor.metadata?.type as VendorType) ?? null;
                                    return (
                                        <tr key={vendor.id} className="hover:bg-gray-50">
                                            {/* Vendor name + address */}
                                            <td className="px-6 py-4">
                                                <Link href={`/admin/vendors/${vendor.id}/edit`}>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                                                        <Building2 className="w-4 h-4 text-amber-700" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900">{vendor.name}</p>
                                                        {vendor.address && (
                                                            <p className="text-xs text-gray-400 truncate max-w-[200px]">
                                                                {vendor.address}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                                </Link>
                                            </td>

                                            {/* Type badge */}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {vendorType ? (
                                                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${TYPE_STYLES[vendorType]}`}>
                                                        {vendorType}
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-400 text-xs">—</span>
                                                )}
                                            </td>

                                            {/* Contact person + phone */}
                                            <td className="px-6 py-4">
                                                <div className="space-y-0.5">
                                                    {vendor.contactPerson && (
                                                        <div className="flex items-center gap-1.5 text-sm text-gray-700">
                                                            <User className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                                                            {vendor.contactPerson}
                                                        </div>
                                                    )}
                                                    {vendor.phone && (
                                                        <div className="flex items-center gap-1.5 text-sm text-gray-500">
                                                            <Phone className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                                                            {vendor.phone}
                                                        </div>
                                                    )}
                                                    {!vendor.contactPerson && !vendor.phone && (
                                                        <span className="text-gray-400 text-xs">No contact</span>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Doc count */}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-sm text-gray-600">
                                                    {vendor.documentUrls.length > 0
                                                        ? `${vendor.documentUrls.length} file${vendor.documentUrls.length !== 1 ? 's' : ''}`
                                                        : <span className="text-gray-400 text-xs">None</span>
                                                    }
                                                </span>
                                            </td>

                                            {/* Actions */}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    <Link
                                                        href={`/admin/vendors/${vendor.id}/edit`}
                                                        className="text-amber-600 hover:text-amber-700"
                                                        title="Edit vendor"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </Link>
                                                    <Link
                                                        href={`/admin/products/new?vendorId=${vendor.id}`}
                                                        className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-amber-50 hover:text-amber-700 text-gray-600 rounded-lg text-xs font-medium transition-colors"
                                                        title="Add a product for this vendor"
                                                    >
                                                        <PackagePlus className="w-3.5 h-3.5" />
                                                        Add Product
                                                    </Link>
                                                    {isAdmin && (
                                                        <button
                                                            onClick={() => handleDelete(vendor.id)}
                                                            className="text-red-600 hover:text-red-700"
                                                            title="Delete vendor"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                isOpen={deleteConfirmOpen}
                onClose={() => setDeleteConfirmOpen(false)}
                onConfirm={confirmDelete}
                title="Delete Vendor"
                message="Are you sure you want to delete this vendor? This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
                variant="danger"
            />

            {/* Summary strip */}
            {!loading && vendors.length > 0 && (
                <div className="mt-4 grid grid-cols-3 gap-4">
                    {(['Artisan', 'City', 'Wholesaler'] as VendorType[]).map((type) => {
                        const count = vendors.filter(
                            (v) => (v.metadata?.type as VendorType) === type
                        ).length;
                        return (
                            <div key={type} className="bg-white rounded-lg shadow p-4">
                                <p className="text-sm text-gray-500">{type} Vendors</p>
                                <p className={`text-2xl font-bold ${
                                    type === 'Artisan' ? 'text-amber-700' :
                                    type === 'City' ? 'text-blue-700' :
                                    'text-purple-700'
                                }`}>
                                    {count}
                                </p>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
