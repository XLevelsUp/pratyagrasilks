import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import { getNewArrivals } from '@/lib/actions/product.actions';

// Server Component - data fetched directly, no client JS overhead
export default async function NewArrivals() {
    const products = await getNewArrivals();

    if (!products || products.length === 0) {
        return null;
    }

    return (
        <section className="py-16 md:py-24 px-4 bg-primary-50">
            <div className="max-w-7xl mx-auto">
                {/* Section Header */}
                <div className="text-center mb-4">
                    {/* Scarcity / curation label */}
                    <span className="inline-block text-xs font-semibold tracking-[0.2em] uppercase text-accent-700 border border-accent-300 bg-accent-light px-4 py-1 rounded-full mb-4">
                        Curated for 2026
                    </span>
                    <h2 className="font-playfair text-3xl md:text-5xl font-bold text-primary mb-4">
                        The New Heritage: Latest Arrivals
                    </h2>
                    <p className="text-textSecondary max-w-2xl mx-auto text-lg leading-relaxed">
                        Discover our newest handwoven masterpieces. From pastel Kanjivarams to
                        contemporary Banarasi weaves, explore authentic Indian silk heritage
                        curated for the modern connoisseur.
                    </p>
                </div>

                {/* Subtle scarcity copy */}
                <p className="text-center text-sm text-accent-700 font-medium mb-10">
                    Each piece handpicked — limited quantities available
                </p>

                {/* Products Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                    {products.map((product) => (
                        <ProductCard
                            key={product.id}
                            product={product}
                            showNewBadge={true}
                        />
                    ))}
                </div>

                {/* CTA */}
                <div className="text-center mt-12">
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
