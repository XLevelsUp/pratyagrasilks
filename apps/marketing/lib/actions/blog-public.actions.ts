/**
 * Public blog reads — the storefront blog index, post pages, sitemap and the
 * "load more" API route.
 *
 * Deliberately NOT a 'use server' module. Every caller is server-side (two
 * server components, a route handler and the sitemap), so these were never
 * invoked as Server Actions; carrying the directive only put them in the
 * action manifest for no benefit. `server-only` makes an accidental client
 * import a build error instead of a leaked service call.
 *
 * The admin CRUD counterparts live in blog-admin.actions.ts, which does keep
 * 'use server' because its callers are client components.
 */

import 'server-only';

import { createClient } from '@/lib/supabase/server';
import { mapCategoryRow, mapCommentRow, mapPostRow, POST_SELECT } from '@/lib/blog/mappers';
import type { BlogPost, BlogCategory, BlogComment } from '@/lib/types';

export async function getCategories(): Promise<BlogCategory[]> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('blog_categories')
        .select('*')
        .order('sort_order', { ascending: true });
    if (error) throw new Error(error.message);
    return (data ?? []).map(mapCategoryRow);
}

export interface GetPostsOptions {
    limit?: number;
    offset?: number;
    categorySlug?: string;
    tag?: string;
}

export async function getPosts(options: GetPostsOptions = {}): Promise<{ posts: BlogPost[]; total: number }> {
    const supabase = createClient();
    const { limit = 9, offset = 0, categorySlug, tag } = options;

    let query = supabase
        .from('blog_posts')
        .select(POST_SELECT, { count: 'exact' })
        .order('published_at', { ascending: false })
        .range(offset, offset + limit - 1);

    if (categorySlug && categorySlug !== 'all') {
        query = query.eq('category_slug', categorySlug);
    }
    if (tag) {
        query = query.contains('tags', [tag]);
    }

    const { data, error, count } = await query;
    if (error) throw new Error(error.message);
    return { posts: (data ?? []).map(mapPostRow), total: count ?? 0 };
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('blog_posts')
        .select(POST_SELECT)
        .eq('slug', slug)
        .single();
    if (error) return null;
    return mapPostRow(data);
}

/** Public read — RLS already limits this to status = 'approved' rows for unauthenticated callers. */
export async function getApprovedComments(postId: string): Promise<BlogComment[]> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('blog_comments')
        .select('*')
        .eq('post_id', postId)
        .eq('status', 'approved')
        .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []).map(mapCommentRow);
}
