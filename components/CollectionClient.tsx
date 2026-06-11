'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductCard from '@/components/ProductCard';
import FilterSidebar, { FilterState } from '@/components/FilterSidebar';
import { Product } from '@/lib/types';

export default function CollectionClient() {
    const searchParams = useSearchParams();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filters, setFilters] = useState<FilterState>({
        category: searchParams.get('category') || '',
        colorFamily: searchParams.get('color') || '',
        minPrice: 0,
        maxPrice: 0,
        search: '',
    });

    useEffect(() => {
        fetchProducts();
    }, [filters]);

    const fetchProducts = async () => {
        setLoading(true);
        setError(null);

        try {
            // Build query parameters
            const params = new URLSearchParams();

            if (filters.category) params.append('category', filters.category);
            if (filters.colorFamily) params.append('color', filters.colorFamily);
            if (filters.minPrice > 0) params.append('minPrice', filters.minPrice.toString());
            if (filters.maxPrice > 0) params.append('maxPrice', filters.maxPrice.toString());
            if (filters.search) params.append('search', filters.search);

            const response = await fetch(`/api/products?${params.toString()}`);

            if (!response.ok) {
                throw new Error('Failed to fetch products');
            }

            const data = await response.json();
            setProducts(data.products || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
            console.error('Error fetching products:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (newFilters: FilterState) => {
        setFilters(newFilters);
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Sidebar */}
                <aside className="lg:col-span-1">
                    <FilterSidebar onFilterChange={handleFilterChange} currentFilters={filters} />
                </aside>

                {/* Product Grid */}
                <main className="lg:col-span-3">
                    {/* Results Header */}
                    <div className="mb-6 flex items-center justify-between">
                        <p className="text-textSecondary">
                            {loading ? (
                                'Loading products...'
                            ) : (
                                `${products.length} product${products.length !== 1 ? 's' : ''} found`
                            )}
                        </p>
                    </div>

                    {/* Error State */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                            <p className="text-red-800 font-medium mb-2">Error loading products</p>
                            <p className="text-red-600 text-sm">{error}</p>
                            <button
                                onClick={fetchProducts}
                                className="mt-4 px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                            >
                                Try Again
                            </button>
                        </div>
                    )}

                    {/* Loading State */}
                    {loading && !error && (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
                                    <div className="aspect-square bg-gray-200"></div>
                                    <div className="p-4">
                                        <div className="h-6 bg-gray-200 rounded mb-2"></div>
                                        <div className="h-4 bg-gray-200 rounded mb-3 w-3/4"></div>
                                        <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Products Grid */}
                    {!loading && !error && products.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {products.map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    )}

                    {/* Empty State */}
                    {!loading && !error && products.length === 0 && (
                        <div className="bg-white rounded-lg shadow-md p-12 text-center">
                            <svg
                                className="mx-auto h-16 w-16 text-gray-400 mb-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                                />
                            </svg>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
                            <p className="text-textSecondary mb-4">
                                Try adjusting your filters or search terms
                            </p>
                            <button
                                onClick={() => setFilters({ category: '', colorFamily: '', minPrice: 0, maxPrice: 0, search: '' })}
                                className="px-6 py-2 bg-accent text-white rounded-md hover:bg-accent-hover transition-colors"
                            >
                                Clear Filters
                            </button>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
