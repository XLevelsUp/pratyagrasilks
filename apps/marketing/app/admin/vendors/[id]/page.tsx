'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    ArrowLeft,
    Building2,
    Package,
    PackagePlus,
    Pencil,
    Phone,
    User,
    FileText,
    X,
    ExternalLink,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { getVendorById, VendorType } from '@/lib/actions/vendor.actions';
import { getProductsByVendor, VendorProduct } from '@/lib/actions/product.actions';
import { getVendorDocSignedUrl } from '@/lib/supabase/storage-utils';
import { Vendor } from '@/lib/types';
import { useAdmin } from '@/lib/hooks/useAdmin';

const TYPE_STYLES: Record<VendorType, string> = {
    Artisan:    'bg-amber-100 text-amber-800',
    City:       'bg-blue-100 text-blue-800',
    Wholesaler: 'bg-purple-100 text-purple-800',
};

const formatPrice = (price: number) =>
    new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    }).format(price);

export default function VendorDetailPage() {
    const { id: vendorId } = useParams<{ id: string }>();
    const router = useRouter();
    const { isAdmin } = useAdmin();

    const [vendor, setVendor]               = useState<Vendor | null>(null);
    const [products, setProducts]           = useState<VendorProduct[]>([]);
    const [docSignedUrls, setDocSignedUrls] = useState<string[]>([]);
    const [vendorLoading, setVendorLoading] = useState(true);
    const [productsLoading, setProductsLoading] = useState(true);
    const [docsLoading, setDocsLoading]     = useState(false);
    const [lightboxUrl, setLightboxUrl]     = useState<string | null>(null);

    // ── Vendor + signed doc URLs ─────────────────────────────────────────────
    useEffect(() => {
        (async () => {
            const data = await getVendorById(vendorId);
            if (!data) { router.push('/admin/vendors'); return; }
            setVendor(data);
            setVendorLoading(false);

            if (data.documentUrls.length > 0) {
                setDocsLoading(true);
                // allSettled — a single bad path won't block the others
                const results = await Promise.allSettled(
                    data.documentUrls.map((path) => getVendorDocSignedUrl(path, 3600))
                );
                setDocSignedUrls(
                    results
                        .filter((r): r is PromiseFulfilledResult<string> => r.status === 'fulfilled')
                        .map((r) => r.value)
                );
                setDocsLoading(false);
            }
        })();
    }, [vendorId, router]);

    // ── Products ─────────────────────────────────────────────────────────────
    useEffect(() => {
        (async () => {
            const data = await getProductsByVendor(vendorId);
            setProducts(data);
            setProductsLoading(false);
        })();
    }, [vendorId]);

    // ── Escape key closes lightbox ───────────────────────────────────────────
    useEffect(() => {
        if (!lightboxUrl) return;
        const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setLightboxUrl(null); };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [lightboxUrl]);

    // ── Guards ───────────────────────────────────────────────────────────────
    if (vendorLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600" />
            </div>
        );
    }
    if (!vendor) return null;

    const vendorType = (vendor.metadata?.type as VendorType) ?? null;
    const gst        = (vendor.metadata?.gst  as string)     ?? null;
    const notes      = (vendor.metadata?.notes as string)    ?? null;

    return (
        <>
        <div>
            {/* ── Header ──────────────────────────────────────────────────── */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <Link href="/admin/vendors" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">{vendor.name}</h1>
                        {vendorType && (
                            <span className={`mt-1 inline-block px-2.5 py-1 rounded-full text-xs font-medium ${TYPE_STYLES[vendorType]}`}>
                                {vendorType}
                            </span>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {isAdmin && (
                        <Link
                            href={`/admin/vendors/${vendorId}/edit`}
                            className="flex items-center gap-2 px-4 py-2 border-2 border-amber-600 text-amber-700 rounded-lg font-medium hover:bg-amber-50 transition-colors"
                        >
                            <Pencil className="w-4 h-4" />
                            Edit Vendor
                        </Link>
                    )}
                    <Link
                        href={`/admin/products/new?vendorId=${vendorId}`}
                        className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700 transition-colors"
                    >
                        <PackagePlus className="w-5 h-5" />
                        Add New Saree
                    </Link>
                </div>
            </div>

            {/* ── Vendor Info Card ─────────────────────────────────────────── */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Vendor Information</h2>
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                    {vendor.address && (
                        <div>
                            <dt className="text-xs text-gray-500 uppercase tracking-wider">Address</dt>
                            <dd className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">{vendor.address}</dd>
                        </div>
                    )}
                    {vendor.contactPerson && (
                        <div>
                            <dt className="text-xs text-gray-500 uppercase tracking-wider flex items-center gap-1">
                                <User className="w-3 h-3" /> Contact Person
                            </dt>
                            <dd className="mt-1 text-sm text-gray-900">{vendor.contactPerson}</dd>
                        </div>
                    )}
                    {vendor.phone && (
                        <div>
                            <dt className="text-xs text-gray-500 uppercase tracking-wider flex items-center gap-1">
                                <Phone className="w-3 h-3" /> Phone
                            </dt>
                            <dd className="mt-1 text-sm text-gray-900">{vendor.phone}</dd>
                        </div>
                    )}
                    {gst && (
                        <div>
                            <dt className="text-xs text-gray-500 uppercase tracking-wider">GST Number</dt>
                            <dd className="mt-1 text-sm font-mono text-gray-900">{gst}</dd>
                        </div>
                    )}
                    {notes && (
                        <div className="md:col-span-2">
                            <dt className="text-xs text-gray-500 uppercase tracking-wider">Internal Notes</dt>
                            <dd className="mt-1 text-sm text-gray-700 whitespace-pre-wrap">{notes}</dd>
                        </div>
                    )}
                </dl>

                {/* ── Document Gallery ──────────────────────────────────────── */}
                {vendor.documentUrls.length > 0 && (
                    <div className="mt-6 pt-6 border-t border-gray-100">
                        <dt className="text-xs text-gray-500 uppercase tracking-wider flex items-center gap-1 mb-3">
                            <FileText className="w-3 h-3" />
                            Documents ({vendor.documentUrls.length})
                        </dt>

                        {docsLoading ? (
                            <div className="flex items-center gap-2 text-sm text-gray-400">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-amber-600" />
                                Loading documents…
                            </div>
                        ) : (
                            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                                {docSignedUrls.map((url, index) => (
                                    <button
                                        key={index}
                                        type="button"
                                        onClick={() => setLightboxUrl(url)}
                                        className="relative group aspect-square rounded-lg overflow-hidden bg-gray-100 border border-gray-200 hover:border-amber-400 hover:shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-amber-500"
                                        title="Click to view"
                                    >
                                        <Image
                                            src={url}
                                            alt={`Document ${index + 1}`}
                                            fill
                                            className="object-cover"
                                            sizes="96px"
                                            unoptimized
                                        />
                                        {/* Number badge */}
                                        <span className="absolute top-1 left-1 bg-black/50 text-white text-[10px] font-bold rounded px-1 leading-4">
                                            {index + 1}
                                        </span>
                                        {/* Zoom hint */}
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                            <ExternalLink className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow" />
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* ── Products Table ───────────────────────────────────────────── */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">Sarees from this Vendor</h2>
                    {!productsLoading && (
                        <span className="text-sm text-gray-500">
                            {products.length} product{products.length !== 1 ? 's' : ''}
                        </span>
                    )}
                </div>

                {productsLoading ? (
                    <div className="flex items-center justify-center h-48">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-600" />
                    </div>
                ) : products.length === 0 ? (
                    <div className="text-center py-16">
                        <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 mb-4">No sarees linked to this vendor yet.</p>
                        <Link
                            href={`/admin/products/new?vendorId=${vendorId}`}
                            className="inline-block text-amber-600 hover:text-amber-700 font-medium"
                        >
                            Add the first saree for {vendor.name}
                        </Link>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {products.map((product) => (
                                    <tr key={product.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="relative w-12 h-12 flex-shrink-0 rounded-md overflow-hidden bg-gray-100">
                                                    {product.thumbnail ? (
                                                        <Image src={product.thumbnail} alt={product.name} fill className="object-cover" sizes="48px" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center">
                                                            <Package className="w-6 h-6 text-gray-400" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <Link href={`/admin/products/${product.id}`} className="font-medium text-gray-900 hover:text-amber-600 transition-colors line-clamp-1">
                                                        {product.name}
                                                    </Link>
                                                    <p className="text-xs text-gray-400">{product.sku}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                {product.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                                            {formatPrice(product.price)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${product.inStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                {product.inStock ? 'In Stock' : 'Sold Out'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>

        {/* ── Lightbox ──────────────────────────────────────────────────────── */}
        {lightboxUrl && (
            <div
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
                onClick={() => setLightboxUrl(null)}
            >
                {/* Stop click-through on the image itself */}
                <div
                    className="relative max-w-3xl w-full max-h-[90vh] flex items-center justify-center"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={lightboxUrl}
                        alt="Vendor document"
                        className="max-w-full max-h-[85vh] rounded-lg shadow-2xl object-contain"
                    />

                    {/* Close */}
                    <button
                        type="button"
                        onClick={() => setLightboxUrl(null)}
                        className="absolute -top-3 -right-3 bg-white rounded-full p-1.5 shadow-lg hover:bg-gray-100 transition-colors"
                        aria-label="Close"
                    >
                        <X className="w-5 h-5 text-gray-700" />
                    </button>

                    {/* Open in new tab */}
                    <a
                        href={lightboxUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="absolute -top-3 -right-12 bg-white rounded-full p-1.5 shadow-lg hover:bg-gray-100 transition-colors"
                        aria-label="Open full size"
                    >
                        <ExternalLink className="w-5 h-5 text-gray-700" />
                    </a>
                </div>
            </div>
        )}
        </>
    );
}
