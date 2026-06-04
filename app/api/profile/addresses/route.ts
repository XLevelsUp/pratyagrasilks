import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// ── GET /api/profile/addresses ────────────────────────────────────────────────
export async function GET() {
    const supabase = createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: customer, error: customerError } = await supabase
        .from('customers')
        .select('id')
        .eq('email', user.email)
        .single();

    if (customerError || !customer) {
        return NextResponse.json({ error: 'Customer profile not found' }, { status: 404 });
    }

    const { data: addresses, error: addressesError } = await supabase
        .from('addresses')
        .select('*')
        .eq('customer_id', customer.id)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });

    if (addressesError) {
        return NextResponse.json({ error: addressesError.message }, { status: 500 });
    }

    return NextResponse.json({ addresses });
}

// ── POST /api/profile/addresses ───────────────────────────────────────────────
export async function POST(req: NextRequest) {
    const supabase = createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: customer, error: customerError } = await supabase
        .from('customers')
        .select('id')
        .eq('email', user.email)
        .single();

    if (customerError || !customer) {
        return NextResponse.json({ error: 'Customer profile not found' }, { status: 404 });
    }

    try {
        const body = await req.json();
        const {
            label = 'Home',
            full_name,
            phone,
            address_line1,
            address_line2,
            city,
            state,
            postal_code,
            country = 'India',
            is_default = false,
        } = body;

        if (!full_name || typeof full_name !== 'string' || full_name.trim().length < 2) {
            return NextResponse.json({ error: 'Full name must be at least 2 characters.' }, { status: 400 });
        }
        const cleanedPhone = phone ? phone.trim().replace(/[\s-()]/g, '') : '';
        if (!cleanedPhone || !/^(\+[1-9]\d{7,14}|\d{10})$/.test(cleanedPhone)) {
            return NextResponse.json({ error: 'Please provide a valid 10-digit mobile number or international number starting with + (e.g. 9876543210 or +919876543210).' }, { status: 400 });
        }
        if (!address_line1 || typeof address_line1 !== 'string' || address_line1.trim().length < 5) {
            return NextResponse.json({ error: 'Address Line 1 must be at least 5 characters.' }, { status: 400 });
        }
        if (!city || typeof city !== 'string' || city.trim().length < 2) {
            return NextResponse.json({ error: 'City is required.' }, { status: 400 });
        }
        const countryHasStates = country && ['India', 'United States', 'Canada', 'Australia'].includes(country);
        if (countryHasStates) {
            if (!state || typeof state !== 'string' || state.trim().length < 2) {
                return NextResponse.json({ error: 'State is required.' }, { status: 400 });
            }
        } else {
            if (state && (typeof state !== 'string' || state.trim().length < 2)) {
                return NextResponse.json({ error: 'State must be at least 2 characters.' }, { status: 400 });
            }
        }
        if (!postal_code || typeof postal_code !== 'string' || postal_code.trim().length < 5 || postal_code.trim().length > 10) {
            return NextResponse.json({ error: 'Postal code must be between 5 and 10 alphanumeric characters.' }, { status: 400 });
        }
        if (label && !['Home', 'Work', 'Other'].includes(label)) {
            return NextResponse.json({ error: 'Label must be Home, Work, or Other.' }, { status: 400 });
        }

        const { data: newAddress, error: dbError } = await supabase
            .from('addresses')
            .insert({
                customer_id: customer.id,
                label,
                full_name: full_name.trim(),
                phone: cleanedPhone,
                address_line1: address_line1.trim(),
                address_line2: address_line2 ? address_line2.trim() : null,
                city: city.trim(),
                state: state ? state.trim() : '',
                postal_code: postal_code.trim(),
                country: country.trim(),
                is_default,
            })
            .select()
            .single();

        if (dbError) {
            return NextResponse.json({ error: dbError.message }, { status: 500 });
        }

        return NextResponse.json({ address: newAddress, success: true }, { status: 201 });
    } catch (err: any) {
        return NextResponse.json({ error: 'Malformed JSON body or request error' }, { status: 400 });
    }
}
