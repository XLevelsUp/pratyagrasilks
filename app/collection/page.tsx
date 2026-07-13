import type { Metadata } from 'next';
import { Suspense } from 'react';
import CollectionClient from '@/components/CollectionClient';
import InstagramReels from '@/components/home/InstagramReels';

import { siteMetadata } from '@/lib/seo/config';

export const metadata: Metadata = {
    title: 'Silk Saree Collection | Pratyagra Silks',
    description:
        'Explore handwoven Kanjivaram, Muga, Tussar and Georgette silk sarees crafted by master weavers. Authentic heirloom quality, direct from weavers across India.',
    alternates: { canonical: `${siteMetadata.baseUrl}/collection` },
};

export default function CollectionPage() {
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: 'Our Silk Saree Collection | Pratyagra Silks',
        description: 'Explore handwoven Kanjivaram, Muga, Tussar and Georgette silk sarees crafted by master weavers. Authentic heirloom quality, direct from weavers across India.',
        url: `${siteMetadata.baseUrl}/collection`,
        breadcrumb: {
            '@type': 'BreadcrumbList',
            itemListElement: [
                {
                    '@type': 'ListItem',
                    position: 1,
                    name: 'Home',
                    item: siteMetadata.baseUrl,
                },
                {
                    '@type': 'ListItem',
                    position: 2,
                    name: 'Silk Collection',
                    item: `${siteMetadata.baseUrl}/collection`,
                },
            ],
        },
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
            />
            <div className="min-h-screen">
            {/* Header */}
            <div className="relative bg-gradient-to-r from-primary to-primary-light text-white py-12">
                <div className="absolute inset-0 bg-[url('https://images.pixieset.com/859010601/05e114529e649bfbaac0385e3b61afb5-large.jpg')] bg-no-repeat bg-cover opacity-30"></div>
                <div className="container mx-auto px-4 relative z-10">
                    <p className="flex items-center gap-3 text-secondary text-xs font-medium tracking-[0.3em] uppercase mb-4">
                        <span className="inline-block w-8 h-px bg-secondary/70" aria-hidden="true" />
                        The Collection
                    </p>
                    <h1 className="font-playfair text-4xl md:text-5xl font-bold mb-2">Our Silk Saree Collection</h1>
                    <p className="text-white/80 mt-2 max-w-3xl">
                        Explore handwoven Kanjivaram, Muga, Tussar and Georgette silk sarees crafted by master weavers. Authentic heirloom quality, direct from weavers across India.
                    </p>
                </div>
            </div>

            {/* Client-side Filters & Product Grid */}
            <Suspense fallback={
                <div className="container mx-auto px-4 py-16 text-center animate-pulse">
                    <div className="text-textSecondary text-lg">Loading collection products...</div>
                </div>
            }>
                <CollectionClient />
            </Suspense>

            {/* Instagram reels — this page uses its own account token; the
                site-wide slot in the layout skips /collection to avoid a
                duplicate section */}
            <Suspense fallback={null}>
                <InstagramReels
                    accessToken={process.env.INSTAGRAM_COLLECTION_ACCESS_TOKEN}
                    profileUrl="https://www.instagram.com/pratyagra_designer/"
                    handle="@pratyagra_designer"
                />
            </Suspense>
        </div>
        </>
    );
}
