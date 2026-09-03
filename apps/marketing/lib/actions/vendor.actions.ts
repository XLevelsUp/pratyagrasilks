'use server';

import { createClient } from '@/lib/supabase/server';
import { Vendor } from '@/lib/types';
import { revalidatePath } from 'next/cache';
import { getCallerRole, assertAdminOnly } from '@/lib/actions/role-guard';

export type VendorType = 'Artisan' | 'City' | 'Wholesaler';

export interface VendorInput {
    name: string;
    address?: string | null;
    contactPerson?: string | null;
    phone?: string | null;
    /** Storage paths within the vendor-docs bucket (from uploadVendorDoc) */
    documentPaths: string[];
    vendorType: VendorType;
    gst?: string | null;
    notes?: string | null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRow(row: any): Vendor {
    return {
        id: row.id,
        name: row.name,
        address: row.address ?? null,
        contactPerson: row.contact_person ?? null,
        phone: row.phone ?? null,
        documentUrls: row.document_urls ?? [],
        metadata: row.metadata ?? {},
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at),
    };
}

export async function getVendors(): Promise<Vendor[]> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('vendors')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return (data ?? []).map(mapRow);
}

export async function getVendorById(id: string): Promise<Vendor | null> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('vendors')
        .select('*')
        .eq('id', id)
        .single();

    if (error) return null;
    return mapRow(data);
}

export async function createVendor(input: VendorInput): Promise<{ id: string }> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('vendors')
        .insert({
            name: input.name,
            address: input.address ?? null,
            contact_person: input.contactPerson ?? null,
            phone: input.phone ?? null,
            document_urls: input.documentPaths,
            metadata: {
                type: input.vendorType,
                gst: input.gst ?? null,
                notes: input.notes ?? null,
            },
        })
        .select('id')
        .single();

    if (error) throw new Error(error.message);
    revalidatePath('/admin/vendors');
    return { id: data.id };
}

export async function updateVendor(id: string, input: Partial<VendorInput>): Promise<void> {
    const role = await getCallerRole();
    await assertAdminOnly(role, 'update vendors');

    const supabase = createClient();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const patch: Record<string, any> = {};
    if (input.name !== undefined)          patch.name           = input.name;
    if (input.address !== undefined)       patch.address        = input.address;
    if (input.contactPerson !== undefined) patch.contact_person = input.contactPerson;
    if (input.phone !== undefined)         patch.phone          = input.phone;
    if (input.documentPaths !== undefined) patch.document_urls  = input.documentPaths;

    // Merge metadata fields selectively to avoid overwriting unrelated keys
    const metaChanged = input.vendorType !== undefined || input.gst !== undefined || input.notes !== undefined;
    if (metaChanged) {
        const { data: current } = await supabase
            .from('vendors')
            .select('metadata')
            .eq('id', id)
            .single();
        const base = (current?.metadata ?? {}) as Record<string, unknown>;
        patch.metadata = {
            ...base,
            ...(input.vendorType !== undefined ? { type: input.vendorType } : {}),
            ...(input.gst !== undefined        ? { gst: input.gst }         : {}),
            ...(input.notes !== undefined      ? { notes: input.notes }     : {}),
        };
    }

    const { error } = await supabase.from('vendors').update(patch).eq('id', id);
    if (error) throw new Error(error.message);

    revalidatePath('/admin/vendors');
    revalidatePath(`/admin/vendors/${id}`);
}

export async function deleteVendorDocument(vendorId: string, docPath: string): Promise<void> {
    const role = await getCallerRole();
    await assertAdminOnly(role, 'delete vendor documents');

    const supabase = createClient();

    const { error: storageError } = await supabase.storage
        .from('vendor-docs')
        .remove([docPath]);
    if (storageError) throw new Error(storageError.message);

    const { data: vendor, error: fetchError } = await supabase
        .from('vendors')
        .select('document_urls')
        .eq('id', vendorId)
        .single();
    if (fetchError) throw new Error(fetchError.message);

    const updatedUrls = ((vendor?.document_urls ?? []) as string[]).filter((p) => p !== docPath);
    const { error: updateError } = await supabase
        .from('vendors')
        .update({ document_urls: updatedUrls })
        .eq('id', vendorId);
    if (updateError) throw new Error(updateError.message);

    revalidatePath('/admin/vendors');
    revalidatePath(`/admin/vendors/${vendorId}`);
    revalidatePath(`/admin/vendors/${vendorId}/edit`);
}

export async function deleteVendor(id: string): Promise<void> {
    const role = await getCallerRole();
    await assertAdminOnly(role, 'delete vendors');

    const supabase = createClient();
    const { error } = await supabase.from('vendors').delete().eq('id', id);
    if (error) throw new Error(error.message);

    revalidatePath('/admin/vendors');
}
