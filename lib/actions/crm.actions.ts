'use server';

import { createClient } from '@supabase/supabase-js';
import { normalizeToE164 } from '@/lib/utils/phone';

export interface PosCustomer {
    id: string;
    email: string | null;
    phone: string | null;
    full_name: string;
    source: 'ONLINE' | 'POS' | 'BOTH';
    total_spent: number;
    total_orders: number;
    last_purchase: string | null;
    created_at: string;
}

export interface CustomerLookupResult {
    success: boolean;
    customer?: PosCustomer;
    error?: string;
}

function getServiceClient() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { autoRefreshToken: false, persistSession: false } }
    );
}

export async function lookupOrCreateCustomer(
    phone: string,
    name?: string
): Promise<CustomerLookupResult> {
    try {
        const supabase = getServiceClient();
        const cleanPhone = normalizeToE164(phone);

        if (!cleanPhone) {
            return { success: false, error: 'Enter a valid 10-digit mobile number' };
        }

        // Lookup existing customer by phone (stored as E.164)
        const { data: existing, error: lookupError } = await supabase
            .from('customers')
            .select('*')
            .eq('phone', cleanPhone)
            .single();

        if (existing) {
            return { success: true, customer: existing as PosCustomer };
        }

        // 404 is expected if not found; other errors are real problems
        if (lookupError && lookupError.code !== 'PGRST116') {
            return { success: false, error: lookupError.message };
        }

        // Create new POS customer
        const { data: created, error: insertError } = await supabase
            .from('customers')
            .insert({
                phone: cleanPhone,
                full_name: name?.trim() || 'Walk-in Customer',
                email: null,
                source: 'POS',
                is_guest: true,
            })
            .select()
            .single();

        if (insertError?.code === '23505') {
            // Race on uq_customers_guest_phone — another terminal created this
            // customer between our lookup and insert. Return the winner.
            const { data: raced } = await supabase
                .from('customers')
                .select('*')
                .eq('phone', cleanPhone)
                .limit(1)
                .maybeSingle();
            if (raced) {
                return { success: true, customer: raced as PosCustomer };
            }
        }

        if (insertError || !created) {
            return { success: false, error: insertError?.message || 'Failed to create customer' };
        }

        return { success: true, customer: created as PosCustomer };
    } catch (err) {
        console.error('lookupOrCreateCustomer error:', err);
        return { success: false, error: 'Internal server error' };
    }
}

export async function getCustomerByPhone(phone: string): Promise<CustomerLookupResult> {
    try {
        const supabase = getServiceClient();
        const cleanPhone = normalizeToE164(phone);

        if (!cleanPhone) {
            return { success: false, error: 'Customer not found' };
        }

        const { data: customer, error } = await supabase
            .from('customers')
            .select('*')
            .eq('phone', cleanPhone)
            .single();

        if (error && error.code === 'PGRST116') {
            return { success: false, error: 'Customer not found' };
        }

        if (error) {
            return { success: false, error: error.message };
        }

        return { success: true, customer: customer as PosCustomer };
    } catch (err) {
        console.error('getCustomerByPhone error:', err);
        return { success: false, error: 'Internal server error' };
    }
}

export async function updateCustomerName(
    customerId: string,
    name: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const supabase = getServiceClient();

        const { error } = await supabase
            .from('customers')
            .update({ full_name: name.trim() })
            .eq('id', customerId);

        if (error) {
            return { success: false, error: error.message };
        }

        return { success: true };
    } catch (err) {
        console.error('updateCustomerName error:', err);
        return { success: false, error: 'Failed to update customer' };
    }
}
