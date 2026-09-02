-- ============================================================================
-- BLOG SYSTEM — admin-managed editorial content (posts, sections, Q&A,
-- CTA buttons, comments) with a fixed structured template.
--
-- Run in the Supabase SQL Editor. Idempotent: safe to re-run.
--
-- Design notes:
--   * Every post follows a FIXED shape (not a freeform page builder):
--     featured image -> intro -> repeatable sections (each with an optional
--     second image + repeatable sub-sections) -> Q&A pairs -> one CTA block.
--   * blog_sections.block_type distinguishes a normal section from an
--     optional "callout / did you know" block.
--   * Posts are always live on save — there is no draft/published boolean;
--     published_at just controls the display date (editable/backdatable).
--   * Comments always start 'pending' server-side — enforced here via a
--     BEFORE INSERT trigger, not just a column default, so a malicious or
--     buggy client can never insert a pre-approved comment.
--   * RLS: public read of posts/categories/approved comments; anon may
--     INSERT a comment; all other writes require profiles.role IN
--     ('ADMIN', 'MARKETING').
-- ============================================================================

-- ── 1. Categories (fixed lookup table) ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.blog_categories (
    slug       TEXT PRIMARY KEY,
    name       TEXT NOT NULL,
    sort_order INT  NOT NULL DEFAULT 0
);

ALTER TABLE public.blog_categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view blog categories" ON public.blog_categories;
CREATE POLICY "Public can view blog categories" ON public.blog_categories
    FOR SELECT USING (true);

INSERT INTO public.blog_categories (slug, name, sort_order)
VALUES
    ('heritage-craft',      'Heritage & Craft',      1),
    ('weaving-traditions',  'Weaving Traditions',    2),
    ('styling-guides',      'Styling Guides',        3),
    ('brand-stories',       'Brand Stories',         4),
    ('care-maintenance',    'Care & Maintenance',    5)
ON CONFLICT (slug) DO UPDATE
    SET name       = EXCLUDED.name,
        sort_order = EXCLUDED.sort_order;

-- ── 2. Posts ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.blog_posts (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug                  TEXT NOT NULL UNIQUE,
    title                 TEXT NOT NULL,

    featured_image_url    TEXT,
    featured_image_alt    TEXT,
    featured_image_mode   TEXT NOT NULL DEFAULT 'cover'
                              CHECK (featured_image_mode IN ('cover', 'contain')),

    intro_html            TEXT NOT NULL DEFAULT '',

    category_slug         TEXT REFERENCES public.blog_categories(slug) ON UPDATE CASCADE,
    author                TEXT NOT NULL DEFAULT 'Pratyagra Team',
    tags                  TEXT[] NOT NULL DEFAULT '{}',

    reading_time_minutes  INT NOT NULL DEFAULT 1,
    published_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    meta_description      TEXT,

    cta_intro_text        TEXT,

    created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_blog_posts_category_slug ON public.blog_posts(category_slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at  ON public.blog_posts(published_at DESC);

DROP TRIGGER IF EXISTS update_blog_posts_updated_at ON public.blog_posts;
CREATE TRIGGER update_blog_posts_updated_at
    BEFORE UPDATE ON public.blog_posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view blog posts" ON public.blog_posts;
CREATE POLICY "Public can view blog posts" ON public.blog_posts
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Content team can insert blog posts" ON public.blog_posts;
CREATE POLICY "Content team can insert blog posts" ON public.blog_posts
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'MARKETING'))
    );

DROP POLICY IF EXISTS "Content team can update blog posts" ON public.blog_posts;
CREATE POLICY "Content team can update blog posts" ON public.blog_posts
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'MARKETING'))
    );

DROP POLICY IF EXISTS "Content team can delete blog posts" ON public.blog_posts;
CREATE POLICY "Content team can delete blog posts" ON public.blog_posts
    FOR DELETE USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'MARKETING'))
    );

-- ── 3. Sections (repeatable; heading + rich-text body; optional callout
--      type; optional second image placed after this section) ────────────
CREATE TABLE IF NOT EXISTS public.blog_sections (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id           UUID NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
    sort_order        INT  NOT NULL DEFAULT 0,

    block_type        TEXT NOT NULL DEFAULT 'section'
                          CHECK (block_type IN ('section', 'callout')),

    heading           TEXT,
    body_html         TEXT NOT NULL DEFAULT '',

    second_image_url  TEXT,
    second_image_alt  TEXT,
    second_image_mode TEXT NOT NULL DEFAULT 'cover'
                          CHECK (second_image_mode IN ('cover', 'contain'))
);

CREATE INDEX IF NOT EXISTS idx_blog_sections_post_id ON public.blog_sections(post_id);

ALTER TABLE public.blog_sections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view blog sections" ON public.blog_sections;
CREATE POLICY "Public can view blog sections" ON public.blog_sections
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Content team can manage blog sections" ON public.blog_sections;
CREATE POLICY "Content team can manage blog sections" ON public.blog_sections
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'MARKETING'))
    ) WITH CHECK (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'MARKETING'))
    );

-- ── 4. Sub-sections (repeatable within a section; heading + rich-text body) ─
CREATE TABLE IF NOT EXISTS public.blog_subsections (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    section_id UUID NOT NULL REFERENCES public.blog_sections(id) ON DELETE CASCADE,
    sort_order INT  NOT NULL DEFAULT 0,
    heading    TEXT,
    body_html  TEXT NOT NULL DEFAULT ''
);

CREATE INDEX IF NOT EXISTS idx_blog_subsections_section_id ON public.blog_subsections(section_id);

ALTER TABLE public.blog_subsections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view blog subsections" ON public.blog_subsections;
CREATE POLICY "Public can view blog subsections" ON public.blog_subsections
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Content team can manage blog subsections" ON public.blog_subsections;
CREATE POLICY "Content team can manage blog subsections" ON public.blog_subsections
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'MARKETING'))
    ) WITH CHECK (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'MARKETING'))
    );

-- ── 5. Q&A pairs (repeatable) ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.blog_qna (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id    UUID NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
    sort_order INT  NOT NULL DEFAULT 0,
    question   TEXT NOT NULL,
    answer     TEXT NOT NULL DEFAULT ''
);

CREATE INDEX IF NOT EXISTS idx_blog_qna_post_id ON public.blog_qna(post_id);

ALTER TABLE public.blog_qna ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view blog qna" ON public.blog_qna;
CREATE POLICY "Public can view blog qna" ON public.blog_qna
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Content team can manage blog qna" ON public.blog_qna;
CREATE POLICY "Content team can manage blog qna" ON public.blog_qna
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'MARKETING'))
    ) WITH CHECK (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'MARKETING'))
    );

-- ── 6. CTA buttons (repeatable, up to N; the CTA intro text lives on
--      blog_posts.cta_intro_text since there's exactly one per post) ──────
CREATE TABLE IF NOT EXISTS public.blog_cta_buttons (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id    UUID NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
    sort_order INT  NOT NULL DEFAULT 0,
    label      TEXT NOT NULL,
    url        TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_blog_cta_buttons_post_id ON public.blog_cta_buttons(post_id);

ALTER TABLE public.blog_cta_buttons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view blog cta buttons" ON public.blog_cta_buttons;
CREATE POLICY "Public can view blog cta buttons" ON public.blog_cta_buttons
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Content team can manage blog cta buttons" ON public.blog_cta_buttons;
CREATE POLICY "Content team can manage blog cta buttons" ON public.blog_cta_buttons
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'MARKETING'))
    ) WITH CHECK (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'MARKETING'))
    );

-- ── 7. Comments — always start 'pending', never trust client input ───────
CREATE TABLE IF NOT EXISTS public.blog_comments (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id    UUID NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
    name       TEXT NOT NULL,
    email      TEXT NOT NULL,
    message    TEXT NOT NULL,
    status     TEXT NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_blog_comments_post_id ON public.blog_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_blog_comments_status  ON public.blog_comments(status);

-- Force every INSERT to 'pending' regardless of what the client sends —
-- a column DEFAULT alone would not stop a client from explicitly setting
-- status = 'approved' in the insert payload.
CREATE OR REPLACE FUNCTION public.force_blog_comment_pending()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    NEW.status = 'pending';
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS blog_comments_force_pending ON public.blog_comments;
CREATE TRIGGER blog_comments_force_pending
    BEFORE INSERT ON public.blog_comments
    FOR EACH ROW EXECUTE FUNCTION public.force_blog_comment_pending();

ALTER TABLE public.blog_comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view approved comments" ON public.blog_comments;
CREATE POLICY "Public can view approved comments" ON public.blog_comments
    FOR SELECT USING (status = 'approved');

DROP POLICY IF EXISTS "Anyone can submit a comment" ON public.blog_comments;
CREATE POLICY "Anyone can submit a comment" ON public.blog_comments
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Content team can view all comments" ON public.blog_comments;
CREATE POLICY "Content team can view all comments" ON public.blog_comments
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'MARKETING'))
    );

DROP POLICY IF EXISTS "Content team can moderate comments" ON public.blog_comments;
CREATE POLICY "Content team can moderate comments" ON public.blog_comments
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'MARKETING'))
    );

DROP POLICY IF EXISTS "Content team can delete comments" ON public.blog_comments;
CREATE POLICY "Content team can delete comments" ON public.blog_comments
    FOR DELETE USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'MARKETING'))
    );

-- ============================================================================
-- Verification (run after the script)
-- ============================================================================
/*
SELECT * FROM public.blog_categories ORDER BY sort_order;

-- Should return 0 rows until the admin creates posts
SELECT id, slug, title, published_at FROM public.blog_posts ORDER BY published_at DESC;
*/
