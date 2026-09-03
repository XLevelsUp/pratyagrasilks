import sharp from 'sharp';

// 50MB size limit
const MAX_FILE_SIZE = 50 * 1024 * 1024;

export async function processImage(file: File): Promise<Buffer> {
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

        // Use containment to fit within bounds while preserving aspect ratio
        // This is better than resize for maintaining quality
        const processed = await sharp(inputBuffer)
            .resize({
                width: 2048,
                height: 2048,
                fit: 'inside',
                withoutEnlargement: true,
            })
            .webp({
                quality: 82,
                effort,
                // Add alphaQuality for images with transparency
                alphaQuality: 100,
            })
            .toBuffer();

        return processed;
    } catch (error) {
        if (error instanceof Error && error.message.includes('exceeds')) {
            throw error;
        }
        throw new Error(`Image processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
