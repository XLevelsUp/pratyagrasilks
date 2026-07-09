import CountUp from '@/components/motion/CountUp';
import Reveal from '@/components/motion/Reveal';
import { StaggerGroup, StaggerItem } from '@/components/motion/Stagger';
import { stats } from '@/lib/home-content';

// Social-proof band — count-up numerals animate on first viewport entry.
export default function StatsBand() {
    return (
        <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto text-center">
                <Reveal>
                    <h2 className="font-playfair text-3xl md:text-5xl font-bold text-primary mb-4">
                        Trusted by Silk Connoisseurs
                    </h2>
                    <p className="text-textSecondary text-lg max-w-2xl mx-auto mb-14">
                        Every saree is selected with meticulous care to ensure exceptional quality,
                        authentic craftsmanship, and timeless beauty.
                    </p>
                </Reveal>

                <StaggerGroup className="grid grid-cols-1 sm:grid-cols-3 gap-10 sm:gap-8">
                    {stats.map((stat) => (
                        <StaggerItem key={stat.label}>
                            <CountUp
                                to={stat.value}
                                suffix={stat.suffix}
                                className="font-playfair text-5xl md:text-6xl font-bold text-primary"
                            />
                            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-accent-700 mt-3">
                                {stat.label}
                            </p>
                        </StaggerItem>
                    ))}
                </StaggerGroup>
            </div>
        </section>
    );
}
