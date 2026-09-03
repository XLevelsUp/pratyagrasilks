/** @type {import('next').NextConfig} */
const nextConfig = {
    // Workspace packages ship raw TS/TSX and are compiled with this app's SWC
    // config. Without this, Next treats node_modules as pre-compiled: the TSX
    // fails to parse, and 'use client' directives are not honoured.
    transpilePackages: ['@pratyagra/core', '@pratyagra/ui', '@pratyagra/auth'],

    async headers() {
        return [
            {
                // The entire admin host is private — noindex everything, rather
                // than enumerating paths the way the storefront has to.
                source: '/(.*)',
                headers: [
                    { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
                ],
            },
        ];
    },

    // Product and blog image uploads post large payloads through server actions.
    experimental: {
        serverActions: { bodySizeLimit: '50mb' },
    },

    images: {
        // Admin only ever renders Supabase-hosted media and Google avatars;
        // the storefront's Instagram/Unsplash/YouTube patterns aren't needed.
        remotePatterns: [
            { protocol: 'https', hostname: '**.supabase.co' },
            { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
        ],
        unoptimized: process.env.NODE_ENV !== 'production',
        formats: ['image/avif', 'image/webp'],
        minimumCacheTTL: 31536000, // 1 year
    },

    reactStrictMode: true,
    swcMinify: true,
};

export default nextConfig;
