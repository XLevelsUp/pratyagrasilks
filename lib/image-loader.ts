// Global Next.js Image loader: returns src verbatim. Guarantees zero calls to
// Vercel's /_next/image optimizer for any <Image> without its own per-instance
// loader (local assets, YouTube thumbnails, marketing images, admin thumbnails,
// blob: previews). Width-aware delivery for product photos is handled per-instance
// by KandangiProductImage's own loader — this one doesn't duplicate that logic.
export default function loader({ src }: { src: string; width: number; quality?: number }): string {
    return src;
}
