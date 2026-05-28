import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { processImage } from '@/lib/services/image.service';

export async function POST(req: NextRequest) {
    const supabase = createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let formData: FormData;
    try {
        formData = await req.formData();
    } catch {
        return NextResponse.json({ error: 'Invalid form data' }, { status: 400 });
    }

    const files = formData.getAll('files') as File[];
    if (!files.length) {
        return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    try {
        const urls = await Promise.all(
            files.map(async (file) => {
                const processedBuffer = await processImage(file);
                const timestamp = Date.now();
                const baseName = file.name
                    .replace(/[^a-zA-Z0-9.-]/g, '_')
                    .replace(/\.[^.]+$/, '');
                const filePath = `products/${timestamp}-${baseName}.webp`;

                const { error: uploadError } = await supabase.storage
                    .from('saree-images')
                    .upload(filePath, processedBuffer, {
                        contentType: 'image/webp',
                        cacheControl: '31536000',
                        upsert: false,
                    });

                if (uploadError) throw new Error(uploadError.message);

                const { data: { publicUrl } } = supabase.storage
                    .from('saree-images')
                    .getPublicUrl(filePath);

                return publicUrl;
            })
        );

        return NextResponse.json({ urls });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Upload failed';
        console.error('Image upload error:', message);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
