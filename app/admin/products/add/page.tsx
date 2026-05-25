'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import OptimizedUploader from '@/components/admin/OptimizedUploader';
import { silkCategories } from '@/lib/seo-config';

const categories = silkCategories.map(c => ({ value: c.slug, label: c.name }));

export default function AddProductPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [productImages, setProductImages] = useState<string[]>([]);
    const [formData, setFormData] = useState({
        name: '',
        sku: '',
        price: '',
        stock_quantity: 1,
        category: 'kanjivaram-silk',
        material: '',
        description: '',
        dimensions: '',
        weight: '',
    });

    const handleImagesChange = (urls: string[]) => {
        setProductImages(urls);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (productImages.length === 0) {
            toast.error('Please upload at least one product image');
            return;
        }

        setLoading(true);

        try {
            const supabase = createClient();

            const { data, error } = await supabase
                .from('products')
                .insert({
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
                })
                .select()
                .single();

            if (error) {
                console.error('Error creating product:', error);
                toast.error('Failed to create product: ' + error.message);
            } else {
                toast.success('Product created successfully!');
                router.push('/admin/products');
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error('Failed to create product');
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
    };

    return (
        <div>
            <div className="flex items-center gap-4 mb-8">
                <Link
                    href="/admin/products"
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <h1 className="text-3xl font-bold text-gray-900">Add New Product</h1>
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

                    {/* Price */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Price (₹) *
                        </label>
                        <input
                            type="number"
                            name="price"
                            value={formData.price}
                            onChange={handleChange}
                            required
                            min="0"
                            step="1"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                            placeholder="e.g., 15000"
                        />
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

                    {/* Optimized Image Uploader */}
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
                </div>

                {/* Actions */}
                <div className="mt-6 flex items-center gap-4">
                    <button
                        type="submit"
                        disabled={loading || productImages.length === 0}
                        className="flex items-center gap-2 px-6 py-3 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        <Save className="w-5 h-5 hidden sm:block" />
                        {loading ? 'Creating...' : 'Create Product'}
                    </button>
                    <Link
                        href="/admin/products"
                        className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </Link>
                </div>
            </form>
        </div>
    );
}
