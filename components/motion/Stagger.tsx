'use client';

import { m } from 'framer-motion';
import type { ReactNode } from 'react';

const container = {
    hidden: {},
    show: {
        transition: { staggerChildren: 0.08 },
    },
};

const item = {
    hidden: { opacity: 0, y: 28 },
    show: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
    },
};

export function StaggerGroup({ children, className }: { children: ReactNode; className?: string }) {
    return (
        <m.div
            className={className}
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-10% 0px' }}
        >
            {children}
        </m.div>
    );
}

export function StaggerItem({ children, className }: { children: ReactNode; className?: string }) {
    return (
        <m.div data-reveal className={className} variants={item}>
            {children}
        </m.div>
    );
}
