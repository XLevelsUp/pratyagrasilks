import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface RouteContext {
    params: {
        id: string;
    };
}

// ── PUT /api/profile/addresses/:id ───────────────────────────────────────────
export async function PUT(req: NextRequest, { params }: RouteContext) {
    const supabase = createClient();
    const addressId = params.id;

    if (!addressId) {
        return NextResponse.json({ error: 'Address ID is required' }, { status: 400 });
    }

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
            label,
            full_name,
            phone,
            address_line1,
            address_line2,
            city,
            state,
            postal_code,
            country,
            is_default,
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

        const { data: updatedAddress, error: dbError } = await supabase
            .from('addresses')
            .update({
                label,
                full_name: full_name.trim(),
                phone: cleanedPhone,
                address_line1: address_line1.trim(),
                address_line2: address_line2 ? address_line2.trim() : null,
                city: city.trim(),
                state: state ? state.trim() : '',
                postal_code: postal_code.trim(),
                country: country ? country.trim() : 'India',
                is_default,
                updated_at: new Date().toISOString(),
            })
            .eq('id', addressId)
            .eq('customer_id', customer.id)
            .select()
            .single();

        if (dbError) {
            return NextResponse.json({ error: dbError.message }, { status: 500 });
        }

        return NextResponse.json({ address: updatedAddress, success: true });
    } catch (err: any) {
        return NextResponse.json({ error: 'Malformed JSON body or request error' }, { status: 400 });
    }
}

// ── DELETE /api/profile/addresses/:id ────────────────────────────────────────
export async function DELETE(req: NextRequest, { params }: RouteContext) {
    const supabase = createClient();
    const addressId = params.id;

    if (!addressId) {
        return NextResponse.json({ error: 'Address ID is required' }, { status: 400 });
    }

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

    const { error: dbError } = await supabase
        .from('addresses')
        .delete()
        .eq('id', addressId)
        .eq('customer_id', customer.id);

    if (dbError) {
        return NextResponse.json({ error: dbError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Address deleted successfully' });
}
