/**
 * SEO Configuration for PratyagraSilks
 * Centralized SEO data for consistency across the site
 */

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
}

/**
 * All silk categories with comprehensive SEO data
 */
export const silkCategories: SilkCategory[] = [
    {
        slug: 'kanjivaram-silk',
        name: 'Kanjivaram Silk',
        description: 'Exquisite handwoven Kanjivaram silk sarees from Tamil Nadu with traditional temple motifs and rich zari work.',
        longDescription: 'Kanjivaram silk sarees, also known as Kanchipuram sarees, are the epitome of South Indian silk weaving tradition. Handwoven by master artisans in Kanchipuram, Tamil Nadu, these sarees are renowned for their pure mulberry silk, contrasting borders, and intricate temple-inspired designs. Each Kanjivaram saree takes weeks to create and features heavy zari work with motifs like peacocks, parrots, and traditional temple architecture.',
        keywords: [
            'kanjivaram silk sarees',
            'kanchipuram sarees online',
            'authentic kanjivaram silk',
            'buy kanjivaram sarees',
            'pure kanjivaram silk',
            'south indian silk sarees',
            'temple border sarees',
            'traditional kanjivaram',
        ],
        metaTitle: 'Authentic Kanjivaram Silk Sarees | Handwoven Temple Border Sarees',
        metaDescription: 'Shop authentic handwoven Kanjivaram silk sarees from Tamil Nadu. Pure mulberry silk with traditional temple motifs, rich zari borders, and exquisite craftsmanship. Free shipping across India.',
        origin: 'Kanchipuram, Tamil Nadu',
        characteristics: [
            'Pure mulberry silk',
            'Contrasting borders with heavy zari',
            'Temple-inspired motifs',
            'Thick, durable fabric',
            'Rich, vibrant colors',
        ],
        priceRange: '₹15,000 - ₹50,000',
    },
    {
        slug: 'banarasi-silk',
        name: 'Banarasi Silk',
        description: 'Luxurious Banarasi silk sarees from Varanasi featuring intricate brocade work and Mughal-inspired patterns.',
        longDescription: 'Banarasi silk sarees are the crown jewels of Indian textile heritage, woven in the ancient city of Varanasi. These opulent sarees feature intricate brocade work with gold and silver zari threads, showcasing Mughal-inspired floral and foliate motifs. Known for their luxurious feel and elaborate designs, Banarasi sarees are the preferred choice for weddings and grand celebrations.',
        keywords: [
            'banarasi silk sarees',
            'banarasi sarees online',
            'authentic banarasi silk',
            'buy banarasi sarees',
            'varanasi silk sarees',
            'brocade silk sarees',
            'wedding banarasi sarees',
            'zari work sarees',
        ],
        metaTitle: 'Authentic Banarasi Silk Sarees | Handwoven Brocade Sarees from Varanasi',
        metaDescription: 'Discover luxurious Banarasi silk sarees with intricate zari brocade work. Authentic handwoven sarees from Varanasi weavers. Perfect for weddings and special occasions.',
        origin: 'Varanasi, Uttar Pradesh',
        characteristics: [
            'Intricate brocade work',
            'Gold and silver zari',
            'Mughal-inspired patterns',
            'Heavy, luxurious fabric',
            'Elaborate pallu designs',
        ],
        priceRange: '₹12,000 - ₹45,000',
    },
    {
        slug: 'tussar-silk',
        name: 'Tussar Silk',
        description: 'Natural Tussar silk sarees with distinctive texture and earthy tones from Bhagalpur.',
        longDescription: 'Tussar silk, also known as Kosa silk, is a wild silk variety known for its natural gold sheen and rich texture. Produced primarily in Bhagalpur, Bihar, Tussar sarees are lightweight yet durable, featuring a distinctive grainy texture. These sarees are perfect for those who appreciate natural, understated elegance with contemporary appeal.',
        keywords: [
            'tussar silk sarees',
            'kosa silk sarees',
            'bhagalpur silk',
            'buy tussar sarees online',
            'natural silk sarees',
            'wild silk sarees',
            'textured silk sarees',
            'contemporary silk sarees',
        ],
        metaTitle: 'Tussar Silk Sarees | Natural Wild Silk from Bhagalpur',
        metaDescription: 'Shop authentic Tussar silk sarees with natural gold sheen and rich texture. Handwoven wild silk from Bhagalpur. Lightweight, durable, and perfect for modern elegance.',
        origin: 'Bhagalpur, Bihar',
        characteristics: [
            'Natural gold sheen',
            'Rich, grainy texture',
            'Lightweight and breathable',
            'Earthy, natural colors',
            'Wild silk variety',
        ],
        priceRange: '₹4,000 - ₹15,000',
    },
    {
        slug: 'mysore-silk',
        name: 'Mysore Silk',
        description: 'Pure Mysore silk sarees from Karnataka known for their soft texture and elegant simplicity.',
        longDescription: 'Mysore silk sarees are celebrated for their pure mulberry silk and minimalist elegance. Produced in Mysore, Karnataka, these sarees are known for their soft, smooth texture and subtle sheen. With understated designs and rich colors, Mysore silk sarees offer timeless sophistication perfect for both formal and casual occasions.',
        keywords: [
            'mysore silk sarees',
            'karnataka silk sarees',
            'pure mysore silk',
            'buy mysore sarees online',
            'soft silk sarees',
            'elegant silk sarees',
            'minimalist sarees',
            'mysore crepe silk',
        ],
        metaTitle: 'Pure Mysore Silk Sarees | Elegant Karnataka Silk Sarees',
        metaDescription: 'Authentic Mysore silk sarees from Karnataka. Pure mulberry silk with soft texture and elegant designs. Perfect blend of tradition and contemporary style.',
        origin: 'Mysore, Karnataka',
        characteristics: [
            'Pure mulberry silk',
            'Soft, smooth texture',
            'Subtle sheen',
            'Minimalist designs',
            'Rich, vibrant colors',
        ],
        priceRange: '₹8,000 - ₹25,000',
    },
    {
        slug: 'kerala-kasavu',
        name: 'Kerala Kasavu',
        description: 'Traditional Kerala Kasavu sarees with distinctive gold borders on cream silk.',
        longDescription: 'Kerala Kasavu sarees, also known as Kerala Set Mundu, are the traditional attire of Kerala. These elegant sarees feature cream or off-white silk with distinctive golden zari borders. Worn during festivals like Onam and Vishu, Kasavu sarees represent Kerala\'s rich cultural heritage and are known for their simple yet sophisticated aesthetic.',
        keywords: [
            'kerala kasavu sarees',
            'kasavu sarees online',
            'kerala set mundu',
            'onam sarees',
            'kerala traditional sarees',
            'gold border sarees',
            'kerala silk sarees',
            'vishu sarees',
        ],
        metaTitle: 'Kerala Kasavu Sarees | Traditional Gold Border Set Mundu',
        metaDescription: 'Authentic Kerala Kasavu sarees with traditional gold zari borders. Perfect for Onam, Vishu, and special occasions. Handwoven Kerala silk with cultural heritage.',
        origin: 'Kerala',
        characteristics: [
            'Cream or off-white base',
            'Golden zari borders',
            'Simple, elegant design',
            'Cultural significance',
            'Lightweight fabric',
        ],
        priceRange: '₹3,000 - ₹12,000',
    },
    {
        slug: 'muga-silk',
        name: 'Muga Silk',
        description: 'Luxurious Muga silk sarees from Assam with natural golden hue and exceptional durability.',
        longDescription: 'Muga silk is a rare and precious silk variety exclusive to Assam, known for its natural golden color and exceptional durability. Produced from semi-domesticated silkworms, Muga silk sarees have a unique lustrous quality that improves with age. These sarees are a symbol of Assamese heritage and are prized for their longevity and natural sheen.',
        keywords: [
            'muga silk sarees',
            'assam silk sarees',
            'golden silk sarees',
            'buy muga silk online',
            'rare silk sarees',
            'assamese traditional sarees',
            'durable silk sarees',
            'natural golden silk',
        ],
        metaTitle: 'Muga Silk Sarees | Rare Golden Silk from Assam',
        metaDescription: 'Exclusive Muga silk sarees from Assam with natural golden hue. Rare, durable wild silk that improves with age. Authentic Assamese heritage sarees.',
        origin: 'Assam',
        characteristics: [
            'Natural golden color',
            'Exceptional durability',
            'Lustrous sheen',
            'Improves with age',
            'Rare silk variety',
        ],
        priceRange: '₹10,000 - ₹35,000',
    },
    {
        slug: 'kani-silk',
        name: 'Kani Silk',
        description: 'Intricate Kani silk sarees from Kashmir with detailed paisley patterns and pashmina blend.',
        longDescription: 'Kani silk sarees from Kashmir are masterpieces of intricate weaving, featuring the traditional Kani technique where small wooden spools create detailed paisley and floral patterns. Often blended with pashmina, these sarees showcase the artistic heritage of Kashmiri weavers and are known for their warmth, softness, and elaborate designs.',
        keywords: [
            'kani silk sarees',
            'kashmiri silk sarees',
            'kani weave sarees',
            'pashmina silk sarees',
            'buy kani sarees online',
            'paisley pattern sarees',
            'kashmir traditional sarees',
            'intricate weave sarees',
        ],
        metaTitle: 'Kani Silk Sarees | Intricate Kashmiri Weave Sarees',
        metaDescription: 'Authentic Kani silk sarees from Kashmir with intricate paisley patterns. Pashmina blend silk with traditional Kani weaving technique. Warm, soft, and elegant.',
        origin: 'Kashmir',
        characteristics: [
            'Intricate Kani weaving',
            'Paisley and floral motifs',
            'Pashmina blend',
            'Soft and warm',
            'Detailed craftsmanship',
        ],
        priceRange: '₹15,000 - ₹60,000',
    },
    {
        slug: 'paithani-silk',
        name: 'Paithani Silk',
        description: 'Prestigious Paithani silk sarees from Maharashtra with peacock motifs and vibrant colors.',
        longDescription: 'Paithani silk sarees from Aurangabad, Maharashtra, are among India\'s most prestigious handwoven sarees. Known for their brilliant colors, intricate peacock and lotus motifs, and distinctive pallu designs, Paithani sarees are woven with fine silk and zari. These sarees represent centuries of Maharashtrian weaving tradition and are treasured heirlooms.',
        keywords: [
            'paithani silk sarees',
            'maharashtra silk sarees',
            'peacock motif sarees',
            'buy paithani sarees online',
            'authentic paithani silk',
            'traditional paithani',
            'aurangabad silk sarees',
            'colorful silk sarees',
        ],
        metaTitle: 'Paithani Silk Sarees | Authentic Peacock Motif Sarees from Maharashtra',
        metaDescription: 'Exquisite Paithani silk sarees from Aurangabad with traditional peacock motifs. Vibrant colors, fine silk, and intricate zari work. Maharashtrian heritage sarees.',
        origin: 'Aurangabad, Maharashtra',
        characteristics: [
            'Vibrant, brilliant colors',
            'Peacock and lotus motifs',
            'Distinctive pallu design',
            'Fine silk and zari',
            'Heirloom quality',
        ],
        priceRange: '₹20,000 - ₹80,000',
    },
    {
        slug: 'pochampalli-silk',
        name: 'Pochampalli Silk',
        description: 'Traditional Pochampalli ikat silk sarees from Andhra Pradesh with geometric patterns.',
        longDescription: 'Pochampalli silk sarees from Andhra Pradesh are famous for their traditional ikat weaving technique, where threads are tie-dyed before weaving to create geometric patterns. These sarees feature vibrant color combinations and distinctive designs that are unique to each piece. Pochampalli ikat is a UNESCO-recognized craft representing India\'s rich textile heritage.',
        keywords: [
            'pochampalli silk sarees',
            'ikat silk sarees',
            'andhra pradesh sarees',
            'buy pochampalli sarees online',
            'geometric pattern sarees',
            'traditional ikat sarees',
            'tie-dye silk sarees',
            'unesco craft sarees',
        ],
        metaTitle: 'Pochampalli Silk Sarees | Traditional Ikat Weave from Andhra Pradesh',
        metaDescription: 'Authentic Pochampalli ikat silk sarees with geometric patterns. UNESCO-recognized traditional tie-dye weaving from Andhra Pradesh. Vibrant, unique designs.',
        origin: 'Pochampalli, Andhra Pradesh',
        characteristics: [
            'Traditional ikat technique',
            'Geometric patterns',
            'Vibrant color combinations',
            'Tie-dyed threads',
            'UNESCO-recognized craft',
        ],
        priceRange: '₹6,000 - ₹20,000',
    },
    {
        slug: 'baluchari-silk',
        name: 'Baluchari Silk',
        description: 'Narrative Baluchari silk sarees from West Bengal with mythological scenes on the pallu.',
        longDescription: 'Baluchari silk sarees from West Bengal are renowned for their narrative pallu designs depicting scenes from Indian mythology and epics. These sarees feature intricate brocade work with stories woven into the fabric, making each piece a work of art. The distinctive Baluchari style represents Bengal\'s rich weaving heritage and storytelling tradition.',
        keywords: [
            'baluchari silk sarees',
            'west bengal silk sarees',
            'mythological sarees',
            'buy baluchari sarees online',
            'narrative pallu sarees',
            'bengal silk sarees',
            'brocade silk sarees',
            'story sarees',
        ],
        metaTitle: 'Baluchari Silk Sarees | Mythological Narrative Sarees from Bengal',
        metaDescription: 'Exquisite Baluchari silk sarees with mythological scenes on pallu. Intricate brocade work from West Bengal. Each saree tells a story through weaving.',
        origin: 'West Bengal',
        characteristics: [
            'Narrative pallu designs',
            'Mythological scenes',
            'Intricate brocade work',
            'Storytelling tradition',
            'Artistic craftsmanship',
        ],
        priceRange: '₹10,000 - ₹30,000',
    },
    {
        slug: 'georgette-silk',
        name: 'Georgette Silk',
        description: 'Elegant Georgette silk sarees with lightweight drape and contemporary designs.',
        longDescription: 'Georgette silk sarees combine the luxury of silk with the lightweight, flowing drape of georgette fabric. These sarees are perfect for modern women who appreciate elegance with comfort. Featuring contemporary designs, vibrant prints, and easy maintenance, Georgette silk sarees are ideal for both formal events and casual gatherings.',
        keywords: [
            'georgette silk sarees',
            'lightweight silk sarees',
            'contemporary silk sarees',
            'buy georgette sarees online',
            'modern silk sarees',
            'easy drape sarees',
            'printed silk sarees',
            'comfortable silk sarees',
        ],
        metaTitle: 'Georgette Silk Sarees | Lightweight Contemporary Silk Sarees',
        metaDescription: 'Elegant Georgette silk sarees with lightweight drape and modern designs. Perfect blend of comfort and luxury. Ideal for all occasions.',
        origin: 'Rajasthan',
        characteristics: [
            'Lightweight fabric',
            'Easy drape',
            'Contemporary designs',
            'Comfortable wear',
            'Versatile styling',
        ],
        priceRange: '₹3,000 - ₹12,000',
    },
];

/**
 * Get category by slug
 */
export function getCategoryBySlug(slug: string): SilkCategory | undefined {
    return silkCategories.find(cat => cat.slug === slug);
}

/**
 * Generate structured data for Organization (for homepage)
 */
export function generateOrganizationSchema() {
    return {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'Pratyagra Silks',
        url: 'https://pratyagrasilks.com',
        logo: 'https://pratyagrasilks.com/logo.png',
        description: 'Authentic handcrafted silk sarees from India\'s finest weavers. Premium quality traditional and contemporary silk sarees.',
        address: {
            '@type': 'PostalAddress',
            addressCountry: 'IN',
        },
        sameAs: [
            // Add social media URLs when available
        ],
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
}) {
    return {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        description: product.description,
        sku: product.sku,
        image: product.images,
        offers: {
            '@type': 'Offer',
            price: product.price,
            priceCurrency: 'INR',
            availability: product.inStock
                ? 'https://schema.org/InStock'
                : 'https://schema.org/OutOfStock',
            url: `https://pratyagrasilks.com/product/${product.sku}`,
        },
        brand: {
            '@type': 'Brand',
            name: 'Pratyagra Silks',
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
        url: `https://pratyagrasilks.com/silk/${category.slug}`,
        breadcrumb: {
            '@type': 'BreadcrumbList',
            itemListElement: [
                {
                    '@type': 'ListItem',
                    position: 1,
                    name: 'Home',
                    item: 'https://pratyagrasilks.com',
                },
                {
                    '@type': 'ListItem',
                    position: 2,
                    name: 'Silk Collections',
                    item: 'https://pratyagrasilks.com/collection',
                },
                {
                    '@type': 'ListItem',
                    position: 3,
                    name: category.name,
                    item: `https://pratyagrasilks.com/silk/${category.slug}`,
                },
            ],
        },
    };
}
