/**
 * Instagram Graph API — fetch recent Reels for the site-wide rail.
 *
 * Requires INSTAGRAM_ACCESS_TOKEN in .env.local (long-lived token from the
 * Instagram API with Instagram Login). Long-lived tokens expire after 60
 * days — refresh via:
 *   GET https://graph.instagram.com/refresh_access_token
 *       ?grant_type=ig_refresh_token&access_token=<current token>
 *
 * Media CDN URLs returned by the API are signed and expire after a day or
 * two; the hourly ISR revalidation below keeps them fresh.
 */

export interface InstagramReel {
    id: string;
    caption: string;
    /** Direct MP4 URL (signed, short-lived) */
    mediaUrl: string;
    /** Poster/thumbnail image URL (signed, short-lived) */
    thumbnailUrl: string;
    /** Permanent link to the reel on instagram.com */
    permalink: string;
    timestamp: string;
}

interface InstagramMediaItem {
    id: string;
    caption?: string;
    media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';
    media_product_type?: 'REELS' | 'FEED' | 'STORY' | 'AD';
    media_url?: string;
    thumbnail_url?: string;
    permalink: string;
    timestamp: string;
}

const FIELDS =
    'id,caption,media_type,media_product_type,media_url,thumbnail_url,permalink,timestamp';

/**
 * @param accessToken Optional token override for a different Instagram
 * account (e.g. INSTAGRAM_COLLECTION_ACCESS_TOKEN on the /collection page).
 * Defaults to the site-wide INSTAGRAM_ACCESS_TOKEN.
 */
export async function getInstagramReels(
    limit = 8,
    accessToken?: string,
): Promise<InstagramReel[]> {
    const token = accessToken ?? process.env.INSTAGRAM_ACCESS_TOKEN;
    if (!token) {
        return [];
    }

    try {
        const res = await fetch(
            `https://graph.instagram.com/me/media?fields=${FIELDS}&limit=50&access_token=${token}`,
            // Revalidate hourly — also keeps the signed CDN URLs from going stale
            { next: { revalidate: 3600 } },
        );

        if (!res.ok) {
            console.error(`Instagram API error ${res.status}: ${await res.text()}`);
            return [];
        }

        const json: { data?: InstagramMediaItem[] } = await res.json();

        return (json.data ?? [])
            .filter(
                (m) =>
                    m.media_type === 'VIDEO' &&
                    (m.media_product_type === undefined || m.media_product_type === 'REELS') &&
                    (m.thumbnail_url || m.media_url),
            )
            .slice(0, limit)
            .map((m) => ({
                id: m.id,
                caption: m.caption ?? '',
                mediaUrl: m.media_url ?? '',
                thumbnailUrl: m.thumbnail_url ?? m.media_url ?? '',
                permalink: m.permalink,
                timestamp: m.timestamp,
            }));
    } catch (error) {
        console.error('Instagram reels fetch failed:', error);
        return [];
    }
}
