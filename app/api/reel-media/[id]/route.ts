import { NextRequest, NextResponse } from 'next/server';

// Caches Instagram reel videos/posters behind our own long-lived Cache-Control
// header. Instagram's signed CDN URLs rotate hourly and are served with no
// cache headers of their own, so every visit re-downloads the full asset
// (2.4MB+ per video). Once the CDN/edge caches a response from this route
// (keyed by reel id + type, not the rotating signed URL), repeat visits never
// touch Instagram again until the cache entry is evicted.
//
// `url` must be the *current* signed Instagram URL for this reel — passed by
// the server component that already fetched it from the Graph API. It's only
// used on a cache miss (to fetch the real bytes, or as the redirect target if
// the fetch fails), so an expired `url` on a warm cache is harmless.

export const dynamic = 'force-dynamic';

const ONE_YEAR = 60 * 60 * 24 * 365;

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    const { id } = await params;
    const sourceUrl = request.nextUrl.searchParams.get('url');
    const type = request.nextUrl.searchParams.get('type') === 'poster' ? 'poster' : 'video';

    if (!id || !sourceUrl) {
        return NextResponse.json({ error: 'Missing id or url' }, { status: 400 });
    }

    let sourceHost: string;
    try {
        sourceHost = new URL(sourceUrl).hostname;
    } catch {
        return NextResponse.json({ error: 'Invalid url' }, { status: 400 });
    }
    // Only ever proxy Instagram/Facebook CDN hosts — never an open relay.
    if (!/\.(cdninstagram\.com|fbcdn\.net)$/.test(sourceHost)) {
        return NextResponse.json({ error: 'Unsupported host' }, { status: 400 });
    }

    try {
        const upstream = await fetch(sourceUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0' },
        });

        if (!upstream.ok || !upstream.body) {
            throw new Error(`Upstream ${upstream.status}`);
        }

        const contentType =
            upstream.headers.get('content-type') ??
            (type === 'poster' ? 'image/jpeg' : 'video/mp4');

        return new NextResponse(upstream.body, {
            status: 200,
            headers: {
                'Content-Type': contentType,
                'Cache-Control': `public, max-age=${ONE_YEAR}, immutable`,
                'CDN-Cache-Control': `public, max-age=${ONE_YEAR}, immutable`,
            },
        });
    } catch (error) {
        console.error(`reel-media proxy failed for reel ${id} (${type}):`, error);
        // Fall back to the original signed URL directly — never worse than
        // today's uncached hotlink, just not cached this time.
        return NextResponse.redirect(sourceUrl, { status: 307 });
    }
}
