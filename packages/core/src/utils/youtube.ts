/**
 * YouTube utility functions for handling video links and embeds
 */

/**
 * Extracts YouTube video ID from various URL formats
 * Supports:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/shorts/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 */
export function getYouTubeVideoId(url: string): string | null {
    if (!url) return null;

    try {
        const urlObj = new URL(url);

        // Handle youtube.com/watch?v=VIDEO_ID
        if (urlObj.hostname.includes('youtube.com') && urlObj.pathname === '/watch') {
            return urlObj.searchParams.get('v');
        }

        // Handle youtu.be/VIDEO_ID
        if (urlObj.hostname === 'youtu.be') {
            return urlObj.pathname.slice(1);
        }

        // Handle youtube.com/shorts/VIDEO_ID
        if (urlObj.hostname.includes('youtube.com') && urlObj.pathname.startsWith('/shorts/')) {
            return urlObj.pathname.split('/')[2];
        }

        // Handle youtube.com/embed/VIDEO_ID
        if (urlObj.hostname.includes('youtube.com') && urlObj.pathname.startsWith('/embed/')) {
            return urlObj.pathname.split('/')[2];
        }

        return null;
    } catch {
        return null;
    }
}

/**
 * Converts any YouTube URL to embed format
 * @param url - YouTube video URL in any format
 * @returns Embed URL or null if invalid
 */
export function getYouTubeEmbedUrl(url: string): string | null {
    const videoId = getYouTubeVideoId(url);
    if (!videoId) return null;

    return `https://www.youtube.com/embed/${videoId}`;
}

/**
 * Gets YouTube video thumbnail URL
 * @param url - YouTube video URL
 * @param quality - Thumbnail quality (default, hqdefault, mqdefault, sddefault, maxresdefault)
 * @returns Thumbnail URL or null if invalid
 */
export function getYouTubeThumbnailUrl(url: string, quality: 'default' | 'hqdefault' | 'mqdefault' | 'sddefault' | 'maxresdefault' = 'hqdefault'): string | null {
    const videoId = getYouTubeVideoId(url);
    if (!videoId) return null;

    return `https://img.youtube.com/vi/${videoId}/${quality}.jpg`;
}

/**
 * Validates if a URL is a valid YouTube link
 * @param url - URL to validate
 * @returns true if valid YouTube URL
 */
export function isValidYouTubeUrl(url: string): boolean {
    if (!url) return true; // Empty is valid (optional field)
    return getYouTubeVideoId(url) !== null;
}
