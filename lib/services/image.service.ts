import sharp from 'sharp';

// 50MB size limit
const MAX_FILE_SIZE = 50 * 1024 * 1024;

export interface ProcessedImage {
    /** High-fidelity master: max 2560px, WebP q90 */
    buffer: Buffer;
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

        // Sharp pipelines are single-use — run master and LQIP on separate instances
        const [master, blurBuffer] = await Promise.all([
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
        ]);

        return {
            buffer: master.data,
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
