import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { processImage } from '@/lib/services/image.service';

export async function POST(req: NextRequest) {
    const supabase = createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let paths: string[];
    try {
        const body = await req.json() as { paths: string[] };
        paths = body.paths;
    } catch {
        return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    if (!Array.isArray(paths) || paths.length === 0) {
        return NextResponse.json({ error: 'paths array is required' }, { status: 400 });
    }

    try {
        const urls = await Promise.all(
            paths.map(async (tempPath) => {
                // Download the raw file from Supabase
                const { data: blob, error: dlError } = await supabase.storage
                    .from('saree-images')
                    .download(tempPath);
                if (dlError || !blob) throw new Error(dlError?.message ?? 'Download failed');

                // Process with sharp: resize 2048px max, convert to WebP
                const arrayBuffer = await blob.arrayBuffer();
                const rawFile = new File([arrayBuffer], 'raw', { type: blob.type });
                const processedBuffer = await processImage(rawFile);

                // Upload the processed WebP to the final path
                const baseName = tempPath.split('/').pop()!.replace(/\.[^.]+$/, '');
                const finalPath = `products/${baseName}.webp`;

                const { error: upError } = await supabase.storage
                    .from('saree-images')
                    .upload(finalPath, processedBuffer, {
                        contentType: 'image/webp',
                        cacheControl: '31536000',
                        upsert: false,
                    });
                if (upError) throw new Error(upError.message);

                // Remove the temp raw original (best-effort, non-fatal)
                await supabase.storage.from('saree-images').remove([tempPath]).catch(() => null);

                const { data: { publicUrl } } = supabase.storage
                    .from('saree-images')
                    .getPublicUrl(finalPath);

                return publicUrl;
            })
        );

        return NextResponse.json({ urls });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Image processing failed';
        console.error('process-uploaded-images error:', message);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
