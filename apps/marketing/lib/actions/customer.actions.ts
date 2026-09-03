'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getCallerRole } from '@/lib/actions/role-guard';
import { isAdminLevelRole } from '@/lib/constants/roles';
import { walkInCustomerSchema } from '@/lib/validations/walkInCustomer.schema';

export interface CreateWalkInResult {
    success: boolean;
    error?: string;
    customerId?: string;
    /** true → the phone already belonged to a customer; customerId points at them */
    existing?: boolean;
    existingName?: string;
}

export interface UpdateCustomerResult {
    success: boolean;
    error?: string;
    customer?: {
        fullName: string;
        phone: string;
        email: string | null;
    };
}

/**
 * Create a guest (walk-in) customer from the admin dashboard so the tailoring
 * measurement flow can start before the client has a digital account.
 * Find-or-return semantics: an already-known phone returns the existing
 * customer instead of erroring, so the UI can jump straight to their profile.
 * Runs through the RLS client — inserts are allowed by the
 * "Staff can insert guest customers" policy (is_guest = true only).
 */
export async function createWalkInCustomer(values: unknown): Promise<CreateWalkInResult> {
    try {
        const role = await getCallerRole();
        if (!role || !isAdminLevelRole(role)) {
            throw new Error('Not authorised to create walk-in customers.');
        }

        const parsed = walkInCustomerSchema.safeParse(values);
        if (!parsed.success) {
            return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid customer details' };
        }

        const { fullName, phone, email } = parsed.data; // phone is E.164
        const supabase = createClient();

        // Find-or-return across ALL customers (guest or registered)
        const { data: existing, error: lookupError } = await supabase
            .from('customers')
            .select('id, full_name')
            .eq('phone', phone)
            .order('created_at', { ascending: true })
            .limit(1)
            .maybeSingle();

        if (lookupError) throw new Error(lookupError.message);
        if (existing) {
            return { success: true, customerId: existing.id, existing: true, existingName: existing.full_name };
        }

        const { data, error } = await supabase
            .from('customers')
            .insert({
                full_name: fullName,
                phone,
                email: email ?? null,
                source: 'POS',
                is_guest: true,
            })
            .select('id')
            .single();

        if (error) {
            if (error.code === '23505') {
                // Race on uq_customers_guest_phone — another staff member created
                // this customer between our select and insert. Return the winner.
                const { data: raced } = await supabase
                    .from('customers')
                    .select('id, full_name')
                    .eq('phone', phone)
                    .limit(1)
                    .maybeSingle();
                if (raced) {
                    return { success: true, customerId: raced.id, existing: true, existingName: raced.full_name };
                }
                return { success: false, error: 'A customer with this email already exists.' };
            }
            throw new Error(error.message);
        }

        revalidatePath('/admin/customers');
        return { success: true, customerId: data.id, existing: false };
    } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : 'Failed to create customer' };
    }
}

/**
 * Correct a customer's details after creation (typo fixes). ADMIN only —
 * cashiers create walk-ins, admins fix mistakes. Email is only writable for
 * guests: registered customers' email is synced from their auth login and
 * must not desync. RLS enforcement via "Admins can update customers".
 */
export async function updateCustomer(customerId: string, values: unknown): Promise<UpdateCustomerResult> {
    try {
        const role = await getCallerRole();
        if (role !== 'ADMIN') {
            throw new Error('Not authorised to edit customers.');
        }

        const parsed = walkInCustomerSchema.safeParse(values);
        if (!parsed.success) {
            return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid customer details' };
        }

        const { fullName, phone, email } = parsed.data; // phone is E.164
        const supabase = createClient();

        const { data: target, error: targetError } = await supabase
            .from('customers')
            .select('id, is_guest, email')
            .eq('id', customerId)
            .maybeSingle();

        if (targetError) throw new Error(targetError.message);
        if (!target) return { success: false, error: 'Customer not found' };

        // Phone must not belong to anyone else (guest or registered)
        const { data: phoneOwner, error: phoneError } = await supabase
            .from('customers')
            .select('id, full_name')
            .eq('phone', phone)
            .neq('id', customerId)
            .limit(1)
            .maybeSingle();

        if (phoneError) throw new Error(phoneError.message);
        if (phoneOwner) {
            return { success: false, error: `This phone number already belongs to ${phoneOwner.full_name}.` };
        }

        const updatePayload: Record<string, unknown> = { full_name: fullName, phone };
        if (target.is_guest) {
            updatePayload.email = email ?? null;
        }

        const { data, error } = await supabase
            .from('customers')
            .update(updatePayload)
            .eq('id', customerId)
            .select('full_name, phone, email')
            .single();

        if (error) {
            if (error.code === '23505') {
                return { success: false, error: 'Another customer already uses this phone number or email.' };
            }
            throw new Error(error.message);
        }

        revalidatePath('/admin/customers');
        revalidatePath(`/admin/customers/${customerId}`);
        return {
            success: true,
            customer: { fullName: data.full_name, phone: data.phone, email: data.email },
        };
    } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : 'Failed to update customer' };
    }
}
