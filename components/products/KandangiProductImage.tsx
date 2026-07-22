'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';

interface KandangiProductImageProps {
    src: string;
    alt: string;
    /** LQIP from product.blurMap[src]; undefined for legacy images (falls back to shimmer) */
    blurDataURL?: string;
    /** Width(px) -> pre-generated variant public URL for this image, e.g.
     *  product.imageVariants?.[src]. Undefined/empty for legacy images — every
     *  requested width then falls back to `src` (the real canonical file). */
    variantMap?: Record<number, string>;
    /** Required so every call site declares its rendered width for correct srcset selection */
    sizes: string;
    /** No-op once variantMap resolves a match — variants are pre-baked at a fixed quality */
    quality?: number;
    priority?: boolean;
    /** Extra classes on the aspect-square wrapper */
    className?: string;
    /** Extra classes on the <Image> itself (e.g. hover scale, grayscale) */
    imgClassName?: string;
    /** Overlays rendered inside the 1:1 frame (WatermarkOverlay, badges, wishlist button) */
    children?: React.ReactNode;
}

/**
 * High-fidelity 1:1 product image for Kandangi saree weave detail.
 *
 * Serves self-hosted, pre-generated WebP width variants via a per-instance
 * Next.js Image loader (never Vercel's /_next/image optimizer — see
 * lib/image-loader.ts for why), with an inline blur placeholder generated at
 * upload time.
 */
export default function KandangiProductImage({
    src,
    alt,
    blurDataURL,
    variantMap,
    sizes,
    quality = 100,
    priority = false,
    className = '',
    imgClassName = '',
    children,
}: KandangiProductImageProps) {
    const [loaded, setLoaded] = useState(false);

    // With a blur placeholder, Next.js handles the swap — an opacity fade would
    // only delay perceived LCP on priority images. The fade is the legacy
    // (no-blur) loading state, paired with the silk-shimmer background.
    const hasBlur = Boolean(blurDataURL);

    // Picks the smallest pre-generated tier that's >= the width Next asks for.
    // Falls back to `src` (the real, confirmed-existing canonical file) when no
    // tier qualifies or variantMap is empty — always safe, never guesses a filename.
    const loader = useMemo(() => {
        const widths = variantMap
            ? Object.keys(variantMap).map(Number).filter(Number.isFinite).sort((a, b) => a - b)
            : [];
        return ({ src: imgSrc, width }: { src: string; width: number; quality?: number }) => {
            const match = widths.find((w) => w >= width);
            return match !== undefined ? variantMap![match] : imgSrc;
        };
    }, [variantMap]);

    return (
        <div className={`relative aspect-square overflow-hidden bg-primary-50 ${!hasBlur ? 'silk-shimmer' : ''} ${className}`}>
            <Image
                src={src}
                alt={alt}
                fill
                quality={quality}
                sizes={sizes}
                priority={priority}
                loader={loader}
                placeholder={hasBlur ? 'blur' : 'empty'}
                blurDataURL={blurDataURL}
                onLoad={() => setLoaded(true)}
                className={`object-cover ${!hasBlur ? `transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}` : ''} ${imgClassName}`}
            />
            {children}
        </div>
    );
}
