'use client';

import { m } from 'framer-motion';
import type { ReactNode } from 'react';

interface RevealProps {
    children: ReactNode;
    delay?: number;
    y?: number;
    /** Fraction of the element that must be visible before animating (defaults to margin-based trigger) */
    amount?: number;
    className?: string;
}

// Fade-and-rise on first viewport entry. `data-reveal` lets the page's
// <noscript> style force visibility when JS is disabled.
export default function Reveal({ children, delay = 0, y = 24, amount, className }: RevealProps) {
    return (
        <m.div
            data-reveal
            className={className}
            initial={{ opacity: 0, y }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={amount !== undefined ? { once: true, amount } : { once: true, margin: '-10% 0px' }}
            transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
        >
            {children}
        </m.div>
    );
}
