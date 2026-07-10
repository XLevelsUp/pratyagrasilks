/**
 * Landing page content — single source for the home sections.
 * Slugs must match the /collection?category= filter scheme:
 * name.toLowerCase().replace(/ /g, '-')
 */

export interface SilkShowcaseItem {
    name: string;
    slug: string;
    image: string;
    description: string;
    origin: string;
}

export const silkShowcaseItems: SilkShowcaseItem[] = [
    {
        name: 'Kanjivaram Silk',
        slug: 'kanjivaram-silk',
        image: '/images/sarees/KanjivaramSilk—Full-Frame.webp',
        description: 'Pure mulberry silk with intricate temple designs',
        origin: 'Kanchipuram, Tamil Nadu',
    },
    {
        name: 'Banarasi Silk',
        slug: 'banarasi-silk',
        image: '/images/sarees/BanarasiSilk—Full-Frame.webp',
        description: 'Luxurious zari work and brocade patterns',
        origin: 'Varanasi, Uttar Pradesh',
    },
    {
        name: 'Tussar Silk',
        slug: 'tussar-silk',
        image: '/images/sarees/TussarSilk—Full-Frame.webp',
        description: 'Natural texture with distinctive golden hue',
        origin: 'Bhagalpur, Bihar',
    },
    {
        name: 'Mysore Silk',
        slug: 'mysore-silk',
        image: '/images/sarees/MysoreSilk—Full-Frame.webp',
        description: 'Finest mulberry silk with elegant designs',
        origin: 'Mysore, Karnataka',
    },
    {
        name: 'Kerala Kasavu',
        slug: 'kerala-kasavu',
        image: '/images/sarees/KeralaKasavu—Full-Frame.webp',
        description: 'Traditional gold zari weaving on white silk',
        origin: 'Kerala',
    },
    {
        name: 'Muga Silk',
        slug: 'muga-silk',
        image: '/images/sarees/MugaSilk—Full-Frame.webp',
        description: 'Golden-hued natural silk unique to Assam',
        origin: 'Assam',
    },
    {
        name: 'Paithani Silk',
        slug: 'paithani-silk',
        image: '/images/sarees/PaithaniSilk—Full-Frame.webp',
        description: 'Fine silk with brilliant colors and peacock motifs',
        origin: 'Aurangabad, Maharashtra',
    },
    {
        name: 'Pochampalli Silk',
        slug: 'pochampalli-silk',
        image: '/images/sarees/PochampalliSilk—Full-Frame.webp',
        description: 'Traditional ikat technique with vibrant colors',
        origin: 'Pochampalli, Andhra Pradesh',
    },
];

export interface CraftStep {
    index: string;
    title: string;
    body: string;
}

export const craftSteps: CraftStep[] = [
    {
        index: '01',
        title: 'Sourced at the loom',
        body: 'We work directly with master weavers and artisan communities across India’s renowned silk regions — from Kanchipuram and Mysore in the South to Varanasi in the North. No middlemen, no compromises: every saree is selected at its source.',
    },
    {
        index: '02',
        title: 'Woven by masters',
        body: 'Each piece is meticulously handwoven by artisans who have inherited centuries of expertise. Pure mulberry silk, real zari, and patterns that carry generations of artistic mastery in every thread.',
    },
    {
        index: '03',
        title: 'Made to be inherited',
        body: 'A Pratyagra saree is an investment in authentic heritage — a timeless treasure crafted to be worn, kept, and passed down. Luxury is most meaningful when it honors tradition.',
    },
];

export const benefits = [
    { title: 'Authentic Craftsmanship', description: 'Handwoven by skilled artisans preserving centuries-old traditions' },
    { title: 'Premium Quality', description: '100% pure silk with superior weaving techniques and durability' },
    { title: 'Sustainable Production', description: 'Ethically sourced with respect for artisans and environment' },
    { title: 'Timeless Design', description: 'Classic patterns that transcend trends and last generations' },
] as const;

export const stats = [
    { value: 1000, suffix: '+', label: 'Satisfied Customers' },
    { value: 500, suffix: '+', label: 'Premium Sarees' },
    { value: 50, suffix: '+', label: 'Artisan Partners' },
] as const;

export const HERO_IMAGE =
    '/iconic_saree.webp';
