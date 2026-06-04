/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        serverActions: {
            bodySizeLimit: '50mb',
        },
    },
    async redirects() {
        return [
            {
                source: '/silk/:category',
                destination: '/collection/:category',
                permanent: true,
            },
            {
                source: '/collection/kadhi-cotton',
                destination: '/collection/khadi-cotton',
                permanent: true,
            },
        ];
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
