'use client';

import { useRef, type ReactNode } from 'react';
import { m, useScroll, useTransform } from 'framer-motion';

interface ParallaxProps {
    children: ReactNode;
    /** Fraction of the container height the content drifts, e.g. 0.15 */
    speed?: number;
    className?: string;
}

// Scroll-linked drift. Initial y is 0, so hydration adds nothing to LCP;
// the transform only appears once the user scrolls.
export default function Parallax({ children, speed = 0.15, className }: ParallaxProps) {
    const ref = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ['start end', 'end start'],
    });
    const y = useTransform(scrollYProgress, [0, 1], [`${-speed * 50}%`, `${speed * 50}%`]);

    return (
        <div ref={ref} className={className}>
            <m.div style={{ y }} className="absolute inset-[-12%]">
                {children}
            </m.div>
        </div>
    );
}
