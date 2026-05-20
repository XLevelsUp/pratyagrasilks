import { Metadata } from 'next';
import Link from 'next/link';
import { silkCategories } from '@/lib/seo-config';

export const metadata: Metadata = {
    title: 'Weaver Direct Sarees India — No Middlemen | Kandangi Sarees',
    description: 'Every Kandangi Sarees saree is sourced directly from the weaver — no middlemen, no markups. Authentic handloom from Tamil Nadu, AP & Telangana.',
    keywords: [
        'weaver direct sarees india',
        'sarees from weavers directly',
        'handloom sarees no middleman',
        'authentic handloom india',
        'kandangi sarees sourcing',
        'weaver-direct sarees',
    ],
    openGraph: {
        title: 'Weaver Direct Sarees India — No Middlemen | Kandangi Sarees',
        description: 'Every Kandangi Sarees saree is sourced directly from the weaver — no middlemen, no markups.',
        url: 'https://kandangisarees.com/weaver-direct-sarees',
        siteName: 'Kandangi Sarees',
        locale: 'en_IN',
        type: 'website',
    },
    alternates: {
        canonical: 'https://kandangisarees.com/weaver-direct-sarees',
    },
};

const webPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Weaver Direct Sarees India — No Middlemen | Kandangi Sarees',
    description: 'Every Kandangi Sarees saree is sourced directly from the weaver — no middlemen, no markups.',
    url: 'https://kandangisarees.com/weaver-direct-sarees',
    publisher: {
        '@type': 'Organization',
        name: 'Kandangi Sarees',
        url: 'https://kandangisarees.com',
    },
};

const weavingRegions = [
    {
        region: 'Tamil Nadu',
        weaves: ['Kanjivaram Silk', 'Chettinad Cotton', 'Khadi Cotton'],
        slugs: ['kanjivaram-silk', 'chettinad-cotton', 'khadi-cotton'],
        note: 'Home to India\'s most celebrated silk weaving tradition. Kanjivaram weavers in Kanchipuram have practised the craft for generations.',
    },
    {
        region: 'Andhra Pradesh',
        weaves: ['Venkatagiri Silk', 'Venkatagiri Cotton', 'Mangalgiri Silk', 'Mangalgiri Cotton', 'Kuppadam Silk', 'Pen Kalamkari'],
        slugs: ['venkatagiri-silk', 'venkatagiri-cotton', 'mangalgiri-silk', 'mangalgiri-cotton', 'kuppadam-silk', 'pen-kalamkari'],
        note: 'Andhra Pradesh produces some of India\'s finest cotton-silk combinations — lighter weaves with distinctive borders that suit everyday elegance.',
    },
    {
        region: 'Telangana',
        weaves: ['Gadwal Silk', 'Narayanapet Cotton'],
        slugs: ['gadwal-silk', 'narayanapet-cotton'],
        note: 'The Gadwal tradition is uniquely Telangana — a cotton body with a pure silk border, handwoven in one of India\'s few surviving integrated weave traditions.',
    },
    {
        region: 'Gujarat',
        weaves: ['Rajkot Patola Silk'],
        slugs: ['patola-silk'],
        note: 'Rajkot Patola is one of India\'s most vibrant ikat traditions — geometric single ikat patterns in bold colours, handwoven in Gujarat.',
    },
    {
        region: 'Jharkhand & West Bengal',
        weaves: ['Tussar Silk', 'Raw Silk'],
        slugs: ['tussar-silk', 'raw-silk'],
        note: 'Wild silk, natural texture, and an earthy palette — Tussar and raw silk from this region carry the honest character of natural fibres.',
    },
];

export default function WeaverDirectSareesPage() {
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }}
            />

            <div className="min-h-screen">
                {/* Hero */}
                <div className="bg-gradient-to-r from-primary to-primary-dark text-white py-16 md:py-24">
                    <div className="container mx-auto px-4">
                        <nav className="mb-6 text-sm">
                            <ol className="flex items-center space-x-2 text-white/80">
                                <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
                                <li>/</li>
                                <li className="text-white font-medium">Weaver-Direct Sarees</li>
                            </ol>
                        </nav>
                        <h1 className="text-4xl font-bold font-playfair mb-4">
                            Weaver-Direct Sarees — From the Loom to Your Wardrobe
                        </h1>
                        <p className="text-xl text-white/80 max-w-3xl">
                            Every saree at Kandangi Sarees is bought directly from the weaver. No middlemen. No wholesale markup. No factory-floor substitutions. Just the saree — and the story of the hands that made it.
                        </p>
                    </div>
                </div>

                <div className="container mx-auto px-4 py-12">

                    {/* Sourcing Process */}
                    <section className="bg-white rounded-lg shadow-md p-8 mb-12">
                        <h2 className="text-3xl font-bold font-playfair text-primary mb-6">Our Sourcing Process</h2>
                        <div className="grid md:grid-cols-3 gap-6">
                            <div className="bg-accent-light rounded-lg p-6">
                                <div className="text-3xl font-bold text-accent mb-2">01</div>
                                <h3 className="text-lg font-semibold text-primary mb-2">Visit the Weaver</h3>
                                <p className="text-gray-700 text-sm leading-relaxed">
                                    We travel to weaving clusters — Kanchipuram, Gadwal, Chettinad, Mangalgiri — and meet the weavers directly. No catalogue browsing. No agent representation.
                                </p>
                            </div>
                            <div className="bg-accent-light rounded-lg p-6">
                                <div className="text-3xl font-bold text-accent mb-2">02</div>
                                <h3 className="text-lg font-semibold text-primary mb-2">Handpick Each Piece</h3>
                                <p className="text-gray-700 text-sm leading-relaxed">
                                    Every saree is physically examined — weave density, zari quality, colour consistency, border integrity. We choose what passes. We leave what doesn't.
                                </p>
                            </div>
                            <div className="bg-accent-light rounded-lg p-6">
                                <div className="text-3xl font-bold text-accent mb-2">03</div>
                                <h3 className="text-lg font-semibold text-primary mb-2">Direct to You</h3>
                                <p className="text-gray-700 text-sm leading-relaxed">
                                    The saree goes from the weaver to our hands to yours. Every intermediary we cut out is money that stays in the weaver's pocket — and value that stays in yours.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Weaving Regions */}
                    <section className="mb-12">
                        <h2 className="text-3xl font-bold font-playfair text-primary mb-8">Weaving Regions We Source From</h2>
                        <div className="space-y-8">
                            {weavingRegions.map((region) => (
                                <div key={region.region} className="bg-white rounded-lg shadow-md p-8">
                                    <h3 className="text-2xl font-semibold font-playfair text-primary mb-2">
                                        {region.region}
                                    </h3>
                                    <p className="text-gray-700 leading-relaxed mb-4">{region.note}</p>
                                    <div className="flex flex-wrap gap-2">
                                        {region.slugs.map((slug, i) => {
                                            const cat = silkCategories.find(c => c.slug === slug);
                                            return cat ? (
                                                <Link
                                                    key={slug}
                                                    href={`/collection/${slug}`}
                                                    className="inline-block px-4 py-1.5 text-sm bg-accent-light text-primary rounded-full hover:bg-accent hover:text-white transition-colors"
                                                >
                                                    {cat.name}
                                                </Link>
                                            ) : null;
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Artisan Communities */}
                    <section className="bg-white rounded-lg shadow-md p-8 mb-12">
                        <h2 className="text-3xl font-bold font-playfair text-primary mb-6">Artisan Communities</h2>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            The weavers we source from are not factory workers. They are artisans — families who have practised their craft through generations, in weaving clusters that have defined regional textile identity for centuries. Kanjivaram weavers in Kanchipuram, Gadwal weavers in Gadwal town, Chettinad weavers in Karaikudi — these are communities whose livelihood is tied to authentic handloom.
                        </p>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            When you buy weaver-direct, you are not just getting a better price. You are participating in a supply chain that is honest — one where the person who made the saree receives a fair return for their work.
                        </p>
                        <p className="text-gray-700 leading-relaxed">
                            We do not run fair-trade programmes or marketing campaigns about it. We just buy directly. That is enough.
                        </p>
                    </section>

                    {/* All Collections */}
                    <section className="bg-accent-light rounded-lg p-8 mb-12">
                        <h2 className="text-2xl font-semibold font-playfair text-primary mb-4">
                            Browse All Weaver-Direct Collections
                        </h2>
                        <div className="flex flex-wrap gap-2">
                            {silkCategories.map((cat) => (
                                <Link
                                    key={cat.slug}
                                    href={`/collection/${cat.slug}`}
                                    className="inline-block px-4 py-1.5 text-sm bg-white border border-accent text-accent rounded-full hover:bg-accent hover:text-white transition-colors"
                                >
                                    {cat.name}
                                </Link>
                            ))}
                        </div>
                    </section>

                    {/* CTA */}
                    <section className="bg-gradient-to-r from-primary to-primary-dark rounded-lg p-12 text-center text-white">
                        <h2 className="text-3xl font-bold font-playfair mb-4">
                            Want to Learn More About the Weaves?
                        </h2>
                        <p className="text-white/80 text-lg mb-8">
                            Our weave guide covers every handloom we carry — origins, characteristics, and how to choose.
                        </p>
                        <Link
                            href="/weave-guide"
                            className="inline-block bg-secondary text-primary font-semibold px-8 py-4 rounded-full text-lg hover:bg-secondary/90 transition-all duration-300 shadow-lg"
                        >
                            Read the Weave Guide
                        </Link>
                    </section>
                </div>
            </div>
        </>
    );
}
