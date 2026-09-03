import { NextRequest, NextResponse } from 'next/server';
import { getPosts } from '@/lib/actions/blog-public.actions';

// Public read, used by the client-side "Load More" button on /blog — the
// initial page of posts is server-rendered directly via getPosts() in
// app/blog/page.tsx, this route only serves subsequent pages.
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '9', 10), 24);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    const categorySlug = searchParams.get('category') || undefined;
    const tag = searchParams.get('tag') || undefined;

    try {
        const { posts, total } = await getPosts({ limit, offset, categorySlug, tag });
        return NextResponse.json({ posts, total });
    } catch (error) {
        console.error('GET /api/blog/posts error:', error);
        return NextResponse.json({ error: 'Failed to load posts' }, { status: 500 });
    }
}
