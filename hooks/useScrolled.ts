'use client';

import { useEffect, useLayoutEffect, useState } from 'react';

// SSR-safe layout effect (avoids the useLayoutEffect server warning)
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

/**
 * True once window.scrollY passes `threshold`. rAF-throttled passive
 * listener; initializes from the live scroll position so a reload
 * mid-page doesn't flash the un-scrolled state.
 */
export default function useScrolled(threshold = 24): boolean {
    const [scrolled, setScrolled] = useState(false);

    useIsomorphicLayoutEffect(() => {
        setScrolled(window.scrollY > threshold);
    }, [threshold]);

    useEffect(() => {
        let ticking = false;
        const onScroll = () => {
            if (ticking) return;
            ticking = true;
            requestAnimationFrame(() => {
                setScrolled(window.scrollY > threshold);
                ticking = false;
            });
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, [threshold]);

    return scrolled;
}
