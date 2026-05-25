import { Metadata } from 'next';
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import { queryProductsByMaxPrice } from '@/lib/utils/product-queries';

export const metadata: Metadata = {
    title: 'Sarees Under ₹5,000 — Handloom Sarees | Kandangi Sarees',
    description: 'Discover authentic handloom sarees under ₹5,000 — cottons, silks & weaves handpicked from Indian weavers. Real quality, honest prices. Shop now.',
    keywords: [
        'sarees under 5000',
        'handloom sarees under 5000',
        'affordable handloom sarees',
        'cotton sarees under 5000',
        'budget handloom sarees india',
        'Kandangi Sarees under 5000',
    ],
    openGraph: {
        title: 'Sarees Under ₹5,000 — Handloom Sarees | Kandangi Sarees',
        description: 'Authentic handloom sarees under ₹5,000 — handpicked from Indian weavers. Real quality, honest prices.',
        url: 'https://kandangisarees.com/sarees-under-5000',
        siteName: 'Kandangi Sarees',
        locale: 'en_IN',
        type: 'website',
    },
    alternates: {
        canonical: 'https://kandangisarees.com/sarees-under-5000',
    },
};

const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Handloom Sarees Under ₹5,000',
    description: 'Authentic handloom sarees under ₹5,000 — cottons, silks & weaves handpicked from Indian weavers.',
    url: 'https://kandangisarees.com/sarees-under-5000',
    provider: {
        '@type': 'Organization',
        name: 'Kandangi Sarees',
        url: 'https://kandangisarees.com',
    },
};

export default async function SareesUnder5000Page() {
    const products = await queryProductsByMaxPrice(5000);

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
            />

            <div className="min-h-screen">
                {/* Hero */}
                <div className="bg-gradient-to-r from-primary to-primary-dark text-white py-16 md:py-24">
                    <div className="container mx-auto px-4">
                        <nav className="mb-6 text-sm">
                            <ol className="flex items-center space-x-2 text-white/80">
                                <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
                                <li>/</li>
                                <li className="text-white font-medium">Sarees Under ₹5,000</li>
                            </ol>
                        </nav>
                        <h1 className="text-4xl font-bold font-playfair mb-4">
                            Handloom Sarees Under ₹5,000 — Handpicked, Not Compromised
                        </h1>
                        <p className="text-xl text-white/80 max-w-3xl">
                            Finding a genuinely handwoven saree under ₹5,000 should not mean settling for less. Our collection includes Chettinad cottons, Khadi weaves, and lightweight silks — every piece sourced directly from the weaver, with no middleman markup.
                        </p>
                    </div>
                </div>

                <div className="container mx-auto px-4 py-12">

                    {/* Products */}
                    <section className="mb-16">
                        {products.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {products.slice(0, 12).map((product) => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white rounded-lg shadow-md p-12 text-center">
                                <p className="text-gray-500 text-lg mb-4">
                                    No sarees under ₹5,000 are currently listed. Check back soon.
                                </p>
                                <Link href="/collection" className="inline-block mt-4 px-6 py-3 bg-accent text-white rounded-lg hover:bg-accent-hover transition-colors">
                                    Browse All Collections
                                </Link>
                            </div>
                        )}
                    </section>

                    {/* Content Sections */}
                    <section className="bg-white rounded-lg shadow-md p-8 mb-12">
                        <h2 className="text-3xl font-bold font-playfair text-primary mb-4">Best Cottons Under ₹5,000</h2>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            Chettinad cotton, Venkatagiri cotton, and Khadi are the strongest performers in this price range. Woven by hand on traditional looms, these cottons are breathable, durable, and carry the character of genuine craft — something no factory-made fabric can replicate.
                        </p>
                        <Link href="/collection/chettinad-cotton" className="text-accent font-medium hover:underline">
                            Explore Chettinad cotton sarees →
                        </Link>
                    </section>

                    <section className="bg-white rounded-lg shadow-md p-8 mb-12">
                        <h2 className="text-3xl font-bold font-playfair text-primary mb-4">Silks Under ₹5,000</h2>
                        <p className="text-gray-700 leading-relaxed">
                            Lighter silk varieties — Venkatagiri silk, soft silk, and raw silk — fall comfortably within this range without compromising on the beauty of a handwoven weave. These are not cut-price silks; they are simply lighter constructions from the same authentic traditions.
                        </p>
                    </section>

                    <section className="bg-white rounded-lg shadow-md p-8 mb-12">
                        <h2 className="text-3xl font-bold font-playfair text-primary mb-4">Daily Wear Picks</h2>
                        <p className="text-gray-700 leading-relaxed">
                            Handloom cottons under ₹5,000 are ideal for daily wear — light enough for warm weather, structured enough for office or casual occasions, and comfortable enough to wear all day. Chettinad cotton and Mangalgiri cotton are particular favourites.
                        </p>
                    </section>

                    <section className="bg-white rounded-lg shadow-md p-8 mb-12">
                        <h2 className="text-3xl font-bold font-playfair text-primary mb-4">Why Our Prices Are Honest</h2>
                        <p className="text-gray-700 leading-relaxed">
                            Every saree at Kandangi Sarees is bought directly from the weaver — no wholesaler, no distributor, no retail markup stacked on top. You pay close to what the weaver charges. That is the only way an authentic handloom saree can cost under ₹5,000.
                        </p>
                    </section>

                    {/* Related Collections */}
                    <section className="bg-accent-light rounded-lg p-8 mb-12">
                        <h2 className="text-2xl font-semibold font-playfair text-primary mb-4">
                            Best Picks in This Range
                        </h2>
                        <div className="flex flex-wrap gap-3">
                            <Link href="/collection/chettinad-cotton" className="inline-block px-5 py-2 bg-white border border-accent text-accent rounded-full font-medium hover:bg-accent hover:text-white transition-colors">
                                Chettinad Cotton
                            </Link>
                            <Link href="/collection/khadi-cotton" className="inline-block px-5 py-2 bg-white border border-accent text-accent rounded-full font-medium hover:bg-accent hover:text-white transition-colors">
                                Khadi Cotton
                            </Link>
                            <Link href="/collection/venkatagiri-cotton" className="inline-block px-5 py-2 bg-white border border-accent text-accent rounded-full font-medium hover:bg-accent hover:text-white transition-colors">
                                Venkatagiri Cotton
                            </Link>
                            <Link href="/weave-guide" className="inline-block px-5 py-2 bg-primary text-white rounded-full font-medium hover:bg-primary-dark transition-colors">
                                Complete Weave Guide →
                            </Link>
                        </div>
                    </section>

                    <section className="bg-gradient-to-r from-primary to-primary-dark rounded-lg p-12 text-center text-white">
                        <h2 className="text-3xl font-bold font-playfair mb-4">Need a Wider Budget?</h2>
                        <p className="text-white/80 text-lg mb-8">
                            Explore our full range of handloom sarees under ₹10,000 — silks, cottons, and occasion weaves.
                        </p>
                        <Link
                            href="/sarees-under-10000"
                            className="inline-block bg-secondary text-primary font-semibold px-8 py-4 rounded-full text-lg hover:bg-secondary/90 transition-all duration-300 shadow-lg"
                        >
                            Sarees Under ₹10,000
                        </Link>
                    </section>
                </div>
            </div>
        </>
    );
}
