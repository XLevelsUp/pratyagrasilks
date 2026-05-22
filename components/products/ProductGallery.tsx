'use client';

import { useState, useCallback, useEffect } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';
import YouTubeSlide from '@/components/products/YouTubeSlide';
import WatermarkOverlay from '@/components/WatermarkOverlay';
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
                <div className="overflow-hidden rounded-lg" ref={mainViewportRef}>
                    <div className="flex">
                        {/* Image Slides */}
                        {images.map((image, index) => (
                            <div key={`image-${index}`} className="flex-[0_0_100%] min-w-0">
                                <div className="relative aspect-square bg-gray-100">
                                    <Image
                                        src={image}
                                        alt={`${productName} - Image ${index + 1}`}
                                        fill
                                        className="object-cover"
                                        sizes="(max-width: 768px) 100vw, 50vw"
                                        priority={index === 0}
                                    />
                                    <WatermarkOverlay />
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
                            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 rounded-full p-2 shadow-lg transition-all z-10"
                            aria-label="Previous image"
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </button>
                        <button
                            onClick={scrollNext}
                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 rounded-full p-2 shadow-lg transition-all z-10"
                            aria-label="Next image"
                        >
                            <ChevronRight className="w-6 h-6" />
                        </button>
                    </>
                )}

                {/* Slide Counter */}
                <div className="absolute bottom-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
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
                                    ? 'border-accent ring-2 ring-accent ring-offset-2'
                                    : 'border-gray-200 hover:border-gray-400'
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
                                    ? 'border-accent ring-2 ring-accent ring-offset-2'
                                    : 'border-gray-200 hover:border-gray-400'
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
