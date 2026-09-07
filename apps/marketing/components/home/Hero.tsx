import Link from 'next/link';
import Image from 'next/image';
import Parallax from '@/components/motion/Parallax';
import HeroVideo from '@/components/home/HeroVideo';
import { HERO_IMAGE } from '@/lib/home-content';

// Server component. Entrance choreography is pure CSS (transform-only line
// masks) so the LCP headline and image paint immediately — no JS on the
// critical path. Parallax only adds transform once the user scrolls.
export default function Hero() {
    return (
        <section className="relative min-h-[100svh] flex items-end overflow-hidden bg-primary-900 text-white">
            {/* Media layer with scroll parallax + slow settle zoom. The image
                paints instantly (LCP + poster); the video fades in over it on
                desktop once playing, and is skipped on mobile/reduced-motion. */}
            <Parallax speed={0.15} className="absolute inset-0 overflow-hidden">
                <div className="absolute inset-0 motion-safe:animate-hero-zoom">
                    <Image
                        src={HERO_IMAGE}
                        alt="Handwoven luxury silk saree drape from Pratyagra Silks"
                        fill
                        priority
                        fetchPriority="high"
                        sizes="100vw"
                        quality={70}
                        className="object-cover"
                    />
                    <HeroVideo />
                </div>
            </Parallax>

            {/* Cinematic scrim — keeps the purple identity, guarantees text contrast */}
            <div className="absolute inset-0 bg-gradient-to-t from-primary-900/85 via-primary-900/40 to-primary-900/30" />

            {/* Content */}
            <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-28 md:pb-32 pt-40">
                <p className="flex items-center gap-4 text-secondary text-xs md:text-sm font-medium tracking-[0.3em] uppercase mb-6 motion-safe:animate-fade-up">
                    <span className="inline-block w-10 h-px bg-secondary/70" aria-hidden="true" />
                    Luxury Handwoven Sarees
                </p>

                <h1 className="font-playfair font-bold text-5xl md:text-7xl lg:text-8xl leading-[1.05] mb-6 max-w-4xl">
                    <span className="block">
                        <span className="block motion-safe:animate-hero-rise">Reviving Tradition</span>
                    </span>
                    <span className="block overflow-hidden">
                        <span className="block motion-safe:animate-hero-rise [animation-delay:120ms] text-secondary">
                            with a New Touch
                        </span>
                    </span>
                </h1>

                <p className="text-base md:text-xl text-white/85 max-w-2xl mb-10 leading-relaxed motion-safe:animate-fade-up [animation-delay:350ms]">
                    Luxury silk sarees curated from the finest weavers across India — the
                    perfect blend of timeless tradition and modern elegance in every piece.
                </p>

                <div className="flex flex-wrap items-center gap-4 motion-safe:animate-fade-up [animation-delay:450ms]">
                    <Link
                        href="/collection"
                        className="inline-block bg-secondary text-primary font-semibold px-8 py-4 rounded-full text-base md:text-lg hover:bg-secondary/90 transition-all duration-300 transform hover:scale-105 shadow-xl"
                    >
                        Explore the Collection
                    </Link>
                    <Link
                        href="#craft"
                        className="inline-block border border-white/40 text-white font-medium px-8 py-4 rounded-full text-base md:text-lg hover:bg-white/10 hover:border-white/70 transition-all duration-300"
                    >
                        Our Craft
                    </Link>
                </div>
            </div>

            {/* Scroll cue */}
            <div
                className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-2 text-white/60 motion-safe:animate-fade-up [animation-delay:700ms]"
                aria-hidden="true"
            >
                <span className="text-[10px] tracking-[0.3em] uppercase">Scroll</span>
                <span className="block w-px h-10 bg-gradient-to-b from-white/60 to-transparent motion-safe:animate-pulse" />
            </div>
        </section>
    );
}
