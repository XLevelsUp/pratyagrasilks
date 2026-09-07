'use client';

import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ExternalLink, LayoutDashboard, SearchX } from 'lucide-react';
import { STOREFRONT_URL } from '@/lib/constants/urls';

/** Top-level route segments served by the storefront app. */
const STOREFRONT_SEGMENTS = [
    'about', 'auth', 'blog', 'cart', 'checkout', 'collection', 'contact',
    'order', 'orders', 'privacy', 'product', 'profile', 'returns',
    'shipping', 'silk', 'terms', 'wishlist',
] as const;

/**
 * Admin 404.
 *
 * Next resolves unmatched URLs against the ROOT not-found boundary, so this
 * renders inside app/layout.tsx — no admin sidebar. It is therefore built as a
 * self-contained card rather than a page fragment.
 *
 * Utilitarian on purpose: the storefront's 404 is customer-facing brand copy,
 * which reads wrong in a back office. This states what happened, shows the
 * path that missed so staff can quote it in a bug report, and offers a way out.
 *
 * Anonymous visitors never reach this — middleware redirects them to /login
 * first — so the audience is always signed-in staff.
 */
export default function NotFound() {
    const router = useRouter();
    const pathname = usePathname();

    // Since the split, the likeliest cause of a 404 here is an old bookmark:
    // a storefront path (/orders/x, /collection, /product/x) opened against the
    // admin host. Offer the storefront equivalent rather than a dead end.
    //
    // Matched against an explicit list of the storefront's top-level segments
    // rather than "anything that isn't /admin" — the loose version claimed
    // /login/typo was a storefront address, which is just wrong.
    const looksLikeStorefrontPath =
        !!pathname &&
        STOREFRONT_SEGMENTS.some(
            (seg) => pathname === `/${seg}` || pathname.startsWith(`/${seg}/`),
        );

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-lg">
                <div className="bg-white rounded-lg shadow p-8 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-50">
                        <SearchX className="h-7 w-7 text-amber-600" aria-hidden="true" />
                    </div>

                    <p className="mt-6 font-playfair text-5xl font-bold leading-none text-gray-900">404</p>
                    <h1 className="mt-2 text-lg font-semibold text-gray-900">
                        This page doesn&apos;t exist in the admin panel
                    </h1>
                    <p className="mt-2 text-sm text-gray-500">
                        The link may be out of date, or the page may have been moved or removed.
                    </p>

                    {pathname && (
                        <p className="mt-4 truncate rounded-md bg-gray-50 px-3 py-2 font-mono text-xs text-gray-600">
                            {pathname}
                        </p>
                    )}

                    {looksLikeStorefrontPath && (
                        <div className="mt-5 rounded-md border border-amber-200 bg-amber-50 p-4 text-left">
                            <p className="text-sm text-amber-900">
                                That looks like a storefront address. The public site now lives on a
                                separate domain — try it there.
                            </p>
                            <a
                                href={`${STOREFRONT_URL}${pathname}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-amber-800 underline underline-offset-2 hover:text-amber-900"
                            >
                                Open on the storefront
                                <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                            </a>
                        </div>
                    )}

                    <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
                        {/* /admin is safe for every role: useAdmin forwards a
                            cashier to /admin/pos and a marketing user to
                            /admin/blog, so one link lands everyone correctly. */}
                        <Link
                            href="/admin"
                            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-md bg-amber-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-amber-700"
                        >
                            <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
                            Go to admin panel
                        </Link>
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-md border border-gray-300 px-5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
                        >
                            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                            Go back
                        </button>
                    </div>
                </div>

                <p className="mt-4 text-center text-xs text-gray-400">
                    Pratyagra Silks — Admin
                </p>
            </div>
        </div>
    );
}
