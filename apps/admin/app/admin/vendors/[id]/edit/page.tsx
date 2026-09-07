import { getVendorById } from '@/lib/actions/vendor.actions';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import VendorForm from '@/components/admin/VendorForm';

interface EditVendorPageProps {
    params: { id: string };
}

export default async function EditVendorPage({ params }: EditVendorPageProps) {
    const vendor = await getVendorById(params.id);
    if (!vendor) redirect('/admin/vendors');

    return (
        <div>
            <div className="flex items-center gap-4 mb-8">
                <Link
                    href={`/admin/vendors/${params.id}`}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Edit Vendor</h1>
                    <p className="text-sm text-gray-500 mt-0.5">{vendor.name}</p>
                </div>
            </div>

            <VendorForm initialData={vendor} />
        </div>
    );
}
