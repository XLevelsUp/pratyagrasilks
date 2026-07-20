import Link from "next/link";
import { Metadata } from "next";
import { ShieldCheck, Star, Leaf, BookOpen } from "lucide-react";

export const metadata: Metadata = {
    title: "Our Story — Kandangi Sarees",
    description: "Learn why we started Kandangi Sarees — to simplify saree shopping by handpicking the finest handlooms from weavers across India. Discover our commitment to authentic weaves and artisan communities.",
    keywords: ["about Kandangi Sarees", "handloom sarees", "weaver-direct sarees", "artisan support", "authentic sarees"],
    alternates: { canonical: "https://kandangisarees.com/about" },
};

const values = [
    { title: "Authenticity", description: "Every piece is sourced directly from the weaver — hand-verified, real.", Icon: ShieldCheck },
    { title: "Quality", description: "Handpicked for wearability, longevity, and the beauty that only comes from handloom.", Icon: Star },
    { title: "Sustainability", description: "Fair wages, weaver dignity, and practices that let tradition flourish for generations.", Icon: Leaf },
    { title: "Tradition", description: "From Kanjivaram silks to Chettinad cottons — we carry living heritage, not just fabric.", Icon: BookOpen },
];

const origins = [
    { name: "Kanjivaram, Tamil Nadu", description: "Home to the legendary Kanjivaram silk sarees — pure mulberry silk with temple borders woven by families who have passed this craft down for centuries.", silks: ["Kanjivaram Silk"], slug: "kanjivaram-silk" },
    { name: "Gadwal, Telangana", description: "The weaving town that perfected the combination of cotton body with silk border — Gadwal sarees are light, graceful, and built for everyday elegance.", silks: ["Gadwal Silk"], slug: "gadwal-silk" },
    { name: "Venkatagiri, Andhra Pradesh", description: "Famous for its ultra-fine weave and delicate jamdani motifs — Venkatagiri produces both silk and cotton sarees that are among the lightest handlooms in India.", silks: ["Venkatagiri Silk", "Venkatagiri Cotton"], slug: "venkatagiri-silk" },
    { name: "Mangalgiri, Andhra Pradesh", description: "Known for the distinctive nizam border and the crisp double-warp Gachi weave — Mangalgiri sarees are a staple of the Andhra handloom tradition.", silks: ["Mangalgiri Silk", "Mangalgiri Gachi"], slug: "mangalgiri-silk" },
    { name: "Rajkot, Gujarat", description: "Rajkot produces the vibrant Rajkot Patola — a single-ikat saree with bold geometric patterns and striking colour contrasts that have made Gujarat's patola tradition famous.", silks: ["Rajkot Patola Silk"], slug: "patola-silk" },
    { name: "Chettinad, Tamil Nadu", description: "The bold checks and vibrant contrasting colours of Chettinad cotton sarees are instantly recognisable — a weave with real character that gets better with every wash.", silks: ["Chettinad Cotton"], slug: "chettinad-cotton" },
    { name: "Narayanapet, Telangana", description: "Wide zari borders on a sturdy cotton body — Narayanapet sarees carry both formal polish and everyday comfort in equal measure.", silks: ["Narayanapet Cotton"], slug: "narayanapet-cotton" },
];

export default function AboutPage() {
    return (
        <div className="flex flex-col overflow-x-hidden">

            {/* ── Hero ─────────────────────────────────────────────────── */}
            <section className="relative text-white py-20 md:py-28 px-4" style={{ backgroundColor: '#5F1300' }}>
                <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                    style={{ backgroundImage: "url('/images/sarees/backgrounds/about_bg.webp')", opacity: 0.12 }}
                />
                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <h1 className="font-playfair text-4xl md:text-6xl font-bold mb-6 animate-slide-up">
                        Why We Started Kandangi Sarees
                    </h1>
                    <p className="text-lg md:text-xl text-white/85 max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: '100ms' }}>
                        To simplify saree shopping by curating the finest handlooms, so every woman finds what truly suits her — effortlessly.
                    </p>
                </div>
            </section>

            {/* ── Mission pull-quote ────────────────────────────────────── */}
            <section className="py-16 md:py-24 px-4 bg-white">
                <div className="max-w-3xl mx-auto text-center">
                    <span className="font-playfair text-5xl leading-none block mb-2" style={{ color: '#E8AB16' }}>&ldquo;</span>
                    <p className="font-playfair text-xl md:text-2xl leading-relaxed" style={{ color: '#5F1300' }}>
                        To simplify saree shopping by curating the finest handlooms, so every woman finds what truly suits her — effortlessly. We nurture the roots of tradition by bringing authentic, handpicked weaves to modern wardrobes.
                    </p>
                    <span className="font-playfair text-5xl leading-none block mt-2" style={{ color: '#E8AB16' }}>&rdquo;</span>

                    {/* Mission + Vision two-column below the pull-quote */}
                    <div className="grid md:grid-cols-2 gap-10 mt-12 text-left">
                        <div>
                            <h2 className="font-playfair text-2xl font-bold mb-3" style={{ color: '#5F1300' }}>Our Mission</h2>
                            <p className="text-base leading-relaxed mb-3" style={{ color: '#1A0A00' }}>
                                We work directly with weavers and artisan cooperatives across Tamil Nadu, Andhra Pradesh, Telangana, and Gujarat — ensuring every saree we carry is genuine, every artisan we work with is paid fairly, and every customer gets exactly what they came for.
                            </p>
                        </div>
                        <div>
                            <h2 className="font-playfair text-2xl font-bold mb-3" style={{ color: '#5F1300' }}>Our Vision</h2>
                            <p className="text-base leading-relaxed" style={{ color: '#1A0A00' }}>
                                We envision Kandangi Sarees as your most trusted saree companion — where every weave is handpicked, every recommendation feels personal, and every purchase honors the artisan behind the loom.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Core Values — 2×2 icon grid ──────────────────────────── */}
            <section className="py-12 md:py-20 px-4" style={{ backgroundColor: '#FDF6E3' }}>
                <div className="max-w-7xl mx-auto">
                    <h2 className="font-playfair text-2xl md:text-4xl font-bold text-center mb-10" style={{ color: '#5F1300' }}>
                        What We Stand For
                    </h2>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                        {values.map(({ title, description, Icon }, index) => (
                            <div
                                key={index}
                                className="stagger-child rounded-xl p-5 border-l-4"
                                style={{ backgroundColor: '#ffffff', borderLeftColor: '#6B1910', animationDelay: `${index * 80}ms` }}
                            >
                                <Icon className="w-7 h-7 mb-3" style={{ color: '#E8AB16' }} />
                                <h3 className="font-semibold text-sm md:text-base mb-2" style={{ color: '#5F1300' }}>{title}</h3>
                                <p className="text-xs md:text-sm leading-relaxed" style={{ color: '#1A0A00' }}>{description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Weaving Regions ──────────────────────────────────────── */}
            <section className="py-16 md:py-24 px-4 bg-white">
                <div className="max-w-7xl mx-auto">
                    <h2 className="font-playfair text-2xl md:text-4xl font-bold text-center mb-3" style={{ color: '#5F1300' }}>
                        Where We Source From
                    </h2>
                    <p className="text-center mb-12 max-w-2xl mx-auto text-sm md:text-base" style={{ color: '#8C5A3C' }}>
                        We work directly with weaving communities in these regions — not through middlemen.
                    </p>

                    <div className="space-y-10">
                        {origins.map((origin, index) => (
                            <div key={index} className="flex flex-col md:flex-row gap-6 md:gap-8 items-start">
                                <div className="md:w-1/2">
                                    <h3 className="font-playfair text-xl md:text-2xl font-bold mb-2" style={{ color: '#5F1300' }}>
                                        {origin.name}
                                    </h3>
                                    <p className="text-sm md:text-base leading-relaxed mb-4" style={{ color: '#1A0A00' }}>
                                        {origin.description}
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {origin.silks.map((silk, idx) => (
                                            <span key={idx} className="text-xs px-3 py-1 rounded-full font-medium" style={{ backgroundColor: 'rgba(95,19,0,0.08)', color: '#5F1300' }}>
                                                {silk}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <Link
                                    href={`/collection/${origin.slug}`}
                                    className="w-full md:w-1/2 rounded-xl p-8 h-52 flex flex-col items-center justify-center group transition-all duration-300 hover:shadow-xl border-2"
                                    style={{ background: 'linear-gradient(135deg, rgba(95,19,0,0.08), rgba(95,19,0,0.04))', borderColor: 'rgba(95,19,0,0.12)' }}
                                >
                                    <span className="text-sm font-medium mb-1 transition-colors" style={{ color: 'rgba(95,19,0,0.5)' }}>
                                        Explore weaves from
                                    </span>
                                    <p className="font-playfair text-2xl md:text-3xl font-bold text-center transition-colors" style={{ color: 'rgba(95,19,0,0.6)' }}>
                                        {origin.name.split(',')[0]}
                                    </p>
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Supporting Weavers ───────────────────────────────────── */}
            <section className="py-16 md:py-20 px-4" style={{ backgroundColor: '#FDF6E3' }}>
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="font-playfair text-2xl md:text-4xl font-bold mb-6" style={{ color: '#5F1300' }}>
                        Supporting Weaver Communities
                    </h2>
                    <p className="text-base md:text-lg leading-relaxed mb-4" style={{ color: '#1A0A00' }}>
                        Every purchase at Kandangi Sarees goes directly back to the weaver. We believe in fair wages, transparent partnerships, and practices that make it possible for artisan families to continue their craft — not just survive, but thrive.
                    </p>
                    <p className="text-base md:text-lg leading-relaxed" style={{ color: '#1A0A00' }}>
                        When you buy a saree from us, you are not just making a purchase. You are choosing to keep a living tradition alive — and that choice matters.
                    </p>
                </div>
            </section>

            {/* ── The Promise — full-width dark band ───────────────────── */}
            <section className="py-16 md:py-24 px-6 text-center text-white bg-gradient-to-r from-primary to-primary-light">
                <div className="max-w-3xl mx-auto">
                    <p className="font-playfair text-2xl md:text-4xl font-bold leading-snug mb-4">
                        Handpicked Weaves. Trusted Guidance. Real Wardrobes.
                    </p>
                    <p className="text-lg md:text-xl italic mb-10" style={{ color: '#E8AB16' }}>
                        That&apos;s the Kandangi Sarees promise.
                    </p>
                    <Link
                        href="/collection"
                        className="inline-flex items-center justify-center px-8 py-4 rounded-full text-base font-semibold transition-all duration-300 hover:scale-105 shadow-lg w-full sm:w-auto"
                        style={{ backgroundColor: '#E8AB16', color: '#1A0A00' }}
                    >
                        Explore the Collection
                    </Link>
                </div>
            </section>
        </div>
    );
}
