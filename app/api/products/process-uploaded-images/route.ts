import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { processImage } from '@/lib/services/image.service';

interface ProcessResult {
    path: string;
    success: boolean;
    url?: string;
    blurDataURL?: string;
    variants?: Record<string, string>;
    error?: string;
}

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
        const results = await Promise.allSettled(
            paths.map(async (rawPath): Promise<ProcessResult> => {
                try {
                    // Download the raw file from Supabase
                    const { data: blob, error: dlError } = await supabase.storage
                        .from('saree-images')
                        .download(rawPath);

                    if (dlError || !blob) {
                        throw new Error(`Download failed: ${dlError?.message || 'Unknown error'}`);
                    }

                    // Check file size before processing
                    if (blob.size > 50 * 1024 * 1024) {
                        throw new Error(`File size (${(blob.size / 1024 / 1024).toFixed(1)}MB) exceeds 50MB limit`);
                    }

                    // Process with sharp
                    const arrayBuffer = await blob.arrayBuffer();
                    const rawFile = new File([arrayBuffer], 'raw', { type: blob.type });
                    const { buffer: processedBuffer, blurDataURL, variants } = await processImage(rawFile);

                    // Upload the canonical (largest) master and every generated smaller
                    // tier in parallel. Canonical path is unchanged from before this
                    // feature, so existing images[]/blur_map keys stay stable.
                    const finalPath = `${rawPath}.webp`;
                    const variantEntries = Object.entries(variants) as [string, Buffer][];

                    const [canonicalUpload, ...variantUploads] = await Promise.all([
                        supabase.storage.from('saree-images').upload(finalPath, processedBuffer, {
                            contentType: 'image/webp',
                            cacheControl: '31536000',
                            upsert: false,
                        }),
                        ...variantEntries.map(([width, buf]) =>
                            supabase.storage.from('saree-images').upload(`${rawPath}-${width}.webp`, buf, {
                                contentType: 'image/webp',
                                cacheControl: '31536000',
                                upsert: false,
                            })
                        ),
                    ]);

                    if (canonicalUpload.error) {
                        throw new Error(`Upload WebP failed: ${canonicalUpload.error.message}`);
                    }

                    // Remove the raw original
                    await supabase.storage
                        .from('saree-images')
                        .remove([rawPath])
                        .catch(() => null);

                    const { data: { publicUrl } } = supabase.storage
                        .from('saree-images')
                        .getPublicUrl(finalPath);

                    // Build the variant width->URL map, skipping any tier whose upload failed
                    // (non-fatal — canonical is already safely uploaded).
                    const variantMap: Record<string, string> = {};
                    variantEntries.forEach(([width], i) => {
                        const uploadResult = variantUploads[i];
                        if (uploadResult.error) {
                            console.error(`Variant upload failed for ${rawPath}-${width}.webp:`, uploadResult.error.message);
                            return;
                        }
                        const { data: { publicUrl: variantUrl } } = supabase.storage
                            .from('saree-images')
                            .getPublicUrl(`${rawPath}-${width}.webp`);
                        variantMap[width] = variantUrl;
                    });

                    return { path: rawPath, success: true, url: publicUrl, blurDataURL, variants: variantMap };
                } catch (err) {
                    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
                    console.error(`Processing ${rawPath} failed:`, errorMsg);
                    return { path: rawPath, success: false, error: errorMsg };
                }
            })
        );

        // Extract successful URLs (with their LQIP placeholders + variant maps) and collect errors
        const urls: string[] = [];
        const blurMap: Record<string, string> = {};
        const variantMap: Record<string, Record<string, string>> = {};
        const errors: Record<string, string> = {};

        results.forEach((result, index) => {
            if (result.status === 'fulfilled') {
                if (result.value.success && result.value.url) {
                    urls.push(result.value.url);
                    if (result.value.blurDataURL) {
                        blurMap[result.value.url] = result.value.blurDataURL;
                    }
                    if (result.value.variants && Object.keys(result.value.variants).length > 0) {
                        variantMap[result.value.url] = result.value.variants;
                    }
                } else if (result.value.error) {
                    errors[result.value.path] = result.value.error;
                }
            } else {
                errors[paths[index]] = result.reason?.message || 'Unknown error';
            }
        });

        // If no images succeeded, return error
        if (urls.length === 0) {
            const errorMessages = Object.entries(errors)
                .map(([path, err]) => `${path}: ${err}`)
                .join('; ');
            console.error('All images failed processing:', errorMessages);
            return NextResponse.json(
                { error: `All images failed: ${errorMessages}` },
                { status: 400 }
            );
        }

        // Return partial success with warnings if some failed
        const response: {
            urls: string[];
            blurMap: Record<string, string>;
            variantMap: Record<string, Record<string, string>>;
            partialFailure?: string;
        } = { urls, blurMap, variantMap };
        if (Object.keys(errors).length > 0) {
            response.partialFailure = Object.entries(errors)
                .map(([path, err]) => `${path}: ${err}`)
                .join('; ');
        }

        return NextResponse.json(response);
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Image processing failed';
        console.error('process-uploaded-images error:', message);
        return NextResponse.json({ error: `Processing error: ${message}` }, { status: 500 });
    }
}
