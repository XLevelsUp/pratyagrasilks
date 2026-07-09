/**
 * SEO Configuration for Kandangi Sarees
 * Centralized SEO data for consistency across the site.
 * Tone: warm, trusted guide — personal, not corporate. Heritage-rooted, not luxury-performative.
 */

import { BRAND_URL } from '@/lib/constants/brand';

export interface SilkCategory {
    slug: string;
    name: string;
    description: string;
    longDescription: string;
    keywords: string[];
    metaTitle: string;
    metaDescription: string;
    origin: string;
    characteristics: string[];
    priceRange: string;
    h1?: string;
    bodyOpener?: string;
    h2s?: string[];
    faqs?: { question: string; answer: string }[];
    relatedSlugs?: string[];
}

/**
 * Kandangi Sarees category taxonomy — silks + cottons
 */
export const silkCategories: SilkCategory[] = [
    // ─── SILKS ───────────────────────────────────────────────────────────────
    {
        slug: 'kanjivaram-silk',
        name: 'Kanjivaram Silk',
        description: 'Handwoven Kanjivaram silk sarees from Tamil Nadu — pure mulberry silk with temple borders and zari work, picked straight from the loom.',
        longDescription: 'Kanjivaram silk sarees are the crown of South Indian weaving. Handwoven in Kanchipuram, Tamil Nadu, by weavers who have carried this craft through generations, each saree is made from pure mulberry silk with contrasting borders and intricate zari motifs. At Kandangi Sarees, every Kanjivaram we carry has been handpicked by us — chosen for the quality of its weave, the richness of its colour, and its wearability for real occasions.',
        keywords: [
            'authentic kanjivaram under 20000',
            'kanjivaram silk sarees',
            'kanchipuram sarees',
            'buy kanjivaram sarees online',
            'handwoven kanjivaram',
            'temple border kanjivaram',
            'south indian silk sarees',
            'Kandangi Sarees kanjivaram',
            'kanjivaram from weavers',
        ],
        metaTitle: 'Authentic Kanjivaram Silk Sarees Under ₹20,000 | Kandangi Sarees',
        metaDescription: 'Shop authentic Kanjivaram silk sarees under ₹20,000 — handpicked from Kanjivaram weavers. Pure mulberry silk, genuine zari. Explore now.',
        origin: 'Kanchipuram, Tamil Nadu',
        characteristics: [
            'Pure mulberry silk with heavy body',
            'Contrasting borders woven separately and joined',
            'Temple-inspired zari motifs',
            'Rich, vibrant colour palette',
            'Durable — lasts generations with care',
        ],
        priceRange: '₹8,000 – ₹40,000',
        bodyOpener: 'Authentic Kanjivaram silk sarees are defined by three things: pure mulberry silk, genuine silver or gold zari, and the interlocked weaving technique that gives the border its signature strength. At Kandangi Sarees, every Kanjivaram is verified at source — because authenticity is not a label, it is a guarantee.',
        relatedSlugs: ['gadwal-silk', 'venkatagiri-silk', 'patola-silk'],
    },
    {
        slug: 'gadwal-silk',
        name: 'Gadwal Silk',
        description: 'Gadwal silk sarees from Telangana — known for their distinctive cotton body with pure silk borders, a weave that suits everyday elegance.',
        longDescription: 'Gadwal sarees from Gadwal, Telangana are woven with a unique technique: a cotton body paired with pure silk borders and pallu. This makes them lighter than full-silk sarees while retaining the lustre and grace of silk where it matters most. At Kandangi Sarees, we pick Gadwal sarees that honour the weave\'s heritage — intricate zari motifs, fine craftsmanship, and comfortable drape for women who wear sarees every day.',
        keywords: [
            'buy gadwal saree online',
            'gadwal silk sarees',
            'gadwal sarees online',
            'buy gadwal sarees',
            'telangana silk sarees',
            'cotton body silk border sarees',
            'gadwal handloom',
            'Kandangi Sarees gadwal',
        ],
        metaTitle: 'Buy Gadwal Silk Sarees Online | Kandangi Sarees',
        metaDescription: 'Buy authentic Gadwal silk sarees sourced directly from Telangana weavers. Pure zari borders, cotton body. Handpicked from ₹3,000. Shop now.',
        origin: 'Gadwal, Telangana',
        characteristics: [
            'Cotton body with pure silk borders and pallu',
            'Lighter drape than full silk — comfortable for daily wear',
            'Intricate zari motifs on the border',
            'Distinct woven join between body and border',
            'Vibrant colour contrasts',
        ],
        priceRange: '₹4,000 – ₹18,000',
        bodyOpener: 'Gadwal silk sarees are celebrated for their unique construction — a cotton body with a pure silk border — making them lighter than most silks while retaining the richness of traditional handloom. Our Gadwal collection is sourced directly from master weavers in Gadwal, Telangana.',
        relatedSlugs: ['kanjivaram-silk', 'kuppadam-silk', 'mangalgiri-silk'],
    },
    {
        slug: 'venkatagiri-silk',
        name: 'Venkatagiri Silk',
        description: 'Venkatagiri silk sarees from Andhra Pradesh — ultra-fine weave with a soft drape, known for their delicate jamdani patterns.',
        longDescription: 'Venkatagiri sarees from Nellore district, Andhra Pradesh, are celebrated for their feather-light weave and fine cotton-silk blend. The sarees feature delicate jamdani-style motifs worked directly into the fabric — no embroidery, just pure weaving artistry. At Kandangi Sarees, we pick Venkatagiri sarees for their refined elegance: pieces that feel effortless on the body and carry the warmth of a living weaving tradition.',
        keywords: [
            'venkatagiri silk sarees',
            'venkatagiri sarees online',
            'andhra silk sarees',
            'jamdani sarees',
            'fine weave sarees',
            'Kandangi Sarees venkatagiri',
            'nellore handloom',
        ],
        metaTitle: 'Venkatagiri Silk Sarees | Fine Weave from Andhra Pradesh | Kandangi Sarees',
        metaDescription: 'Handpicked Venkatagiri silk sarees — feather-light weave with delicate jamdani motifs from Andhra Pradesh weavers. Shop authentic weaves at Kandangi Sarees.',
        origin: 'Venkatagiri, Andhra Pradesh',
        characteristics: [
            'Ultra-fine cotton-silk blend',
            'Delicate jamdani motifs woven into the fabric',
            'Feather-light drape — comfortable in warm weather',
            'Subtle, elegant colour palette',
            'Intricate border work',
        ],
        priceRange: '₹3,000 – ₹15,000',
    },
    {
        slug: 'mangalgiri-silk',
        name: 'Mangalgiri Silk',
        description: 'Mangalgiri silk sarees from Andhra Pradesh — distinctive nizam border with a crisp drape, a hallmark of Andhra weaving heritage.',
        longDescription: 'Mangalgiri, a small weaving town near Vijayawada, Andhra Pradesh, produces sarees with a distinctive nizam border — a gold or silver zari stripe woven at the edge. Mangalgiri silk sarees combine this signature border with a smooth, slightly textured body that holds a crisp pleat. At Kandangi Sarees, we pick Mangalgiri silks for their versatility: formal enough for occasions, comfortable enough for everyday wear.',
        keywords: [
            'mangalgiri silk saree buy',
            'mangalgiri silk sarees',
            'mangalgiri sarees online',
            'nizam border sarees',
            'andhra pradesh handloom',
            'vijayawada silk sarees',
            'Kandangi Sarees mangalgiri',
        ],
        metaTitle: 'Mangalgiri Silk Sarees | Nizam Border Sarees | Kandangi Sarees',
        metaDescription: 'Authentic Mangalgiri silk sarees from Andhra Pradesh — distinctive nizam zari border, crisp drape, handpicked from weavers. Shop at Kandangi Sarees.',
        origin: 'Mangalgiri, Andhra Pradesh',
        characteristics: [
            'Signature nizam border — gold or silver zari stripe',
            'Crisp, structured drape',
            'Smooth slightly textured body',
            'Versatile — occasion and everyday wear',
            'Pure silk or cotton-silk blend options',
        ],
        priceRange: '₹3,500 – ₹16,000',
        relatedSlugs: ['gadwal-silk', 'venkatagiri-silk', 'mangalgiri-cotton'],
    },
    {
        slug: 'kuppadam-silk',
        name: 'Kuppadam Silk',
        description: 'Kuppadam silk sarees — a rare weave from Andhra Pradesh combining silk and cotton with a richly contrasting border.',
        longDescription: 'Kuppadam sarees are a lesser-known treasure from Andhra Pradesh, woven in the Kuppadam tradition with a combined silk-cotton structure and a richly contrasting border. Similar in technique to Gadwal but with distinct regional motifs and colour sensibilities, Kuppadam sarees are a rare find — and at Kandangi Sarees, we pick them specifically for women who appreciate discovering weaves that are authentic but not yet overexposed.',
        keywords: [
            'kuppadam silk sarees',
            'kuppadam sarees online',
            'andhra handloom sarees',
            'rare weave sarees',
            'Kandangi Sarees kuppadam',
            'silk cotton sarees',
        ],
        metaTitle: 'Kuppadam Silk Sarees | Rare Andhra Weave | Kandangi Sarees',
        metaDescription: 'Discover rare Kuppadam silk sarees from Andhra Pradesh — silk-cotton weave with rich contrasting borders, handpicked from artisan weavers. Shop at Kandangi Sarees.',
        origin: 'Andhra Pradesh',
        characteristics: [
            'Silk-cotton combination structure',
            'Richly contrasting borders',
            'Regional motifs unique to Kuppadam tradition',
            'Rare, limited availability',
            'Comfortable drape',
        ],
        priceRange: '₹4,000 – ₹18,000',
    },
    {
        slug: 'pen-kalamkari',
        name: 'Pen Kalamkari',
        description: 'Pen Kalamkari sarees from Andhra Pradesh — hand-painted with natural dyes, each piece a one-of-a-kind wearable artwork.',
        longDescription: 'Pen Kalamkari is one of India\'s most distinctive textile arts — each saree is hand-painted using a bamboo pen (kalam) and natural plant and mineral dyes. Made primarily in Srikalahasti, Andhra Pradesh, these sarees depict mythological scenes, birds, florals, and geometric patterns. No two pieces are identical. At Kandangi Sarees, we pick Pen Kalamkari sarees for women who want something genuinely handmade — not printed, not stamped, but drawn by hand.',
        keywords: [
            'pen kalamkari sarees',
            'kalamkari sarees online',
            'hand-painted sarees',
            'natural dye sarees',
            'srikalahasti kalamkari',
            'Kandangi Sarees kalamkari',
            'wearable art sarees',
        ],
        metaTitle: 'Pen Kalamkari Sarees | Hand-Painted Natural Dye | Kandangi Sarees',
        metaDescription: 'Authentic Pen Kalamkari sarees from Srikalahasti — hand-painted with a bamboo pen and natural dyes. Each piece is unique. Handpicked by Kandangi Sarees.',
        origin: 'Srikalahasti, Andhra Pradesh',
        characteristics: [
            'Hand-painted using bamboo pen (kalam)',
            'Natural plant and mineral dyes only',
            'Mythological, floral, and geometric motifs',
            'Each piece is genuinely unique',
            'Cotton or silk base',
        ],
        priceRange: '₹3,000 – ₹20,000',
    },
    {
        slug: 'patola-silk',
        name: 'Rajkot Patola Silk',
        description: 'Rajkot Patola silk sarees from Gujarat — vibrant ikat weave with geometric precision, one of India\'s most celebrated textile traditions.',
        longDescription: 'Rajkot Patola sarees from Gujarat are woven using the single ikat technique — where warp threads are resist-dyed before weaving to create bold, geometric patterns with striking colour contrasts. Rajkot Patola is more accessible than the Patan double ikat variety while retaining the distinctive geometric vocabulary that makes Patola sarees so iconic. At Kandangi Sarees, we carefully source Rajkot Patola sarees for collectors and saree connoisseurs who appreciate rare regional craft.',
        keywords: [
            'rajkot patola silk saree price',
            'rajkot patola silk sarees',
            'rajkot patola sarees',
            'single ikat sarees',
            'gujarat silk sarees',
            'buy rajkot patola sarees online',
            'Kandangi Sarees rajkot patola',
            'rare silk sarees',
        ],
        metaTitle: 'Rajkot Patola Silk Sarees | Ikat Weave from Gujarat | Kandangi Sarees',
        metaDescription: 'Rajkot Patola silk sarees from Gujarat — vibrant ikat weave with geometric precision. One of India\'s most celebrated textile traditions. Handpicked by Kandangi Sarees.',
        origin: 'Gujarat',
        characteristics: [
            'Single ikat technique — warp threads are resist-dyed before weaving',
            'Bold geometric patterns and traditional motifs',
            'More accessible than Patan double ikat while retaining the iconic Patola aesthetic',
            'Woven on traditional handlooms in Rajkot, Gujarat',
            'Vibrant colour contrasts and smooth silk texture',
        ],
        priceRange: '₹15,000 – ₹80,000',
        relatedSlugs: ['kanjivaram-silk', 'venkatagiri-silk', 'gadwal-silk'],
    },
    {
        slug: 'raw-silk',
        name: 'Raw Silk',
        description: 'Raw silk sarees with a natural, textured sheen — the unprocessed character of silk in its most honest form.',
        longDescription: 'Raw silk sarees retain the natural texture of the silk fibre before it is fully processed, giving them a slightly nubby, textured surface and a matte-to-subtle sheen. This honest, understated quality makes raw silk sarees a favourite for women who want the beauty of silk without the high formality of processed varieties. At Kandangi Sarees, we pick raw silk sarees that drape beautifully, come in rich earthy tones, and suit both everyday elegance and formal occasions.',
        keywords: [
            'raw silk sarees',
            'raw silk sarees online',
            'textured silk sarees',
            'natural silk sarees',
            'Kandangi Sarees raw silk',
            'unprocessed silk sarees',
        ],
        metaTitle: 'Raw Silk Sarees | Natural Texture, Honest Weave | Kandangi Sarees',
        metaDescription: 'Handpicked raw silk sarees — natural texture, matte sheen, and earthy colour palette. Understated elegance for everyday and occasions. Shop at Kandangi Sarees.',
        origin: 'Multi-region (Tamil Nadu, Andhra Pradesh, Karnataka)',
        characteristics: [
            'Natural, slightly nubby texture',
            'Matte to subtle sheen',
            'Rich, earthy colour palette',
            'Lighter than processed silk — comfortable to wear',
            'Versatile — everyday and occasion',
        ],
        priceRange: '₹2,500 – ₹12,000',
    },
    {
        slug: 'tussar-silk',
        name: 'Tussar Silk',
        description: 'Tussar silk sarees with a natural golden hue and rich texture — wild silk at its most distinctive.',
        longDescription: 'Tussar silk (also called Kosa silk) is produced from wild silkworms and is known for its natural golden-tan sheen and distinctive grainy texture. Woven primarily in Jharkhand, West Bengal, and Odisha, Tussar sarees are lightweight, breathable, and carry an earthy, natural elegance. At Kandangi Sarees, we pick Tussar sarees for women who love texture and appreciate the unpretentious beauty of natural fibres.',
        keywords: [
            'tussar silk sarees',
            'kosa silk sarees',
            'wild silk sarees',
            'jharkhand silk sarees',
            'natural golden silk',
            'Kandangi Sarees tussar',
            'textured silk sarees',
        ],
        metaTitle: 'Tussar Silk Sarees | Natural Wild Silk | Kandangi Sarees',
        metaDescription: 'Handpicked Tussar silk sarees with natural golden sheen and rich texture. Lightweight wild silk from Jharkhand — earthy, authentic, and wearable. Shop at Kandangi Sarees.',
        origin: 'Jharkhand / West Bengal',
        characteristics: [
            'Natural golden-tan sheen',
            'Distinctive grainy, nubby texture',
            'Lightweight and breathable',
            'Earthy natural colour palette',
            'Wild silk — unique to each piece',
        ],
        priceRange: '₹3,000 – ₹14,000',
    },
    {
        slug: 'soft-silk',
        name: 'Soft Silk',
        description: 'Soft silk sarees with a smooth, lightweight drape — the gentler, more wearable face of pure silk.',
        longDescription: 'Soft silk sarees are woven from a finer, lighter silk yarn that produces a smooth, fluid drape quite different from the structured weight of Kanjivaram or Gadwal. Often associated with Bangalore and Mysore silk traditions, soft silk sarees are a favourite for women who want the sheen and elegance of pure silk without the stiffness of heavier weaves. At Kandangi Sarees, we handpick soft silk sarees that combine a clean finish, vibrant colour palette, and everyday wearability.',
        keywords: [
            'soft silk sarees',
            'soft silk sarees online',
            'bangalore soft silk sarees',
            'mysore soft silk sarees',
            'lightweight silk sarees',
            'pure soft silk sarees india',
            'Kandangi Sarees soft silk',
            'affordable silk sarees',
        ],
        metaTitle: 'Soft Silk Sarees | Lightweight Pure Silk | Kandangi Sarees',
        metaDescription: 'Handpicked soft silk sarees — smooth drape, vibrant colours, and lightweight pure silk. Elegant for everyday and occasions. Shop at Kandangi Sarees.',
        origin: 'Karnataka (Bangalore / Mysore)',
        characteristics: [
            'Smooth, lightweight drape',
            'Bright, vibrant colour palette',
            'Subtle natural sheen',
            'Less stiff than heavier silk varieties',
            'Versatile — daily wear to celebrations',
        ],
        priceRange: '₹2,500 – ₹8,000',
        relatedSlugs: ['raw-silk', 'venkatagiri-silk', 'tussar-silk'],
    },

    // ─── COTTONS ─────────────────────────────────────────────────────────────
    {
        slug: 'chettinad-cotton',
        name: 'Chettinad Cotton',
        description: 'Chettinad cotton sarees from Tamil Nadu — bold checks, vibrant colours, and a thick, durable weave that only gets better with wear.',
        longDescription: 'Chettinad cotton sarees are woven in the Karaikudi region of Tamil Nadu, traditionally associated with the Chettiar community. They are known for their bold checks, stripes, and bright contrasting colour combinations — a visual identity that is immediately recognisable. The fabric is thick, sturdy, and develops a beautiful softness with every wash. At Kandangi Sarees, we pick Chettinad cottons that are authentic to the tradition — colourful, characterful, and built to last.',
        keywords: [
            'chettinad cotton saree online',
            'chettinad cotton sarees',
            'chettinad sarees online',
            'karaikudi sarees',
            'tamil cotton sarees',
            'bold check sarees',
            'Kandangi Sarees chettinad',
            'handloom cotton sarees',
        ],
        metaTitle: 'Chettinad Cotton Sarees Online | Kandangi Sarees',
        metaDescription: 'Shop authentic Chettinad cotton sarees handpicked from Tamil Nadu weavers. Lightweight, breathable & perfect for daily wear. Explore the collection.',
        origin: 'Karaikudi, Tamil Nadu',
        characteristics: [
            'Bold checks, stripes, and contrasting colour combinations',
            'Thick, durable cotton weave',
            'Gets softer and more comfortable with every wash',
            'Naturally breathable — ideal for warm weather',
            'Rich, vibrant colour palette',
        ],
        priceRange: '₹1,200 – ₹6,000',
        bodyOpener: 'Chettinad cotton sarees are among the most sought-after handloom weaves in India — known for their distinctive checks, deep colours, and exceptional breathability. At Kandangi Sarees, every Chettinad cotton is handpicked directly from weavers in the Chettinad region of Tamil Nadu.',
        relatedSlugs: ['narayanapet-cotton', 'khadi-cotton', 'venkatagiri-cotton'],
    },
    {
        slug: 'narayanapet-cotton',
        name: 'Narayanapet Cotton',
        description: 'Narayanapet cotton sarees from Telangana — wide zari borders on sturdy cotton, a weave that carries both occasion and everyday grace.',
        longDescription: 'Narayanapet sarees come from the Mahabubnagar district of Telangana and are known for their wide, richly woven zari borders on a cotton body. The combination of a structured cotton weave with a formal zari border gives these sarees a versatility that is hard to match — equally at home at a festival or a family gathering. At Kandangi Sarees, we pick Narayanapet cottons for their solid build, honest weave, and the way they hold a pleat without effort.',
        keywords: [
            'narayanapet cotton sarees',
            'narayanapet sarees online',
            'telangana cotton sarees',
            'zari border cotton sarees',
            'mahabubnagar handloom',
            'Kandangi Sarees narayanapet',
        ],
        metaTitle: 'Narayanapet Cotton Sarees | Zari Border Cotton | Kandangi Sarees',
        metaDescription: 'Handpicked Narayanapet cotton sarees from Telangana — wide zari borders on sturdy cotton, perfect for festivals and family occasions. Shop at Kandangi Sarees.',
        origin: 'Narayanapet, Telangana',
        characteristics: [
            'Wide richly woven zari borders',
            'Sturdy, structured cotton body',
            'Holds pleats well without stiffening',
            'Suitable for festivals, occasions, and everyday wear',
            'Strong, long-lasting weave',
        ],
        priceRange: '₹1,500 – ₹8,000',
    },
    {
        slug: 'venkatagiri-cotton',
        name: 'Venkatagiri Cotton',
        description: 'Venkatagiri cotton sarees from Andhra Pradesh — ultra-fine weave with jamdani motifs, the lighter cousin of the silk version.',
        longDescription: 'The cotton variant of Venkatagiri sarees shares the same fine weaving heritage as its silk counterpart but offers a lighter, airier fabric ideal for daily wear. Woven with delicate jamdani-style motifs, Venkatagiri cotton sarees are among the finest handloom cottons in India. At Kandangi Sarees, we pick these for women who want the elegance of a handloom saree on a regular day — without any compromise on craft.',
        keywords: [
            'venkatagiri cotton saree',
            'venkatagiri cotton sarees',
            'venkatagiri cotton sarees online',
            'andhra cotton sarees',
            'fine cotton sarees',
            'jamdani cotton sarees',
            'Kandangi Sarees venkatagiri cotton',
        ],
        metaTitle: 'Venkatagiri Cotton Sarees | Fine Jamdani Weave | Kandangi Sarees',
        metaDescription: 'Ultra-fine Venkatagiri cotton sarees from Andhra Pradesh with delicate jamdani motifs — handpicked for daily elegance. Shop at Kandangi Sarees.',
        origin: 'Venkatagiri, Andhra Pradesh',
        characteristics: [
            'Ultra-fine cotton weave',
            'Delicate jamdani motifs woven in',
            'Feather-light — perfect for warm weather daily wear',
            'Soft, comfortable drape',
            'Subtle, refined colour palette',
        ],
        priceRange: '₹1,000 – ₹5,000',
        relatedSlugs: ['chettinad-cotton', 'mangalgiri-cotton', 'venkatagiri-silk'],
    },
    {
        slug: 'mangalgiri-cotton',
        name: 'Mangalgiri',
        description: 'Mangalgiri cotton sarees from Andhra Pradesh — the iconic nizam border on a lightweight cotton body, a daily weave with real character.',
        longDescription: 'Mangalgiri sarees are the cotton variety of the Mangalgiri weaving tradition — lighter than the silk versions but equally distinctive. The nizam border, woven in gold or silver zari, gives these cotton sarees a polish that makes them suitable well beyond casual wear. The "Gachi" refers to the double-warp construction that gives the fabric its characteristic crispness. At Kandangi Sarees, we pick Mangalgiri sarees for women who want a daily-wear saree that still looks considered.',
        keywords: [
            'mangalgiri cotton sarees',
            'Mangalgiri sarees',
            'nizam border cotton sarees',
            'andhra cotton handloom',
            'Kandangi Sarees mangalgiri cotton',
            'daily wear sarees',
        ],
        metaTitle: 'Mangalgiri Cotton Sarees | Nizam Border Daily Wear | Kandangi Sarees',
        metaDescription: 'Mangalgiri cotton sarees from Andhra Pradesh — nizam zari border on lightweight cotton. Crisp, considered, and handpicked for daily wear. Shop at Kandangi Sarees.',
        origin: 'Mangalgiri, Andhra Pradesh',
        characteristics: [
            'Signature nizam border on cotton body',
            'Double-warp construction for natural crispness',
            'Lightweight and comfortable for all-day wear',
            'Suitable for office, home, and casual occasions',
            'Pure cotton — breathable in warm weather',
        ],
        priceRange: '₹1,000 – ₹5,000',
    },
    {
        slug: 'khadi-cotton',
        name: 'Khadi Cotton',
        description: 'Khadi cotton sarees — hand-spun and hand-woven across India, with a texture and warmth that no machine can replicate.',
        longDescription: 'Khadi sarees are woven from hand-spun yarn — each thread drawn out by hand before being woven on a handloom. The result is a fabric with a distinctive irregular texture, natural warmth, and an honest quality that is completely its own. Khadi sarees span a wide range of styles, from plain and earthy to intricately bordered, and they are produced by weaving cooperatives across India. At Kandangi Sarees, we pick Khadi sarees that are genuinely hand-spun — not machine-spun fabric passed off as Khadi.',
        keywords: [
            'khadi cotton saree online',
            'khadi cotton sarees',
            'khadi sarees online',
            'hand-spun sarees',
            'hand-woven khadi',
            'Kandangi Sarees khadi',
            'sustainable sarees',
            'khadi india sarees',
        ],
        metaTitle: 'Khadi Cotton Sarees | Hand-Spun, Hand-Woven | Kandangi Sarees',
        metaDescription: 'Authentic hand-spun Khadi cotton sarees — natural texture, earthy warmth, and the honest quality of genuine handloom. Handpicked by Kandangi Sarees.',
        origin: 'Pan-India (various Khadi cooperatives)',
        characteristics: [
            'Genuinely hand-spun yarn — not machine-spun',
            'Distinctive irregular texture',
            'Natural warmth — comfortable in all seasons',
            'Earthy, natural dye colour palette',
            'Woven by cooperative artisan communities',
        ],
        priceRange: '₹1,000 – ₹6,000',
        relatedSlugs: ['chettinad-cotton', 'mangalgiri-cotton', 'venkatagiri-cotton'],
    },
];

/**
 * Get category by slug
 */
export function getCategoryBySlug(slug: string): SilkCategory | undefined {
    return silkCategories.find(cat => cat.slug === slug);
}

/**
 * Valid top-level filter/category types for the collection page.
 * Used by collection page filter UI and any dynamic routing that needs to
 * distinguish between broad fabric groups.
 */
export const CATEGORY_TYPES = ['silk', 'cotton', 'silk-cotton'] as const;
export type CategoryType = typeof CATEGORY_TYPES[number];

/**
 * Maps a category slug to its broad fabric type.
 */
export function getCategoryType(slug: string): CategoryType {
    if (slug.includes('cotton')) return 'cotton';
    if (slug === 'pen-kalamkari') return 'silk-cotton';
    return 'silk';
}

/**
 * Generate structured data for Organization (for homepage)
 */
export function generateOrganizationSchema() {
    return {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'Kandangi Sarees',
        alternateName: 'Adakkami',
        url: BRAND_URL,
        logo: `${BRAND_URL}/logo.png`,
        contactPoint: {
            '@type': 'ContactPoint',
            contactType: 'customer service',
            availableLanguage: ['English', 'Tamil', 'Telugu'],
        },
    };
}

/**
 * Generate structured data for Product
 */
export function generateProductSchema(product: {
    name: string;
    description: string;
    price: number;
    sku: string;
    category: string;
    images: string[];
    inStock: boolean;
    colorFamilies?: string[];
}) {
    const colorLabel = product.colorFamilies?.length
        ? product.colorFamilies.length > 1
            ? product.colorFamilies.map(c => c.charAt(0).toUpperCase() + c.slice(1)).join(' and ') + ' Dual Tone'
            : product.colorFamilies[0].charAt(0).toUpperCase() + product.colorFamilies[0].slice(1)
        : undefined;

    return {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        description: product.description,
        sku: product.sku,
        image: product.images,
        ...(colorLabel ? { color: colorLabel } : {}),
        offers: {
            '@type': 'Offer',
            price: product.price,
            priceCurrency: 'INR',
            availability: product.inStock
                ? 'https://schema.org/InStock'
                : 'https://schema.org/OutOfStock',
            url: `${BRAND_URL}/product/${product.sku}`,
        },
        brand: {
            '@type': 'Brand',
            name: 'Kandangi Sarees',
        },
        category: product.category,
    };
}

/**
 * Generate structured data for CollectionPage
 */
export function generateCollectionSchema(category: SilkCategory) {
    return {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: category.name,
        description: category.description,
        url: `${BRAND_URL}/collection/${category.slug}`,
        breadcrumb: {
            '@type': 'BreadcrumbList',
            itemListElement: [
                {
                    '@type': 'ListItem',
                    position: 1,
                    name: 'Home',
                    item: BRAND_URL,
                },
                {
                    '@type': 'ListItem',
                    position: 2,
                    name: 'Saree Collection',
                    item: `${BRAND_URL}/collection`,
                },
                {
                    '@type': 'ListItem',
                    position: 3,
                    name: category.name,
                    item: `${BRAND_URL}/collection/${category.slug}`,
                },
            ],
        },
    };
}

export function generateWebSiteSchema() {
    return {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'Kandangi Sarees',
        url: BRAND_URL,
        potentialAction: {
            '@type': 'SearchAction',
            target: {
                '@type': 'EntryPoint',
                urlTemplate: `${BRAND_URL}/collection?search={search_term_string}`,
            },
            'query-input': 'required name=search_term_string',
        },
    };
}

export function generateFAQSchema(faqs: { question: string; answer: string }[]) {
    return {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.map(faq => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: {
                '@type': 'Answer',
                text: faq.answer,
            },
        })),
    };
}
