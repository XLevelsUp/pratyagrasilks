'use client';

// Client gate for the site-wide Instagram reels slot above the footer.
// Hidden on the pages that render their own InstagramReels placement: the
// homepage (below the Silk Showcase) and /collection (which uses its own
// account token). The server-rendered section is passed through as children
// so data fetching stays on the server.
// (Previously ConditionalReels, which also hid the slot on /admin — no longer
// needed now that admin is a separate app with its own root layout.)
import { usePathname } from 'next/navigation';

export default function ReelsSlot({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    if (pathname === '/' || pathname === '/collection') {
        return null;
    }

    return <>{children}</>;
}
