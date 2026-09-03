import { createClient } from '@supabase/supabase-js';
import { DiscountCampaign } from '@pratyagra/core/utils/campaign';

/**
 * The POS counter needs the running campaign so scanned items price the same
 * way the storefront prices them.
 *
 * This is a deliberate ~30-line copy of getActiveCampaignPublic from the
 * marketing app's lib/data/public-products.ts, rather than promoting that
 * 200-line storefront data module (new arrivals, product listings, ISR
 * concerns) into a shared package for one function. The shared thing that
 * actually matters — the DiscountCampaign shape and the band-application
 * maths — already lives in @pratyagra/core/utils/campaign, so the two copies
 * cannot drift on pricing behaviour, only on this one query.
 */

// Cookie-free anon client: this is public catalog data and needs no session.
function publicClient() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { auth: { persistSession: false } },
    );
}

/** The running festival sale, or null. */
export async function getActiveCampaignPublic(): Promise<DiscountCampaign | null> {
    const supabase = publicClient();

    const { data, error } = await supabase
        .from('discount_campaigns')
        .select('*, discount_campaign_bands(*)')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

    // A missing table (migration not yet run) must not break the POS
    if (error || !data) return null;

    /* eslint-disable @typescript-eslint/no-explicit-any */
    return {
        id: data.id,
        name: data.name,
        isActive: data.is_active,
        startsAt: data.starts_at ?? null,
        endsAt: data.ends_at ?? null,
        bands: (data.discount_campaign_bands ?? []).map((b: any) => ({
            id: b.id,
            minPrice: b.min_price != null ? Number(b.min_price) : null,
            maxPrice: b.max_price != null ? Number(b.max_price) : null,
            category: b.category ?? null,
            discountType: b.discount_type,
            discountValue: Number(b.discount_value),
        })),
    };
}
