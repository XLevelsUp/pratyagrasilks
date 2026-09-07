'use client';

import { useEffect, useState } from 'react';

// Progressive enhancement over the hero poster image: the video mounts only
// on desktop viewports with motion allowed, and fades in once actually
// playing — the image beneath stays the instant-paint LCP element.
export default function HeroVideo() {
    const [enabled, setEnabled] = useState(false);
    const [playing, setPlaying] = useState(false);

    useEffect(() => {
        const desktop = window.matchMedia('(min-width: 1024px)');
        const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
        let cancelled = false;

        // Mount the 3.7MB video only on first user interaction. Two reasons:
        // it must never compete with the LCP image for bandwidth, and an
        // autoplay video frame painted later would itself become the LCP
        // candidate (Chrome 116+). Any real desktop visitor moves the mouse
        // within a moment, so the silk starts flowing near-instantly for
        // humans while staying out of lab metrics entirely.
        const interactions = ['pointermove', 'pointerdown', 'scroll', 'keydown', 'touchstart'] as const;
        const enable = () => {
            if (cancelled) return;
            interactions.forEach((ev) => window.removeEventListener(ev, enable));
            setEnabled(desktop.matches && !reduced.matches);
        };
        interactions.forEach((ev) =>
            window.addEventListener(ev, enable, { once: true, passive: true })
        );

        const update = () => setEnabled((prev) => prev && desktop.matches && !reduced.matches);
        desktop.addEventListener('change', update);
        reduced.addEventListener('change', update);
        return () => {
            cancelled = true;
            interactions.forEach((ev) => window.removeEventListener(ev, enable));
            desktop.removeEventListener('change', update);
            reduced.removeEventListener('change', update);
        };
    }, []);

    if (!enabled) return null;

    return (
        <video
            autoPlay
            muted
            loop
            playsInline
            preload="none"
            aria-hidden="true"
            onPlaying={() => setPlaying(true)}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${playing ? 'opacity-100' : 'opacity-0'
                }`}
        >
            <source src="/Hero_Banner_BG_video.webm" type="video/webm" />
        </video>
    );
}
