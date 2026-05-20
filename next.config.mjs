/** @type {import('next').NextConfig} */
const nextConfig = {
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
            }
        ],
        minimumCacheTTL: 31536000, // 1 year cache for extreme performance
        formats: ['image/avif', 'image/webp'],
    },
    // Enable React strict mode for better development experience
    reactStrictMode: true,
    // Optimize for production
    swcMinify: true,
};

export default nextConfig;
