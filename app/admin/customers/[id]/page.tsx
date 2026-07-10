'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { ArrowLeft, Loader2, Mail, Phone, Ruler } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useAdmin } from '@/lib/hooks/useAdmin';
import MeasurementProfileForm from '@/components/admin/measurements/MeasurementProfileForm';
import CustomerProfilesList from '@/components/admin/measurements/CustomerProfilesList';
import { getMeasurementProfiles } from '@/lib/actions/measurement.actions';
import { MeasurementProfile } from '@/lib/validations/measurement.schema';

interface CustomerRow {
    id: string;
    full_name: string;
    email: string | null;
    phone: string | null;
    source: string | null;
    total_orders: number | null;
    total_spent: number | null;
    created_at: string;
}

export default function CustomerDetailPage() {
    const params = useParams();
    const customerId = params.id as string;
    const { isAdmin, loading: roleLoading } = useAdmin();

    const [customer, setCustomer] = useState<CustomerRow | null>(null);
    const [profiles, setProfiles] = useState<MeasurementProfile[]>([]);
    const [loading, setLoading] = useState(true);
    /** null = form closed; 'new' = create; profile = edit */
    const [formState, setFormState] = useState<'new' | MeasurementProfile | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const supabase = createClient();
            const [{ data: customerData, error }, profilesResult] = await Promise.all([
                supabase
                    .from('customers')
                    .select('id, full_name, email, phone, source, total_orders, total_spent, created_at')
                    .eq('id', customerId)
                    .single(),
                getMeasurementProfiles(customerId),
            ]);

            if (error || !customerData) {
                toast.error('Customer not found');
            } else {
                setCustomer(customerData as CustomerRow);
            }
            if (profilesResult.success && profilesResult.profiles) {
                setProfiles(profilesResult.profiles);
            } else if (profilesResult.error) {
                toast.error(profilesResult.error);
            }
        } finally {
            setLoading(false);
        }
    }, [customerId]);

    useEffect(() => {
        if (!roleLoading) load();
    }, [roleLoading, load]);

    const handleSaved = (saved: MeasurementProfile) => {
        setProfiles((prev) => {
            const exists = prev.some((p) => p.id === saved.id);
            return exists ? prev.map((p) => (p.id === saved.id ? saved : p)) : [...prev, saved];
        });
        setFormState(null);
    };

    if (roleLoading || loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <Loader2 className="w-8 h-8 animate-spin text-amber-600" aria-hidden="true" />
            </div>
        );
    }

    if (!customer) {
        return (
            <div className="text-center py-20">
                <h1 className="text-xl font-semibold text-gray-900 mb-2">Customer not found</h1>
                <Link href="/admin/customers" className="text-amber-700 hover:underline">
                    Back to customers
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            {/* Back link */}
            <Link
                href="/admin/customers"
                className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-amber-700 transition-colors"
            >
                <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                All Customers
            </Link>

            {/* Customer header card */}
            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{customer.full_name}</h1>
                        <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-600">
                            {customer.phone && (
                                <span className="flex items-center gap-1.5">
                                    <Phone className="w-4 h-4 text-gray-400" aria-hidden="true" />
                                    {customer.phone}
                                </span>
                            )}
                            {customer.email && (
                                <span className="flex items-center gap-1.5">
                                    <Mail className="w-4 h-4 text-gray-400" aria-hidden="true" />
                                    {customer.email}
                                </span>
                            )}
                            {customer.source && (
                                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                    {customer.source}
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="flex gap-6 text-sm">
                        <div>
                            <p className="text-gray-400 text-xs uppercase tracking-wider">Orders</p>
                            <p className="text-lg font-semibold text-gray-900">{customer.total_orders ?? 0}</p>
                        </div>
                        <div>
                            <p className="text-gray-400 text-xs uppercase tracking-wider">Lifetime Value</p>
                            <p className="text-lg font-semibold text-gray-900">
                                ₹{Number(customer.total_spent ?? 0).toLocaleString('en-IN')}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Measurements section */}
            <div className="flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                    <Ruler className="w-5 h-5 text-amber-600" aria-hidden="true" />
                    Measurement Profiles
                </h2>
                {formState === null && profiles.length > 0 && (
                    <button
                        onClick={() => setFormState('new')}
                        className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 transition-colors"
                    >
                        + New Profile
                    </button>
                )}
            </div>

            {formState !== null ? (
                <MeasurementProfileForm
                    customerId={customerId}
                    profile={formState === 'new' ? undefined : formState}
                    onSaved={handleSaved}
                    onCancel={() => setFormState(null)}
                />
            ) : (
                <CustomerProfilesList
                    customerId={customerId}
                    profiles={profiles}
                    canDelete={isAdmin}
                    onEdit={(p) => setFormState(p)}
                    onDeleted={(id) => setProfiles((prev) => prev.filter((p) => p.id !== id))}
                    onAddNew={() => setFormState('new')}
                />
            )}
        </div>
    );
}
