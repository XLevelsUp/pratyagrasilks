'use client';

import { usePathname } from 'next/navigation';

// Client gate for the site-wide Instagram reels slot above the footer.
// Hidden on admin routes (like the footer) and on pages that render their
// own InstagramReels placement: the homepage (below the Silk Showcase) and
// /collection (which uses its own account token). The server-rendered
// section is passed through as children so data fetching stays on the server.
export default function ConditionalReels({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isHidden =
        pathname === '/' || pathname === '/collection' || pathname?.startsWith('/admin');

    if (isHidden) {
        return null;
    }

    return <>{children}</>;
}
