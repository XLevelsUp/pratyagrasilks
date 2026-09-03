'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { getCallerRole } from '@/lib/actions/role-guard';
import type { DiscountCampaign, CampaignBand } from '@pratyagra/core/utils/campaign';

/* eslint-disable @typescript-eslint/no-explicit-any */
function mapCampaign(row: any): DiscountCampaign {
    return {
        id: row.id,
        name: row.name,
        isActive: row.is_active,
        startsAt: row.starts_at ?? null,
        endsAt: row.ends_at ?? null,
        bands: (row.discount_campaign_bands ?? []).map((b: any) => ({
            id: b.id,
            minPrice: b.min_price != null ? Number(b.min_price) : null,
            maxPrice: b.max_price != null ? Number(b.max_price) : null,
            category: b.category ?? null,
            discountType: b.discount_type,
            discountValue: Number(b.discount_value),
        })),
    };
}

/**
 * The current campaign, or null. Returns it whether or not it is live right
 * now — callers use isCampaignLive() to decide, so the admin can still see a
 * scheduled or expired sale.
 */
export async function getActiveCampaign(): Promise<DiscountCampaign | null> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('discount_campaigns')
        .select('*, discount_campaign_bands(*)')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

    if (error) {
        // Surfaced rather than swallowed — a silent null makes every product
        // look undiscounted, indistinguishable from "no sale is running".
        throw new Error(`Could not load the sale campaign: ${error.message}`);
    }
    return data ? mapCampaign(data) : null;
}

export interface CampaignInput {
    name: string;
    startsAt: string | null;
    endsAt: string | null;
    bands: Omit<CampaignBand, 'id'>[];
}

/**
 * Replaces the current campaign with a new one. Only one runs at a time, so
 * the previous is deactivated rather than deleted — it stays as history.
 */
export async function saveCampaign(input: CampaignInput): Promise<void> {
    const role = await getCallerRole();
    if (role !== 'ADMIN') throw new Error('Only an admin can manage sale campaigns.');

    if (!input.bands.length) throw new Error('Add at least one discount band.');

    const supabase = createClient();

    // Retire any running campaign first — one active at a time
    await supabase
        .from('discount_campaigns')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('is_active', true);

    const { data: campaign, error } = await supabase
        .from('discount_campaigns')
        .insert({
            name: input.name,
            is_active: true,
            starts_at: input.startsAt,
            ends_at: input.endsAt,
        })
        .select('id')
        .single();

    if (error || !campaign) {
        throw new Error(error?.message || 'Could not create the sale.');
    }

    const { error: bandsError } = await supabase.from('discount_campaign_bands').insert(
        input.bands.map(b => ({
            campaign_id: campaign.id,
            min_price: b.minPrice,
            max_price: b.maxPrice,
            category: b.category,
            discount_type: b.discountType,
            discount_value: b.discountValue,
        })),
    );

    if (bandsError) {
        // Roll back so we never leave a campaign with no bands
        await supabase.from('discount_campaigns').delete().eq('id', campaign.id);
        throw new Error(bandsError.message);
    }

    revalidateStorefront();
}

/** Ends the running sale immediately. Prices revert on the next render. */
export async function endCampaign(): Promise<void> {
    const role = await getCallerRole();
    if (role !== 'ADMIN') throw new Error('Only an admin can manage sale campaigns.');

    const supabase = createClient();

    const { data, error } = await supabase
        .from('discount_campaigns')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('is_active', true)
        .select('id');

    if (error) throw new Error(error.message);
    if (!data || data.length === 0) {
        throw new Error('No sale is running, or the database rejected the change.');
    }

    revalidateStorefront();
}

function revalidateStorefront() {
    revalidatePath('/');
    revalidatePath('/collection');
    revalidatePath('/admin/products');
    revalidatePath('/admin/pos');
}
