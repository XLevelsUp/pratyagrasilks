/**
 * Pure snake_case-row → domain-object mappers for the blog schema, plus the
 * shared PostgREST select used to pull a post with its nested tree.
 *
 * These are deliberately free of any framework or Supabase import: both the
 * public storefront reads and the admin CRUD writes need them, and after the
 * monorepo split those live in two independently-deployed apps. Keeping the
 * mapping in one framework-free module is what stops the two sides from
 * drifting on row shape.
 */

import type {
    BlogPost,
    BlogCategory,
    BlogSection,
    BlogSubsection,
    BlogQnA,
    BlogCtaButton,
    BlogComment,
} from '@/lib/types';

/** Post with its category, sections (+subsections), Q&A and CTA buttons. */
export const POST_SELECT = `
    *,
    blog_categories ( slug, name, sort_order ),
    blog_sections ( *, blog_subsections ( * ) ),
    blog_qna ( * ),
    blog_cta_buttons ( * )
`;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapCategoryRow(row: any): BlogCategory {
    return { slug: row.slug, name: row.name, sortOrder: row.sort_order };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapSubsectionRow(row: any): BlogSubsection {
    return {
        id: row.id,
        sectionId: row.section_id,
        sortOrder: row.sort_order,
        heading: row.heading,
        bodyHtml: row.body_html,
    };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapSectionRow(row: any): BlogSection {
    return {
        id: row.id,
        postId: row.post_id,
        sortOrder: row.sort_order,
        blockType: row.block_type,
        heading: row.heading,
        bodyHtml: row.body_html,
        secondImageUrl: row.second_image_url,
        secondImageAlt: row.second_image_alt,
        secondImageMode: row.second_image_mode,
        subsections: ((row.blog_subsections ?? []) as unknown[])
            .map(mapSubsectionRow)
            .sort((a, b) => a.sortOrder - b.sortOrder),
    };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapQnaRow(row: any): BlogQnA {
    return { id: row.id, postId: row.post_id, sortOrder: row.sort_order, question: row.question, answer: row.answer };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapCtaButtonRow(row: any): BlogCtaButton {
    return { id: row.id, postId: row.post_id, sortOrder: row.sort_order, label: row.label, url: row.url };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapPostRow(row: any): BlogPost {
    return {
        id: row.id,
        slug: row.slug,
        title: row.title,
        featuredImageUrl: row.featured_image_url,
        featuredImageAlt: row.featured_image_alt,
        featuredImageMode: row.featured_image_mode,
        introHtml: row.intro_html,
        categorySlug: row.category_slug,
        category: row.blog_categories ? mapCategoryRow(row.blog_categories) : undefined,
        author: row.author,
        tags: row.tags ?? [],
        readingTimeMinutes: row.reading_time_minutes,
        publishedAt: new Date(row.published_at),
        metaDescription: row.meta_description,
        ctaIntroText: row.cta_intro_text,
        sections: ((row.blog_sections ?? []) as unknown[])
            .map(mapSectionRow)
            .sort((a, b) => a.sortOrder - b.sortOrder),
        qna: ((row.blog_qna ?? []) as unknown[])
            .map(mapQnaRow)
            .sort((a, b) => a.sortOrder - b.sortOrder),
        ctaButtons: ((row.blog_cta_buttons ?? []) as unknown[])
            .map(mapCtaButtonRow)
            .sort((a, b) => a.sortOrder - b.sortOrder),
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at),
    };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapCommentRow(row: any): BlogComment {
    return {
        id: row.id,
        postId: row.post_id,
        name: row.name,
        email: row.email,
        message: row.message,
        status: row.status,
        createdAt: new Date(row.created_at),
    };
}
