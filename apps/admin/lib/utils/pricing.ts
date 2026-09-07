/**
 * Calculate MRP using a cost-plus-margin model.
 *
 * landingCost         = purchasePrice × (1 + purchaseTax / 100)
 * taxableSellingPrice = landingCost   × (1 + margin      / 100)
 * mrp                 = taxableSellingPrice × (1 + sellingTax / 100)
 */
export function calculateMrp(
    purchasePrice: number,
    purchaseTaxPercent: number,
    marginPercent: number,
    sellingTaxPercent: number,
): number {
    const landingCost = purchasePrice * (1 + purchaseTaxPercent / 100);
    const taxableSellingPrice = landingCost * (1 + marginPercent / 100);
    const mrp = taxableSellingPrice * (1 + sellingTaxPercent / 100);
    return Math.round(mrp);
}
