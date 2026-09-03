'use client';

import { usePathname } from 'next/navigation';
import Header from './Header';

// Client wrapper that picks the header treatment from the route: the homepage
// gets the transparent-over-hero variant, every other page the solid one.
// (Previously ConditionalHeader, which also had to hide the header on /admin —
// no longer needed now that admin is a separate app with its own root layout.)
export default function SiteHeader() {
    const pathname = usePathname();
    return <Header variant={pathname === '/' ? 'overlay' : 'solid'} />;
}
