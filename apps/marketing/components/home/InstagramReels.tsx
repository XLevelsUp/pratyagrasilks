import ReelsCarousel from '@/components/home/ReelsCarousel';
import { getInstagramReels } from '@/lib/instagram';

const DEFAULT_PROFILE_URL = 'https://instagram.com/pratyagra_silks';
const DEFAULT_HANDLE = '@pratyagra_silks';

interface InstagramReelsProps {
    /** Server-only token override — never reaches the client */
    accessToken?: string;
    /** Profile the badge + Follow CTA link to; must match the token's account */
    profileUrl?: string;
    handle?: string;
}

// Server Component — fetches the 5 most recent reels (ISR-cached hourly, so
// a newly uploaded reel appears automatically and takes the centre slot).
// Returns null when the token is missing or the API fails so pages are
// never blocked by it. Playback/interaction lives in ReelsCarousel (client).
// `accessToken` switches the section to a different Instagram account,
// e.g. @pratyagra_designer on /collection.
export default async function InstagramReels({
    accessToken,
    profileUrl = DEFAULT_PROFILE_URL,
    handle = DEFAULT_HANDLE,
}: InstagramReelsProps) {
    const reels = await getInstagramReels(5, accessToken);

    if (reels.length === 0) {
        return null;
    }

    return (
        <section className="py-16 md:py-24 px-4 bg-primary-50 overflow-hidden">
            <div className="max-w-7xl mx-auto">
                {/* Editorial header */}
                <div className="text-center mb-12">
                    <span className="inline-block text-xs font-semibold tracking-[0.2em] uppercase text-accent-700 border border-accent-300 bg-accent-light px-4 py-1 rounded-full mb-5">
                        {handle}
                    </span>
                    <h2 className="font-playfair text-3xl md:text-5xl font-bold text-primary mb-4">
                        Reels from the Loom
                    </h2>
                    <p className="text-textSecondary text-lg leading-relaxed max-w-2xl mx-auto">
                        Drapes, weaves, and behind-the-loom moments — our five latest reels,
                        fresh from Instagram.
                    </p>
                </div>

                <ReelsCarousel reels={reels} />

                {/* Follow CTA */}
                <div className="text-center mt-12">
                    <a
                        href={profileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-primary text-secondary font-semibold px-8 py-3.5 rounded-full hover:bg-primary-light transition-all duration-300 hover:scale-105 shadow-lg"
                    >
                        Follow on Instagram
                        <span aria-hidden="true">→</span>
                    </a>
                </div>
            </div>
        </section>
    );
}
