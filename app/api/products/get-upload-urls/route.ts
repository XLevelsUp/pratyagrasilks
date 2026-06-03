import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
    const supabase = createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let filenames: string[];
    try {
        const body = await req.json() as { filenames: string[] };
        filenames = body.filenames;
    } catch {
        return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    if (!Array.isArray(filenames) || filenames.length === 0) {
        return NextResponse.json({ error: 'filenames array is required' }, { status: 400 });
    }

    try {
        const uploads = await Promise.all(
            filenames.map(async (name) => {
                const base = name.replace(/[^a-zA-Z0-9.-]/g, '_').replace(/\.[^.]+$/, '');
                const path = `temp/products/${Date.now()}-${base}`;

                const { data, error } = await supabase.storage
                    .from('saree-images')
                    .createSignedUploadUrl(path);

                if (error || !data) throw new Error(error?.message ?? 'Failed to create signed URL');
                return { path, signedUrl: data.signedUrl, token: data.token };
            })
        );

        return NextResponse.json({ uploads });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to generate upload URLs';
        console.error('get-upload-urls error:', message);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
