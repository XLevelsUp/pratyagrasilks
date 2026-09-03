'use client';

import { useMemo, useState } from 'react';
import { Tag, X, Plus, Trash2, AlertTriangle, Loader2, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import { saveCampaign, endCampaign } from '@/lib/actions/campaign.actions';
import {
    DiscountCampaign,
    CampaignBand,
    bandMatches,
    isCampaignLive,
    isCampaignScheduled,
} from '@/lib/utils/campaign';
import { calculateSalePrice, DiscountType } from '@/lib/utils/discount';

interface TargetProduct {
    id: string;
    name: string;
    price: number;
    category: string;
    is_online?: boolean;
    in_stock?: boolean;
    exclude_from_sales?: boolean;
    purchase_price?: number | null;
    purchase_tax_percent?: number | null;
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
    products: TargetProduct[];
    campaign: DiscountCampaign | null;
    categories: { value: string; label: string }[];
    onSaved: () => void;
}

type DraftBand = {
    minPrice: string;
    maxPrice: string;
    category: string;
    discountType: DiscountType;
    discountValue: string;
};

const emptyBand = (): DraftBand => ({
    minPrice: '',
    maxPrice: '',
    category: '',
    discountType: 'PCT',
    discountValue: '',
});

const fmt = (n: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

// yyyy-MM-ddTHH:mm for <input type="datetime-local">, or '' when unset.
// Uses local parts, not toISOString(), so a 10:00 IST sale doesn't reopen as
// 04:30 after the UTC conversion.
const toDateTimeInput = (iso: string | null) => {
    if (!iso) return '';
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export default function BulkDiscountDialog({
    isOpen,
    onClose,
    products,
    campaign,
    categories,
    onSaved,
}: Props) {
    const [name, setName] = useState(campaign?.name ?? '');
    const [startDate, setStartDate] = useState(toDateTimeInput(campaign?.startsAt ?? null));
    const [endDate, setEndDate] = useState(toDateTimeInput(campaign?.endsAt ?? null));
    const [bands, setBands] = useState<DraftBand[]>(
        campaign?.bands.length
            ? campaign.bands.map(b => ({
                  minPrice: b.minPrice?.toString() ?? '',
                  maxPrice: b.maxPrice?.toString() ?? '',
                  category: b.category ?? '',
                  discountType: b.discountType,
                  discountValue: b.discountValue.toString(),
              }))
            : [emptyBand()],
    );
    const [saving, setSaving] = useState(false);
    const [ending, setEnding] = useState(false);

    // Draft bands in the shape the matcher expects
    const parsedBands: CampaignBand[] = useMemo(
        () =>
            bands
                .filter(b => parseFloat(b.discountValue) > 0)
                .map(b => ({
                    minPrice: b.minPrice ? parseFloat(b.minPrice) : null,
                    maxPrice: b.maxPrice ? parseFloat(b.maxPrice) : null,
                    category: b.category || null,
                    discountType: b.discountType,
                    discountValue: parseFloat(b.discountValue),
                })),
        [bands],
    );

    // Live preview — the admin's check against a typo before the sale goes public
    const preview = useMemo(() => {
        // Sold sarees can't be bought at a sale price, so they never count
        const online = products.filter(p => p.is_online !== false && p.in_stock !== false);
        const matched: { product: TargetProduct; salePrice: number; belowCost: boolean }[] = [];

        for (const product of online) {
            let best: number | null = null;

            for (const band of parsedBands) {
                if (!bandMatches(band, {
                    price: product.price,
                    category: product.category,
                    isOnline: true,
                    inStock: true,
                    excludeFromSales: product.exclude_from_sales ?? false,
                })) continue;
                const candidate = calculateSalePrice(product.price, band.discountType, band.discountValue);
                if (candidate === null) continue;
                if (best === null || candidate < best) best = candidate;
            }

            if (best === null) continue;

            const landingCost =
                (Number(product.purchase_price) || 0) * (1 + (Number(product.purchase_tax_percent) || 0) / 100);

            matched.push({ product, salePrice: best, belowCost: landingCost > 0 && best < landingCost });
        }

        return {
            matched,
            total: online.length,
            belowCostCount: matched.filter(m => m.belowCost).length,
        };
    }, [products, parsedBands]);

    if (!isOpen) return null;

    const updateBand = (index: number, patch: Partial<DraftBand>) =>
        setBands(prev => prev.map((b, i) => (i === index ? { ...b, ...patch } : b)));

    const handleSave = async () => {
        if (!name.trim()) {
            toast.error('Give the sale a name, e.g. "Diwali Sale"');
            return;
        }
        if (!parsedBands.length) {
            toast.error('Add at least one band with a discount value');
            return;
        }
        if (startDate && endDate && new Date(endDate) <= new Date(startDate)) {
            toast.error('End date must be after the start date');
            return;
        }

        setSaving(true);
        try {
            await saveCampaign({
                name: name.trim(),
                // datetime-local is already local wall-clock time; new Date()
                // reads it in the browser's zone, so the stored instant matches
                // what the admin typed.
                startsAt: startDate ? new Date(startDate).toISOString() : null,
                endsAt: endDate ? new Date(endDate).toISOString() : null,
                bands: parsedBands,
            });
            toast.success('Sale saved');
            onSaved();
            onClose();
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Could not save the sale');
        } finally {
            setSaving(false);
        }
    };

    const handleEnd = async () => {
        setEnding(true);
        try {
            await endCampaign();
            toast.success('Sale ended — prices are back to normal');
            onSaved();
            onClose();
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Could not end the sale');
        } finally {
            setEnding(false);
        }
    };

    const live = isCampaignLive(campaign);
    const scheduled = isCampaignScheduled(campaign);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-5">
                    <div>
                        <h3 className="flex items-center gap-2 text-lg font-bold text-gray-900">
                            <Tag className="w-5 h-5 text-[#550c72]" />
                            Bulk Discount
                        </h3>
                        <p className="text-xs text-gray-500 mt-0.5">
                            Applies to sarees listed on the website. Each saree takes its best available discount.
                        </p>
                    </div>
                    <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {campaign && (live || scheduled) && (
                    <div
                        className={`rounded-xl px-4 py-2.5 mb-5 text-sm font-medium ${
                            live
                                ? 'bg-green-50 border border-green-200 text-green-800'
                                : 'bg-blue-50 border border-blue-200 text-blue-800'
                        }`}
                    >
                        {live ? '● Running now' : '◷ Scheduled'} — {campaign.name}
                        {campaign.startsAt && !live && (
                            <span className="font-normal">
                                {' '}· starts{' '}
                                {new Date(campaign.startsAt).toLocaleString('en-IN', {
                                    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true,
                                })}
                            </span>
                        )}
                        {campaign.endsAt && (
                            <span className="font-normal">
                                {' '}· ends{' '}
                                {new Date(campaign.endsAt).toLocaleString('en-IN', {
                                    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true,
                                })}
                            </span>
                        )}
                    </div>
                )}

                {/* Sale name */}
                <div className="mb-5">
                    <label className="block text-xs font-semibold text-gray-600 uppercase mb-2">Sale name</label>
                    <input
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="e.g. Diwali Sale, Aadi Offer"
                        className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#550c72]"
                    />
                </div>

                {/* Bands */}
                <div className="mb-5">
                    <label className="block text-xs font-semibold text-gray-600 uppercase mb-2">
                        Discount bands
                    </label>
                    <div className="space-y-3">
                        {bands.map((band, i) => (
                            <div key={i} className="bg-gray-50 border border-gray-200 rounded-xl p-3">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-semibold text-gray-500">Band {i + 1}</span>
                                    {bands.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => setBands(prev => prev.filter((_, idx) => idx !== i))}
                                            className="text-red-400 hover:text-red-600"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                    <input
                                        type="number"
                                        min="0"
                                        value={band.minPrice}
                                        onChange={e => updateBand(i, { minPrice: e.target.value })}
                                        placeholder="Min ₹"
                                        className="px-2.5 py-2 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#550c72]"
                                    />
                                    <input
                                        type="number"
                                        min="0"
                                        value={band.maxPrice}
                                        onChange={e => updateBand(i, { maxPrice: e.target.value })}
                                        placeholder="Max ₹"
                                        className="px-2.5 py-2 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#550c72]"
                                    />
                                    <select
                                        value={band.category}
                                        onChange={e => updateBand(i, { category: e.target.value })}
                                        className="px-2.5 py-2 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#550c72]"
                                    >
                                        <option value="">All categories</option>
                                        {categories.map(c => (
                                            <option key={c.value} value={c.value}>
                                                {c.label}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="flex gap-1.5">
                                        <div className="flex rounded-lg border-2 border-gray-200 overflow-hidden flex-shrink-0">
                                            {(['AMT', 'PCT'] as DiscountType[]).map(mode => (
                                                <button
                                                    key={mode}
                                                    type="button"
                                                    onClick={() => updateBand(i, { discountType: mode })}
                                                    className={`px-2.5 py-2 text-sm font-bold transition-colors ${
                                                        band.discountType === mode
                                                            ? 'bg-[#550c72] text-white'
                                                            : 'bg-white text-gray-500 hover:bg-gray-50'
                                                    }`}
                                                >
                                                    {mode === 'AMT' ? '₹' : '%'}
                                                </button>
                                            ))}
                                        </div>
                                        <input
                                            type="number"
                                            min="0"
                                            value={band.discountValue}
                                            onChange={e => updateBand(i, { discountValue: e.target.value })}
                                            placeholder="Off"
                                            className="w-full min-w-0 px-2 py-2 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#550c72]"
                                        />
                                    </div>
                                </div>
                                <p className="text-[11px] text-gray-400 mt-1.5">
                                    Leave min/max empty for no limit. Overlapping bands are fine — the deepest
                                    discount wins.
                                </p>
                            </div>
                        ))}
                    </div>

                    <button
                        type="button"
                        onClick={() => setBands(prev => [...prev, emptyBand()])}
                        className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#550c72] bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        Add band
                    </button>
                </div>

                {/* Period */}
                <div className="mb-5">
                    <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 uppercase mb-2">
                        <Calendar className="w-3.5 h-3.5" />
                        Period (optional)
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <span className="block text-[11px] text-gray-500 mb-1">Starts</span>
                            <input
                                type="datetime-local"
                                value={startDate}
                                onChange={e => setStartDate(e.target.value)}
                                className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#550c72]"
                            />
                        </div>
                        <div>
                            <span className="block text-[11px] text-gray-500 mb-1">Ends</span>
                            <input
                                type="datetime-local"
                                value={endDate}
                                onChange={e => setEndDate(e.target.value)}
                                className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#550c72]"
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                        <button
                            type="button"
                            onClick={() => {
                                if (startDate) setStartDate(`${startDate.split('T')[0]}T00:00`);
                                if (endDate) setEndDate(`${endDate.split('T')[0]}T23:59`);
                            }}
                            className="text-[11px] font-medium text-[#550c72] bg-purple-50 border border-purple-200 rounded px-2 py-1 hover:bg-purple-100"
                        >
                            Whole days
                        </button>
                        <span className="text-[11px] text-gray-400">
                            sets 00:00 → 23:59
                        </span>
                    </div>
                    <p className="text-[11px] text-gray-400 mt-1.5">
                        Leave empty to run until you remove it. With an end time the sale stops on its own.
                    </p>
                </div>

                {/* Live preview */}
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-5">
                    <p className="text-sm font-semibold text-gray-700 mb-2">
                        {preview.matched.length} of {preview.total} website sarees match
                    </p>
                    {preview.matched.length > 0 && (
                        <div className="space-y-1 max-h-32 overflow-y-auto">
                            {preview.matched.slice(0, 6).map(({ product, salePrice, belowCost }) => (
                                <div key={product.id} className="flex justify-between text-xs">
                                    <span className="text-gray-600 truncate flex-1 mr-3">{product.name}</span>
                                    <span className="flex items-baseline gap-1.5 flex-shrink-0">
                                        <span className="text-gray-400 line-through">{fmt(product.price)}</span>
                                        <span className={belowCost ? 'text-red-600 font-semibold' : 'text-green-700 font-semibold'}>
                                            {fmt(salePrice)}
                                        </span>
                                    </span>
                                </div>
                            ))}
                            {preview.matched.length > 6 && (
                                <p className="text-[11px] text-gray-400 pt-1">
                                    + {preview.matched.length - 6} more
                                </p>
                            )}
                        </div>
                    )}
                </div>

                {/* Below-cost warning */}
                {preview.belowCostCount > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-5 flex gap-3">
                        <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm font-semibold text-red-800">
                                {preview.belowCostCount} saree{preview.belowCostCount > 1 ? 's' : ''} would sell below cost
                            </p>
                            <p className="text-xs text-red-700 mt-1">
                                Shown in red above. You can still save — check a flat ₹ amount isn&apos;t hitting
                                cheaper sarees.
                            </p>
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-3">
                    {campaign && (
                        <button
                            type="button"
                            onClick={handleEnd}
                            disabled={ending || saving}
                            className="px-4 py-3 border-2 border-red-200 text-red-600 rounded-xl font-semibold text-sm hover:bg-red-50 disabled:opacity-40 transition-colors whitespace-nowrap"
                        >
                            {ending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'End sale'}
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={saving || ending}
                        className="flex-1 py-3 border-2 border-gray-200 text-gray-600 rounded-xl font-semibold hover:bg-gray-50 disabled:opacity-40 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={saving || ending || !parsedBands.length}
                        className="flex-[2] py-3 bg-[#550c72] hover:bg-[#8430AB] disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"
                    >
                        {saving ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            `Apply to ${preview.matched.length} saree${preview.matched.length === 1 ? '' : 's'}`
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
