'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { ArrowLeft, Save, Youtube, Calculator } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import OptimizedUploader from '@/components/admin/OptimizedUploader';
import ColorFamilyPicker from '@/components/ui/ColorFamilyPicker';
import QrLabel from '@/components/admin/QrLabel';
import { isValidYouTubeUrl, getYouTubeThumbnailUrl } from '@/lib/utils/youtube';
import { calculateMrp } from '@/lib/utils/pricing';
import Image from 'next/image';
import { getVendors } from '@/lib/actions/vendor.actions';
import { Vendor } from '@/lib/types';
import { useAdmin } from '@/lib/hooks/useAdmin';
import { updateProduct } from '@/lib/actions/product.actions';
import { silkCategories } from '@/lib/seo-config';

const categories = silkCategories.map(c => ({ value: c.slug, label: c.name }));

export default function EditProductPage() {
    const router = useRouter();
    const params = useParams();
    const productId = params.id as string;
    const { role } = useAdmin();

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [productImages, setProductImages] = useState<string[]>([]);
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [vendorsLoading, setVendorsLoading] = useState(true);
    const [formData, setFormData] = useState({
        name: '',
        sku: '',
        price: '',
        stock_quantity: '',
        category: 'kanjivaram-silk',
        material: '',
        description: '',
        dimensions: '',
        weight: '',
        yt_link: '',
        is_online: true,
        color_families: [] as string[],
        vendorId: '',
        purchase_price: '',
        purchase_tax_percent: '5',
        profit_margin_percent: '30',
        selling_tax_percent: '5',
        is_price_overridden: false,
    });
    const [ytLinkError, setYtLinkError] = useState('');

    useEffect(() => {
        fetchProduct();
    }, [productId]);

    useEffect(() => {
        (async () => {
            try {
                const data = await getVendors();
                setVendors(data);
            } catch (err) {
                console.error('Failed to load vendors:', err);
            } finally {
                setVendorsLoading(false);
            }
        })();
    }, []);

    async function fetchProduct() {
        const supabase = createClient();
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('id', productId)
            .single();

        if (error) {
            console.error('Error fetching product:', error);
            toast.error('Failed to load product');
            router.push('/admin/products');
        } else if (data) {
            setFormData({
                name: data.name || '',
                sku: data.sku || '',
                price: data.price?.toString() || '',
                stock_quantity: data.stock_quantity?.toString() || '',
                category: data.category || 'kanjivaram-silk',
                material: data.material || '',
                description: data.description || '',
                dimensions: data.dimensions || '',
                weight: data.weight || '',
                yt_link: data.yt_link || '',
                is_online: data.is_online ?? true,
                color_families: data.color_families ?? [],
                vendorId: data.vendor_id || '',
                purchase_price: data.purchase_price?.toString() || '',
                purchase_tax_percent: data.purchase_tax_percent?.toString() ?? '0',
                profit_margin_percent: data.profit_margin_percent?.toString() ?? '30',
                selling_tax_percent: data.selling_tax_percent?.toString() ?? '0',
                is_price_overridden: data.is_price_overridden ?? false,
            });
            // Set product images separately
            setProductImages(Array.isArray(data.images) ? data.images : []);
        }
        setFetching(false);
    }

    // Auto-calculate MRP when procurement fields change (unless admin manually overrode price)
    useEffect(() => {
        if (formData.is_price_overridden) return;
        const pp = parseFloat(formData.purchase_price);
        if (!pp || pp <= 0) return;
        const mrp = calculateMrp(
            pp,
            parseFloat(formData.purchase_tax_percent) || 0,
            parseFloat(formData.profit_margin_percent) || 0,
            parseFloat(formData.selling_tax_percent) || 0,
        );
        setFormData(prev => ({ ...prev, price: mrp.toString() }));
    }, [formData.purchase_price, formData.purchase_tax_percent, formData.profit_margin_percent, formData.selling_tax_percent, formData.is_price_overridden]);

    const handleImagesChange = (urls: string[]) => {
        setProductImages(urls);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate YouTube link if provided
        if (formData.yt_link && !isValidYouTubeUrl(formData.yt_link)) {
            toast.error('Please enter a valid YouTube URL');
            setYtLinkError('Invalid YouTube URL');
            return;
        }

        setLoading(true);

        try {
            await updateProduct(productId, {
                name: formData.name,
                sku: formData.sku,
                price: parseFloat(formData.price),
                stock_quantity: parseInt(formData.stock_quantity.toString()),
                category: formData.category,
                material: formData.material,
                description: formData.description,
                dimensions: formData.dimensions || null,
                weight: formData.weight || null,
                images: productImages,
                yt_link: formData.yt_link || null,
                is_online: formData.is_online,
                color_families: formData.color_families,
                vendor_id: formData.vendorId || null,
                purchase_price: parseFloat(formData.purchase_price) || 0,
                purchase_tax_percent: parseFloat(formData.purchase_tax_percent) || 0,
                profit_margin_percent: parseFloat(formData.profit_margin_percent) || 0,
                selling_tax_percent: parseFloat(formData.selling_tax_percent) || 0,
                is_price_overridden: formData.is_price_overridden,
            });

            toast.success('Product updated successfully!');
            router.push('/admin/products');
        } catch (error) {
            console.error('Error:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to update product');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
        }));

        // If admin manually edits the price field, flag as overridden
        if (name === 'price') {
            setFormData(prev => ({ ...prev, is_price_overridden: true }));
        }

        // Validate YouTube link on change
        if (name === 'yt_link') {
            if (value && !isValidYouTubeUrl(value)) {
                setYtLinkError('Invalid YouTube URL');
            } else {
                setYtLinkError('');
            }
        }
    };

    if (fetching) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
            </div>
        );
    }

    return (
        <div>
            <div className="flex items-center gap-4 mb-8">
                <Link
                    href="/admin/products"
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <h1 className="text-3xl font-bold text-gray-900">Edit Product</h1>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Product Name */}
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Product Name *
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                            placeholder="e.g., Traditional Kanjivaram Silk Saree"
                        />
                    </div>

                    {/* SKU */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            SKU *
                        </label>
                        <input
                            type="text"
                            name="sku"
                            value={formData.sku}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                            placeholder="e.g., KAN-001"
                        />
                    </div>

                    {/* ── Procurement & Margin ───────────────────────── */}
                    {role === 'ADMIN' && (
                        <div className="md:col-span-2 p-4 bg-gray-50 rounded-xl border border-gray-200">
                            <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-4">
                                <Calculator className="w-4 h-4 text-amber-600" />
                                Procurement &amp; Margin
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Purchase Price (₹)</label>
                                    <input
                                        type="number" name="purchase_price" min="0" step="1"
                                        value={formData.purchase_price}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                                        placeholder="0"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Purchase Tax %</label>
                                    <input
                                        type="number" name="purchase_tax_percent" min="0" max="100" step="0.5"
                                        value={formData.purchase_tax_percent}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Margin %</label>
                                    <input
                                        type="number" name="profit_margin_percent" min="0" max="1000" step="0.5"
                                        value={formData.profit_margin_percent}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Selling Tax %</label>
                                    <input
                                        type="number" name="selling_tax_percent" min="0" max="100" step="0.5"
                                        value={formData.selling_tax_percent}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Price */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            MRP / Price (₹) *
                            {formData.is_price_overridden && (
                                <span className="ml-2 text-xs font-normal text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded">
                                    Manual override
                                </span>
                            )}
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="number"
                                name="price"
                                value={formData.price}
                                onChange={handleChange}
                                required
                                min="0"
                                step="1"
                                disabled={role === 'CASHIER'}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                                placeholder="e.g., 15000"
                            />
                            {formData.is_price_overridden && role === 'ADMIN' && (
                                <button
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, is_price_overridden: false }))}
                                    className="flex-shrink-0 px-3 py-2 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-300 rounded-lg hover:bg-amber-100 whitespace-nowrap"
                                >
                                    Reset to calculated
                                </button>
                            )}
                        </div>
                        {role === 'CASHIER' && (
                            <p className="mt-1 text-xs text-amber-600">Price modification requires Admin access.</p>
                        )}
                    </div>

                    {/* Stock Quantity */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Stock Quantity *
                        </label>
                        <input
                            type="number"
                            name="stock_quantity"
                            value={formData.stock_quantity}
                            onChange={handleChange}
                            required
                            min="0"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                            placeholder="e.g., 10"
                        />
                    </div>

                    {/* Category */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Category *
                        </label>
                        <select
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                        >
                            {categories.map((cat) => (
                                <option key={cat.value} value={cat.value}>
                                    {cat.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Color Family */}
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Color Family
                        </label>
                        <ColorFamilyPicker
                            value={formData.color_families}
                            onChange={(ids) => setFormData(prev => ({ ...prev, color_families: ids }))}
                        />
                    </div>

                    {/* Vendor */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Vendor
                        </label>
                        <select
                            name="vendorId"
                            value={formData.vendorId}
                            onChange={handleChange}
                            disabled={vendorsLoading}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 disabled:bg-gray-50 disabled:text-gray-400"
                        >
                            <option value="">— No vendor / Walk-in —</option>
                            {vendors.map((v) => (
                                <option key={v.id} value={v.id}>{v.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Material */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Material *
                        </label>
                        <input
                            type="text"
                            name="material"
                            value={formData.material}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                            placeholder="e.g., Pure Silk"
                        />
                    </div>

                    {/* Dimensions */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Length (Saree + Blouse)
                        </label>
                        <input
                            type="text"
                            name="dimensions"
                            value={formData.dimensions}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                            placeholder="e.g., 6.25 (5.5 Mts of saree and 70 cm Blouse)"
                        />
                    </div>

                    {/* Weight */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Weight
                        </label>
                        <input
                            type="text"
                            name="weight"
                            value={formData.weight}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                            placeholder="e.g., 800g"
                        />
                    </div>

                    {/* Description */}
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Description *
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            required
                            rows={4}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                            placeholder="Detailed product description..."
                        />
                    </div>

                    {/* YouTube Video Link */}
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <Youtube className="w-4 h-4 inline mr-1" />
                            YouTube Video Link (Optional)
                        </label>
                        <input
                            type="text"
                            name="yt_link"
                            value={formData.yt_link}
                            onChange={handleChange}
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 ${ytLinkError ? 'border-red-500' : 'border-gray-300'
                                }`}
                            placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
                        />
                        {ytLinkError && (
                            <p className="mt-1 text-sm text-red-600">{ytLinkError}</p>
                        )}
                        {formData.yt_link && !ytLinkError && getYouTubeThumbnailUrl(formData.yt_link) && (
                            <div className="mt-3">
                                <p className="text-xs text-gray-600 mb-2">Video Preview:</p>
                                <div className="relative w-48 h-36 rounded-lg overflow-hidden border-2 border-gray-200">
                                    <Image
                                        src={getYouTubeThumbnailUrl(formData.yt_link) || ''}
                                        alt="YouTube thumbnail"
                                        fill
                                        className="object-cover"
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                                        <Youtube className="w-12 h-12 text-white opacity-80" />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Product Images */}
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Product Images *
                        </label>
                        <OptimizedUploader
                            onImagesChange={handleImagesChange}
                            existingImages={productImages}
                            maxImages={10}
                        />
                    </div>

                    {/* ── List on Website Toggle ─────────────────────── */}
                    <div className="md:col-span-2">
                        <div className={`flex items-start gap-4 p-5 rounded-xl border-2 transition-all duration-200 ${
                            formData.is_online
                                ? 'border-primary bg-primary-50'
                                : 'border-gray-200 bg-gray-50'
                        }`}>
                            <button
                                type="button"
                                id="toggle-is-online-edit"
                                role="switch"
                                aria-checked={formData.is_online}
                                onClick={() =>
                                    setFormData((prev) => ({ ...prev, is_online: !prev.is_online }))
                                }
                                className={`relative inline-flex h-7 w-14 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                                    formData.is_online ? 'bg-primary' : 'bg-gray-300'
                                }`}
                            >
                                <span
                                    className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                                        formData.is_online ? 'translate-x-7' : 'translate-x-0'
                                    }`}
                                />
                            </button>
                            <div className="flex flex-col">
                                <span className={`text-sm font-semibold ${
                                    formData.is_online ? 'text-primary' : 'text-gray-600'
                                }`}>
                                    {formData.is_online ? '🌐 Listed on Website' : '🏪 Physical Store Only (POS)'}
                                </span>
                                <span className="text-xs text-gray-500 mt-0.5">
                                    {formData.is_online
                                        ? 'This saree will appear in the public online catalog.'
                                        : 'This saree is hidden from the website. Use barcode label for in-store billing.'}
                                </span>
                            </div>
                        </div>
                    </div>


                </div>

                {/* Actions */}
                <div className="mt-6 flex items-center gap-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center gap-2 px-6 py-3 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700 transition-colors disabled:bg-gray-400"
                    >
                        <Save className="w-5 h-5" />
                        {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                    <Link
                        href="/admin/products"
                        className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </Link>
                </div>
            </form>

            {!formData.is_online && formData.sku && (
                <div className="mt-8 bg-white rounded-lg shadow p-6 print:m-0 print:p-0 print:shadow-none bg-amber-50 border border-amber-200">
                    <h2 className="text-xl font-bold font-playfair text-gray-900 mb-2 print:hidden">Print POS Label</h2>
                    <p className="text-sm text-gray-600 mb-6 print:hidden">
                        Since this saree is marked for <strong>Physical Store Only</strong>, you can print a QR label for it.
                    </p>
                    <QrLabel
                        productName={formData.name}
                        sku={formData.sku}
                        price={Number(formData.price) || 0}
                    />
                </div>
            )}
        </div>
    );
}
