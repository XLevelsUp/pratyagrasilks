import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// ── POST /api/profile/photo ───────────────────────────────────────────────────
export async function POST(req: NextRequest) {
    const supabase = createClient(); // server client — carries the user's session from cookies

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let formData: FormData;
    try {
        formData = await req.formData();
    } catch (e) {
        return NextResponse.json({ error: 'Invalid form data.' }, { status: 400 });
    }

    const file = formData.get('file') as File | null;
    if (!file) {
        return NextResponse.json({ error: 'No file provided.' }, { status: 400 });
    }

    // Validate file type
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) {
        return NextResponse.json({ error: 'Only JPG, PNG, or WebP images allowed.' }, { status: 400 });
    }

    // Validate file size (max 2 MB)
    if (file.size > 2 * 1024 * 1024) {
        return NextResponse.json({ error: 'Image must be under 2 MB.' }, { status: 400 });
    }

    try {
        // Convert File to ArrayBuffer for server-side upload
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const ext = file.name.split('.').pop() ?? 'jpg';
        const filePath = `avatars/${user.id}/avatar.${ext}`;

        // Upload using the SAME authenticated server client — carries the user's JWT.
        const { error: uploadError } = await supabase.storage
            .from('saree-images')
            .upload(filePath, buffer, {
                contentType: file.type,
                cacheControl: '3600',
                upsert: true,
            });

        if (uploadError) {
            console.error('Storage upload error:', uploadError);
            return NextResponse.json({ error: uploadError.message }, { status: 500 });
        }

        // Get the public URL
        const { data: { publicUrl } } = supabase.storage
            .from('saree-images')
            .getPublicUrl(filePath);

        const cacheBustedUrl = `${publicUrl}?t=${Date.now()}`;

        // Run DB update and auth metadata sync in parallel — they are independent
        const [{ error: dbError }] = await Promise.all([
            supabase
                .from('customers')
                .update({ avatar_url: publicUrl, updated_at: new Date().toISOString() })
                .eq('email', user.email),
            supabase.auth.updateUser({ data: { avatar_url: cacheBustedUrl } }),
        ]);

        if (dbError) {
            console.error('Database update error:', dbError);
            return NextResponse.json({ error: `Database update failed: ${dbError.message}` }, { status: 500 });
        }

        return NextResponse.json({ url: publicUrl });
    } catch (error: any) {
        console.error('Avatar upload failed:', error);
        return NextResponse.json({ error: error.message || 'Internal server error.' }, { status: 500 });
    }
}
