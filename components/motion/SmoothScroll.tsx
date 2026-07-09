'use client';

import { useEffect, useState, type ReactNode } from 'react';
import dynamic from 'next/dynamic';

// Lenis loads as its own deferred chunk after hydration — it's never needed
// for first paint, so keep it out of the route bundle.
const ReactLenis = dynamic(() => import('lenis/react').then((mod) => mod.ReactLenis), {
    ssr: false,
});

// Lenis in root mode drives native window scroll, so position:sticky
// (fixed header, showcase runway) keeps working. Enabled only after mount
// and never under prefers-reduced-motion — hydration-safe by construction.
export default function SmoothScroll({ children }: { children: ReactNode }) {
    const [enabled, setEnabled] = useState(false);

    useEffect(() => {
        const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
        const update = () => setEnabled(!mq.matches);
        update();
        mq.addEventListener('change', update);
        return () => mq.removeEventListener('change', update);
    }, []);

    if (!enabled) return <>{children}</>;

    return (
        <ReactLenis root options={{ lerp: 0.1, wheelMultiplier: 1, touchMultiplier: 1.5 }}>
            {children}
        </ReactLenis>
    );
}
