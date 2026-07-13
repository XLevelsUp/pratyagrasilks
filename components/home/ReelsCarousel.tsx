'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import type { InstagramReel } from '@/lib/instagram';

// Cover-flow style carousel: the active reel sits centre and autoplays
// (muted — required for browser autoplay policies); clicking a side card,
// a dot, or an arrow slides that reel to the centre and plays it. Index 0
// (the newest reel from the API) is centred by default, so a freshly
// uploaded reel lands in the middle after each ISR refresh.
export default function ReelsCarousel({ reels }: { reels: InstagramReel[] }) {
    const [active, setActive] = useState(0);
    const [muted, setMuted] = useState(true);
    const [isMobile, setIsMobile] = useState(false);
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const touchStartX = useRef<number | null>(null);

    const count = reels.length;
    const half = Math.floor(count / 2);

    // Signed circular distance from the active card, in [-half, +half] —
    // keeps the active card centred with the rest wrapped evenly around it.
    const offsetOf = (index: number) =>
        ((((index - active) % count) + count + half) % count) - half;

    const goTo = (index: number) => setActive(((index % count) + count) % count);

    // Tighter fan geometry on phones so the neighbours peek at the edges
    // instead of overflowing far off-screen.
    useEffect(() => {
        const mq = window.matchMedia('(max-width: 639px)');
        const update = () => setIsMobile(mq.matches);
        update();
        mq.addEventListener('change', update);
        return () => mq.removeEventListener('change', update);
    }, []);

    const spacing = isMobile ? 38 : 58; // % of card width per step
    const scaleStep = isMobile ? 0.2 : 0.16;

    // Swipe navigation (mobile) — horizontal drags flip reels, vertical
    // scrolling stays native via touch-action: pan-y on the stage.
    const onTouchStart = (e: React.TouchEvent) => {
        touchStartX.current = e.touches[0].clientX;
    };
    const onTouchEnd = (e: React.TouchEvent) => {
        if (touchStartX.current === null) return;
        const delta = e.changedTouches[0].clientX - touchStartX.current;
        touchStartX.current = null;
        if (Math.abs(delta) > 40) {
            goTo(delta < 0 ? active + 1 : active - 1);
        }
    };

    // Drive playback imperatively: React doesn't reliably apply `muted` as a
    // DOM attribute on mount, which makes browsers block the new video's
    // autoplay after a card swap. Setting it on the element and calling
    // play() explicitly works every time.
    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;
        video.muted = muted;
        const playPromise = video.play();
        if (playPromise) {
            playPromise.catch(() => {
                // Unmuted autoplay blocked — retry muted so playback never stalls
                video.muted = true;
                setMuted(true);
                video.play().catch(() => {});
            });
        }
    }, [active, muted]);

    return (
        <div className="max-w-4xl mx-auto">
            {/* Stage — cards are absolutely stacked and fanned out by transform */}
            <div
                className="relative h-[420px] sm:h-[480px] md:h-[540px] select-none"
                style={{ touchAction: 'pan-y' }}
                onTouchStart={onTouchStart}
                onTouchEnd={onTouchEnd}
            >
                {reels.map((reel, index) => {
                    const offset = offsetOf(index);
                    const isActive = offset === 0;
                    const distance = Math.abs(offset);

                    return (
                        <div
                            key={reel.id}
                            className="absolute left-1/2 top-1/2 w-[210px] sm:w-[240px] md:w-[270px] aspect-[9/16] transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
                            style={{
                                transform: `translate(-50%, -50%) translateX(${offset * spacing}%) scale(${1 - distance * scaleStep})`,
                                zIndex: 10 - distance,
                                opacity: distance === 2 ? (isMobile ? 0.35 : 0.55) : distance === 1 ? 0.8 : 1,
                                filter: isActive ? 'none' : 'brightness(0.88)',
                            }}
                        >
                            {isActive ? (
                                /* ── Centre card: always playing ── */
                                <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl shadow-primary/25 ring-2 ring-accent-300">
                                    <video
                                        ref={videoRef}
                                        key={reel.id}
                                        src={reel.mediaUrl}
                                        poster={reel.thumbnailUrl}
                                        autoPlay
                                        muted
                                        loop
                                        playsInline
                                        className="w-full h-full object-cover"
                                    />

                                    {/* Caption */}
                                    {reel.caption && (
                                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent p-4 pt-10 pointer-events-none">
                                            <p className="text-white text-xs leading-snug line-clamp-2">
                                                {reel.caption}
                                            </p>
                                        </div>
                                    )}

                                    {/* Sound toggle */}
                                    <button
                                        type="button"
                                        onClick={() => setMuted((m) => !m)}
                                        aria-label={muted ? 'Unmute reel' : 'Mute reel'}
                                        className="absolute top-3 right-3 flex items-center justify-center w-9 h-9 rounded-full bg-black/50 backdrop-blur-sm text-white hover:bg-black/70 transition-colors"
                                    >
                                        {muted ? (
                                            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4" aria-hidden="true">
                                                <path d="M3 9v6h4l5 5V4L7 9H3zm13.59 3L14 9.41 15.41 8 18 10.59 20.59 8 22 9.41 19.41 12 22 14.59 20.59 16 18 13.41 15.41 16 14 14.59 16.59 12z" />
                                            </svg>
                                        ) : (
                                            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4" aria-hidden="true">
                                                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0014 7.97v8.05A4.47 4.47 0 0016.5 12zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                                            </svg>
                                        )}
                                    </button>

                                    {/* View on Instagram */}
                                    <a
                                        href={reel.permalink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-sm text-white text-xs font-medium hover:bg-black/70 transition-colors"
                                    >
                                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5" aria-hidden="true">
                                            <path d="M12 2.16c3.2 0 3.58.01 4.85.07 3.25.15 4.77 1.69 4.92 4.92.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.15 3.23-1.66 4.77-4.92 4.92-1.27.06-1.64.07-4.85.07s-3.58-.01-4.85-.07c-3.26-.15-4.77-1.7-4.92-4.92-.06-1.27-.07-1.64-.07-4.85s.01-3.58.07-4.85C2.38 3.92 3.9 2.38 7.15 2.23 8.42 2.17 8.8 2.16 12 2.16zM12 0C8.74 0 8.33.01 7.05.07 2.7.27.27 2.69.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.2 4.36 2.62 6.78 6.98 6.98C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c4.35-.2 6.78-2.62 6.98-6.98.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95C23.73 2.7 21.31.27 16.95.07 15.67.01 15.26 0 12 0zm0 5.84A6.16 6.16 0 105.84 12 6.16 6.16 0 0012 5.84zm0 10.15A3.99 3.99 0 1116 12a3.99 3.99 0 01-4 3.99zm6.4-11.85a1.44 1.44 0 11-1.44 1.44 1.44 1.44 0 011.44-1.44z" />
                                        </svg>
                                        View
                                    </a>
                                </div>
                            ) : (
                                /* ── Side card: thumbnail, click to bring centre ── */
                                <button
                                    type="button"
                                    onClick={() => goTo(index)}
                                    aria-label={`Play reel ${index + 1}${reel.caption ? `: ${reel.caption.slice(0, 60)}` : ''}`}
                                    className="group relative w-full h-full rounded-2xl overflow-hidden shadow-xl shadow-primary/15 ring-1 ring-primary/10 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                                >
                                    <Image
                                        src={reel.thumbnailUrl}
                                        alt={reel.caption ? reel.caption.slice(0, 100) : 'Pratyagra Silks Instagram reel'}
                                        fill
                                        sizes="270px"
                                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                    {/* Play hint on hover */}
                                    <span className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 transition-colors">
                                        <span className="flex items-center justify-center w-11 h-11 rounded-full bg-black/45 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            <svg viewBox="0 0 24 24" fill="white" className="w-4 h-4 ml-0.5" aria-hidden="true">
                                                <path d="M8 5.14v13.72L19 12 8 5.14z" />
                                            </svg>
                                        </span>
                                    </span>
                                </button>
                            )}
                        </div>
                    );
                })}

                {/* Prev / Next arrows */}
                <button
                    type="button"
                    onClick={() => goTo(active - 1)}
                    aria-label="Previous reel"
                    className="absolute left-0 sm:left-2 top-1/2 -translate-y-1/2 z-20 hidden sm:flex items-center justify-center w-11 h-11 rounded-full bg-white shadow-lg ring-1 ring-primary/10 text-primary hover:bg-primary hover:text-white transition-colors"
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" aria-hidden="true">
                        <path d="M15 18l-6-6 6-6" />
                    </svg>
                </button>
                <button
                    type="button"
                    onClick={() => goTo(active + 1)}
                    aria-label="Next reel"
                    className="absolute right-0 sm:right-2 top-1/2 -translate-y-1/2 z-20 hidden sm:flex items-center justify-center w-11 h-11 rounded-full bg-white shadow-lg ring-1 ring-primary/10 text-primary hover:bg-primary hover:text-white transition-colors"
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" aria-hidden="true">
                        <path d="M9 18l6-6-6-6" />
                    </svg>
                </button>
            </div>

            {/* Dot indicators */}
            <div className="flex items-center justify-center gap-2.5 mt-8">
                {reels.map((reel, index) => (
                    <button
                        key={reel.id}
                        type="button"
                        onClick={() => goTo(index)}
                        aria-label={`Go to reel ${index + 1}`}
                        aria-current={index === active}
                        className={`h-2 rounded-full transition-all duration-300 ${
                            index === active
                                ? 'w-7 bg-accent'
                                : 'w-2 bg-primary/20 hover:bg-primary/40'
                        }`}
                    />
                ))}
            </div>
        </div>
    );
}
