'use client';

import { LazyMotion, MotionConfig } from 'framer-motion';
import type { ReactNode } from 'react';

// Feature bundle loads as a separate async chunk after hydration
const loadFeatures = () => import('./motion-features').then((mod) => mod.default);

// Single entry point for the motion bundle. `strict` throws in dev if any
// component imports `motion.*` instead of `m.*`, keeping the bundle lean.
export default function MotionProvider({ children }: { children: ReactNode }) {
    return (
        <LazyMotion features={loadFeatures} strict>
            <MotionConfig reducedMotion="user">{children}</MotionConfig>
        </LazyMotion>
    );
}
