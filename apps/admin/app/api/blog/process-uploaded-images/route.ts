import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@pratyagra/auth/server';
import { processImage } from '@/lib/services/image.service';
import { getCallerRole, assertRoleIn } from '@pratyagra/auth/role-guard';

interface ProcessResult {
    path: string;
    success: boolean;
    url?: string;
    error?: string;
}

export async function POST(req: NextRequest) {
    const supabase = createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const role = await getCallerRole();
        await assertRoleIn(role, ['ADMIN', 'MARKETING'], 'upload blog images');
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Not authorised';
        return NextResponse.json({ error: message }, { status: 403 });
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
        const results = await Promise.allSettled(
            paths.map(async (rawPath): Promise<ProcessResult> => {
                try {
                    const { data: blob, error: dlError } = await supabase.storage
                        .from('saree-images')
                        .download(rawPath);

                    if (dlError || !blob) {
                        throw new Error(`Download failed: ${dlError?.message || 'Unknown error'}`);
                    }

                    if (blob.size > 50 * 1024 * 1024) {
                        throw new Error(`File size (${(blob.size / 1024 / 1024).toFixed(1)}MB) exceeds 50MB limit`);
                    }

                    const arrayBuffer = await blob.arrayBuffer();
                    const rawFile = new File([arrayBuffer], 'raw', { type: blob.type });
                    const processedBuffer = await processImage(rawFile);

                    const finalPath = `${rawPath}.webp`;

                    const { error: upError } = await supabase.storage
                        .from('saree-images')
                        .upload(finalPath, processedBuffer, {
                            contentType: 'image/webp',
                            cacheControl: '31536000',
                            upsert: false,
                        });

                    if (upError) {
                        throw new Error(`Upload WebP failed: ${upError.message}`);
                    }

                    await supabase.storage
                        .from('saree-images')
                        .remove([rawPath])
                        .catch(() => null);

                    const { data: { publicUrl } } = supabase.storage
                        .from('saree-images')
                        .getPublicUrl(finalPath);

                    return { path: rawPath, success: true, url: publicUrl };
                } catch (err) {
                    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
                    console.error(`Processing ${rawPath} failed:`, errorMsg);
                    return { path: rawPath, success: false, error: errorMsg };
                }
            })
        );

        const urls: string[] = [];
        const errors: Record<string, string> = {};

        results.forEach((result, index) => {
            if (result.status === 'fulfilled') {
                if (result.value.success && result.value.url) {
                    urls.push(result.value.url);
                } else if (result.value.error) {
                    errors[result.value.path] = result.value.error;
                }
            } else {
                errors[paths[index]] = result.reason?.message || 'Unknown error';
            }
        });

        if (urls.length === 0) {
            const errorMessages = Object.entries(errors)
                .map(([path, err]) => `${path}: ${err}`)
                .join('; ');
            console.error('All blog images failed processing:', errorMessages);
            return NextResponse.json(
                { error: `All images failed: ${errorMessages}` },
                { status: 400 }
            );
        }

        const response: { urls: string[]; partialFailure?: string } = { urls };
        if (Object.keys(errors).length > 0) {
            response.partialFailure = Object.entries(errors)
                .map(([path, err]) => `${path}: ${err}`)
                .join('; ');
        }

        return NextResponse.json(response);
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Image processing failed';
        console.error('blog process-uploaded-images error:', message);
        return NextResponse.json({ error: `Processing error: ${message}` }, { status: 500 });
    }
}
