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
