// The admin portal is a separate deployment on its own subdomain.
const ADMIN_URL = process.env.NEXT_PUBLIC_ADMIN_URL ?? 'https://admin.pratyagrasilks.com';

/** @type {import('next').NextConfig} */
const nextConfig = {
    // Workspace packages ship raw TS/TSX and are compiled with this app's SWC
    // config. Without this, Next treats node_modules as pre-compiled: the TSX
    // fails to parse, and 'use client' directives are not honoured.
    transpilePackages: ['@pratyagra/core', '@pratyagra/ui', '@pratyagra/auth'],
    async headers() {
        return [
            {
                // Transactional and private routes — strongest noindex signal.
                // 'admin' is no longer listed: those URLs 301 to the admin
                // host, which noindexes every response at the header level.
                source: '/(cart|checkout|orders|profile|auth)(.*)',
                headers: [
                    { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
                ],
            },
        ];
    },
    async redirects() {
        return [
            // The admin portal moved to its own deployment and origin. These
            // use statusCode: 301 rather than `permanent: true` — Next emits
            // 308 for `permanent`, and 301 is what was specified.
            // Declared here rather than in vercel.json so `next dev` exercises
            // them too, and because redirects run ahead of middleware: /admin/*
            // never pays for the bot check or a Supabase round trip.
            {
                source: '/admin',
                destination: `${ADMIN_URL}/admin`,
                statusCode: 301,
            },
            {
                source: '/admin/:path*',
                destination: `${ADMIN_URL}/admin/:path*`,
                statusCode: 301,
            },
            {
                source: '/x',
                destination: 'https://x.com/PratyagraSilks',
                permanent: true,
            },
            {
                source: '/reddit',
                destination: 'https://reddit.com/user/Pratyagra_silks',
                permanent: true,
            },
            {
                source: '/blogger',
                destination: 'https://pratyagrasilks.blogspot.com',
                permanent: true,
            },
            {
                source: '/pinterest',
                destination: 'https://pin.it/2Uc1Y596H',
                permanent: true,
            },
            {
                source: '/instagram',
                destination: 'https://instagram.com/pratyagra_silks',
                permanent: true,
            },
            {
                source: '/youtube',
                destination: 'https://youtube.com/@pratyagrasilks',
                permanent: true,
            },
            {
                source: '/facebook',
                destination: 'https://facebook.com/pratyagrasilks',
                permanent: true,
            },
        ];
    },
    experimental: {
        serverActions: {
            bodySizeLimit: '50mb',
        },
    },
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**.supabase.co',
            },
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
            },
            {
                protocol: 'https',
                hostname: 'images.pixieset.com',
            },
            {
                protocol: 'https',
                hostname: 'img.youtube.com',
            },
            {
                protocol: 'https',
                hostname: 'lh3.googleusercontent.com',
            },
            {
                // Instagram reel thumbnails (signed CDN URLs)
                protocol: 'https',
                hostname: '**.cdninstagram.com',
            },
            {
                protocol: 'https',
                hostname: '**.fbcdn.net',
            }
        ],
        // Skip optimization in dev only — production always optimizes
        unoptimized: process.env.NODE_ENV === 'production' ? false : true,
        // AVIF first (30-50% smaller than WebP for photography), WebP fallback
        formats: ['image/avif', 'image/webp'],
        // Each transformed variant is cached for a year — encode cost paid once
        minimumCacheTTL: 31536000, // 1 year
    },
    // Enable React strict mode for better development experience
    reactStrictMode: true,
    // Optimize for production
    swcMinify: true,
};

export default nextConfig;
