import type { Metadata } from 'next';
import { Suspense } from 'react';
import MotionProvider from '@/components/motion/MotionProvider';
import SmoothScroll from '@/components/motion/SmoothScroll';
import Hero from '@/components/home/Hero';
import NewArrivals from '@/components/home/NewArrivals';
import SilkShowcase from '@/components/home/SilkShowcase';
import InstagramReels from '@/components/home/InstagramReels';
import Craftsmanship from '@/components/home/Craftsmanship';
import StatsBand from '@/components/home/StatsBand';
import CtaBand from '@/components/home/CtaBand';
import { silkShowcaseItems, HERO_IMAGE } from '@/lib/home-content';
import { siteMetadata } from '@/lib/seo/config';

// Static + ISR: the page reads only public catalog data (cookie-free client
// in NewArrivals), so it can be served from cache and refreshed every 5 min.
export const revalidate = 300;

export const metadata: Metadata = {
    title: 'Luxury Handwoven Silk Sarees | Pratyagra Silks',
    description:
        "Shop authentic handwoven Kanjivaram, Banarasi, Tussar & Paithani silk sarees, curated from India's master weavers. Heirloom quality, ethically sourced.",
    alternates: { canonical: siteMetadata.baseUrl },
    openGraph: {
        title: 'Luxury Handwoven Silk Sarees | Pratyagra Silks',
        description:
            "Authentic handwoven silk sarees curated from India's master weavers. Heirloom quality, ethically sourced.",
        url: siteMetadata.baseUrl,
        type: 'website',
        images: [HERO_IMAGE],
    },
};

const webPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${siteMetadata.baseUrl}/#webpage`,
    url: siteMetadata.baseUrl,
    name: 'Luxury Handwoven Silk Sarees | Pratyagra Silks',
    description:
        "Shop authentic handwoven Kanjivaram, Banarasi, Tussar & Paithani silk sarees, curated from India's master weavers.",
    isPartOf: { '@id': `${siteMetadata.baseUrl}/#website` },
    about: { '@id': `${siteMetadata.baseUrl}/#organization` },
};

// Shimmer skeleton matching the NewArrivals rail layout — section padding
// must stay identical to NewArrivals to avoid CLS at the Suspense swap.
function NewArrivalsSkeleton() {
    return (
        <section className="py-16 md:py-24 px-4 bg-primary-50">
            <div className="max-w-7xl mx-auto">
                {/* Editorial header skeleton (left-aligned) */}
                <div className="mb-10">
                    <div className="h-6 w-36 rounded-full bg-accent-300/40 animate-pulse mb-5" />
                    <div className="h-10 w-2/3 max-w-xl rounded-lg bg-primary/10 animate-pulse mb-4" />
                    <div className="h-4 w-1/2 max-w-md rounded bg-gray-200 animate-pulse" />
                </div>
                {/* Horizontal rail of card skeletons — mirrors the editorial card anatomy */}
                <div className="flex gap-5 md:gap-6 overflow-hidden">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="shrink-0 w-[80%] sm:w-[45%] lg:w-[30%] xl:w-[24%]">
                            {/* Image placeholder with sweeping shimmer */}
                            <div className="aspect-[3/4] rounded-xl bg-gradient-to-br from-primary-100 to-primary-200 relative overflow-hidden">
                                <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/50 to-transparent" />
                            </div>
                            {/* Text lines */}
                            <div className="pt-4 space-y-2 animate-pulse">
                                <div className="h-3 w-1/3 rounded bg-gray-200" />
                                <div className="h-5 w-3/4 rounded bg-gray-200" />
                                <div className="h-5 w-1/3 rounded bg-gray-200" />
                            </div>
                        </div>
                    ))}
                </div>
                {/* Progress bar placeholder */}
                <div className="h-px bg-primary-100 mt-8" />
            </div>
        </section>
    );
}

// Server Component — all data fetching stays server-side; motion lives in
// small client leaf components that receive server-rendered children.
export default function Home() {
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }}
            />
            {/* With JS disabled, reveal-animated blocks must stay visible */}
            <noscript>
                <style>{`[data-reveal]{opacity:1!important;transform:none!important}`}</style>
            </noscript>

            <MotionProvider>
                <SmoothScroll>
                    <div className="flex flex-col">
                        <Hero />

                        {/* New Arrivals — streaming SSR with Suspense skeleton */}
                        <Suspense fallback={<NewArrivalsSkeleton />}>
                            <NewArrivals />
                        </Suspense>

                        <SilkShowcase items={silkShowcaseItems} />
                        <Craftsmanship />
                        <StatsBand />

                        {/* Instagram reels — streamed so the page never waits on the API */}
                        <Suspense fallback={null}>
                            <InstagramReels />
                        </Suspense>
                        <CtaBand />
                    </div>
                </SmoothScroll>
            </MotionProvider>
        </>
    );
}
