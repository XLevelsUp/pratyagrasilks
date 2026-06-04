import sharp from 'sharp';

export async function processImage(file: File): Promise<Buffer> {
    const arrayBuffer = await file.arrayBuffer();
    const inputBuffer = Buffer.from(arrayBuffer);

    return sharp(inputBuffer)
        .resize({ width: 2048, withoutEnlargement: true })
        .webp({ quality: 100, effort: 6 })
        .toBuffer();
}
