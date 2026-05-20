'use client';

import { useState, useEffect } from 'react';
import ColorFamilyPicker from '@/components/ui/ColorFamilyPicker';

interface FilterSidebarProps {
    onFilterChange: (filters: FilterState) => void;
    currentFilters?: FilterState;
}

export interface FilterState {
    category: string;
    colorFamily: string;
    minPrice: number;
    maxPrice: number;
    search: string;
}

const categories = [
    { value: '', label: 'All Silk Types' },
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

const priceRanges = [
    { min: 0, max: 0, label: 'All Prices' },
    { min: 0, max: 10000, label: 'Under ₹10,000' },
    { min: 10000, max: 20000, label: '₹10,000 - ₹20,000' },
    { min: 20000, max: 30000, label: '₹20,000 - ₹30,000' },
    { min: 30000, max: 50000, label: '₹30,000 - ₹50,000' },
    { min: 50000, max: 0, label: 'Above ₹50,000' },
];

export default function FilterSidebar({ onFilterChange, currentFilters }: FilterSidebarProps) {
    const [filters, setFilters] = useState<FilterState>({
        category: '',
        colorFamily: '',
        minPrice: 0,
        maxPrice: 0,
        search: '',
    });

    // Sync internal state with parent's filter state (e.g., from URL parameters)
    useEffect(() => {
        if (currentFilters) {
            setFilters(currentFilters);
        }
    }, [currentFilters]);

    const handleCategoryChange = (category: string) => {
        const newFilters = { ...filters, category };
        setFilters(newFilters);
        onFilterChange(newFilters);
    };

    const handlePriceRangeChange = (min: number, max: number) => {
        const newFilters = { ...filters, minPrice: min, maxPrice: max };
        setFilters(newFilters);
        onFilterChange(newFilters);
    };

    const handleColorChange = (colorFamily: string) => {
        const newFilters = { ...filters, colorFamily };
        setFilters(newFilters);
        onFilterChange(newFilters);
    };

    const handleSearchChange = (search: string) => {
        const newFilters = { ...filters, search };
        setFilters(newFilters);
        onFilterChange(newFilters);
    };

    const clearFilters = () => {
        const newFilters = {
            category: '',
            colorFamily: '',
            minPrice: 0,
            maxPrice: 0,
            search: '',
        };
        setFilters(newFilters);
        onFilterChange(newFilters);
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Filters</h2>
                <button
                    onClick={clearFilters}
                    className="text-sm text-accent-700 hover:text-accent-hover font-medium"
                >
                    Clear All
                </button>
            </div>

            {/* Search */}
            <div className="mb-6">
                <label className="block text-sm font-medium  mb-2">
                    Search Products
                </label>
                <input
                    type="text"
                    value={filters.search}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    placeholder="Search by name..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                />
            </div>

            {/* Color Family Filter */}
            <div className="mb-6">
                <h3 className="text-sm font-medium mb-3">Color Family</h3>
                <ColorFamilyPicker
                    value={filters.colorFamily ? [filters.colorFamily] : []}
                    onChange={(ids) => handleColorChange(ids[ids.length - 1] ?? '')}
                    size="sm"
                />
            </div>

            {/* Category Filter */}
            <div className="mb-6">
                <h3 className="text-sm font-medium  mb-3">Category</h3>
                <div className="space-y-2 grid grid-cols-2 lg:grid-cols-1">
                    {categories.map((cat) => (
                        <label key={cat.value} className="flex items-center cursor-pointer group">
                            <input
                                type="radio"
                                name="category"
                                value={cat.value}
                                checked={filters.category === cat.value}
                                onChange={(e) => handleCategoryChange(e.target.value)}
                                className="w-4 h-4 text-primary focus:ring-primary-light"
                            />
                            <span className="ml-3 text-sm  group-hover:text-primary-light">
                                {cat.label}
                            </span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Price Range Filter */}
            <div className="mb-6">
                <h3 className="text-sm font-medium  mb-3">Price Range</h3>
                <div className="space-y-2 grid grid-cols-2 lg:grid-cols-1">
                    {priceRanges.map((range, index) => (
                        <label key={index} className="flex items-center cursor-pointer group">
                            <input
                                type="radio"
                                name="priceRange"
                                checked={filters.minPrice === range.min && filters.maxPrice === range.max}
                                onChange={() => handlePriceRangeChange(range.min, range.max)}
                                className="w-4 h-4 text-accent focus:ring-accent"
                            />
                            <span className="ml-3 text-sm  group-hover:text-accent-hover">
                                {range.label}
                            </span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Active Filters Summary */}
            {(filters.category || filters.colorFamily || filters.minPrice > 0 || filters.maxPrice > 0 || filters.search) && (
                <div className="pt-4 border-t border-gray-200 hidden lg:block">
                    <h3 className="text-sm font-medium  mb-2">Active Filters</h3>
                    <div className="space-y-1">
                        {filters.category && (
                            <div className="text-xs text-textSecondary">
                                Category: <span className="font-medium">{filters.category}</span>
                            </div>
                        )}
                        {filters.colorFamily && (
                            <div className="text-xs text-textSecondary">
                                Color: <span className="font-medium capitalize">{filters.colorFamily}</span>
                            </div>
                        )}
                        {(filters.minPrice > 0 || filters.maxPrice > 0) && (
                            <div className="text-xs text-textSecondary">
                                Price: <span className="font-medium">
                                    {filters.minPrice > 0 ? `₹${filters.minPrice.toLocaleString()}` : '₹0'} -
                                    {filters.maxPrice > 0 ? ` ₹${filters.maxPrice.toLocaleString()}` : ' ∞'}
                                </span>
                            </div>
                        )}
                        {filters.search && (
                            <div className="text-xs text-textSecondary">
                                Search: <span className="font-medium">{filters.search}</span>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
