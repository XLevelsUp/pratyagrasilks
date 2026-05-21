import Link from "next/link";
import { Suspense } from "react";
import NewArrivals from "@/components/home/NewArrivals";
import { silkCategories } from "@/lib/seo-config";
import { Layers, Heart, Leaf, Sparkles, ChevronDown } from "lucide-react";

function NewArrivalsSkeleton() {
    return (
        <section className="py-16 md:py-24 px-4 bg-primary-50">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-10">
                    <div className="inline-block h-6 w-36 rounded-full bg-accent-300/40 animate-pulse mb-4" />
                    <div className="h-10 w-2/3 mx-auto rounded-lg bg-primary/10 animate-pulse mb-4" />
                    <div className="h-4 w-1/2 mx-auto rounded bg-gray-200 animate-pulse" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="rounded-2xl overflow-hidden shadow-md bg-white">
                            <div className="aspect-[3/4] bg-gradient-to-br from-primary-100 to-primary-200 animate-pulse" />
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

const benefits = [
    {
        title: "Weaver-Direct Sourcing",
        description: "Every saree comes straight from the loom — no middlemen, no compromise.",
        Icon: Layers,
    },
    {
        title: "Curated for Real Women",
        description: "We handpick every piece for wearability, beauty, and true value.",
        Icon: Heart,
    },
    {
        title: "Rooted in Heritage",
        description: "Our weaves support artisan communities and preserve living traditions.",
        Icon: Leaf,
    },
    {
        title: "Warmth in Every Thread",
        description: "From everyday cottons to bridal silks — we simplify the search so you find what suits you.",
        Icon: Sparkles,
    },
];

export default function Home() {
    return (
        <div className="flex flex-col overflow-x-hidden">

            {/* ── Hero Section ─────────────────────────────────────────── */}
            <section className="relative h-[100dvh] md:h-[80vh] flex items-end overflow-hidden">
                {/* Background image */}
                <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                    style={{
                        backgroundImage:
                            "url('/images/sarees/backgrounds/Hero_bg.webp')",
                    }}
                />

                {/* Gradient overlay — warm brown from bottom */}
                <div
                    className="absolute inset-0"
                    style={{
                        background:
                            "linear-gradient(to top, rgba(95,19,0,0.82) 0%, rgba(95,19,0,0.45) 50%, transparent 100%)",
                    }}
                />

                {/* Hero content — anchored to bottom */}
                <div className="relative z-10 w-full max-w-7xl mx-auto px-6 pb-16 md:pb-20">
                    <h1
                        className="font-playfair text-4xl md:text-6xl font-bold text-white leading-tight mb-4 animate-slide-up"
                        style={{ textShadow: "0 2px 12px rgba(0,0,0,0.3)" }}
                    >
                        Handpicked for You,<br className="hidden sm:block" /> Rooted in Tradition.
                    </h1>

                    <p
                        className="text-base md:text-lg text-white/85 mb-8 max-w-lg animate-slide-up"
                        style={{ animationDelay: "100ms" }}
                    >
                        Authentic handloom sarees, direct from the weaver.
                    </p>

                    <div
                        className="flex flex-col sm:flex-row gap-3 animate-slide-up"
                        style={{ animationDelay: "200ms" }}
                    >
                        <Link
                            href="/collection"
                            className="inline-flex items-center justify-center px-8 py-4 rounded-full text-base font-semibold transition-all duration-300 hover:scale-105 shadow-lg"
                            style={{ backgroundColor: "#E8AB16", color: "#1A0A00" }}
                        >
                            Shop Sarees
                        </Link>
                        <Link
                            href="/about"
                            className="inline-flex items-center justify-center px-8 py-4 rounded-full text-base font-semibold border-2 border-white text-white transition-all duration-300 hover:bg-white/10"
                        >
                            Our Story
                        </Link>
                    </div>
                </div>

                {/* Scroll arrow */}
                <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-10 animate-bounce">
                    <ChevronDown className="w-6 h-6 text-white/70" />
                </div>
            </section>

            {/* ── New Arrivals — streaming SSR with Suspense skeleton ─── */}
            <Suspense fallback={<NewArrivalsSkeleton />}>
                <NewArrivals />
            </Suspense>

            {/* ── Shop by Weave — Category Strip ───────────────────────── */}
            <section className="py-12 md:py-16 px-4 bg-white">
                <div className="max-w-7xl mx-auto">
                    <h2 className="font-playfair text-2xl md:text-4xl font-bold text-center mb-2" style={{ color: "#5F1300" }}>
                        Shop by Weave
                    </h2>
                    <p className="text-center text-sm md:text-base mb-8 max-w-xl mx-auto" style={{ color: "#8C5A3C" }}>
                        Silks and cottons handpicked from weavers across India — each one chosen for a reason.
                    </p>

                    {/* Horizontal scroll on mobile, wrap on desktop */}
                    <div className="flex gap-3 overflow-x-auto hide-scrollbar md:flex-wrap md:justify-center pb-2">
                        {silkCategories.map((category, index) => (
                            <Link
                                key={category.slug}
                                href={`/collection/${category.slug}`}
                                className="stagger-child flex-shrink-0 group flex flex-col items-start px-4 py-3 rounded-xl border border-[#5F1300]/20 bg-white shadow-sm transition-all duration-200 hover:bg-[#5F1300] hover:border-[#5F1300] hover:shadow-md min-w-[140px] md:min-w-0"
                                style={{ animationDelay: `${index * 60}ms` }}
                            >
                                <span className="text-sm sm:text-lg font-semibold leading-snug text-[#1A0A00] group-hover:text-white transition-colors">
                                    {category.name}
                                </span>
                                <span className="text-xs sm:text-sm mt-0.5 text-[#8C5A3C] group-hover:text-[#E8AB16] transition-colors">
                                    {category.origin}
                                </span>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Why Kandangi Sarees — 2×2 icon grid ─────────────────── */}
            <section className="py-12 md:py-20 px-4" style={{ backgroundColor: "#FDF6E3" }}>
                <div className="max-w-7xl mx-auto">
                    <h2 className="font-playfair text-2xl md:text-4xl font-bold text-center mb-2" style={{ color: "#5F1300" }}>
                        Why Kandangi Sarees
                    </h2>
                    <p className="text-center text-sm md:text-base mb-10 max-w-xl mx-auto" style={{ color: "#8C5A3C" }}>
                        We don&apos;t just sell sarees. We handpick every piece and guide you to a weave that&apos;s genuinely right for you.
                    </p>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                        {benefits.map(({ title, description, Icon }, index) => (
                            <div
                                key={index}
                                className="stagger-child rounded-xl p-5 border-l-4"
                                style={{
                                    backgroundColor: "#ffffff",
                                    borderLeftColor: "#6B1910",
                                    animationDelay: `${index * 80}ms`,
                                }}
                            >
                                <Icon className="w-7 h-7 mb-3" style={{ color: "#E8AB16" }} />
                                <h3 className="font-semibold text-sm md:text-base mb-2 leading-snug" style={{ color: "#5F1300" }}>
                                    {title}
                                </h3>
                                <p className="text-xs md:text-sm leading-relaxed" style={{ color: "#1A0A00" }}>
                                    {description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Our Story ────────────────────────────────────────────── */}
            <section className="py-16 md:py-24 px-4 bg-white">
                <div className="max-w-4xl mx-auto">
                    <h2 className="font-playfair text-3xl md:text-5xl font-bold mb-6 text-center" style={{ color: "#5F1300" }}>
                        Handpicked for You, Rooted in Tradition.
                    </h2>
                    <div className="space-y-6 leading-relaxed text-base md:text-lg" style={{ color: "#1A0A00" }}>
                        <p>
                            <strong>Kandangi Sarees</strong> was built for women who know what they want in a saree — but don&apos;t always have the time or the right guide to find it. We handpick every weave directly from artisan communities across Tamil Nadu, Andhra Pradesh, Telangana, and Gujarat. No middlemen. No compromise.
                        </p>
                        <p>
                            From the bold checks of a Chettinad cotton to the vibrant ikat of a Rajkot Patola, every saree in our collection has been chosen for its <strong>authenticity, wearability, and honest craft</strong>.
                        </p>
                        <p>
                            When you buy from Kandangi Sarees, you&apos;re supporting the weaver behind the loom, the family behind the craft, and a tradition that has survived for generations because women like you chose to keep it alive.
                        </p>
                        <div
                            className="border-l-4 p-6 mt-8 rounded-r-lg"
                            style={{ borderLeftColor: "#5F1300", backgroundColor: "rgba(95,19,0,0.04)" }}
                        >
                            <p className="font-semibold text-lg md:text-xl" style={{ color: "#5F1300" }}>
                                &ldquo;Handpicked Weaves. Trusted Guidance. Real Wardrobes. That&apos;s the Kandangi Sarees promise.&rdquo;
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials — disabled until Phase 3 */}
            {false && <section className="py-16 md:py-24 px-4 bg-white">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="font-playfair text-3xl md:text-5xl font-bold mb-8" style={{ color: "#5F1300" }}>
                        Trusted by Saree Lovers
                    </h2>
                </div>
            </section>}

            {/* ── CTA Section ──────────────────────────────────────────── */}
            <section className="py-16 md:py-24 px-4 text-white bg-gradient-to-r from-primary to-primary-light">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="font-playfair text-3xl md:text-5xl font-bold mb-4">
                        Pick Your Saree Effortlessly.
                    </h2>
                    <p className="text-base md:text-lg mb-8 opacity-90 max-w-2xl mx-auto">
                        Browse our curated collection of authentic handlooms across silk and cotton. Handpicked from weavers. Made for you.
                    </p>
                    <Link
                        href="/collection"
                        className="inline-flex items-center justify-center px-8 py-4 rounded-full text-base font-semibold transition-all duration-300 hover:scale-105 shadow-lg w-full sm:w-auto"
                        style={{ backgroundColor: "#E8AB16", color: "#1A0A00" }}
                    >
                        Shop Now
                    </Link>
                </div>
            </section>
        </div>
    );
}
