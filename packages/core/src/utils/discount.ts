/**
 * Per-product discount helpers.
 *
 * `price` is always the MRP. `sale_price` is what the customer pays, or null
 * when there is no offer. Every surface — cards, detail, cart, checkout, POS,
 * SEO — reads the effective price from here so a rounding difference can never
 * put one figure on the card and another at checkout.
 *
 * Unrelated to the POS cart-wide offer, which is per-sale rather than
 * per-product and lives in the POS page itself.
 */

export type DiscountType = 'AMT' | 'PCT';

/** Anything carrying MRP + optional offer. Structural, so it accepts both the
 *  camelCase Product type and raw snake_case rows from Supabase. */
export interface DiscountablePrice {
    price: number;
    sale_price?: number | null;
    salePrice?: number | null;
}

/**
 * Sale price for a given MRP and discount, or null when there is no discount.
 * Rounded to whole rupees and clamped to 0…mrp — an offer can never raise the
 * price or push it below zero.
 */
export function calculateSalePrice(
    mrp: number,
    type: DiscountType | null | undefined,
    value: number | null | undefined,
): number | null {
    if (!type || !value || value <= 0 || mrp <= 0) return null;

    const off = type === 'PCT' ? (mrp * value) / 100 : value;
    const sale = Math.round(mrp - off);

    if (!Number.isFinite(sale)) return null;
    return Math.min(Math.max(sale, 0), mrp);
}

/** What the customer actually pays. Falls back to MRP when undiscounted. */
export function getEffectivePrice(product: DiscountablePrice): number {
    const sale = product.sale_price ?? product.salePrice;
    return sale != null && sale < product.price ? sale : product.price;
}

/** True when the product carries a live offer. */
export function hasDiscount(product: DiscountablePrice): boolean {
    const sale = product.sale_price ?? product.salePrice;
    return sale != null && sale < product.price;
}

/** Rupees saved. 0 when undiscounted. */
export function getDiscountSavings(product: DiscountablePrice): number {
    return Math.max(product.price - getEffectivePrice(product), 0);
}

/**
 * Whole-number percentage off, for the badge. Rounded so "20% OFF" reads
 * cleanly rather than "19.7% OFF".
 */
export function getDiscountPercent(product: DiscountablePrice): number {
    if (product.price <= 0) return 0;
    return Math.round((getDiscountSavings(product) / product.price) * 100);
}
