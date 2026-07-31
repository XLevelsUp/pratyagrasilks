'use client';

import { useState, useEffect, useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import ProductCard from '@/components/ProductCard';
import FilterSidebar, { FilterState } from '@/components/FilterSidebar';
import { Product } from '@/lib/types';

export default function CollectionClient() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // URL query string is the single source of truth for filters —
    // shareable links, SSR-friendly, back/forward-navigable.
    const filters = useMemo<FilterState>(
        () => ({
            category: searchParams.get('category') || '',
            colorFamily: searchParams.get('color') || '',
            minPrice: Number(searchParams.get('minPrice')) || 0,
            maxPrice: Number(searchParams.get('maxPrice')) || 0,
            search: searchParams.get('search') || '',
        }),
        [searchParams]
    );

    useEffect(() => {
        fetchProducts();
        // eslint-disable-next-line react-hooks/exhaustive-deps
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

    return (
        <div className="container mx-auto px-4 py-4 md:py-0 md:pb-8">
            {/* Filter bar (md+) + bottom-sheet drawer (mobile) */}
            <FilterSidebar
                currentFilters={filters}
                resultCount={products.length}
                loading={loading}
            />

            {/* Product Grid — height floor so result changes (including zero
                results) never collapse the page and jolt the scroll position */}
            <main className="flex flex-col min-h-[50vh] pt-2 md:pt-8">
                    {/* Results count — mobile only; the bar owns it on md+ */}
                    <div className="mb-6 md:hidden">
                        <p className="text-xs font-semibold tracking-[0.2em] uppercase text-textSecondary/70">
                            {loading && products.length === 0
                                ? 'Curating the collection…'
                                : `${products.length} ${products.length === 1 ? 'piece' : 'pieces'}`}
                        </p>
                    </div>

                    {/* Error State — fills the reserved column height */}
                    {error && (
                        <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
                            <p className="text-red-800 font-medium mb-2">Error loading products</p>
                            <p className="text-red-600 text-sm">{error}</p>
                            <button
                                onClick={fetchProducts}
                                className="mt-6 px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                            >
                                Try Again
                            </button>
                        </div>
                    )}

                    {/* Skeleton — first load only; refetches keep the stale grid mounted */}
                    {loading && products.length === 0 && !error && (
                        <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 md:gap-x-6 md:gap-y-12 xl:grid-cols-4">
                            {[...Array(6)].map((_, i) => (
                                <div key={i}>
                                    <div className="aspect-[3/4] rounded-xl bg-gradient-to-br from-primary-100 to-primary-200 relative overflow-hidden">
                                        <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/50 to-transparent" />
                                    </div>
                                    <div className="pt-4 space-y-2 animate-pulse">
                                        <div className="h-3 w-1/3 rounded bg-gray-200"></div>
                                        <div className="h-5 w-3/4 rounded bg-gray-200"></div>
                                        <div className="h-5 w-1/3 rounded bg-gray-200"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Products Grid — stays mounted during refetch (stale-while-revalidate)
                        so the page height never collapses and the sticky sidebar stays put;
                        a gentle dim signals the update instead */}
                    {!error && products.length > 0 && (
                        <div
                            className={`grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 md:gap-x-6 md:gap-y-12 xl:grid-cols-4 transition-opacity duration-300 ${loading ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}
                        >
                            {products.map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    )}

                    {/* Empty State — centered in the reserved column height */}
                    {!loading && !error && products.length === 0 && (
                        <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
                            <p className="text-xs font-semibold tracking-[0.25em] uppercase text-textSecondary/50 mb-4">
                                No pieces found
                            </p>
                            <h3 className="font-playfair text-2xl md:text-3xl font-semibold text-primary mb-3">
                                Nothing matches your refinement
                            </h3>
                            <p className="text-textSecondary mb-8 max-w-sm">
                                Try broadening your selection — or explore the full collection.
                            </p>
                            <button
                                onClick={() => router.replace(pathname, { scroll: false })}
                                className="px-8 py-3 bg-primary text-secondary font-semibold rounded-full hover:bg-primary-light transition-colors"
                            >
                                Clear Filters
                            </button>
                        </div>
                    )}
                </main>
        </div>
    );
}
