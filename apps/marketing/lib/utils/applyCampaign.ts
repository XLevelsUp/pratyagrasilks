/**
 * Folds a live campaign into a product's salePrice.
 *
 * Every storefront surface already reads salePrice via getEffectivePrice(), so
 * resolving the campaign here means cards, cart, checkout, POS and SEO pick up
 * festival pricing without any of them needing to know campaigns exist.
 *
 * The product's own discount is preserved whenever it is the better offer, and
 * `price` (the MRP) is never touched.
 */

import { DiscountCampaign, getFinalPrice } from './campaign';

export interface CampaignApplicable {
    price: number;
    salePrice?: number | null;
    sale_price?: number | null;
    category?: string | null;
    isOnline?: boolean;
    is_online?: boolean;
    excludeFromSales?: boolean;
    exclude_from_sales?: boolean;
    inStock?: boolean;
    in_stock?: boolean;
}

/** Returns the product with salePrice set to the best available offer. */
export function applyCampaignToProduct<T extends CampaignApplicable>(
    product: T,
    campaign: DiscountCampaign | null,
    now: Date = new Date(),
): T {
    if (!campaign) return product;

    const final = getFinalPrice(product, campaign, now);
    if (final >= product.price) return product;

    return { ...product, salePrice: final, sale_price: final };
}

export function applyCampaignToProducts<T extends CampaignApplicable>(
    products: T[],
    campaign: DiscountCampaign | null,
    now: Date = new Date(),
): T[] {
    if (!campaign) return products;
    return products.map(p => applyCampaignToProduct(p, campaign, now));
}
