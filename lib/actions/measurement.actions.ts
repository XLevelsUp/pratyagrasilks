'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getCallerRole } from '@/lib/actions/role-guard';
import { isAdminLevelRole } from '@/lib/constants/roles';
import { MEASUREMENT_FIELDS } from '@/lib/constants/measurements';
import {
    measurementProfileSchema,
    MeasurementProfile,
} from '@/lib/validations/measurement.schema';

interface ActionResult<T = undefined> {
    success: boolean;
    error?: string;
    profile?: T extends MeasurementProfile ? MeasurementProfile : never;
    profiles?: T extends MeasurementProfile[] ? MeasurementProfile[] : never;
}

/** Staff gate — ADMIN and CASHIER may read/write measurement profiles */
async function assertStaff(action: string) {
    const role = await getCallerRole();
    if (!role || !isAdminLevelRole(role)) {
        throw new Error(`Not authorised to ${action}.`);
    }
    return role;
}

function mapRow(row: Record<string, unknown>): MeasurementProfile {
    const base = {
        id: row.id as string,
        customerId: row.customer_id as string,
        profileLabel: row.profile_label as string,
        outfitType: (row.outfit_type as string | null) ?? '',
        designer: (row.designer as string | null) ?? '',
        notes: (row.notes as string | null) ?? '',
        createdAt: row.created_at as string,
        updatedAt: row.updated_at as string,
    };
    const measurements = Object.fromEntries(
        MEASUREMENT_FIELDS.map((f) => [f.key, row[f.column] === null ? null : Number(row[f.column])])
    );
    return { ...base, ...measurements } as MeasurementProfile;
}

/** camelCase payload → snake_case row for insert/update */
function toRow(payload: Record<string, unknown>) {
    const row: Record<string, unknown> = {
        profile_label: payload.profileLabel,
        outfit_type: payload.outfitType || null,
        designer: payload.designer || null,
        notes: payload.notes || null,
    };
    for (const f of MEASUREMENT_FIELDS) {
        row[f.column] = payload[f.key] ?? null;
    }
    return row;
}

export async function getMeasurementProfiles(
    customerId: string
): Promise<ActionResult<MeasurementProfile[]>> {
    try {
        await assertStaff('view measurement profiles');
        const supabase = createClient();
        const { data, error } = await supabase
            .from('measurement_profiles')
            .select('*')
            .eq('customer_id', customerId)
            .order('created_at', { ascending: true });

        if (error) throw new Error(error.message);
        return { success: true, profiles: (data ?? []).map(mapRow) } as ActionResult<MeasurementProfile[]>;
    } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : 'Failed to load profiles' };
    }
}

export async function createMeasurementProfile(
    customerId: string,
    values: unknown
): Promise<ActionResult<MeasurementProfile>> {
    try {
        await assertStaff('create measurement profiles');

        const parsed = measurementProfileSchema.safeParse(values);
        if (!parsed.success) {
            return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid measurements' };
        }

        const supabase = createClient();
        const { data, error } = await supabase
            .from('measurement_profiles')
            .insert({ customer_id: customerId, ...toRow(parsed.data) })
            .select('*')
            .single();

        if (error) throw new Error(error.message);
        revalidatePath(`/admin/customers/${customerId}`);
        return { success: true, profile: mapRow(data) } as ActionResult<MeasurementProfile>;
    } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : 'Failed to save profile' };
    }
}

export async function updateMeasurementProfile(
    profileId: string,
    customerId: string,
    values: unknown
): Promise<ActionResult<MeasurementProfile>> {
    try {
        await assertStaff('update measurement profiles');

        const parsed = measurementProfileSchema.safeParse(values);
        if (!parsed.success) {
            return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid measurements' };
        }

        const supabase = createClient();
        const { data, error } = await supabase
            .from('measurement_profiles')
            .update(toRow(parsed.data))
            .eq('id', profileId)
            .select('*')
            .single();

        if (error) throw new Error(error.message);
        revalidatePath(`/admin/customers/${customerId}`);
        return { success: true, profile: mapRow(data) } as ActionResult<MeasurementProfile>;
    } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : 'Failed to update profile' };
    }
}

export async function deleteMeasurementProfile(
    profileId: string,
    customerId: string
): Promise<ActionResult> {
    try {
        const role = await assertStaff('delete measurement profiles');
        if (role !== 'ADMIN') {
            return { success: false, error: 'Only administrators can delete measurement profiles.' };
        }

        const supabase = createClient();
        const { error } = await supabase
            .from('measurement_profiles')
            .delete()
            .eq('id', profileId);

        if (error) throw new Error(error.message);
        revalidatePath(`/admin/customers/${customerId}`);
        return { success: true };
    } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : 'Failed to delete profile' };
    }
}
