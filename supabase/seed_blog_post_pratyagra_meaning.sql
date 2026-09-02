-- ============================================================================
-- SEED — "The Meaning Behind 'Pratyagra' – Reviving Tradition with a New Touch"
--
-- Run in the Supabase SQL Editor AFTER add_marketing_role.sql and
-- create_blog_tables.sql have both been run.
--
-- Images: no real image files exist yet, so featured_image_url and every
-- section's second_image_url are left NULL here (a NULL image just means
-- that slot renders empty — it does not break the page). Upload the actual
-- photos afterward via /admin/blog/<id>/edit using the alt text noted in
-- each comment below, so they go through the real signed-upload + WebP
-- pipeline instead of being inserted as a URL that would 404.
--
-- Idempotent: re-running deletes and recreates this post by slug, so you can
-- safely tweak this file and re-run it while drafting.
-- ============================================================================

DO $$
DECLARE
    v_post_id   UUID;
    v_section_id UUID;
BEGIN
    -- Clear any previous run of this seed (cascade removes sections/subsections/qna/cta)
    DELETE FROM public.blog_posts WHERE slug = 'the-meaning-behind-pratyagra';

    -- ── Post ────────────────────────────────────────────────────────────
    INSERT INTO public.blog_posts (
        slug, title,
        featured_image_url, featured_image_alt, featured_image_mode,
        intro_html,
        category_slug, author, tags,
        reading_time_minutes, published_at,
        meta_description,
        cta_intro_text
    ) VALUES (
        'the-meaning-behind-pratyagra',
        'The Meaning Behind "Pratyagra" – Reviving Tradition with a New Touch',
        NULL, -- TODO: upload via admin — "Pratyagra Silks handwoven silk saree representing Indian handloom heritage"
        'Pratyagra Silks handwoven silk saree representing Indian handloom heritage',
        'cover',
        '<h3>The Story Behind the Name &ldquo;Pratyagra&rdquo;</h3>' ||
        '<p>A name carries meaning before a single explanation follows it. Say &ldquo;Pratyagra&rdquo; and there is a sense of something rooted, deliberate, and connected to the past. That was intentional.</p>' ||
        '<p>Before a saree was sourced or a weaver was contacted, the name came first. It needed to represent everything the brand believes in &mdash; traditional craftsmanship, authenticity, heritage, and a fresh way of experiencing Indian handlooms.</p>' ||
        '<p>If you have explored our collection or noticed our tagline, &ldquo;Reviving Tradition with a New Touch,&rdquo; you may have wondered where the name Pratyagra comes from.</p>' ||
        '<p>The name represents our belief that tradition does not need to be replaced to remain relevant. It can be renewed, presented differently, and carried forward while keeping its roots intact.</p>',
        'brand-stories',
        'Pratyagra Team',
        ARRAY['Pratyagra Silks', 'Indian Handloom', 'Handwoven Silk Sarees', 'Indian Textile Heritage', 'Traditional Weaving'],
        7,
        '2026-09-01T00:00:00Z',
        'The story behind the name "Pratyagra" — how Pratyagra Silks revives India''s handloom traditions with a new touch, from sourcing philosophy to heirloom sarees.',
        'Explore our collection of heirloom handwoven sarees, sourced directly from India''s master weavers.'
    )
    RETURNING id INTO v_post_id;

    -- ── S1 second image (placed right after the introduction) ────────────
    -- Modeled as a heading-less section immediately following the intro,
    -- carrying only the "after introduction" image — see file header note
    -- on why images land after a full section rather than mid-paragraph.
    INSERT INTO public.blog_sections (post_id, sort_order, block_type, heading, body_html, second_image_url, second_image_alt, second_image_mode)
    VALUES (
        v_post_id, 0, 'section', NULL, '',
        NULL, -- TODO: upload — "Close-up of traditional handwoven silk saree craftsmanship"
        'Close-up of traditional handwoven silk saree craftsmanship', 'cover'
    );

    -- ── S2 — What does "Pratyagra" actually mean? ─────────────────────────
    INSERT INTO public.blog_sections (post_id, sort_order, block_type, heading, body_html, second_image_url, second_image_alt, second_image_mode)
    VALUES (
        v_post_id, 1, 'section', 'What Does "Pratyagra" Actually Mean?', '',
        NULL, NULL, 'cover'
    )
    RETURNING id INTO v_section_id;

    INSERT INTO public.blog_subsections (section_id, sort_order, heading, body_html) VALUES
    (v_section_id, 0, 'What Does the Name "Pratyagra" Represent?',
        '<p>&ldquo;Pratyagra&rdquo; is a Sanskrit-rooted word that broadly represents something fresh, renewed, or newly arrived, while still carrying the essence of what came before.</p>' ||
        '<p>For us, this distinction is important.</p>' ||
        '<p>New does not always mean completely different. A freshly bloomed flower is new, but it still comes from the same root. In much the same way, traditional Indian handloom can find a place in the present without losing the craftsmanship and heritage that made it special in the first place.</p>' ||
        '<p>Kanjivaram silk from Kanchipuram, Banarasi brocade from Varanasi, Tussar silk from Bhagalpur, and other regional handlooms have evolved through generations of skilled craftsmanship.</p>' ||
        '<p>They do not need a new identity. They need a renewed way of being discovered and appreciated.</p>' ||
        '<p>That is what Pratyagra means to us &mdash; tradition renewed, not tradition reinvented.</p>'),
    (v_section_id, 1, 'How Does Pratyagra Connect the Old with the New?',
        '<p>The philosophy behind Pratyagra is simple: honour what came before while making it meaningful for today.</p>' ||
        '<p>Traditional weaving techniques, patterns, materials, and artisan knowledge have travelled across generations. Our role is not to alter that heritage, but to create a more accessible journey between the weaver and the person wearing the saree.</p>'),
    (v_section_id, 2, 'How Does the Name Reflect Our Sourcing Philosophy?',
        '<p>The idea of being freshly presented while remaining rooted in the past also influences how we select our sarees.</p>' ||
        '<p>Each piece is carefully sourced with attention to its craftsmanship, origin, materials, and weaving tradition.</p>' ||
        '<p>The goal is simple: allow the heritage to reach a new generation without losing the connection to the people and traditions behind it.</p>');

    -- ── S3 — Why "Reviving Tradition with a New Touch" isn't just a tagline ─
    -- Image 2 (alt: "Woman wearing traditional handwoven silk saree from
    -- Pratyagra Silks") appeared after S3.S1's text — closest fit is this
    -- section's second_image_url, rendering after the whole section.
    INSERT INTO public.blog_sections (post_id, sort_order, block_type, heading, body_html, second_image_url, second_image_alt, second_image_mode)
    VALUES (
        v_post_id, 2, 'section', 'Why "Reviving Tradition with a New Touch" Isn''t Just a Tagline', '',
        NULL, -- TODO: upload — "Woman wearing traditional handwoven silk saree from Pratyagra Silks"
        'Woman wearing traditional handwoven silk saree from Pratyagra Silks', 'cover'
    )
    RETURNING id INTO v_section_id;

    INSERT INTO public.blog_subsections (section_id, sort_order, heading, body_html) VALUES
    (v_section_id, 0, 'What Does "Reviving Tradition" Mean to Pratyagra?',
        '<p>For Pratyagra Silks, reviving tradition means protecting the qualities that make Indian handloom special.</p>' ||
        '<p>It means respecting traditional weaving practices, authentic materials, skilled artisans, and the time required to create a saree by hand.</p>' ||
        '<p>A handwoven saree carries more than colour and design. It carries the knowledge of an artisan and techniques that have been preserved over generations.</p>' ||
        '<p>That heritage deserves to be valued rather than diluted for the sake of speed.</p>'),
    (v_section_id, 1, 'What Does the "New Touch" Actually Mean?',
        '<p>The &ldquo;new touch&rdquo; is not about changing the saree. It is about changing the journey to the saree.</p>' ||
        '<p>Today&rsquo;s customers expect convenience, transparency, easy access to information, and a thoughtful shopping experience.</p>' ||
        '<p>That means making traditional sarees easier to discover while providing clarity about their craftsmanship, origin, materials, and story.</p>' ||
        '<p>From a weaver&rsquo;s hands in Kanchipuram or Mysore to a customer&rsquo;s wardrobe anywhere in the world, the experience can be modern while the craft remains traditional.</p>');

    -- ── S4 — The three ideas behind every Pratyagra saree ─────────────────
    INSERT INTO public.blog_sections (post_id, sort_order, block_type, heading, body_html)
    VALUES (
        v_post_id, 3, 'section', 'The Three Ideas Behind Every Pratyagra Saree',
        '<p>Everything we do comes back to three commitments.</p>'
    )
    RETURNING id INTO v_section_id;

    INSERT INTO public.blog_subsections (section_id, sort_order, heading, body_html) VALUES
    (v_section_id, 0, 'Sourced at the Loom',
        '<p>We work with master weavers and artisan communities across India''s renowned weaving regions, including Kanchipuram, Mysore, and Varanasi.</p>' ||
        '<p>Selecting sarees close to their source helps us understand the craftsmanship behind every piece and maintain a stronger connection to its origin.</p>'),
    (v_section_id, 1, 'Woven by Masters',
        '<p>Every handwoven saree represents hours of skill, patience, and experience.</p>' ||
        '<p>Traditional materials such as pure mulberry silk and authentic zari, combined with generations of weaving knowledge, create sarees that carry a distinctive sense of heritage.</p>' ||
        '<p>The beauty is not simply in the finished design. It is in the hands that created it.</p>'),
    (v_section_id, 2, 'Made to Be Inherited',
        '<p>A Pratyagra saree is chosen to be more than a one-time occasion outfit.</p>' ||
        '<p>It can become part of a wedding memory, a family celebration, or a treasured piece passed from one generation to another.</p>' ||
        '<p>That is why we see an heirloom saree differently from a trend-driven purchase. Its value grows through the stories attached to it.</p>');

    -- ── "Did you know?" callout (follows S4 in the source content) ────────
    INSERT INTO public.blog_sections (post_id, sort_order, block_type, heading, body_html)
    VALUES (
        v_post_id, 4, 'callout', 'Did you know?',
        '<p>Our choice of a name rooted in renewal rather than novelty reflects our belief that handloom should not be treated like fast fashion. The aim is to preserve what is valuable and help it find its place in the future.</p>'
    );

    -- ── S5 — Who is Pratyagra Silks really for? ───────────────────────────
    INSERT INTO public.blog_sections (post_id, sort_order, block_type, heading, body_html)
    VALUES (v_post_id, 5, 'section', 'Who Is Pratyagra Silks Really For?', '')
    RETURNING id INTO v_section_id;

    INSERT INTO public.blog_subsections (section_id, sort_order, heading, body_html) VALUES
    (v_section_id, 0, 'For Those Who Value Authentic Handloom',
        '<p>Pratyagra Silks is for people who see a saree as more than an outfit.</p>' ||
        '<p>Our customers may want to know where a saree was woven, what materials were used, who created it, and why its craftsmanship matters.</p>' ||
        '<p>They appreciate the difference between something that simply looks traditional and something that genuinely carries a traditional craft story.</p>'),
    (v_section_id, 1, 'For Those Looking for Heirloom Sarees',
        '<p>With over 50 artisan partners across India''s weaving clusters and more than 500 curated pieces, Pratyagra Silks brings together sarees from several important Indian weaving traditions.</p>' ||
        '<p>From Kanjivaram and Banarasi to Tussar, Mysore silk, Kerala Kasavu, Muga, Paithani, and Pochampalli, each collection represents a different regional expression of Indian textile heritage.</p>');

    -- ── S6 — Carrying the name forward ─────────────────────────────────────
    INSERT INTO public.blog_sections (post_id, sort_order, block_type, heading, body_html)
    VALUES (
        v_post_id, 6, 'section', 'Carrying the Name Forward',
        '<p>A name becomes meaningful through the choices made behind it.</p>' ||
        '<p>Every time we select a saree based on its craftsmanship, explain its origin honestly, or choose to work closely with artisan communities, we are putting the meaning of Pratyagra into practice.</p>' ||
        '<p>For us, reviving tradition does not mean placing the past behind glass.</p>' ||
        '<p>It means allowing traditional craftsmanship to continue being worn, appreciated, celebrated, and passed forward.</p>' ||
        '<p>That is the meaning behind Pratyagra Silks.</p>' ||
        '<p><strong>Tradition renewed. Heritage respected. A new generation connected to the craft.</strong></p>'
    );

    -- ── S7 — Q&A ────────────────────────────────────────────────────────
    INSERT INTO public.blog_qna (post_id, sort_order, question, answer) VALUES
    (v_post_id, 0, 'What Does the Name "Pratyagra" Mean?',
        '"Pratyagra" is a Sanskrit-rooted word that broadly represents something fresh, renewed, or newly arrived, while retaining the essence of what came before.'),
    (v_post_id, 1, 'Why Did Pratyagra Silks Choose a Sanskrit-Inspired Name?',
        'The name reflects the brand''s connection to India''s long-standing handloom and textile heritage. It represents the idea of respecting traditional craftsmanship while bringing it to a new generation.'),
    (v_post_id, 2, 'How Does the Name Connect to the Brand''s Sourcing Philosophy?',
        'The philosophy of renewal without losing the root influences how sarees are selected — with attention to their craftsmanship, origin, materials, and connection to traditional weaving communities.'),
    (v_post_id, 3, 'Does "Reviving Tradition with a New Touch" Mean the Sarees Are Modernized?',
        'No. The "new touch" refers primarily to the way customers discover and experience traditional sarees, rather than changing the fundamental craft or heritage behind them.'),
    (v_post_id, 4, 'Who Is Pratyagra Silks Best Suited For?',
        'Pratyagra Silks is suited to those who appreciate authentic handwoven sarees, Indian textile heritage, skilled craftsmanship, and pieces that can become part of their wardrobe and family story for years to come.');

    -- ── CTA button ─────────────────────────────────────────────────────────
    INSERT INTO public.blog_cta_buttons (post_id, sort_order, label, url) VALUES
    (v_post_id, 0, 'Explore the Collection', '/collection');

    RAISE NOTICE 'Seeded blog post % (id=%)', 'the-meaning-behind-pratyagra', v_post_id;
END $$;

-- ============================================================================
-- Verification
-- ============================================================================
/*
SELECT id, slug, title, published_at FROM public.blog_posts WHERE slug = 'the-meaning-behind-pratyagra';
SELECT sort_order, block_type, heading FROM public.blog_sections s
  JOIN public.blog_posts p ON p.id = s.post_id WHERE p.slug = 'the-meaning-behind-pratyagra' ORDER BY sort_order;
SELECT question FROM public.blog_qna q
  JOIN public.blog_posts p ON p.id = q.post_id WHERE p.slug = 'the-meaning-behind-pratyagra' ORDER BY sort_order;
*/
