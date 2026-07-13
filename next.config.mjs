/** @type {import('next').NextConfig} */
const nextConfig = {
    async headers() {
        return [
            {
                // Transactional and private routes — strongest noindex signal
                source: '/(cart|checkout|orders|profile|auth|admin)(.*)',
                headers: [
                    { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
                ],
            },
        ];
    },
    async redirects() {
        return [
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
