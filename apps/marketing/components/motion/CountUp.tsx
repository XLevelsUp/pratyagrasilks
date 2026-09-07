'use client';

import { useEffect, useRef, useState } from 'react';
import { useInView, useReducedMotion } from 'framer-motion';

interface CountUpProps {
    to: number;
    suffix?: string;
    className?: string;
}

// SSR renders the final value so crawlers and no-JS visitors see the real
// number; the count-up only runs once the element enters the viewport.
export default function CountUp({ to, suffix = '', className }: CountUpProps) {
    const ref = useRef<HTMLSpanElement>(null);
    const inView = useInView(ref, { once: true, margin: '-20% 0px' });
    const reduced = useReducedMotion();
    const [display, setDisplay] = useState(to);
    const [started, setStarted] = useState(false);

    useEffect(() => {
        if (!inView || started || reduced) return;
        setStarted(true);
        // rAF loop instead of framer's animate() — keeps the standalone
        // animation engine out of the route bundle
        const duration = 1600;
        const start = performance.now();
        let raf = 0;
        const tick = (now: number) => {
            const t = Math.min(1, (now - start) / duration);
            const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
            setDisplay(Math.round(eased * to));
            if (t < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, [inView, started, reduced, to]);

    return (
        <span ref={ref} className={className}>
            {display.toLocaleString('en-IN')}
            {suffix}
        </span>
    );
}
