/**
 * The storefront is a separate deployment on a separate origin, so any link to
 * it from the admin app must be an absolute URL on a plain anchor — next/link
 * would try to client-navigate within the admin app and 404.
 */
export const STOREFRONT_URL =
    process.env.NEXT_PUBLIC_STOREFRONT_URL ?? 'https://pratyagrasilks.com';
