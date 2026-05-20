import Link from "next/link";
import Image from "next/image";
import { Suspense } from "react";
import NewArrivals from "@/components/home/NewArrivals";

// Shimmer skeleton matching the NewArrivals grid layout (4 cards × approx 400px section)
function NewArrivalsSkeleton() {
    return (
        <section className="py-16 md:py-24 px-4 bg-primary-50">
            <div className="max-w-7xl mx-auto">
                {/* Header skeleton */}
                <div className="text-center mb-10">
                    <div className="inline-block h-6 w-36 rounded-full bg-accent-300/40 animate-pulse mb-4" />
                    <div className="h-10 w-2/3 mx-auto rounded-lg bg-primary/10 animate-pulse mb-4" />
                    <div className="h-4 w-1/2 mx-auto rounded bg-gray-200 animate-pulse" />
                </div>
                {/* 4-column card skeleton grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="rounded-2xl overflow-hidden shadow-md bg-white">
                            {/* Image placeholder */}
                            <div className="aspect-[3/4] bg-gradient-to-br from-primary-100 to-primary-200 animate-pulse relative">
                                <div className="absolute inset-0 bg-shimmer" />
                            </div>
                            {/* Text lines */}
                            <div className="p-4 space-y-2">
                                <div className="h-4 w-3/4 rounded bg-gray-200 animate-pulse" />
                                <div className="h-4 w-1/2 rounded bg-gray-200 animate-pulse" />
                                <div className="h-6 w-1/3 rounded bg-accent-300/40 animate-pulse mt-2" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

// Server Component - Optimized for performance and SEO
export default function Home() {
    // Featured silk type collections
    const categories = [
        { id: 1, name: "Kanjivaram Silk", image: "/images/sarees/KanjivaramSilk—Full-Frame.webp", description: "Pure mulberry silk with intricate temple designs" },
        { id: 2, name: "Banarasi Silk", image: "/images/sarees/BanarasiSilk—Full-Frame.webp", description: "Luxurious zari work and brocade patterns" },
        { id: 3, name: "Tussar Silk", image: "/images/sarees/TussarSilk—Full-Frame.webp", description: "Natural texture with distinctive golden hue" },
        { id: 4, name: "Mysore Silk", image: "/images/sarees/MysoreSilk—Full-Frame.webp", description: "Finest mulberry silk with elegant designs" },
        { id: 5, name: "Kerala Kasavu", image: "/images/sarees/KeralaKasavu—Full-Frame.webp", description: "Traditional gold zari weaving on white silk" },
        { id: 6, name: "Muga Silk", image: "/images/sarees/MugaSilk—Full-Frame.webp", description: "Golden-hued natural silk unique to Assam" },
        { id: 7, name: "Paithani Silk", image: "/images/sarees/PaithaniSilk—Full-Frame.webp", description: "Fine silk with brilliant colors and peacock motifs" },
        { id: 8, name: "Pochampalli Silk", image: "/images/sarees/PochampalliSilk—Full-Frame.webp", description: "Traditional ikat technique with vibrant colors" },
    ];

    const benefits = [
        { title: "Authentic Craftsmanship", description: "Handwoven by skilled artisans preserving centuries-old traditions" },
        { title: "Premium Quality", description: "100% pure silk with superior weaving techniques and durability" },
        { title: "Sustainable Production", description: "Ethically sourced and produced with respect to artisans and environment" },
        { title: "Timeless Design", description: "Classic patterns that transcend trends and last generations" },
    ];

    return (
        <div className="flex flex-col">
            {/* Hero Section - Mobile-first, high-impact, SEO optimized */}
            <section className="relative py-20 md:py-32 px-4 text-white overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-primary-light opacity-90"></div>
                <div className="absolute inset-0 opacity-15">
                    <Image
                        src="https://images.pixieset.com/859010601/ab207e7a5cbdc26b65405f930546fb35-large.jpg"
                        alt="Hero Background"
                        fill
                        priority
                        fetchPriority="high"
                        className="object-cover"
                    />
                </div>
                <div className="max-w-7xl mx-auto text-center relative z-10">
                    <h1 className="font-playfair text-4xl md:text-6xl lg:text-7xl font-bold mb-6 text-balance leading-tight drop-shadow-lg">
                        Reviving Tradition with a New Touch
                    </h1>
                    <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto text-balance opacity-95 drop-shadow">
                        Your one-stop destination for luxury silk sarees curated from the finest weavers across India. Experience the perfect blend of timeless tradition and modern elegance in every piece.
                    </p>
                    <Link
                        href="/collection"
                        className="inline-block bg-secondary text-primary font-semibold px-8 py-4 rounded-full text-lg hover:bg-secondary/90 transition-all duration-300 transform hover:scale-105 shadow-xl"
                    >
                        Explore Our Collection
                    </Link>
                </div>

                {/* Decorative element - now above the pattern to blend */}
                <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white to-transparent z-10"></div>
            </section>
            
            {/* New Arrivals — streaming SSR with Suspense skeleton */}
            <Suspense fallback={<NewArrivalsSkeleton />}>
                <NewArrivals />
            </Suspense>

            {/* Why Choose PratyagraSilks - Trust & Credibility Section */}
            <section className="py-16 md:py-24 px-4">
                <div className="max-w-7xl mx-auto">
                    <h2 className="font-playfair text-3xl md:text-5xl font-bold text-primary text-center mb-4">
                        Why Choose Pratyagra Silks
                    </h2>
                    <p className="text-center  mb-12 max-w-2xl mx-auto text-lg">
                        Experience the perfect blend of luxury and tradition. Our carefully curated collection features premium handwoven silk sarees from India's finest weavers, combining centuries-old craftsmanship with contemporary style.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                        {benefits.map((benefit, index) => (
                            <div key={index} className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow">
                                <h3 className="font-playfair text-xl font-bold text-primary mb-3">
                                    {benefit.title}
                                </h3>
                                <p className=" text-sm leading-relaxed">
                                    {benefit.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Featured Collections */}
            <section className="p-4">
                <div className="max-w-7xl mx-auto">
                    <h2 className="font-playfair text-3xl md:text-5xl font-bold text-primary text-center mb-4">
                        Explore Our Silk Saree Collections
                    </h2>
                    <p className="text-center  mb-12 max-w-2xl mx-auto text-lg">
                        Discover our handpicked range of premium silk sarees from across India
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                        {categories.map((category) => (
                            <Link
                                key={category.id}
                                href={`/collection?category=${category.name.toLowerCase().replace(/ /g, "-")}`}
                                className="relative group overflow-hidden rounded-lg shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                                <div className="absolute inset-0 bg-no-repeat bg-cover" style={{ backgroundImage: `url('${category.image}')` }}></div>
                                {/* Placeholder background with gradient */}
                                <div className="aspect-[3/4] bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center">
                                    <span className="text-primary/30 font-playfair text-2xl font-bold text-center px-4">
                                        {category.name}
                                    </span>
                                </div>

                                {/* Category label overlay */}
                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                                    <h3 className="font-playfair text-white text-xl md:text-2xl font-semibold group-hover:text-secondary transition-colors mb-2">
                                        {category.name}
                                    </h3>
                                    <p className="text-white/80 text-sm">
                                        {category.description}
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Our Heritage & Ethos - SEO Content Block */}
            <section className="py-16 md:py-24 px-4">
                <div className="max-w-4xl mx-auto">
                    <h2 className="font-playfair text-3xl md:text-5xl font-bold text-primary mb-6 text-center">
                        Reviving Tradition with a New Touch
                    </h2>
                    <div className="space-y-6  leading-relaxed text-lg">
                        <p>
                            <strong>Pratyagra Silks</strong> is devoted to reviving India's timeless silk heritage by curating luxury sarees from the finest weavers across the country. Each piece in our collection is a masterpiece of luxury—meticulously handwoven by master artisans who have inherited centuries of expertise. We celebrate the artistry, tradition, and cultural pride embedded in every authentic Indian textile.
                        </p>
                        <p>
                            Our commitment to <strong>curated excellence, uncompromised quality, and ethical partnerships</strong> defines us. We work directly with master weavers and artisan communities across India's renowned silk regions—from Kanjivaram and Mysore in the South to Varanasi in the North. Every thread is a testament to tradition, every pattern reflects generations of artistic mastery, and every saree embodies the luxury that comes from blending timeless heritage with contemporary elegance.
                        </p>
                        <p>
                            We believe luxury is most meaningful when it honors tradition. When you choose a Pratyagra Silks saree, you invest in authentic heritage, support artisan dignity, and acquire a timeless treasure that will be cherished for generations.
                        </p>
                        <div className="bg-primary/5 border-l-4 border-primary p-6 mt-8">
                            <p className="font-semibold text-primary text-xl">
                                "Experience luxury that honors tradition. Experience PratyagraSilks."
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Trust & Social Proof Section */}
            {false && <section className="py-16 md:py-24 px-4 bg-white">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="font-playfair text-3xl md:text-5xl font-bold text-primary mb-8">
                        Trusted by Silk Saree Enthusiasts
                    </h2>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-8 mb-8">
                        <div className="text-center">
                            <p className="text-4xl font-bold text-primary">1000+</p>
                            <p className=" text-sm mt-2">Satisfied Customers</p>
                        </div>
                        <div className="text-center">
                            <p className="text-4xl font-bold text-primary">500+</p>
                            <p className=" text-sm mt-2">Premium Sarees</p>
                        </div>
                        <div className="text-center">
                            <p className="text-4xl font-bold text-primary">50+</p>
                            <p className=" text-sm mt-2">Artisan Partners</p>
                        </div>
                    </div>

                    <p className=" text-lg mb-6 max-w-2xl mx-auto">
                        Every saree is selected with meticulous care to ensure exceptional quality, authentic craftsmanship, and timeless beauty. We're committed to bringing you genuine Indian handloom excellence.
                    </p>
                </div>
            </section>}

            {/* CTA Section */}
            <section className="py-16 md:py-24 px-4 bg-gradient-to-r from-primary to-primary-light text-white">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="font-playfair text-3xl md:text-5xl font-bold mb-6">
                        Begin Your Journey Into Timeless Elegance
                    </h2>
                    <p className="text-lg mb-8 opacity-95 max-w-2xl mx-auto">
                        Browse our curated collection of handwoven silk sarees. Each piece is an investment in tradition, artistry, and timeless beauty.
                    </p>
                    <Link
                        href="/collection"
                        className="inline-block bg-secondary text-primary font-semibold px-8 py-4 rounded-full text-lg hover:bg-secondary/90 transition-all duration-300 transform hover:scale-105 shadow-lg"
                    >
                        Shop Now
                    </Link>
                </div>
            </section>
        </div>
    );
}

