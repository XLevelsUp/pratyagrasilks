'use server';

/**
 * Admin blog CRUD and comment moderation. Keeps the 'use server' directive
 * because its callers are client components (app/admin/blog/*,
 * components/admin/blog/BlogPostForm).
 *
 * getPosts/getCategories are duplicated from blog-public.actions.ts rather
 * than shared: the admin list needs to stay callable as a Server Action from
 * a client component, and after the split these two modules live in two
 * separately-deployed apps. Duplicating ~20 lines of query beats a Server
 * Action crossing a deployment boundary.
 */

import { createClient } from '@pratyagra/auth/server';
import { revalidatePath } from 'next/cache';
import { getCallerRole, assertRoleIn } from '@pratyagra/auth/role-guard';
import { mapCategoryRow, mapCommentRow, mapPostRow, POST_SELECT } from '@pratyagra/core/blog/mappers';
import type { BlogPost, BlogPostInput, BlogCategory, BlogComment } from '@pratyagra/core/types';

const CONTENT_ROLES = ['ADMIN', 'MARKETING'] as const;

// ── Reading time ─────────────────────────────────────────────────────────
// ~200 wpm over every rich-text/plain field in the post, HTML tags stripped.
function estimateReadingTime(input: BlogPostInput): number {
    const strip = (html: string) => html.replace(/<[^>]*>/g, ' ');
    const parts = [
        strip(input.introHtml),
        ...input.sections.flatMap((s) => [
            strip(s.bodyHtml),
            ...s.subsections.map((sub) => strip(sub.bodyHtml)),
        ]),
        ...input.qna.flatMap((q) => [q.question, q.answer]),
        input.ctaIntroText ?? '',
    ];
    const wordCount = parts.join(' ').trim().split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.round(wordCount / 200));
}

function slugify(title: string): string {
    return title
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

function excerpt(html: string, maxLen = 160): string {
    const text = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    return text.length > maxLen ? `${text.slice(0, maxLen - 1).trimEnd()}…` : text;
}

async function assertContentRole(action: string): Promise<void> {
    const role = await getCallerRole();
    await assertRoleIn(role, [...CONTENT_ROLES], action);
}

function isUniqueViolation(error: { code?: string } | null): boolean {
    return error?.code === '23505';
}

// ── Reads ────────────────────────────────────────────────────────────────

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

export async function getPostById(id: string): Promise<BlogPost | null> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('blog_posts')
        .select(POST_SELECT)
        .eq('id', id)
        .single();
    if (error) return null;
    return mapPostRow(data);
}

// ── Writes ───────────────────────────────────────────────────────────────

/** Persists the sections/subsections/qna/cta-buttons for a post, replacing whatever existed before (delete-then-insert, matching the form's "whole nested tree resubmitted on every save" shape). */
async function replaceNestedContent(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    supabase: any,
    postId: string,
    input: BlogPostInput,
): Promise<void> {
    // Sections (cascade deletes subsections)
    await supabase.from('blog_sections').delete().eq('post_id', postId);
    for (let i = 0; i < input.sections.length; i++) {
        const s = input.sections[i];
        const { data: sectionRow, error: sectionError } = await supabase
            .from('blog_sections')
            .insert({
                post_id: postId,
                sort_order: i,
                block_type: s.blockType,
                heading: s.heading,
                body_html: s.bodyHtml,
                second_image_url: s.secondImageUrl ?? null,
                second_image_alt: s.secondImageAlt ?? null,
                second_image_mode: s.secondImageMode,
            })
            .select('id')
            .single();
        if (sectionError) throw new Error(sectionError.message);

        if (s.subsections.length > 0) {
            const { error: subError } = await supabase.from('blog_subsections').insert(
                s.subsections.map((sub, j) => ({
                    section_id: sectionRow.id,
                    sort_order: j,
                    heading: sub.heading,
                    body_html: sub.bodyHtml,
                })),
            );
            if (subError) throw new Error(subError.message);
        }
    }

    // Q&A
    await supabase.from('blog_qna').delete().eq('post_id', postId);
    if (input.qna.length > 0) {
        const { error: qnaError } = await supabase.from('blog_qna').insert(
            input.qna.map((q, i) => ({ post_id: postId, sort_order: i, question: q.question, answer: q.answer })),
        );
        if (qnaError) throw new Error(qnaError.message);
    }

    // CTA buttons
    await supabase.from('blog_cta_buttons').delete().eq('post_id', postId);
    if (input.ctaButtons.length > 0) {
        const { error: ctaError } = await supabase.from('blog_cta_buttons').insert(
            input.ctaButtons.map((b, i) => ({ post_id: postId, sort_order: i, label: b.label, url: b.url })),
        );
        if (ctaError) throw new Error(ctaError.message);
    }
}

export async function createPost(input: BlogPostInput): Promise<{ id: string }> {
    await assertContentRole('create blog posts');
    const supabase = createClient();

    const slug = input.slug.trim() || slugify(input.title);
    const readingTimeMinutes = input.readingTimeMinutes || estimateReadingTime(input);
    const metaDescription = input.metaDescription?.trim() || excerpt(input.introHtml);

    const { data, error } = await supabase
        .from('blog_posts')
        .insert({
            slug,
            title: input.title,
            featured_image_url: input.featuredImageUrl ?? null,
            featured_image_alt: input.featuredImageAlt ?? null,
            featured_image_mode: input.featuredImageMode,
            intro_html: input.introHtml,
            category_slug: input.categorySlug,
            author: input.author,
            tags: input.tags,
            reading_time_minutes: readingTimeMinutes,
            published_at: input.publishedAt,
            meta_description: metaDescription,
            cta_intro_text: input.ctaIntroText,
        })
        .select('id')
        .single();

    if (error) {
        if (isUniqueViolation(error)) {
            throw new Error(`That slug ("${slug}") is already in use — please choose a different one.`);
        }
        throw new Error(error.message);
    }

    await replaceNestedContent(supabase, data.id, input);

    revalidatePath('/admin/blog');
    revalidatePath('/blog');
    revalidatePath(`/blog/${slug}`);

    return { id: data.id };
}

export async function updatePost(id: string, input: BlogPostInput): Promise<void> {
    await assertContentRole('update blog posts');
    const supabase = createClient();

    const slug = input.slug.trim() || slugify(input.title);
    const readingTimeMinutes = input.readingTimeMinutes || estimateReadingTime(input);
    const metaDescription = input.metaDescription?.trim() || excerpt(input.introHtml);

    const { data: existing } = await supabase.from('blog_posts').select('slug').eq('id', id).single();

    const { error } = await supabase
        .from('blog_posts')
        .update({
            slug,
            title: input.title,
            featured_image_url: input.featuredImageUrl ?? null,
            featured_image_alt: input.featuredImageAlt ?? null,
            featured_image_mode: input.featuredImageMode,
            intro_html: input.introHtml,
            category_slug: input.categorySlug,
            author: input.author,
            tags: input.tags,
            reading_time_minutes: readingTimeMinutes,
            published_at: input.publishedAt,
            meta_description: metaDescription,
            cta_intro_text: input.ctaIntroText,
        })
        .eq('id', id);

    if (error) {
        if (isUniqueViolation(error)) {
            throw new Error(`That slug ("${slug}") is already in use — please choose a different one.`);
        }
        throw new Error(error.message);
    }

    await replaceNestedContent(supabase, id, input);

    revalidatePath('/admin/blog');
    revalidatePath(`/admin/blog/${id}/edit`);
    revalidatePath('/blog');
    revalidatePath(`/blog/${slug}`);
    if (existing && existing.slug !== slug) {
        revalidatePath(`/blog/${existing.slug}`);
    }
}

export async function deletePost(id: string): Promise<void> {
    await assertContentRole('delete blog posts');
    const supabase = createClient();

    const { data: existing } = await supabase.from('blog_posts').select('slug').eq('id', id).single();

    const { error } = await supabase.from('blog_posts').delete().eq('id', id);
    if (error) throw new Error(error.message);

    revalidatePath('/admin/blog');
    revalidatePath('/blog');
    if (existing) revalidatePath(`/blog/${existing.slug}`);
}

// ── Comments ─────────────────────────────────────────────────────────────

export async function getPendingComments(): Promise<BlogComment[]> {
    await assertContentRole('view comment moderation queue');
    const supabase = createClient();
    const { data, error } = await supabase
        .from('blog_comments')
        .select('*')
        .order('status', { ascending: true }) // 'approved' < 'pending' < 'rejected' alphabetically is wrong; re-sort below
        .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);

    const rows = (data ?? []).map(mapCommentRow);
    // Pending-first ordering per spec (alphabetical status sort above isn't
    // the right order, so re-sort explicitly).
    const rank: Record<BlogComment['status'], number> = { pending: 0, approved: 1, rejected: 2 };
    return rows.sort((a, b) => rank[a.status] - rank[b.status]);
}

export async function approveComment(id: string): Promise<void> {
    await assertContentRole('moderate comments');
    const supabase = createClient();
    const { data: comment, error } = await supabase
        .from('blog_comments')
        .update({ status: 'approved' })
        .eq('id', id)
        .select('post_id, blog_posts(slug)')
        .single();
    if (error) throw new Error(error.message);
    revalidatePath('/admin/blog/comments');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const slug = (comment as any)?.blog_posts?.slug;
    if (slug) revalidatePath(`/blog/${slug}`);
}

export async function rejectComment(id: string): Promise<void> {
    await assertContentRole('moderate comments');
    const supabase = createClient();
    const { error } = await supabase.from('blog_comments').update({ status: 'rejected' }).eq('id', id);
    if (error) throw new Error(error.message);
    revalidatePath('/admin/blog/comments');
}

export async function deleteComment(id: string): Promise<void> {
    await assertContentRole('delete comments');
    const supabase = createClient();
    const { error } = await supabase.from('blog_comments').delete().eq('id', id);
    if (error) throw new Error(error.message);
    revalidatePath('/admin/blog/comments');
}
