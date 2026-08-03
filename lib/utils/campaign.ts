/**
 * Bulk discount campaigns — site-wide festival sales.
 *
 * Separate from the per-product discount in `discount.ts`. That one writes
 * sale_price onto the product row; this one writes nothing and computes at
 * render time. Two things fall out of that:
 *
 *   - A festival sale never overwrites a product's own discount. When the
 *     sale ends, the per-product offer is still there.
 *   - Expiry needs no scheduled job. Past ends_at, isCampaignLive() returns
 *     false and every page prices normally again.
 *
 * A product takes the single BEST discount available — the largest of its own
 * sale_price and any matching band. Discounts are never summed, so a customer
 * never pays less than the biggest number advertised.
 */

import { DiscountType, calculateSalePrice } from './discount';

export interface CampaignBand {
    id?: string;
    minPrice: number | null;
    maxPrice: number | null;
    category: string | null;
    discountType: DiscountType;
    discountValue: number;
}

export interface DiscountCampaign {
    id: string;
    name: string;
    isActive: boolean;
    startsAt: string | null;
    endsAt: string | null;
    bands: CampaignBand[];
}

/** Product shape needed to price against a campaign. */
export interface CampaignTarget {
    price: number;
    category?: string | null;
    isOnline?: boolean;
    is_online?: boolean;
    sale_price?: number | null;
    salePrice?: number | null;
    /** Held at full price — festival sales skip it. */
    excludeFromSales?: boolean;
    exclude_from_sales?: boolean;
    inStock?: boolean;
    in_stock?: boolean;
}

/**
 * Whether the campaign is running right now.
 *
 * This is the expiry mechanism: once `endsAt` is in the past the campaign
 * stops matching and prices revert on their own. A future `startsAt` means
 * scheduled-but-not-yet-visible.
 */
export function isCampaignLive(
    campaign: Pick<DiscountCampaign, 'isActive' | 'startsAt' | 'endsAt'> | null | undefined,
    now: Date = new Date(),
): boolean {
    if (!campaign || !campaign.isActive) return false;

    const t = now.getTime();
    if (campaign.startsAt && t < new Date(campaign.startsAt).getTime()) return false;
    if (campaign.endsAt && t > new Date(campaign.endsAt).getTime()) return false;
    return true;
}

/** Campaign has a start date still in the future. */
export function isCampaignScheduled(
    campaign: Pick<DiscountCampaign, 'isActive' | 'startsAt'> | null | undefined,
    now: Date = new Date(),
): boolean {
    if (!campaign || !campaign.isActive || !campaign.startsAt) return false;
    return now.getTime() < new Date(campaign.startsAt).getTime();
}

/** Campaign has run its course. */
export function isCampaignExpired(
    campaign: Pick<DiscountCampaign, 'endsAt'> | null | undefined,
    now: Date = new Date(),
): boolean {
    if (!campaign?.endsAt) return false;
    return now.getTime() > new Date(campaign.endsAt).getTime();
}

/**
 * Does this band cover the product? Bands are scoped to the website — a
 * POS-only saree is never touched by a festival sale.
 */
export function bandMatches(band: CampaignBand, product: CampaignTarget): boolean {
    const online = product.isOnline ?? product.is_online ?? true;
    if (!online) return false;

    // Admin has pinned this saree at full price
    if (product.excludeFromSales ?? product.exclude_from_sales ?? false) return false;

    // A sold saree can't be bought at the sale price, so advertising one is
    // misleading — it stays at MRP with no badge.
    const inStock = product.inStock ?? product.in_stock ?? true;
    if (!inStock) return false;

    if (band.minPrice != null && product.price < band.minPrice) return false;
    if (band.maxPrice != null && product.price > band.maxPrice) return false;
    if (band.category && product.category !== band.category) return false;

    return true;
}

/**
 * Best campaign price for a product, or null when no band applies.
 * With overlapping bands the deepest discount wins.
 */
export function getCampaignPrice(
    product: CampaignTarget,
    campaign: DiscountCampaign | null | undefined,
    now: Date = new Date(),
): number | null {
    if (!isCampaignLive(campaign, now) || !campaign) return null;

    let best: number | null = null;

    for (const band of campaign.bands) {
        if (!bandMatches(band, product)) continue;

        const candidate = calculateSalePrice(product.price, band.discountType, band.discountValue);
        if (candidate === null) continue;
        if (best === null || candidate < best) best = candidate;
    }

    return best;
}

/**
 * Final price after weighing the product's own discount against the campaign.
 * Whichever is cheaper for the customer wins; they are never combined.
 */
export function getFinalPrice(
    product: CampaignTarget,
    campaign: DiscountCampaign | null | undefined,
    now: Date = new Date(),
): number {
    const own = product.sale_price ?? product.salePrice ?? null;
    const ownPrice = own != null && own < product.price ? own : product.price;

    const campaignPrice = getCampaignPrice(product, campaign, now);
    if (campaignPrice === null) return ownPrice;

    return Math.min(ownPrice, campaignPrice);
}

/** True when the product is discounted by either route. */
export function hasAnyDiscount(
    product: CampaignTarget,
    campaign: DiscountCampaign | null | undefined,
    now: Date = new Date(),
): boolean {
    return getFinalPrice(product, campaign, now) < product.price;
}

/** Rupees saved against MRP. */
export function getFinalSavings(
    product: CampaignTarget,
    campaign: DiscountCampaign | null | undefined,
    now: Date = new Date(),
): number {
    return Math.max(product.price - getFinalPrice(product, campaign, now), 0);
}

/** Whole-number percentage off, for the badge. */
export function getFinalDiscountPercent(
    product: CampaignTarget,
    campaign: DiscountCampaign | null | undefined,
    now: Date = new Date(),
): number {
    if (product.price <= 0) return 0;
    return Math.round((getFinalSavings(product, campaign, now) / product.price) * 100);
}
