import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import VendorForm from '@/components/admin/VendorForm';

export default function NewVendorPage() {
    return (
        <div>
            <div className="flex items-center gap-4 mb-8">
                <Link
                    href="/admin/vendors"
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <h1 className="text-3xl font-bold text-gray-900">Add New Vendor</h1>
            </div>

            <VendorForm />
        </div>
    );
}
