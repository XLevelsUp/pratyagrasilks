'use client';

import { useState } from 'react';
import Image from 'next/image';

interface KandangiProductImageProps {
    src: string;
    alt: string;
    /** LQIP from product.blurMap[src]; undefined for legacy images (falls back to shimmer) */
    blurDataURL?: string;
    /** Required so every call site declares its rendered width for correct srcset selection */
    sizes: string;
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
 * Serves responsive AVIF/WebP variants at quality 90 through the Next.js
 * optimizer, with an inline blur placeholder generated at upload time.
 * Note: blur, srcset, and AVIF are invisible in `npm run dev` (images are
 * globally unoptimized in development) — verify with a production build.
 */
export default function KandangiProductImage({
    src,
    alt,
    blurDataURL,
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

    return (
        <div className={`relative aspect-square overflow-hidden bg-primary-50 ${!hasBlur ? 'silk-shimmer' : ''} ${className}`}>
            <Image
                src={src}
                alt={alt}
                fill
                quality={quality}
                sizes={sizes}
                priority={priority}
                placeholder={hasBlur ? 'blur' : 'empty'}
                blurDataURL={blurDataURL}
                onLoad={() => setLoaded(true)}
                className={`object-cover ${!hasBlur ? `transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}` : ''} ${imgClassName}`}
            />
            {children}
        </div>
    );
}
