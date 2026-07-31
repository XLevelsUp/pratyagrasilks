import Link from 'next/link';
import Reveal from '@/components/motion/Reveal';
import NewArrivalsRail from '@/components/home/NewArrivalsRail';
import { getNewArrivalsPublic } from '@/lib/data/public-products';
import { siteMetadata } from '@/lib/seo/config';

// Server Component - data fetched directly, no client JS overhead.
// Uses the cookie-free public client so the home page stays static (ISR).
export default async function NewArrivals() {
    const products = await getNewArrivalsPublic();

    if (!products || products.length === 0) {
        return null;
    }

    // ItemList JSON-LD emitted here so it reuses the single Supabase query
    const itemListSchema = {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: 'New Arrivals — Pratyagra Silks',
        itemListElement: products.map((product, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            url: `${siteMetadata.baseUrl}/product/${product.id}`,
            name: product.name,
        })),
    };

    return (
        <section className="py-16 md:py-24 px-4 bg-primary-50">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
            />
            <div className="max-w-7xl mx-auto">
                {/* Editorial header — copy left, collection link right */}
                <Reveal amount={0.4} className="mb-10">
                    <div className="flex flex-wrap items-end justify-between gap-6">
                        <div className="max-w-2xl">
                            <span className="inline-block text-xs font-semibold tracking-[0.2em] uppercase text-accent-700 border border-accent-300 bg-accent-light px-4 py-1 rounded-full mb-5">
                                Curated for 2026
                            </span>
                            <h2 className="font-playfair text-3xl md:text-5xl font-bold text-primary mb-4">
                                The New Heritage: Latest Arrivals
                            </h2>
                            <p className="text-textSecondary text-lg leading-relaxed">
                                Discover our newest handwoven masterpieces — authentic Indian silk
                                heritage curated for the modern connoisseur.
                            </p>
                        </div>
                        <Link
                            href="/collection"
                            className="hidden md:inline-flex items-center gap-2 text-primary font-semibold hover:text-primary-light transition-colors group pb-1 border-b-2 border-primary/20 hover:border-primary-light"
                        >
                            View the Full Collection
                            <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1">
                                →
                            </span>
                        </Link>
                    </div>
                    {/* Subtle scarcity copy */}
                    <p className="text-sm text-accent-700 font-medium mt-4">
                        Each piece handpicked — limited quantities available
                    </p>
                </Reveal>

                {/* Product rail — entrance triggers when 30% visible */}
                <Reveal amount={0.3} y={32}>
                    <NewArrivalsRail products={products} />
                </Reveal>

                {/* Mobile CTA (desktop has the header link) */}
                <div className="text-center mt-10 md:hidden">
                    <Link
                        href="/collection"
                        className="inline-block bg-primary text-secondary font-semibold px-8 py-4 rounded-full text-lg hover:bg-primary-light transition-all duration-300 transform hover:scale-105 shadow-lg"
                    >
                        View All Collection
                    </Link>
                </div>
            </div>
        </section>
    );
}
