'use client';

import { usePathname } from 'next/navigation';
import Header from './Header';

export default function ConditionalHeader() {
    const pathname = usePathname();
    if (pathname?.startsWith('/admin')) return null;
    // Home page gets the transparent-over-hero treatment
    return <Header variant={pathname === '/' ? 'overlay' : 'solid'} />;
}
