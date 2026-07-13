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
        // Trimmed to match the 4 widths self-hosted variants are actually generated at
        // (see lib/services/image.service.ts) — every deviceSize maps onto a real file.
        deviceSizes: [640, 1080, 1600, 2560],
        imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
        // Custom loader replaces Next's built-in optimizer entirely — /_next/image is
        // never called (Vercel Image Optimization on this project is quota-blocked:
        // 402 OPTIMIZED_IMAGE_REQUEST_PAYMENT_REQUIRED). Self-hosted width variants
        // (see lib/services/image.service.ts + lib/image-loader.ts) replace it instead.
        loader: 'custom',
        loaderFile: './lib/image-loader.ts',
        // MUST be false — Next emits a single flat <img src> with no srcSet whenever
        // this is true, regardless of loader. It's the loader (not this flag) that
        // keeps us off Vercel's optimizer now.
        unoptimized: false,
        minimumCacheTTL: 31536000, // 1 year
    },
    // Enable React strict mode for better development experience
    reactStrictMode: true,
    // Optimize for production
    swcMinify: true,
};

export default nextConfig;
