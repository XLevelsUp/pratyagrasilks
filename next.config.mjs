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
            }
        ],
        // Disable Next.js Image Optimization for Supabase images (already optimized to WebP)
        // Allow unoptimized for large images to prevent timeout
        unoptimized: process.env.NODE_ENV === 'production' ? false : true,
        // Increase timeout for image optimization of large files
        minimumCacheTTL: 31536000, // 1 year
    },
    // Enable React strict mode for better development experience
    reactStrictMode: true,
    // Optimize for production
    swcMinify: true,
};

export default nextConfig;
