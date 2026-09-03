import Link from "next/link";
import { Metadata } from "next";
import { siteMetadata } from "@/lib/seo/config";

export const metadata: Metadata = {
    title: "About Pratyagra Silks | Authentic Indian Handloom Silk Sarees",
    description: "Learn about Pratyagra Silks' mission to preserve Indian handloom craftsmanship. Discover our commitment to authentic silk sarees, artisan partnerships, and sustainable practices.",
    keywords: ["about pratyagra silks", "handloom sarees", "silk saree heritage", "artisan support", "Indian craftsmanship"],
};

export default function AboutPage() {
    const values = [
        {
            title: "Authenticity",
            description: "We guarantee 100% authentic handwoven silk sarees from traditional weavers across India.",
        },
        {
            title: "Quality",
            description: "Premium materials and meticulous craftsmanship ensure exceptional durability and elegance.",
        },
        {
            title: "Sustainability",
            description: "Ethical sourcing, fair compensation for artisans, and environmentally responsible practices.",
        },
        {
            title: "Tradition",
            description: "Preserving centuries-old weaving techniques and cultural heritage for future generations.",
        },
    ];

    const origins = [
        {
            name: "Kanjivaram, Tamil Nadu",
            description: "Home to the legendary Kanjivaram silk sarees, known for their pure mulberry silk and intricate temple designs.",
            silks: ["Kanjivaram Silk", "South Indian Traditions"],
            slug: "kanjivaram-silk"
        },
        {
            name: "Varanasi, Uttar Pradesh",
            description: "The weaving capital of India, famous for Banarasi sarees with their luxurious zari work and brocade patterns.",
            silks: ["Banarasi Silk", "Zari Work"],
            slug: "banarasi-silk"
        },
        {
            name: "Bhagalpur, Bihar",
            description: "The oldest silk weaving center in India, specializing in Tussar silk sarees with their distinctive natural texture.",
            silks: ["Tussar Silk", "Natural Fibers"],
            slug: "tussar-silk"
        },
        {
            name: "Mysore, Karnataka",
            description: "Famous for pure Mysore silk sarees, produced from the finest mulberry silk with elegant designs.",
            silks: ["Mysore Silk", "Pure Mulberry"],
            slug: "mysore-silk"
        },
        {
            name: "Kochi, Kerala",
            description: "The cultural hub of Kerala, renowned for its exquisite Kasavu sarees featuring traditional gold weaving on white silk.",
            silks: ["Kerala Kasavu", "Gold Borders"],
            slug: "kerala-kasavu"
        },
        {
            name: "Assam",
            description: "Known for the luxurious Muga silk, a golden-hued natural silk unique to Assam with exceptional lustrous qualities.",
            silks: ["Muga Silk", "Natural Gold"],
            slug: "muga-silk"
        },
        {
            name: "Kashmir",
            description: "The land of Kani silks, featuring intricate Kani weaving with detailed patterns and pashmina blend sarees.",
            silks: ["Kani Silk", "Pashmina Blend"],
            slug: "kani-silk"
        },
        {
            name: "Aurangabad, Maharashtra",
            description: "Home to the prestigious Paithani silk sarees, known for their fine silk, brilliant colors, and peacock motifs.",
            silks: ["Paithani Silk", "Peacock Designs"],
            slug: "paithani-silk"
        },
        {
            name: "Andhra Pradesh",
            description: "Birthplace of Pochampally silk sarees, famous for their traditional ikat technique and vibrant color combinations.",
            silks: ["Pochampalli Silk", "Ikat Patterns"],
            slug: "pochampalli-silk"
        },
        {
            name: "West Bengal",
            description: "Renowned for Baluchari silk sarees, featuring narrative motifs and the famous Baluchari pallu with mythological scenes.",
            silks: ["Baluchari Silk", "Narrative Designs"],
            slug: "baluchari-silk"
        },
        {
            name: "Rajasthan",
            description: "Known for elegant Georgette silk sarees with traditional Rajasthani patterns and vibrant cultural designs.",
            silks: ["Georgette Silk", "Rajasthani Art"],
            slug: "georgette-silk"
        },
    ];

    const schema = {
        '@context': 'https://schema.org',
        '@type': 'AboutPage',
        name: 'About PratyagraSilks | Authentic Indian Handloom Silk Sarees',
        description: "Learn about PratyagraSilks' mission to preserve Indian handloom craftsmanship. Discover our commitment to authentic silk sarees, artisan partnerships, and sustainable practices.",
        url: `${siteMetadata.baseUrl}/about`,
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
                    name: 'About Us',
                    item: `${siteMetadata.baseUrl}/about`,
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
            <div className="flex flex-col">
            {/* Hero Section */}
            <section className="relative bg-gradient-to-br from-primary via-primary/90 to-primary-light text-white py-16 md:py-24 px-4">
                <div className="absolute inset-0 bg-[url('https://images.pixieset.com/859010601/d7c3222457a03fa54d40c17b0f874229-large.jpg')] bg-no-repeat bg-cover opacity-15"></div>
                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <h1 className="font-playfair text-4xl md:text-6xl font-bold mb-6">
                        Our Story
                    </h1>
                    <p className="text-lg md:text-xl opacity-95 max-w-2xl mx-auto">
                        At Pratyagra Silks, we are dedicated to breathing new life into India’s silk heritage. Our luxury silk sarees are curated from the finest weavers across the country, blending centuries-old craftsmanship with contemporary elegance. By partnering with master artisans from renowned silk regions, we ensure every saree is a testament to tradition, quality, and modern style.
                    </p>
                </div>
            </section>

            {/* Mission & Vision */}
            <section className="py-16 md:py-24 px-4 bg-white">
                <div className="max-w-4xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-12 mb-12">
                        <div>
                            <h2 className="font-playfair text-3xl font-bold text-primary mb-4">
                                Our Mission
                            </h2>
                            <p className=" text-lg leading-relaxed mb-4">
                                At Pratyagra Silks, our mission is to revive India's silk heritage by curating luxury sarees from the finest weavers across the country. We believe in blending timeless tradition with contemporary elegance, creating pieces that celebrate centuries of artistry while resonating with modern sensibilities.
                            </p>
                            <p className=" text-lg leading-relaxed">
                                We are committed to bringing authentic, premium handwoven silk sarees directly to discerning customers worldwide, while ensuring fair compensation and unwavering support for the master artisans who bring these treasures to life through their exceptional craftsmanship.
                            </p>
                        </div>
                        <div>
                            <h2 className="font-playfair text-3xl font-bold text-primary mb-4">
                                Our Vision
                            </h2>
                            <p className=" text-lg leading-relaxed mb-4">
                                We envision Pratyagra Silks as the premier destination for luxury silk sarees—where tradition is revived, quality is uncompromised, and every piece tells the story of dedicated weavers from India's finest silk regions.
                            </p>
                            <p className=" text-lg leading-relaxed">
                                We are building a sustainable ecosystem where master weavers thrive, artisan communities flourish, and customers worldwide discover the perfect blend of heritage craftsmanship and modern elegance in every saree they wear.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Core Values */}
            <section className="py-16 md:py-24 px-4">
                <div className="max-w-7xl mx-auto">
                    <h2 className="font-playfair text-3xl md:text-5xl font-bold text-primary text-center mb-12">
                        Our Core Values
                    </h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {values.map((value, index) => (
                            <div key={index} className="bg-white rounded-lg shadow-md p-6">
                                <h3 className="font-playfair text-xl font-bold text-primary mb-3">
                                    {value.title}
                                </h3>
                                <p className=" text-sm leading-relaxed">
                                    {value.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Silk Origins */}
            <section className="py-16 md:py-24 px-4 bg-white">
                <div className="max-w-7xl mx-auto">
                    <h2 className="font-playfair text-3xl md:text-5xl font-bold text-primary text-center mb-4">
                        Exploring Silk Weaving Regions
                    </h2>
                    <p className="text-center  mb-12 max-w-2xl mx-auto text-lg">
                        We source directly from India's most renowned silk weaving centers, each with unique traditions and expertise
                    </p>

                    <div className="space-y-12">
                        {origins.map((origin, index) => (
                            <div key={index} className="flex flex-col md:flex-row gap-8 items-start">
                                <div className="md:w-1/2">
                                    <h3 className="font-playfair text-2xl font-bold text-primary mb-3">
                                        {origin.name}
                                    </h3>
                                    <p className=" text-lg leading-relaxed mb-4">
                                        {origin.description}
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {origin.silks.map((silk, idx) => (
                                            <span key={idx} className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
                                                {silk}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <Link
                                    href={`/collection?category=${origin.slug}`}
                                    className="w-full md:w-1/2 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg p-8 h-64 flex flex-col items-center justify-center group hover:from-primary/30 hover:to-primary/20 transition-all duration-300 hover:shadow-xl cursor-pointer border-2 border-transparent hover:border-primary/30"
                                >
                                    <div className="text-center">
                                        <div className="inline-flex items-center text-primary/50 group-hover:text-primary/80 font-semibold transition-all">
                                            <span>Explore Collection from</span>
                                        </div>
                                        <p className="text-primary/50 font-playfair text-3xl font-bold mt-1 group-hover:text-primary/80 transition-colors">
                                            {origin.name.split(",")[0]}
                                        </p>
                                    </div>
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Artisan Partnership */}
            <section className="py-16 md:py-24 px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="font-playfair text-3xl md:text-5xl font-bold text-primary mb-6">
                        Supporting Artisan Communities
                    </h2>
                    <p className=" text-lg leading-relaxed mb-8">
                        Every purchase of a Pratyagra Silks saree directly supports the livelihoods of skilled artisans and their families. We believe in fair trade practices, ensuring that weavers receive equitable compensation for their exceptional work.
                    </p>
                    <p className=" text-lg leading-relaxed mb-8">
                        By choosing Pratyagra Silks, you're not just acquiring a beautiful saree—you're investing in preserving traditional crafts, supporting artisan dignity, and ensuring these remarkable skills are passed down to future generations.
                    </p>
                    <div className="bg-primary/5 border-l-4 border-primary p-6 text-left">
                        <p className="text-primary font-semibold text-lg">
                            "Craft. Community. Culture. That's the Pratyagra Silks promise."
                        </p>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 md:py-24 px-4 bg-gradient-to-r from-primary to-primary-light text-white">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="font-playfair text-3xl md:text-5xl font-bold mb-6">
                        Explore Our Collections
                    </h2>
                    <p className="text-lg mb-8 opacity-95 max-w-2xl mx-auto">
                        Discover authentic handwoven silk sarees from India's finest artisans.
                    </p>
                    <Link
                        href="/collection"
                        className="inline-block bg-secondary text-primary font-semibold px-8 py-4 rounded-full text-lg hover:bg-secondary/90 transition-all duration-300 transform hover:scale-105 shadow-lg"
                    >
                        Browse Collection
                    </Link>
                </div>
            </section>
        </div>
        </>
    );
}

