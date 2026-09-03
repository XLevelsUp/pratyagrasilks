import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface RouteContext {
    params: {
        id: string;
    };
}

// ── PATCH /api/profile/addresses/:id/default ──────────────────────────────────
// Set a selected address as the default address
export async function PATCH(req: NextRequest, { params }: RouteContext) {
    const supabase = createClient();
    const addressId = params.id;

    if (!addressId) {
        return NextResponse.json({ error: 'Address ID is required' }, { status: 400 });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Resolve customer ID
    const { data: customer, error: customerError } = await supabase
        .from('customers')
        .select('id')
        .eq('email', user.email)
        .single();

    if (customerError || !customer) {
        return NextResponse.json({ error: 'Customer profile not found' }, { status: 404 });
    }

    // Mark the address as default.
    // The database-level trigger 'enforce_single_default_address_trigger'
    // will automatically toggle is_default to FALSE for all other addresses owned by this customer.
    const { data: updatedAddress, error: dbError } = await supabase
        .from('addresses')
        .update({
            is_default: true,
            updated_at: new Date().toISOString(),
        })
        .eq('id', addressId)
        .eq('customer_id', customer.id)
        .select()
        .single();

    if (dbError) {
        return NextResponse.json({ error: dbError.message }, { status: 500 });
    }

    return NextResponse.json({ address: updatedAddress, success: true, message: 'Address set as default successfully' });
}
