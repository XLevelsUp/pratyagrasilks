'use client';

import { useState, useCallback, useEffect } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';
import YouTubeSlide from '@/components/products/YouTubeSlide';
import { getYouTubeThumbnailUrl } from '@/lib/utils/youtube';

interface ProductGalleryProps {
    images: string[];
    yt_link?: string | null;
    productName?: string;
}

export default function ProductGallery({ images, yt_link, productName = 'Product' }: ProductGalleryProps) {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [mainViewportRef, emblaMainApi] = useEmblaCarousel({
        loop: true,
        skipSnaps: false,
    });
    const [thumbViewportRef, emblaThumbsApi] = useEmblaCarousel({
        containScroll: 'keepSnaps',
        dragFree: true,
    });

    const hasVideo = Boolean(yt_link && yt_link.trim() !== '');
    const totalItems = images.length + (hasVideo ? 1 : 0);

    const onThumbClick = useCallback(
        (index: number) => {
            if (!emblaMainApi || !emblaThumbsApi) return;
            emblaMainApi.scrollTo(index);
        },
        [emblaMainApi, emblaThumbsApi]
    );

    const onSelect = useCallback(() => {
        if (!emblaMainApi || !emblaThumbsApi) return;
        const index = emblaMainApi.selectedScrollSnap();
        setSelectedIndex(index);
        emblaThumbsApi.scrollTo(index);
    }, [emblaMainApi, emblaThumbsApi]);

    useEffect(() => {
        if (!emblaMainApi) return;
        onSelect();
        emblaMainApi.on('select', onSelect);
        emblaMainApi.on('reInit', onSelect);
    }, [emblaMainApi, onSelect]);

    const scrollPrev = useCallback(() => {
        if (emblaMainApi) emblaMainApi.scrollPrev();
    }, [emblaMainApi]);

    const scrollNext = useCallback(() => {
        if (emblaMainApi) emblaMainApi.scrollNext();
    }, [emblaMainApi]);

    return (
        <div className="space-y-4">
            {/* Main Carousel */}
            <div className="relative">
                <div className="overflow-hidden rounded-2xl" ref={mainViewportRef}>
                    <div className="flex">
                        {/* Image Slides */}
                        {images.map((image, index) => (
                            <div key={`image-${index}`} className="flex-[0_0_100%] min-w-0">
                                <div className="relative aspect-square bg-primary-50 silk-shimmer overflow-hidden group">
                                    <Image
                                        src={image}
                                        alt={`${productName} - Image ${index + 1}`}
                                        fill
                                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                                        sizes="(max-width: 768px) 100vw, 50vw"
                                        priority={index === 0}
                                    />
                                </div>
                            </div>
                        ))}

                        {/* YouTube Video Slide */}
                        {hasVideo && yt_link && (
                            <div key="video" className="flex-[0_0_100%] min-w-0">
                                <YouTubeSlide
                                    url={yt_link}
                                    title={`${productName} Video`}
                                    isActive={selectedIndex === images.length}
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* Navigation Buttons */}
                {totalItems > 1 && (
                    <>
                        <button
                            onClick={scrollPrev}
                            className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-11 h-11 rounded-full bg-white/95 backdrop-blur border border-primary/15 shadow-xl text-primary hover:bg-primary hover:text-secondary transition-all duration-300 z-10"
                            aria-label="Previous image"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                            onClick={scrollNext}
                            className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-11 h-11 rounded-full bg-white/95 backdrop-blur border border-primary/15 shadow-xl text-primary hover:bg-primary hover:text-secondary transition-all duration-300 z-10"
                            aria-label="Next image"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </>
                )}

                {/* Slide Counter */}
                <div className="absolute bottom-4 right-4 bg-primary-900/70 backdrop-blur text-white/90 px-3 py-1 rounded-full text-xs tracking-[0.15em]">
                    {selectedIndex + 1} / {totalItems}
                </div>
            </div>

            {/* Thumbnail Navigation */}
            {totalItems > 1 && (
                <div className="overflow-hidden" ref={thumbViewportRef}>
                    <div className="flex gap-2">
                        {/* Image Thumbnails */}
                        {images.map((image, index) => (
                            <button
                                key={`thumb-${index}`}
                                onClick={() => onThumbClick(index)}
                                className={`flex-[0_0_20%] min-w-0 relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${index === selectedIndex
                                    ? 'border-primary ring-1 ring-primary ring-offset-2'
                                    : 'border-primary-100 hover:border-primary-300'
                                    }`}
                            >
                                <Image
                                    src={image}
                                    alt={`Thumbnail ${index + 1}`}
                                    fill
                                    className="object-cover"
                                    sizes="20vw"
                                />
                            </button>
                        ))}

                        {/* YouTube Thumbnail */}
                        {hasVideo && yt_link && (
                            <button
                                key="thumb-video"
                                onClick={() => onThumbClick(images.length)}
                                className={`flex-[0_0_20%] min-w-0 relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${selectedIndex === images.length
                                    ? 'border-primary ring-1 ring-primary ring-offset-2'
                                    : 'border-primary-100 hover:border-primary-300'
                                    }`}
                            >
                                {getYouTubeThumbnailUrl(yt_link) && (
                                    <Image
                                        src={getYouTubeThumbnailUrl(yt_link) || ''}
                                        alt="Video thumbnail"
                                        fill
                                        className="object-cover"
                                        sizes="20vw"
                                    />
                                )}
                                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                                    <div className="bg-red-600 rounded-full p-3">
                                        <Play className="w-6 h-6 text-white fill-white" />
                                    </div>
                                </div>
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
