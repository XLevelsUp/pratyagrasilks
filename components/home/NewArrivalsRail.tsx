'use client';

import { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import type { Product } from '@/lib/types';

interface NewArrivalsRailProps {
    products: Product[];
}

// Editorial product rail — drag/swipe with a peeking next card, prev/next
// controls, and a progress bar tracking scroll position.
export default function NewArrivalsRail({ products }: NewArrivalsRailProps) {
    const [emblaRef, emblaApi] = useEmblaCarousel({
        align: 'start',
        containScroll: 'trimSnaps',
    });
    const [canPrev, setCanPrev] = useState(false);
    const [canNext, setCanNext] = useState(true);
    const [progress, setProgress] = useState(0);

    const onUpdate = useCallback(() => {
        if (!emblaApi) return;
        setCanPrev(emblaApi.canScrollPrev());
        setCanNext(emblaApi.canScrollNext());
        setProgress(Math.max(0, Math.min(1, emblaApi.scrollProgress())));
    }, [emblaApi]);

    useEffect(() => {
        if (!emblaApi) return;
        onUpdate();
        emblaApi.on('select', onUpdate);
        emblaApi.on('scroll', onUpdate);
        emblaApi.on('reInit', onUpdate);
        return () => {
            emblaApi.off('select', onUpdate);
            emblaApi.off('scroll', onUpdate);
            emblaApi.off('reInit', onUpdate);
        };
    }, [emblaApi, onUpdate]);

    // Large floating arrows over the rail edges; they fade out entirely
    // when there's nothing left to scroll in that direction.
    const arrowClass = (enabled: boolean) =>
        `hidden lg:flex absolute top-1/2 -translate-y-1/2 z-10 items-center justify-center w-14 h-14 rounded-full bg-white/95 backdrop-blur border border-primary/15 shadow-xl text-primary transition-all duration-300 hover:bg-primary hover:text-secondary hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
            enabled ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`;

    return (
        <div className="relative">
            {/* Rail */}
            <div className="overflow-hidden" ref={emblaRef}>
                <div className="flex -ml-5 md:-ml-6 touch-pan-y">
                    {products.map((product) => (
                        <div
                            key={product.id}
                            className="min-w-0 flex-[0_0_80%] sm:flex-[0_0_45%] lg:flex-[0_0_30%] xl:flex-[0_0_24%] pl-5 md:pl-6"
                        >
                            <ProductCard product={product} showNewBadge={true} />
                        </div>
                    ))}
                </div>
            </div>

            {/* Overlay navigation */}
            <button
                type="button"
                onClick={() => emblaApi?.scrollPrev()}
                disabled={!canPrev}
                className={`${arrowClass(canPrev)} -left-4 xl:-left-7`}
                aria-label="Previous products"
            >
                <ChevronLeft className="w-6 h-6" />
            </button>
            <button
                type="button"
                onClick={() => emblaApi?.scrollNext()}
                disabled={!canNext}
                className={`${arrowClass(canNext)} -right-4 xl:-right-7`}
                aria-label="Next products"
            >
                <ChevronRight className="w-6 h-6" />
            </button>

            {/* Progress bar */}
            <div className="h-px bg-primary-100 relative overflow-hidden rounded-full mt-8">
                <div
                    className="absolute inset-y-0 left-0 w-full bg-primary origin-left transition-transform duration-200 ease-out"
                    style={{ transform: `scaleX(${progress})` }}
                    aria-hidden="true"
                />
            </div>
        </div>
    );
}
