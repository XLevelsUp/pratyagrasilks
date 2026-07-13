import sharp from 'sharp';

// 50MB size limit
const MAX_FILE_SIZE = 50 * 1024 * 1024;

const VARIANT_WIDTHS = [640, 1080, 1600] as const; // 2560 is the canonical/master pass below
export type VariantWidth = typeof VARIANT_WIDTHS[number];

export interface ProcessedImage {
    /** High-fidelity master: max 2560px, WebP q90 */
    buffer: Buffer;
    /** Smaller responsive tiers. Only present for widths strictly below the source's
     *  actual width — a tier that would duplicate canonical (or a larger tier) via
     *  withoutEnlargement is skipped rather than stored as a wasted near-duplicate. */
    variants: Partial<Record<VariantWidth, Buffer>>;
    /** Inline LQIP: data:image/webp;base64,... (~300 bytes) */
    blurDataURL: string;
    width: number;
    height: number;
}

export async function processImage(file: File): Promise<ProcessedImage> {
    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
        throw new Error(`Image size (${(file.size / 1024 / 1024).toFixed(1)}MB) exceeds 50MB limit`);
    }

    const arrayBuffer = await file.arrayBuffer();
    const inputBuffer = Buffer.from(arrayBuffer);

    try {
        // Get image metadata to validate dimensions and check for corruption
        const metadata = await sharp(inputBuffer).metadata();

        if (!metadata.width || !metadata.height) {
            throw new Error('Unable to read image dimensions - corrupted file');
        }

        // For very large images, use lower effort setting to prevent timeout/OOM
        // Effort 4 is much faster than 6 for large files with minimal quality loss
        const effort = file.size > 20 * 1024 * 1024 ? 4 : 6;

        // Skip a tier that's >= the source's actual width — withoutEnlargement would
        // just produce a byte-different, pixel-identical duplicate of canonical/a
        // larger tier, wasting storage and an upload for no visual benefit.
        const widthsToGenerate = VARIANT_WIDTHS.filter((w) => metadata.width! > w);

        // Sharp pipelines are single-use — every operation gets a fresh sharp(inputBuffer) instance
        const [master, blurBuffer, ...variantResults] = await Promise.all([
            sharp(inputBuffer)
                .resize({
                    width: 2560,
                    height: 2560,
                    fit: 'inside',
                    withoutEnlargement: true,
                })
                .webp({
                    quality: 90,
                    effort,
                    // Sharper 4:2:0 chroma — preserves fine zari/weave detail
                    smartSubsample: true,
                    alphaQuality: 100,
                })
                .toBuffer({ resolveWithObject: true }),
            sharp(inputBuffer)
                .resize({ width: 20, height: 20, fit: 'inside' })
                .webp({ quality: 30, effort: 2 })
                .toBuffer(),
            ...widthsToGenerate.map((w) =>
                sharp(inputBuffer)
                    .resize({ width: w, height: w, fit: 'inside', withoutEnlargement: true })
                    // Smaller tiers are cheap to encode regardless of source size — flat low effort
                    .webp({ quality: 90, effort: 4, smartSubsample: true, alphaQuality: 100 })
                    .toBuffer()
            ),
        ]);

        const variants: Partial<Record<VariantWidth, Buffer>> = {};
        widthsToGenerate.forEach((w, i) => {
            variants[w] = variantResults[i];
        });

        return {
            buffer: master.data,
            variants,
            blurDataURL: `data:image/webp;base64,${blurBuffer.toString('base64')}`,
            width: master.info.width,
            height: master.info.height,
        };
    } catch (error) {
        if (error instanceof Error && error.message.includes('exceeds')) {
            throw error;
        }
        throw new Error(`Image processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
