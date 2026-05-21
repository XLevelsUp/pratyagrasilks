'use client';

import { useState, useCallback } from 'react';
import { silkCategories } from '@/lib/seo-config';
import ColorFamilyPicker from '@/components/ui/ColorFamilyPicker';

export interface FilterState {
    category: string;
    colorFamily: string;
    minPrice: number;
    maxPrice: number;
    search: string;
}

interface FilterSidebarProps {
    onFilterChange: (filters: FilterState) => void;
    currentFilters: FilterState;
}

/**
 * Categories are derived directly from silkCategories in seo-config.
 * This prevents drift between the nav taxonomy and the filter options.
 */
const silkOptions = silkCategories.filter(c => !c.slug.includes('cotton'));
const cottonOptions = silkCategories.filter(c => c.slug.includes('cotton'));

// Price range bounds for Kandangi Sarees's catalogue
const MIN_PRICE_BOUND = 1000;
const MAX_PRICE_BOUND = 40000;

export default function FilterSidebar({ onFilterChange, currentFilters }: FilterSidebarProps) {
    const [localFilters, setLocalFilters] = useState<FilterState>(currentFilters);
    const [expandedSections, setExpandedSections] = useState({
        search: true,
        category: true,
        price: true,
    });

    const updateFilter = useCallback(
        (key: keyof FilterState, value: string | number) => {
            const updated = { ...localFilters, [key]: value };
            setLocalFilters(updated);
            onFilterChange(updated);
        },
        [localFilters, onFilterChange]
    );

    const clearFilters = () => {
        const reset: FilterState = { category: '', colorFamily: '', minPrice: 0, maxPrice: 0, search: '' };
        setLocalFilters(reset);
        onFilterChange(reset);
    };

    const toggleSection = (section: keyof typeof expandedSections) => {
        setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const hasActiveFilters =
        localFilters.category || localFilters.colorFamily || localFilters.minPrice > 0 || localFilters.maxPrice > 0 || localFilters.search;

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-primary">Filter Weaves</h2>
                {hasActiveFilters && (
                    <button
                        onClick={clearFilters}
                        className="text-sm text-accent-700 hover:text-accent-hover transition-colors"
                    >
                        Clear all
                    </button>
                )}
            </div>

            {/* Search */}
            <div className="mb-6">
                <button
                    onClick={() => toggleSection('search')}
                    className="flex items-center justify-between w-full text-left mb-3"
                >
                    <h3 className="font-semibold text-gray-900">Search</h3>
                    <span className="text-gray-400">{expandedSections.search ? '−' : '+'}</span>
                </button>
                {expandedSections.search && (
                    <input
                        type="text"
                        placeholder="Search sarees..."
                        value={localFilters.search}
                        onChange={e => updateFilter('search', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                    />
                )}
            </div>

            {/* Color Family */}
            <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Color</h3>
                <ColorFamilyPicker
                    value={localFilters.colorFamily ? [localFilters.colorFamily] : []}
                    onChange={(ids) => updateFilter('colorFamily', ids[ids.length - 1] ?? '')}
                    size="sm"
                />
            </div>

            {/* Category */}
            <div className="mb-6">
                <button
                    onClick={() => toggleSection('category')}
                    className="flex items-center justify-between w-full text-left mb-3"
                >
                    <h3 className="font-semibold text-gray-900">Weave Type</h3>
                    <span className="text-gray-400">{expandedSections.category ? '−' : '+'}</span>
                </button>
                {expandedSections.category && (
                    <div className="space-y-2">
                        <label className="flex items-center cursor-pointer">
                            <input
                                type="radio"
                                name="category"
                                value=""
                                checked={localFilters.category === ''}
                                onChange={() => updateFilter('category', '')}
                                className="mr-2 accent-primary"
                            />
                            <span className="text-sm">All Weaves</span>
                        </label>

                        {/* Silks group */}
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate pt-2 pb-1">
                            Silks
                        </p>
                        {silkOptions.map(cat => (
                            <label key={cat.slug} className="flex items-center cursor-pointer">
                                <input
                                    type="radio"
                                    name="category"
                                    value={cat.slug}
                                    checked={localFilters.category === cat.slug}
                                    onChange={() => updateFilter('category', cat.slug)}
                                    className="mr-2 accent-primary"
                                />
                                <span className="text-sm">{cat.name}</span>
                            </label>
                        ))}

                        {/* Cottons group */}
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate pt-2 pb-1">
                            Cottons
                        </p>
                        {cottonOptions.map(cat => (
                            <label key={cat.slug} className="flex items-center cursor-pointer">
                                <input
                                    type="radio"
                                    name="category"
                                    value={cat.slug}
                                    checked={localFilters.category === cat.slug}
                                    onChange={() => updateFilter('category', cat.slug)}
                                    className="mr-2 accent-primary"
                                />
                                <span className="text-sm">{cat.name}</span>
                            </label>
                        ))}
                    </div>
                )}
            </div>

            {/* Price Range */}
            <div className="mb-6">
                <button
                    onClick={() => toggleSection('price')}
                    className="flex items-center justify-between w-full text-left mb-3"
                >
                    <h3 className="font-semibold text-gray-900">Price Range</h3>
                    <span className="text-gray-400">{expandedSections.price ? '−' : '+'}</span>
                </button>
                {expandedSections.price && (
                    <div className="space-y-4">
                        <div className="flex gap-3">
                            <div className="flex-1">
                                <label className="block text-xs text-gray-500 mb-1">Min (₹)</label>
                                <input
                                    type="number"
                                    min={MIN_PRICE_BOUND}
                                    max={MAX_PRICE_BOUND}
                                    step={500}
                                    placeholder="1,000"
                                    value={localFilters.minPrice || ''}
                                    onChange={e => updateFilter('minPrice', Number(e.target.value) || 0)}
                                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                                />
                            </div>
                            <div className="flex-1">
                                <label className="block text-xs text-gray-500 mb-1">Max (₹)</label>
                                <input
                                    type="number"
                                    min={MIN_PRICE_BOUND}
                                    max={MAX_PRICE_BOUND}
                                    step={500}
                                    placeholder="40,000"
                                    value={localFilters.maxPrice || ''}
                                    onChange={e => updateFilter('maxPrice', Number(e.target.value) || 0)}
                                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                                />
                            </div>
                        </div>
                        <p className="text-xs text-textSecondary">
                            Range: ₹{MIN_PRICE_BOUND.toLocaleString('en-IN')} – ₹{MAX_PRICE_BOUND.toLocaleString('en-IN')}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
