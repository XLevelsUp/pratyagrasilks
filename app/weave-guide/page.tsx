import { Metadata } from 'next';
import Link from 'next/link';
import { silkCategories, generateFAQSchema } from '@/lib/seo-config';

export const metadata: Metadata = {
    title: 'Indian Saree Weave Guide — Kanjivaram to Chettinad | Kandangi Sarees',
    description: 'Your complete guide to Indian handloom saree weaves — Kanjivaram, Gadwal, Chettinad, Rajkot Patola & more. Learn origins, care tips & how to choose.',
    keywords: [
        'weave guide indian sarees',
        'types of indian sarees',
        'kanjivaram vs gadwal',
        'handloom saree guide',
        'chettinad cotton guide',
        'how to identify authentic saree',
        'indian saree weaves explained',
        'Kandangi Sarees weave guide',
    ],
    openGraph: {
        title: 'Indian Saree Weave Guide — Kanjivaram to Chettinad | Kandangi Sarees',
        description: 'Your complete guide to Indian handloom saree weaves — Kanjivaram, Gadwal, Chettinad, Rajkot Patola & more.',
        url: 'https://kandangisarees.com/weave-guide',
        siteName: 'Kandangi Sarees',
        locale: 'en_IN',
        type: 'website',
    },
    alternates: {
        canonical: 'https://kandangisarees.com/weave-guide',
    },
};

const faqData = silkCategories.map((cat) => {
    const [first, second] = cat.longDescription.split('.');
    const summary = second ? `${first}. ${second}.` : `${first}.`;
    return {
        question: `What is ${cat.name}?`,
        answer: `${summary} Woven in ${cat.origin}, price range ${cat.priceRange}.`,
    };
});

const faqSchema = generateFAQSchema(faqData);

export default function WeaveGuidePage() {
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
            />

            <div className="min-h-screen">
                {/* Hero */}
                <div className="bg-gradient-to-r from-primary to-primary-dark text-white py-16 md:py-24">
                    <div className="container mx-auto px-4">
                        <nav className="mb-6 text-sm">
                            <ol className="flex items-center space-x-2 text-white/80">
                                <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
                                <li>/</li>
                                <li className="text-white font-medium">Weave Guide</li>
                            </ol>
                        </nav>
                        <h1 className="text-4xl font-bold font-playfair mb-4">
                            The Kandangi Sarees Weave Guide — Every Handloom You Need to Know
                        </h1>
                        <p className="text-xl text-white/80 max-w-3xl">
                            From the interlocked borders of Kanjivaram to the bold checks of Chettinad — a plain-language guide to the handloom sarees we carry, where they come from, and how to choose the right one for you.
                        </p>
                    </div>
                </div>

                <div className="container mx-auto px-4 py-12">

                    {/* Quick Nav */}
                    <div className="bg-white rounded-lg shadow-md p-6 mb-12">
                        <p className="text-sm font-medium text-gray-500 mb-3">Jump to a weave:</p>
                        <div className="flex flex-wrap gap-2">
                            {silkCategories.map((cat) => (
                                <a
                                    key={cat.slug}
                                    href={`#${cat.slug}`}
                                    className="px-3 py-1.5 text-sm bg-accent-light text-primary rounded-full hover:bg-accent hover:text-white transition-colors"
                                >
                                    {cat.name}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* One section per weave */}
                    <div className="space-y-12">
                        {silkCategories.map((cat) => (
                            <section
                                key={cat.slug}
                                id={cat.slug}
                                className="bg-white rounded-lg shadow-md p-8 scroll-mt-24"
                            >
                                <h2 className="text-2xl font-bold font-playfair text-primary mb-2">
                                    What is {cat.name}?
                                </h2>
                                <p className="text-sm text-gray-500 mb-4">Origin: {cat.origin} · Price range: {cat.priceRange}</p>
                                <p className="text-gray-700 leading-relaxed mb-4">{cat.longDescription}</p>
                                <div className="mb-4">
                                    <p className="font-medium text-gray-800 mb-2">Key characteristics:</p>
                                    <ul className="space-y-1">
                                        {cat.characteristics.map((c, i) => (
                                            <li key={i} className="flex items-start text-gray-700 text-sm">
                                                <span className="mr-2 text-accent">—</span>
                                                {c}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <Link
                                    href={`/collection/${cat.slug}`}
                                    className="inline-block px-5 py-2 bg-accent text-white rounded-full text-sm font-medium hover:bg-accent-hover transition-colors"
                                >
                                    Shop {cat.name} →
                                </Link>
                            </section>
                        ))}
                    </div>

                    {/* CTA */}
                    <section className="mt-16 bg-gradient-to-r from-primary to-primary-dark rounded-lg p-12 text-center text-white">
                        <h2 className="text-3xl font-bold font-playfair mb-4">
                            Ready to Find Your Weave?
                        </h2>
                        <p className="text-white/80 text-lg mb-8">
                            Browse the full collection — filtered by weave, price, or fabric type.
                        </p>
                        <div className="flex flex-wrap gap-4 justify-center">
                            <Link
                                href="/collection"
                                className="inline-block bg-secondary text-primary font-semibold px-8 py-4 rounded-full text-lg hover:bg-secondary/90 transition-all duration-300 shadow-lg"
                            >
                                Browse All Collections
                            </Link>
                            <Link
                                href="/weaver-direct-sarees"
                                className="inline-block bg-white/10 text-white border border-white/30 font-semibold px-8 py-4 rounded-full text-lg hover:bg-white/20 transition-all duration-300"
                            >
                                About Our Sourcing
                            </Link>
                        </div>
                    </section>
                </div>
            </div>
        </>
    );
}
