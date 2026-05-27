import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// ── GET /api/profile ──────────────────────────────────────────────────────────
export async function GET() {
    const supabase = createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: customer, error } = await supabase
        .from('customers')
        .select('id, full_name, phone, avatar_url, email, created_at')
        .eq('email', user.email)
        .single();

    // PGRST116 = "no rows returned" — user exists in auth but not yet in customers table.
    // Return null customer so the UI falls back to auth metadata gracefully.
    if (error && error.code !== 'PGRST116') {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ customer: customer ?? null });
}

// ── PUT /api/profile ──────────────────────────────────────────────────────────
export async function PUT(req: NextRequest) {
    const supabase = createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { full_name, phone } = body;

    // Validate full_name
    if (!full_name || typeof full_name !== 'string' || full_name.trim().length < 2) {
        return NextResponse.json({ error: 'Full name must be at least 2 characters.' }, { status: 400 });
    }
    if (full_name.trim().length > 100) {
        return NextResponse.json({ error: 'Full name must not exceed 100 characters.' }, { status: 400 });
    }

    // Validate phone (optional, E.164 or 10-digit national format if provided)
    if (phone) {
        const cleanedPhone = phone.trim().replace(/[\s-()]/g, '');
        if (!/^(\+[1-9]\d{7,14}|\d{10})$/.test(cleanedPhone)) {
            return NextResponse.json({ error: 'Please provide a valid 10-digit mobile number or international number starting with + (e.g. 9876543210 or +919876543210).' }, { status: 400 });
        }
    }

    // Update customers table
    const { error: dbError } = await supabase
        .from('customers')
        .update({
            full_name: full_name.trim(),
            phone: phone || null,
            updated_at: new Date().toISOString(),
        })
        .eq('email', user.email);

    if (dbError) {
        return NextResponse.json({ error: dbError.message }, { status: 500 });
    }

    // Sync full_name AND phone into Supabase Auth metadata so profile page updates instantly
    /* fixed: phone number sync */
    await supabase.auth.updateUser({
        data: {
            full_name: full_name.trim(),
            phone: phone || null,
        },
    });

    return NextResponse.json({ success: true });
}
