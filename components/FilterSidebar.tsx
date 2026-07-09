'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Drawer } from 'vaul';
import { ChevronDown, Search, SlidersHorizontal } from 'lucide-react';
import ColorFamilyPicker from '@/components/ui/ColorFamilyPicker';

export interface FilterState {
    category: string;
    colorFamily: string;
    minPrice: number;
    maxPrice: number;
    search: string;
}

interface FilterSidebarProps {
    currentFilters: FilterState;
    /** Live result count shown in the bar / on the mobile sheet's footer button */
    resultCount?: number;
    loading?: boolean;
}

// Values must match product.category in the DB — do not rename.
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
    { min: 10000, max: 20000, label: '₹10,000 – ₹20,000' },
    { min: 20000, max: 30000, label: '₹20,000 – ₹30,000' },
    { min: 30000, max: 50000, label: '₹30,000 – ₹50,000' },
    { min: 50000, max: 0, label: 'Above ₹50,000' },
];

function countActive(f: FilterState): number {
    return (
        (f.category ? 1 : 0) +
        (f.colorFamily ? 1 : 0) +
        (f.minPrice > 0 || f.maxPrice > 0 ? 1 : 0) +
        (f.search ? 1 : 0)
    );
}

// Shared URL-write hook: optimistic local state for instant control feedback,
// URL query string as the single source of truth (shareable, back/forward).
function useFilterUrl(urlFilters: FilterState) {
    const router = useRouter();
    const pathname = usePathname();
    const [filters, setFilters] = useState(urlFilters);

    useEffect(() => {
        setFilters(urlFilters);
    }, [urlFilters]);

    const applyFilters = (next: FilterState) => {
        setFilters(next); // instant visual feedback
        const params = new URLSearchParams();
        if (next.category) params.set('category', next.category);
        if (next.colorFamily) params.set('color', next.colorFamily);
        if (next.minPrice > 0) params.set('minPrice', String(next.minPrice));
        if (next.maxPrice > 0) params.set('maxPrice', String(next.maxPrice));
        if (next.search) params.set('search', next.search);
        const qs = params.toString();
        router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    };

    const clearAll = () => applyFilters({ category: '', colorFamily: '', minPrice: 0, maxPrice: 0, search: '' });

    return { filters, applyFilters, clearAll };
}

/* ------------------------------------------------------------------ */
/* Desktop (md+): horizontal filter bar with anchored dropdown panels  */
/* ------------------------------------------------------------------ */

type MenuKey = 'category' | 'color' | 'price';

function OptionButton({
    selected,
    label,
    onClick,
}: {
    selected: boolean;
    label: string;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-pressed={selected}
            className="flex items-center gap-3 py-2 w-full text-left group/opt"
        >
            <span
                className={`w-4 h-4 shrink-0 rounded-full border transition-all duration-200 ${
                    selected ? 'border-[5px] border-primary' : 'border-primary-200 group-hover/opt:border-primary'
                }`}
                aria-hidden="true"
            />
            <span
                className={`text-sm transition-colors ${
                    selected ? 'text-primary' : 'text-textSecondary group-hover/opt:text-primary'
                }`}
            >
                {label}
            </span>
        </button>
    );
}

function FilterBar({
    urlFilters,
    resultCount,
    loading,
}: {
    urlFilters: FilterState;
    resultCount?: number;
    loading?: boolean;
}) {
    const { filters, applyFilters, clearAll } = useFilterUrl(urlFilters);
    const [openMenu, setOpenMenu] = useState<MenuKey | null>(null);
    const [searchInput, setSearchInput] = useState(urlFilters.search);
    const debounceRef = useRef<ReturnType<typeof setTimeout>>();
    const barRef = useRef<HTMLDivElement>(null);
    const activeCount = countActive(filters);

    useEffect(() => {
        setSearchInput(urlFilters.search);
    }, [urlFilters.search]);

    // Close open panel on outside click or Escape
    useEffect(() => {
        if (!openMenu) return;
        const onPointerDown = (e: PointerEvent) => {
            if (barRef.current && !barRef.current.contains(e.target as Node)) {
                setOpenMenu(null);
            }
        };
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setOpenMenu(null);
        };
        document.addEventListener('pointerdown', onPointerDown);
        document.addEventListener('keydown', onKeyDown);
        return () => {
            document.removeEventListener('pointerdown', onPointerDown);
            document.removeEventListener('keydown', onKeyDown);
        };
    }, [openMenu]);

    const pick = (next: FilterState) => {
        applyFilters(next);
        setOpenMenu(null);
    };

    const handleSearchChange = (value: string) => {
        setSearchInput(value);
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            applyFilters({ ...filters, search: value.trim() });
        }, 400);
    };

    const activeCategory = categories.find((c) => c.value === filters.category && c.value !== '');
    const activePrice = priceRanges.find(
        (r) => r.min === filters.minPrice && r.max === filters.maxPrice && (r.min > 0 || r.max > 0)
    );

    const pillClass = (active: boolean, open: boolean) =>
        `flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors duration-200 ${
            active
                ? 'bg-primary text-secondary border-primary'
                : open
                  ? 'border-primary text-primary'
                  : 'border-primary-200 text-textPrimary hover:border-primary hover:text-primary'
        }`;

    const chevronClass = (open: boolean) =>
        `w-4 h-4 transition-transform duration-200 ${open ? 'rotate-180' : ''}`;

    return (
        <div
            ref={barRef}
            className="hidden md:block sticky top-16 lg:top-20 z-30 bg-background/95 backdrop-blur border-b border-primary-100"
        >
            <div className="flex items-center gap-3 py-3 flex-wrap">
                {/* Silk Type */}
                <div className="relative">
                    <button
                        type="button"
                        aria-haspopup="true"
                        aria-expanded={openMenu === 'category'}
                        onClick={() => setOpenMenu(openMenu === 'category' ? null : 'category')}
                        className={pillClass(Boolean(activeCategory), openMenu === 'category')}
                    >
                        {activeCategory ? activeCategory.label : 'Silk Type'}
                        <ChevronDown className={chevronClass(openMenu === 'category')} aria-hidden="true" />
                    </button>
                    {openMenu === 'category' && (
                        <div className="absolute left-0 top-full mt-2 z-40 w-[26rem] bg-white rounded-2xl border border-primary-100 shadow-xl p-5 animate-scale-in origin-top-left">
                            <div className="grid grid-cols-2 gap-x-6">
                                {categories.map((cat) => (
                                    <OptionButton
                                        key={cat.value}
                                        selected={filters.category === cat.value}
                                        label={cat.label}
                                        onClick={() => pick({ ...filters, category: cat.value })}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Colour */}
                <div className="relative">
                    <button
                        type="button"
                        aria-haspopup="true"
                        aria-expanded={openMenu === 'color'}
                        onClick={() => setOpenMenu(openMenu === 'color' ? null : 'color')}
                        className={pillClass(Boolean(filters.colorFamily), openMenu === 'color')}
                    >
                        {filters.colorFamily
                            ? filters.colorFamily.charAt(0).toUpperCase() + filters.colorFamily.slice(1)
                            : 'Colour'}
                        <ChevronDown className={chevronClass(openMenu === 'color')} aria-hidden="true" />
                    </button>
                    {openMenu === 'color' && (
                        <div className="absolute left-0 top-full mt-2 z-40 w-72 bg-white rounded-2xl border border-primary-100 shadow-xl p-5 animate-scale-in origin-top-left">
                            <ColorFamilyPicker
                                value={filters.colorFamily ? [filters.colorFamily] : []}
                                onChange={(ids) => pick({ ...filters, colorFamily: ids[ids.length - 1] ?? '' })}
                                size="sm"
                            />
                        </div>
                    )}
                </div>

                {/* Price */}
                <div className="relative">
                    <button
                        type="button"
                        aria-haspopup="true"
                        aria-expanded={openMenu === 'price'}
                        onClick={() => setOpenMenu(openMenu === 'price' ? null : 'price')}
                        className={pillClass(Boolean(activePrice), openMenu === 'price')}
                    >
                        {activePrice ? activePrice.label : 'Price'}
                        <ChevronDown className={chevronClass(openMenu === 'price')} aria-hidden="true" />
                    </button>
                    {openMenu === 'price' && (
                        <div className="absolute left-0 top-full mt-2 z-40 w-64 bg-white rounded-2xl border border-primary-100 shadow-xl p-5 animate-scale-in origin-top-left">
                            {priceRanges.map((range) => (
                                <OptionButton
                                    key={range.label}
                                    selected={filters.minPrice === range.min && filters.maxPrice === range.max}
                                    label={range.label}
                                    onClick={() => pick({ ...filters, minPrice: range.min, maxPrice: range.max })}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Search */}
                <div className="relative ml-1">
                    <Search
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-textSecondary/40"
                        aria-hidden="true"
                    />
                    <input
                        type="text"
                        value={searchInput}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        placeholder="Search…"
                        aria-label="Search products"
                        className="w-40 focus:w-56 transition-all duration-300 bg-transparent border-0 border-b border-primary-200 focus:border-primary focus:outline-none focus:ring-0 pl-6 pr-0 py-1.5 text-sm placeholder:text-textSecondary/40"
                    />
                </div>

                <div className="flex-1" />

                {/* Piece count — keeps stale value during refetch (no jump) */}
                <p className="text-xs font-semibold tracking-[0.2em] uppercase text-textSecondary/70">
                    {loading && (resultCount ?? 0) === 0
                        ? 'Curating…'
                        : `${resultCount ?? 0} ${resultCount === 1 ? 'piece' : 'pieces'}`}
                </p>

                {activeCount > 0 && (
                    <button
                        type="button"
                        onClick={clearAll}
                        className="text-sm text-accent-700 hover:text-accent-hover font-medium"
                    >
                        Clear all
                    </button>
                )}
            </div>
        </div>
    );
}

/* ------------------------------------------------------------- */
/* Mobile (<md): bottom-sheet drawer — unchanged working pattern  */
/* ------------------------------------------------------------- */

function SectionLabel({ children }: { children: React.ReactNode }) {
    return (
        <h3 className="text-xs font-semibold tracking-[0.2em] uppercase text-textSecondary/60 mb-3">
            {children}
        </h3>
    );
}

function FilterPanel({ filters: urlFilters }: { filters: FilterState }) {
    const groupId = useId();
    const { filters, applyFilters } = useFilterUrl(urlFilters);
    const [searchInput, setSearchInput] = useState(urlFilters.search);
    const debounceRef = useRef<ReturnType<typeof setTimeout>>();

    useEffect(() => {
        setSearchInput(urlFilters.search);
    }, [urlFilters.search]);

    const handleSearchChange = (value: string) => {
        setSearchInput(value);
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            applyFilters({ ...filters, search: value.trim() });
        }, 400);
    };

    return (
        <div>
            {/* Search */}
            <div className="mb-8">
                <SectionLabel>Search</SectionLabel>
                <div className="relative">
                    <Search
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-textSecondary/40"
                        aria-hidden="true"
                    />
                    <input
                        type="text"
                        value={searchInput}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        placeholder="Search by name…"
                        aria-label="Search products"
                        className="w-full bg-transparent border-0 border-b border-primary-200 focus:border-primary focus:outline-none focus:ring-0 pl-7 pr-0 py-2 text-sm placeholder:text-textSecondary/40 transition-colors"
                    />
                </div>
            </div>

            {/* Colour */}
            <div className="mb-8 pt-6 border-t border-primary-100">
                <SectionLabel>Colour</SectionLabel>
                <ColorFamilyPicker
                    value={filters.colorFamily ? [filters.colorFamily] : []}
                    onChange={(ids) =>
                        applyFilters({ ...filters, colorFamily: ids[ids.length - 1] ?? '' })
                    }
                    size="sm"
                />
            </div>

            {/* Silk Type */}
            <div className="mb-8 pt-6 border-t border-primary-100">
                <SectionLabel>Silk Type</SectionLabel>
                <div className="grid grid-cols-2">
                    {categories.map((cat) => (
                        <label key={cat.value} className="flex items-center gap-3 py-2 cursor-pointer">
                            <input
                                type="radio"
                                name={`category-${groupId}`}
                                value={cat.value}
                                checked={filters.category === cat.value}
                                onChange={() => applyFilters({ ...filters, category: cat.value })}
                                className="peer sr-only"
                            />
                            <span
                                className="w-4 h-4 shrink-0 rounded-full border border-primary-200 transition-all duration-200 peer-checked:border-[5px] peer-checked:border-primary peer-focus-visible:ring-2 peer-focus-visible:ring-primary peer-focus-visible:ring-offset-2"
                                aria-hidden="true"
                            />
                            <span className="text-sm text-textSecondary peer-checked:text-primary hover:text-primary transition-colors">
                                {cat.label}
                            </span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Price */}
            <div className="pt-6 border-t border-primary-100">
                <SectionLabel>Price</SectionLabel>
                <div className="grid grid-cols-2">
                    {priceRanges.map((range) => (
                        <label key={range.label} className="flex items-center gap-3 py-2 cursor-pointer">
                            <input
                                type="radio"
                                name={`priceRange-${groupId}`}
                                checked={filters.minPrice === range.min && filters.maxPrice === range.max}
                                onChange={() =>
                                    applyFilters({ ...filters, minPrice: range.min, maxPrice: range.max })
                                }
                                className="peer sr-only"
                            />
                            <span
                                className="w-4 h-4 shrink-0 rounded-full border border-primary-200 transition-all duration-200 peer-checked:border-[5px] peer-checked:border-primary peer-focus-visible:ring-2 peer-focus-visible:ring-primary peer-focus-visible:ring-offset-2"
                                aria-hidden="true"
                            />
                            <span className="text-sm text-textSecondary peer-checked:text-primary hover:text-primary transition-colors">
                                {range.label}
                            </span>
                        </label>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default function FilterSidebar({ currentFilters, resultCount, loading }: FilterSidebarProps) {
    const router = useRouter();
    const pathname = usePathname();
    const activeCount = countActive(currentFilters);

    return (
        <>
            {/* Desktop / tablet: horizontal filter bar */}
            <FilterBar urlFilters={currentFilters} resultCount={resultCount} loading={loading} />

            {/* Mobile: bottom-sheet drawer */}
            <Drawer.Root>
                <Drawer.Trigger asChild>
                    <button
                        type="button"
                        className="md:hidden fixed bottom-5 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 bg-primary text-secondary font-semibold text-sm rounded-full px-6 py-3 shadow-xl active:scale-95 transition-transform"
                    >
                        <SlidersHorizontal className="w-4 h-4" aria-hidden="true" />
                        Filters
                        {activeCount > 0 && (
                            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-secondary text-primary text-xs font-bold">
                                {activeCount}
                            </span>
                        )}
                    </button>
                </Drawer.Trigger>
                <Drawer.Portal>
                    <Drawer.Overlay className="md:hidden fixed inset-0 bg-black/40 z-40" />
                    <Drawer.Content className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-white rounded-t-3xl max-h-[85vh] flex flex-col focus:outline-none">
                        {/* Drag handle */}
                        <div className="mx-auto w-10 h-1 rounded-full bg-primary-200 mt-3 mb-1" aria-hidden="true" />

                        <div className="flex items-center justify-between px-6 py-4">
                            <Drawer.Title className="font-playfair text-xl font-semibold text-textPrimary">
                                Refine
                            </Drawer.Title>
                            {activeCount > 0 && (
                                <button
                                    type="button"
                                    onClick={() => router.replace(pathname, { scroll: false })}
                                    className="text-sm text-accent-700 hover:text-accent-hover font-medium"
                                >
                                    Clear All
                                </button>
                            )}
                        </div>

                        <div className="flex-1 overflow-y-auto px-6 pb-4">
                            <FilterPanel filters={currentFilters} />
                        </div>

                        {/* Sticky footer — filters auto-apply, this just closes */}
                        <div className="border-t border-primary-100 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
                            <Drawer.Close asChild>
                                <button
                                    type="button"
                                    className="w-full bg-primary text-secondary font-semibold rounded-full py-3.5 text-base hover:bg-primary-light transition-colors"
                                >
                                    {loading
                                        ? 'Curating…'
                                        : `View ${resultCount ?? 0} ${resultCount === 1 ? 'piece' : 'pieces'}`}
                                </button>
                            </Drawer.Close>
                        </div>
                    </Drawer.Content>
                </Drawer.Portal>
            </Drawer.Root>
        </>
    );
}
