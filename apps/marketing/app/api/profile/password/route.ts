import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// ── PUT /api/profile/password ─────────────────────────────────────────────────
export async function PUT(req: NextRequest) {
    const supabase = createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { currentPassword, newPassword, confirmPassword } = await req.json();

    // Validate presence
    if (!currentPassword || !newPassword || !confirmPassword) {
        return NextResponse.json({ error: 'All password fields are required.' }, { status: 400 });
    }

    // Max 20 chars (enforced here as server-side guard)
    if (newPassword.length > 20) {
        return NextResponse.json({ error: 'Password must not exceed 20 characters.' }, { status: 400 });
    }

    // Min 8 chars
    if (newPassword.length < 8) {
        return NextResponse.json({ error: 'Password must be at least 8 characters.' }, { status: 400 });
    }

    // Confirm match
    if (newPassword !== confirmPassword) {
        return NextResponse.json({ error: 'Passwords do not match.' }, { status: 400 });
    }

    // Verify current password by attempting sign-in
    const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email!,
        password: currentPassword,
    });

    if (signInError) {
        return NextResponse.json({ error: 'Current password is incorrect.' }, { status: 401 });
    }

    // Update to new password
    const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
    });

    if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}
