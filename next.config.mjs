/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        serverActions: {
            bodySizeLimit: '50mb',
        },
        // Tree-shake icon/util barrel imports so only used exports ship to the client
        optimizePackageImports: ['lucide-react'],
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
        // AVIF first for smaller high-fidelity variants; WebP fallback
        formats: ['image/avif', 'image/webp'],
        // Top bucket matches the 2560px upload masters (default 3840 would never be filled)
        deviceSizes: [640, 750, 828, 1080, 1200, 1600, 1920, 2560],
        imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
        // Dev skips optimization for fast HMR — blur/srcset/AVIF only observable in production builds
        unoptimized: process.env.NODE_ENV === 'production' ? false : true,
        minimumCacheTTL: 31536000, // 1 year
    },
    // Enable React strict mode for better development experience
    reactStrictMode: true,
    // Optimize for production
    swcMinify: true,
};

export default nextConfig;
