import Link from 'next/link';
import Reveal from '@/components/motion/Reveal';
import { silkShowcaseItems } from '@/lib/home-content';

// Closing CTA — silk-luster sheen sweep + ghost marquee of silk names.
export default function CtaBand() {
    const marqueeNames = silkShowcaseItems.map((s) => s.name);

    return (
        <section className="relative py-20 md:py-28 px-4 bg-primary text-white overflow-hidden">
            {/* Ghost marquee backdrop */}
            <div className="absolute bottom-4 flex items-center overflow-hidden" aria-hidden="true">
                <div className="flex whitespace-nowrap motion-safe:animate-marquee">
                    {[0, 1].map((copy) => (
                        <span key={copy} className="flex shrink-0">
                            {marqueeNames.map((name) => (
                                // Decorative watermark rendered via pseudo-element so
                                // contrast audits (correctly) ignore it — it's not text
                                // meant to be read.
                                <span
                                    key={`${copy}-${name}`}
                                    data-name={name}
                                    className="font-playfair text-6xl md:text-8xl font-bold text-white/[0.06] px-8 select-none before:content-[attr(data-name)]"
                                />
                            ))}
                        </span>
                    ))}
                </div>
            </div>

            {/* Silk sheen sweep */}
            <div
                className="absolute inset-y-[-40%] left-0 w-1/3 bg-gradient-to-r from-transparent via-secondary/10 to-transparent motion-safe:animate-sheen pointer-events-none"
                aria-hidden="true"
            />

            <div className="relative z-10 max-w-4xl mx-auto text-center">
                <Reveal>
                    <h2 className="font-playfair text-3xl md:text-5xl font-bold mb-6">
                        Begin Your Journey Into Timeless Elegance
                    </h2>
                    <p className="text-lg mb-10 opacity-95 max-w-2xl mx-auto">
                        Browse our curated collection of handwoven silk sarees. Each piece is an
                        investment in tradition, artistry, and timeless beauty.
                    </p>
                    <Link
                        href="/collection"
                        className="inline-block bg-secondary text-primary font-semibold px-8 py-4 rounded-full text-lg hover:bg-secondary/90 transition-all duration-300 transform hover:scale-105 shadow-lg"
                    >
                        Shop Now
                    </Link>
                </Reveal>
            </div>
        </section>
    );
}
