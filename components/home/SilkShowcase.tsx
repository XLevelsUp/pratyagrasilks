import Image from 'next/image';
import Link from 'next/link';
import Reveal from '@/components/motion/Reveal';
import type { SilkShowcaseItem } from '@/lib/home-content';

interface SilkShowcaseProps {
    items: SilkShowcaseItem[];
}

// Mobile / tablet card — native snap scroll, zero JS
function ShowcaseCard({ item, index }: { item: SilkShowcaseItem; index: number }) {
    return (
        <Link
            href={`/collection?category=${item.slug}`}
            className="group relative block overflow-hidden rounded-2xl shadow-lg snap-center shrink-0 w-[78vw] aspect-[3/4] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
            <Image
                src={item.image}
                alt={`${item.name} saree`}
                fill
                sizes="78vw"
                quality={60}
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
            <span
                className="absolute top-4 right-5 font-playfair font-bold text-7xl text-white/10 select-none"
                aria-hidden="true"
            >
                {String(index + 1).padStart(2, '0')}
            </span>
            <div className="absolute bottom-0 left-0 right-0 p-6">
                <p className="text-secondary/90 text-[11px] font-medium tracking-[0.25em] uppercase mb-2">
                    {item.origin}
                </p>
                <h3 className="font-playfair text-white text-2xl font-semibold mb-1">{item.name}</h3>
                <p className="text-white/70 text-sm">{item.description}</p>
            </div>
        </Link>
    );
}

// Desktop panel — collapsed shows a vertical name rail; hover (or keyboard
// focus) expands the panel and reveals the full story. Pure CSS transitions.
function AccordionPanel({ item, index }: { item: SilkShowcaseItem; index: number }) {
    return (
        <Link
            href={`/collection?category=${item.slug}`}
            className="group relative block overflow-hidden rounded-2xl flex-[1_1_0%] hover:flex-[4.5_1_0%] focus-within:flex-[4.5_1_0%] focus:flex-[4.5_1_0%] transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary min-w-0"
        >
            <Image
                src={item.image}
                alt={`${item.name} saree`}
                fill
                sizes="(min-width: 1024px) 40vw, 78vw"
                quality={60}
                className="object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105"
            />
            {/* Scrim — deepens on expand so the story text stays readable */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-black/10 opacity-80 group-hover:opacity-100 group-focus:opacity-100 transition-opacity duration-700" />

            {/* Ghost index numeral */}
            <span
                className="absolute top-5 left-1/2 -translate-x-1/2 group-hover:left-6 group-hover:translate-x-0 group-focus:left-6 group-focus:translate-x-0 font-playfair font-bold text-4xl text-white/25 select-none transition-all duration-700"
                aria-hidden="true"
            >
                {String(index + 1).padStart(2, '0')}
            </span>

            {/* Collapsed state: vertical name rail */}
            <span
                className="absolute bottom-6 left-1/2 -translate-x-1/2 [writing-mode:vertical-rl] rotate-180 font-playfair text-white text-xl font-medium tracking-wide whitespace-nowrap opacity-100 group-hover:opacity-0 group-focus:opacity-0 transition-opacity duration-300"
                aria-hidden="true"
            >
                {item.name}
            </span>

            {/* Expanded state: full story */}
            <div className="absolute bottom-0 left-0 right-0 p-6 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 group-focus:opacity-100 group-focus:translate-y-0 transition-all duration-500 delay-150">
                <p className="text-secondary/90 text-[11px] font-medium tracking-[0.25em] uppercase mb-2 whitespace-nowrap">
                    {item.origin}
                </p>
                <h3 className="font-playfair text-white text-2xl xl:text-3xl font-semibold mb-2 whitespace-nowrap">
                    {item.name}
                </h3>
                <p className="text-white/75 text-sm leading-relaxed mb-3 max-w-xs">{item.description}</p>
                <span className="inline-flex items-center gap-2 text-secondary text-sm font-medium">
                    Explore
                    <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1">
                        →
                    </span>
                </span>
            </div>
        </Link>
    );
}

// Server component — the desktop gallery is a hover-expand accordion,
// fully CSS-driven (no scroll hijacking, no JS on the interaction path).
export default function SilkShowcase({ items }: SilkShowcaseProps) {
    return (
        <section className="py-16 md:py-24">
            <Reveal className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-12">
                <h2 className="font-playfair text-3xl md:text-5xl font-bold text-primary mb-4">
                    Explore Our Silk Saree Collections
                </h2>
                <p className="text-textSecondary max-w-2xl mx-auto text-lg">
                    Discover our handpicked range of premium silk sarees from across India
                </p>
            </Reveal>

            {/* Mobile & tablet: native snap scroll */}
            <div className="lg:hidden flex overflow-x-auto snap-x snap-mandatory gap-4 px-4 pb-4 hide-scrollbar">
                {items.map((item, i) => (
                    <ShowcaseCard key={item.slug} item={item} index={i} />
                ))}
            </div>

            {/* Desktop: hover-expand accordion gallery */}
            <Reveal className="hidden lg:block max-w-[1600px] mx-auto px-6 xl:px-10">
                <div className="flex gap-3 h-[70vh] min-h-[480px] max-h-[720px]">
                    {items.map((item, i) => (
                        <AccordionPanel key={item.slug} item={item} index={i} />
                    ))}
                </div>
                <p className="text-center text-xs tracking-[0.25em] uppercase text-textSecondary/50 mt-6">
                    Hover a panel to explore
                </p>
            </Reveal>
        </section>
    );
}
