'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Search, Plus, Edit, Trash2, Package, Printer } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import toast from 'react-hot-toast';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { useAdmin } from '@/lib/hooks/useAdmin';
import { deleteProduct } from '@/lib/actions/product.actions';
import BulkQrWrapper from '@/components/admin/BulkQrWrapper';
import PrinterCalibration from '@/components/admin/PrinterCalibration';
import ResponsiveDataTable, { Column } from '@/components/admin/ResponsiveDataTable';

interface Product {
    id: string;
    name: string;
    sku: string;
    price: number;
    stock_quantity: number;
    category: string;
    material: string;
    images: string[];
    in_stock: boolean;
}

export default function AdminProductsPage() {
    const { isAdmin } = useAdmin();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [productToDelete, setProductToDelete] = useState<string | null>(null);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [isPrinting, setIsPrinting] = useState(false);
    const [vendors, setVendors] = useState<{ id: string; name: string }[]>([]);
    const [vendorFilter, setVendorFilter] = useState('all');
    const [stockFilter, setStockFilter] = useState('all');
    const [listingFilter, setListingFilter] = useState('all');

    useEffect(() => {
        fetchProducts();
    }, [categoryFilter, vendorFilter, stockFilter, listingFilter]);

    useEffect(() => {
        async function fetchVendors() {
            const supabase = createClient();
            const { data } = await supabase
                .from('vendors')
                .select('id, name')
                .order('name');
            if (data) setVendors(data);
        }
        fetchVendors();
    }, []);

    async function fetchProducts() {
        setLoading(true);
        const supabase = createClient();

        let query = supabase
            .from('products')
            .select('*')
            .order('created_at', { ascending: false });

        if (categoryFilter !== 'all') {
            query = query.eq('category', categoryFilter);
        }
        if (vendorFilter === 'none') {
            query = query.is('vendor_id', null);
        } else if (vendorFilter !== 'all') {
            query = query.eq('vendor_id', vendorFilter);
        }
        if (stockFilter === 'available') query = query.gt('stock_quantity', 0);
        if (stockFilter === 'sold_out')  query = query.eq('stock_quantity', 0);
        if (listingFilter === 'online')   query = query.eq('is_online', true);
        if (listingFilter === 'pos_only') query = query.eq('is_online', false);

        const { data, error } = await query;

        if (error) {
            console.error('Error fetching products:', error);
        } else {
            setProducts(data || []);
        }

        setLoading(false);
    }

    const handleDelete = async (id: string) => {
        setProductToDelete(id);
        setDeleteConfirmOpen(true);
    };

    const confirmDelete = async () => {
        if (!productToDelete) return;

        try {
            await deleteProduct(productToDelete);
            toast.success('Product deleted successfully');
            fetchProducts();
        } catch (err) {
            console.error('Error deleting product:', err);
            toast.error(err instanceof Error ? err.message : 'Failed to delete product');
        }

        setProductToDelete(null);
    };

    const handleToggleStock = async (id: string, currentStock: number) => {
        const supabase = createClient();
        const newStock = currentStock > 0 ? 0 : 1;
        const { error } = await supabase
            .from('products')
            .update({ stock_quantity: newStock })
            .eq('id', id);

        if (error) {
            console.error('Error updating product:', error);
            toast.error('Failed to update product status');
        } else {
            fetchProducts();
        }
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(price);
    };

    const filteredProducts = products.filter((product) => {
        const searchLower = searchTerm.toLowerCase();
        return (
            product.name.toLowerCase().includes(searchLower) ||
            product.sku.toLowerCase().includes(searchLower) ||
            product.category.toLowerCase().includes(searchLower)
        );
    });

    const allSelected = filteredProducts.length > 0 && filteredProducts.every(p => selectedIds.has(p.id));
    const someSelected = selectedIds.size > 0;
    const selectedProducts = filteredProducts.filter(p => selectedIds.has(p.id));

    const toggleOne = (id: string) => setSelectedIds(prev => {
        const next = new Set(prev);
        next.has(id) ? next.delete(id) : next.add(id);
        return next;
    });

    const toggleAll = () => setSelectedIds(
        allSelected ? new Set() : new Set(filteredProducts.map(p => p.id))
    );

    const handlePrintLabels = () => {
        setIsPrinting(true);
        setTimeout(() => {
            window.print();
            setIsPrinting(false);
            setSelectedIds(new Set());
        }, 300);
    };

    const categories = [
        { value: 'kanjivaram-silk', label: 'Kanjivaram Silk' },
        { value: 'banarasi-silk', label: 'Banarasi Silk' },
        { value: 'tussar-silk', label: 'Tussar Silk' },
        { value: 'mysore-silk', label: 'Mysore Silk' },
        { value: 'kerala-kasavu', label: 'Kerala Kasavu' },
        { value: 'muga-silk', label: 'Muga Silk' },
        { value: 'kani-silk', label: 'Kani Silk' },
        { value: 'paithani-silk', label: 'Paithani Silk' },
        { value: 'pochampalli-silk', label: 'Pochampalli Silk' },
        { value: 'baluchari-silk', label: 'Baluchari Silk' },
        { value: 'georgette-silk', label: 'Georgette Silk' },
        { value: 'cotton', label: 'Cotton' },
        { value: 'silk-cotton', label: 'Silk Cotton' },
    ];

    const columns: Column<Product>[] = [
        {
            key: 'select',
            header: (
                <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleAll}
                    className="rounded border-gray-300 accent-amber-600 cursor-pointer"
                />
            ),
            render: (product) => (
                <input
                    type="checkbox"
                    checked={selectedIds.has(product.id)}
                    onChange={() => toggleOne(product.id)}
                    className="rounded border-gray-300 accent-amber-600 cursor-pointer"
                />
            ),
        },
        {
            key: 'product',
            header: 'Product',
            render: (product) => (
                <div className="flex items-center gap-3">
                    <div className="relative w-12 h-12 flex-shrink-0 rounded-md overflow-hidden bg-gray-100">
                        {product.images?.[0] ? (
                            <Image src={product.images[0]} alt={product.name} fill className="object-cover" sizes="48px" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <Package className="w-6 h-6 text-gray-400" />
                            </div>
                        )}
                    </div>
                    <div>
                        <div className="font-medium text-gray-900 line-clamp-2">{product.name}</div>
                        <div className="text-sm text-gray-500 truncate">{product.material}</div>
                    </div>
                </div>
            ),
        },
        {
            key: 'sku',
            header: 'SKU',
            className: 'whitespace-nowrap text-sm text-gray-500',
            render: (product) => product.sku,
        },
        {
            key: 'category',
            header: 'Category',
            className: 'whitespace-nowrap',
            render: (product) => (
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {product.category}
                </span>
            ),
        },
        {
            key: 'price',
            header: 'Price',
            className: 'whitespace-nowrap font-medium text-gray-900',
            render: (product) => formatPrice(product.price),
        },
        {
            key: 'stock',
            header: 'Stock',
            className: 'whitespace-nowrap',
            render: (product) => (
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    product.stock_quantity > 10 ? 'bg-green-100 text-green-800'
                    : product.stock_quantity > 0 ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                    {product.stock_quantity} units
                </span>
            ),
        },
        {
            key: 'status',
            header: 'Status',
            className: 'whitespace-nowrap',
            render: (product) => (
                <button
                    onClick={() => handleToggleStock(product.id, product.stock_quantity)}
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                        product.stock_quantity > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}
                >
                    {product.stock_quantity > 0 ? 'Available' : 'Sold Out'}
                </button>
            ),
        },
        {
            key: 'actions',
            header: 'Actions',
            className: 'whitespace-nowrap',
            render: (product) => (
                <div className="flex items-center gap-2">
                    <Link href={`/admin/products/${product.id}`} className="text-amber-600 hover:text-amber-700">
                        <Edit className="w-4 h-4" />
                    </Link>
                    {isAdmin && (
                        <button onClick={() => handleDelete(product.id)} className="text-red-600 hover:text-red-700">
                            <Trash2 className="w-4 h-4" />
                        </button>
                    )}
                </div>
            ),
        },
    ];

    const renderCard = (product: Product) => (
        <div className="p-4">
            <div className="flex items-start gap-3">
                <input
                    type="checkbox"
                    checked={selectedIds.has(product.id)}
                    onChange={() => toggleOne(product.id)}
                    className="mt-1 rounded border-gray-300 accent-amber-600 cursor-pointer flex-shrink-0"
                />
                <div className="relative w-16 h-16 flex-shrink-0 rounded-md overflow-hidden bg-gray-100">
                    {product.images?.[0] ? (
                        <Image src={product.images[0]} alt={product.name} fill className="object-cover" sizes="64px" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-6 h-6 text-gray-400" />
                        </div>
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 line-clamp-2 text-sm">{product.name}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{product.sku}</div>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {product.category}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            product.stock_quantity > 10 ? 'bg-green-100 text-green-800'
                            : product.stock_quantity > 0 ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                            {product.stock_quantity} units
                        </span>
                    </div>
                </div>
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <span className="font-medium text-gray-900 text-sm">{formatPrice(product.price)}</span>
                    <button
                        onClick={() => handleToggleStock(product.id, product.stock_quantity)}
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            product.stock_quantity > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}
                    >
                        {product.stock_quantity > 0 ? 'Available' : 'Sold Out'}
                    </button>
                    <div className="flex items-center gap-2">
                        <Link href={`/admin/products/${product.id}`} className="text-amber-600 hover:text-amber-700">
                            <Edit className="w-4 h-4" />
                        </Link>
                        {isAdmin && (
                            <button onClick={() => handleDelete(product.id)} className="text-red-600 hover:text-red-700">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div>
            <div className="flex items-center justify-between mb-6 lg:mb-8">
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Products</h1>
                <div className="flex items-center gap-2 lg:gap-3">
                    <PrinterCalibration />
                    <Link
                        href="/admin/products/new"
                        className="flex items-center gap-2 px-3 lg:px-4 py-2 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700 transition-colors text-sm lg:text-base"
                    >
                        <Plus className="w-5 h-5" />
                        <span className="hidden sm:inline">Add Product</span>
                    </Link>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
                {/* Search */}
                <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by name, SKU, or category..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 min-h-[44px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    />
                </div>

                {/* Dropdown filters */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {/* Category */}
                    <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="w-full px-3 py-2.5 min-h-[44px] border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    >
                        <option value="all">All Categories</option>
                        {categories.map((cat) => (
                            <option key={cat.value} value={cat.value}>{cat.label}</option>
                        ))}
                    </select>

                    {/* Vendor */}
                    <select
                        value={vendorFilter}
                        onChange={(e) => setVendorFilter(e.target.value)}
                        className="w-full px-3 py-2.5 min-h-[44px] border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    >
                        <option value="all">All Vendors</option>
                        <option value="none">No Vendor</option>
                        {vendors.map((v) => (
                            <option key={v.id} value={v.id}>{v.name}</option>
                        ))}
                    </select>

                    {/* Stock status */}
                    <select
                        value={stockFilter}
                        onChange={(e) => setStockFilter(e.target.value)}
                        className="w-full px-3 py-2.5 min-h-[44px] border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    >
                        <option value="all">All Stock</option>
                        <option value="available">Available</option>
                        <option value="sold_out">Sold Out</option>
                    </select>

                    {/* Listing status */}
                    <select
                        value={listingFilter}
                        onChange={(e) => setListingFilter(e.target.value)}
                        className="w-full px-3 py-2.5 min-h-[44px] border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    >
                        <option value="all">All Listings</option>
                        <option value="online">Online</option>
                        <option value="pos_only">POS Only</option>
                    </select>
                </div>

                {/* Active filter indicator */}
                {[categoryFilter, vendorFilter, stockFilter, listingFilter].filter(f => f !== 'all').length > 0 && (
                    <div className="mt-3 flex items-center gap-2">
                        <span className="text-xs text-gray-500">
                            {[categoryFilter, vendorFilter, stockFilter, listingFilter].filter(f => f !== 'all').length} filter{[categoryFilter, vendorFilter, stockFilter, listingFilter].filter(f => f !== 'all').length > 1 ? 's' : ''} active
                        </span>
                        <button
                            onClick={() => { setCategoryFilter('all'); setVendorFilter('all'); setStockFilter('all'); setListingFilter('all'); }}
                            className="text-xs text-amber-600 hover:text-amber-700 underline"
                        >
                            Clear all
                        </button>
                    </div>
                )}
            </div>

            {/* Bulk action bar */}
            {someSelected && (
                <div className="sticky top-4 z-10 flex items-center justify-between bg-[#5F1300] text-white px-5 py-3 rounded-xl shadow-lg mb-4">
                    <span className="text-sm font-semibold">
                        {selectedIds.size} product{selectedIds.size > 1 ? 's' : ''} selected
                    </span>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setSelectedIds(new Set())}
                            className="text-xs underline opacity-80 hover:opacity-100"
                        >
                            Clear
                        </button>
                        <button
                            onClick={handlePrintLabels}
                            className="flex items-center gap-2 px-4 py-2 min-h-[44px] bg-white text-[#5F1300] rounded-lg text-sm font-bold hover:bg-gray-100 transition-colors"
                        >
                            <Printer className="w-4 h-4" />
                            Print {selectedIds.size} Label{selectedIds.size > 1 ? 's' : ''}
                        </button>
                    </div>
                </div>
            )}

            {/* Products Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <ResponsiveDataTable
                    columns={columns}
                    data={filteredProducts}
                    keyExtractor={(p) => p.id}
                    renderCard={renderCard}
                    loading={loading}
                    emptyState={
                        <div className="text-center py-12">
                            <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500">No products found</p>
                            <Link
                                href="/admin/products/new"
                                className="inline-block mt-4 text-amber-600 hover:text-amber-700 font-medium"
                            >
                                Add your first product
                            </Link>
                        </div>
                    }
                />
            </div>

            {/* Stats */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg shadow p-4">
                    <p className="text-sm text-textSecondary">Total Products</p>
                    <p className="text-2xl font-bold text-gray-900">{products.length}</p>
                </div>
                <div className="bg-white rounded-lg shadow p-4">
                    <p className="text-sm text-textSecondary">Available Products</p>
                    <p className="text-2xl font-bold text-green-600">
                        {products.filter((p) => p.stock_quantity > 0).length}
                    </p>
                </div>
                <div className="bg-white rounded-lg shadow p-4">
                    <p className="text-sm text-textSecondary">Sold Stock</p>
                    <p className="text-2xl font-bold text-red-600">
                        {products.filter((p) => p.stock_quantity < 1).length}
                    </p>
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                isOpen={deleteConfirmOpen}
                onClose={() => setDeleteConfirmOpen(false)}
                onConfirm={confirmDelete}
                title="Delete Product"
                message="Are you sure you want to delete this product? This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
                variant="danger"
            />

            {/* Bulk label print wrapper — rendered off-screen, revealed by print CSS */}
            {isPrinting && <BulkQrWrapper products={selectedProducts} />}
        </div>
    );
}
