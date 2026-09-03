'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Play } from 'lucide-react';
import { getYouTubeEmbedUrl, getYouTubeThumbnailUrl } from '@/lib/utils/youtube';

interface YouTubeSlideProps {
    url: string;
    title?: string;
    isActive?: boolean;
}

export default function YouTubeSlide({ url, title = 'Product Video', isActive = false }: YouTubeSlideProps) {
    const [isInView, setIsInView] = useState(false);
    const [shouldLoadIframe, setShouldLoadIframe] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const embedUrl = getYouTubeEmbedUrl(url);
    const thumbnailUrl = getYouTubeThumbnailUrl(url, 'maxresdefault');

    // Extract video ID for playlist parameter (required for proper looping)
    const videoId = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)?.[1];

    // Intersection Observer to detect when slide is visible
    useEffect(() => {
        if (!containerRef.current) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setIsInView(true);
                    }
                });
            },
            {
                threshold: 0.5, // Load when 50% visible
                rootMargin: '50px', // Start loading slightly before fully visible
            }
        );

        observer.observe(containerRef.current);

        return () => {
            if (containerRef.current) {
                observer.unobserve(containerRef.current);
            }
        };
    }, []);

    // Load iframe when slide becomes active AND is in view
    useEffect(() => {
        if (isActive && isInView) {
            setShouldLoadIframe(true);
        }
    }, [isActive, isInView]);

    if (!embedUrl || !videoId) return null;

    // Build iframe URL with autoplay, mute, loop, and playlist params
    // playlist parameter is required for loop to work properly
    const iframeUrl = `${embedUrl}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&modestbranding=1&rel=0&playsinline=1&showinfo=0&iv_load_policy=3`;

    return (
        <div ref={containerRef} className="relative w-full aspect-square bg-black flex items-center justify-center">
            {shouldLoadIframe ? (
                // Lazy-loaded iframe
                <div className="relative w-full h-full">
                    <iframe
                        src={iframeUrl}
                        title={title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="absolute inset-0 w-full h-full"
                        style={{ border: 'none' }}
                    />
                </div>
            ) : (
                // Placeholder thumbnail
                <div className="relative w-full h-full">
                    {thumbnailUrl && (
                        <Image
                            src={thumbnailUrl}
                            alt={title}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, 50vw"
                        />
                    )}
                    {/* Play overlay */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <div className="bg-red-600 rounded-full p-6 shadow-2xl">
                            <Play className="w-12 h-12 text-white fill-white" />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
