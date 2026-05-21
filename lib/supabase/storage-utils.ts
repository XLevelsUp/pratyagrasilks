import { createClient } from './client';

/**
 * Upload a product image to Supabase Storage
 * @param file - The image file to upload (should be compressed)
 * @returns Public URL of the uploaded image
 */
export async function uploadProductImage(file: File): Promise<string> {
    const supabase = createClient();

    // Generate unique filename with timestamp
    const timestamp = Date.now();
    const fileExt = file.name.split('.').pop();
    const fileName = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const filePath = `products/${fileName}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
        .from('saree-images')
        .upload(filePath, file, {
            cacheControl: '31536000', // 1 year cache
            upsert: false,
        });

    if (error) {
        console.error('Upload error:', error);
        throw new Error(`Failed to upload image: ${error.message}`);
    }

    // Get public URL
    const {
        data: { publicUrl },
    } = supabase.storage.from('saree-images').getPublicUrl(filePath);

    return publicUrl;
}

/**
 * Delete a product image from Supabase Storage
 * @param imageUrl - The public URL of the image to delete
 */
export async function deleteProductImage(imageUrl: string): Promise<void> {
    const supabase = createClient();

    // Extract file path from URL
    const urlParts = imageUrl.split('/');
    const bucketIndex = urlParts.indexOf('saree-images');
    if (bucketIndex === -1) {
        throw new Error('Invalid image URL');
    }

    const filePath = urlParts.slice(bucketIndex + 1).join('/');

    const { error } = await supabase.storage.from('saree-images').remove([filePath]);

    if (error) {
        console.error('Delete error:', error);
        throw new Error(`Failed to delete image: ${error.message}`);
    }
}

/**
 * Upload multiple product images
 * @param files - Array of image files to upload
 * @returns Array of public URLs
 */
export async function uploadMultipleProductImages(files: File[]): Promise<string[]> {
    const uploadPromises = files.map((file) => uploadProductImage(file));
    return Promise.all(uploadPromises);
}

// ─── Vendor Documents (private 'vendor-docs' bucket) ─────────────────────────

/**
 * Upload a vendor document (already compressed to WebP) to the vendor-docs bucket.
 * @returns Storage path within the bucket (store this in vendors.document_urls)
 */
export async function uploadVendorDoc(file: File): Promise<string> {
    const supabase = createClient();
    const timestamp = Date.now();
    const baseName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_').replace(/\.[^.]+$/, '');
    const path = `${timestamp}_${baseName}.webp`;

    const { error } = await supabase.storage
        .from('vendor-docs')
        .upload(path, file, { cacheControl: '3600', upsert: false });

    if (error) throw new Error(`Vendor doc upload failed: ${error.message}`);
    return path;
}

/**
 * Generate a short-lived signed URL for displaying a vendor document.
 * @param path  - Storage path returned by uploadVendorDoc
 * @param expiresIn - Seconds until URL expires (default 1 hour)
 */
export async function getVendorDocSignedUrl(path: string, expiresIn = 3600): Promise<string> {
    const supabase = createClient();
    const { data, error } = await supabase.storage
        .from('vendor-docs')
        .createSignedUrl(path, expiresIn);
    if (error || !data) throw new Error(`Signed URL failed: ${error?.message}`);
    return data.signedUrl;
}

/**
 * Permanently delete a vendor document from storage.
 * @param path - Storage path returned by uploadVendorDoc
 */
export async function deleteVendorDoc(path: string): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase.storage.from('vendor-docs').remove([path]);
    if (error) throw new Error(`Vendor doc delete failed: ${error.message}`);
}

// ─── Avatar / Profile Photos ──────────────────────────────────────────────────

/**
 * Upload a user profile avatar to saree-images bucket under avatars/{userId}/
 * @param file     - The image file (jpg / png / webp)
 * @param userId   - Supabase auth user id (used as folder name)
 * @returns Public URL of the uploaded avatar
 */
export async function uploadAvatarImage(file: File, userId: string): Promise<string> {
    const supabase = createClient();

    const ext = file.name.split('.').pop() ?? 'jpg';
    const filePath = `avatars/${userId}/avatar.${ext}`;

    const { error } = await supabase.storage
        .from('saree-images')
        .upload(filePath, file, {
            cacheControl: '3600',
            upsert: true, // overwrite existing avatar
        });

    if (error) throw new Error(`Avatar upload failed: ${error.message}`);

    const { data: { publicUrl } } = supabase.storage
        .from('saree-images')
        .getPublicUrl(filePath);

    return publicUrl;
}

