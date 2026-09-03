/**
 * Check if a URL points to Supabase Storage.
 * Used to bypass Next.js Image Optimization for pre-processed images.
 */
export function isSupabaseImage(url: string): boolean {
    return url.includes('.supabase.co/storage/');
}
