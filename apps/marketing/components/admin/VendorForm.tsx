'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import VendorDocUploader from '@/components/admin/VendorDocUploader';
import { createVendor, updateVendor, VendorType } from '@/lib/actions/vendor.actions';
import { Vendor } from '@/lib/types';

const VENDOR_TYPES: { value: VendorType; label: string }[] = [
    { value: 'Artisan',    label: 'Artisan (Direct weaver / craftsperson)' },
    { value: 'City',       label: 'City Supplier (Local city dealer)'       },
    { value: 'Wholesaler', label: 'Wholesaler (Bulk distributor)'           },
];

interface FormState {
    name: string;
    vendorType: VendorType;
    contactPerson: string;
    phone: string;
    address: string;
    gst: string;
    notes: string;
}

interface VendorFormProps {
    initialData?: Vendor;
}

export default function VendorForm({ initialData }: VendorFormProps) {
    const router = useRouter();
    const isEdit = !!initialData;

    const [loading, setLoading] = useState(false);
    const [documentPaths, setDocumentPaths] = useState<string[]>(
        initialData?.documentUrls ?? []
    );
    const [form, setForm] = useState<FormState>({
        name:          initialData?.name ?? '',
        vendorType:    (initialData?.metadata?.type as VendorType) ?? 'Artisan',
        contactPerson: initialData?.contactPerson ?? '',
        phone:         initialData?.phone ?? '',
        address:       initialData?.address ?? '',
        gst:           (initialData?.metadata?.gst  as string) ?? '',
        notes:         (initialData?.metadata?.notes as string) ?? '',
    });

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name.trim()) {
            toast.error('Vendor name is required.');
            return;
        }

        setLoading(true);
        try {
            const payload = {
                name:          form.name.trim(),
                vendorType:    form.vendorType,
                contactPerson: form.contactPerson.trim() || null,
                phone:         form.phone.trim() || null,
                address:       form.address.trim() || null,
                documentPaths,
                gst:           form.gst.trim() || null,
                notes:         form.notes.trim() || null,
            };

            if (isEdit) {
                await updateVendor(initialData!.id, payload);
                toast.success('Vendor updated successfully!');
                router.push(`/admin/vendors/${initialData!.id}`);
            } else {
                await createVendor(payload);
                toast.success('Vendor created successfully!');
                router.push('/admin/vendors');
            }
        } catch (err) {
            console.error(err);
            toast.error(err instanceof Error ? err.message : isEdit ? 'Failed to update vendor.' : 'Failed to create vendor.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Vendor Name */}
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Vendor / Business Name *
                    </label>
                    <input
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                        placeholder="e.g., Ramesh Silk Weavers"
                    />
                </div>

                {/* Vendor Type */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Vendor Type *
                    </label>
                    <select
                        name="vendorType"
                        value={form.vendorType}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    >
                        {VENDOR_TYPES.map((t) => (
                            <option key={t.value} value={t.value}>{t.label}</option>
                        ))}
                    </select>
                </div>

                {/* GST Number */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        GST Number
                    </label>
                    <input
                        type="text"
                        name="gst"
                        value={form.gst}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                        placeholder="e.g., 29ABCDE1234F1Z5"
                    />
                </div>

                {/* Contact Person */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Contact Person
                    </label>
                    <input
                        type="text"
                        name="contactPerson"
                        value={form.contactPerson}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                        placeholder="e.g., Ramesh Kumar"
                    />
                </div>

                {/* Phone */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                    </label>
                    <input
                        type="tel"
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                        placeholder="e.g., +91 98765 43210"
                    />
                </div>

                {/* Address */}
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Address
                    </label>
                    <textarea
                        name="address"
                        value={form.address}
                        onChange={handleChange}
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                        placeholder="Full address of the vendor"
                    />
                </div>

                {/* Internal Notes */}
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Internal Notes
                    </label>
                    <textarea
                        name="notes"
                        value={form.notes}
                        onChange={handleChange}
                        rows={2}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                        placeholder="Payment terms, quality notes, reminders…"
                    />
                </div>

                {/* Document Uploader */}
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Vendor Documents
                        <span className="ml-2 text-xs text-gray-400 font-normal">
                            Bills, business cards, KYC photos (up to 5)
                        </span>
                    </label>
                    <VendorDocUploader
                        onPathsChange={setDocumentPaths}
                        existingPaths={initialData?.documentUrls ?? []}
                    />
                </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex items-center gap-4">
                <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-3 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                    <Save className="w-5 h-5" />
                    {loading ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Vendor'}
                </button>
                <Link
                    href={isEdit ? `/admin/vendors/${initialData!.id}` : '/admin/vendors'}
                    className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                    Cancel
                </Link>
            </div>
        </form>
    );
}
