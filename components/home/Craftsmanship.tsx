import Image from 'next/image';
import Parallax from '@/components/motion/Parallax';
import Reveal from '@/components/motion/Reveal';
import { craftSteps, benefits } from '@/lib/home-content';

// Dark scrollytelling act: sticky parallax image on the left, story steps
// scrolling past on the right. Absorbs the old heritage prose + benefits.
export default function Craftsmanship() {
    return (
        <section id="craft" className="bg-primary-900 text-secondary/90 py-20 md:py-28 px-4 sm:px-6 lg:px-8 scroll-mt-20">
            <div className="max-w-7xl mx-auto">
                <Reveal className="max-w-2xl mb-16 lg:mb-24">
                    <p className="flex items-center gap-4 text-secondary text-xs font-medium tracking-[0.3em] uppercase mb-5">
                        <span className="inline-block w-10 h-px bg-secondary/60" aria-hidden="true" />
                        Our Heritage &amp; Ethos
                    </p>
                    <h2 className="font-playfair text-3xl md:text-5xl font-bold text-white leading-tight">
                        Every thread is a testament to tradition
                    </h2>
                </Reveal>

                <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
                    {/* Sticky parallax image */}
                    <div className="lg:sticky lg:top-24 lg:self-start">
                        <Parallax
                            speed={0.1}
                            className="relative overflow-hidden rounded-2xl aspect-[4/5] border border-secondary/20"
                        >
                            <Image
                                src="/iconic_saree.webp"
                                alt="Handwoven Banarasi silk saree — intricate zari brocade detail"
                                fill
                                sizes="(min-width: 1024px) 45vw, 92vw"
                                quality={60}
                                className="object-cover"
                            />
                            <video
                                autoPlay
                                muted
                                loop
                                playsInline
                                preload="none"
                                aria-hidden="true"
                                className="absolute inset-0 h-full w-full object-cover animate-[fadeIn_1s_ease-in_1s_forwards] opacity-0"
                            >
                                <source src="/Heritage_of_silks.webm" type="video/webm" />
                            </video>
                        </Parallax>
                    </div>

                    {/* Story steps */}
                    <div>
                        {craftSteps.map((step) => (
                            <Reveal key={step.index} y={32} className="py-[9vh] first:pt-0 lg:py-[14vh] lg:first:pt-8">
                                <span
                                    className="block font-playfair text-6xl md:text-7xl font-bold text-secondary/15 mb-4 select-none"
                                    aria-hidden="true"
                                >
                                    {step.index}
                                </span>
                                <h3 className="font-playfair text-2xl md:text-3xl font-semibold text-white mb-4">
                                    {step.title}
                                </h3>
                                <p className="text-secondary/80 text-lg leading-relaxed max-w-lg">{step.body}</p>
                            </Reveal>
                        ))}

                        {/* Benefits micro-grid */}
                        <Reveal className="grid grid-cols-2 gap-x-8 gap-y-8 mt-6 lg:mt-10">
                            {benefits.map((benefit) => (
                                <div key={benefit.title} className="border-t border-secondary/25 pt-4">
                                    <h4 className="text-xs font-semibold tracking-[0.2em] uppercase text-secondary mb-2">
                                        {benefit.title}
                                    </h4>
                                    <p className="text-secondary/70 text-sm leading-relaxed">{benefit.description}</p>
                                </div>
                            ))}
                        </Reveal>
                    </div>
                </div>

                {/* Pull-quote finale */}
                <Reveal className="mt-20 lg:mt-28 text-center">
                    <blockquote className="font-playfair italic text-2xl md:text-4xl text-white leading-snug max-w-3xl mx-auto">
                        &ldquo;Experience luxury that honors tradition.
                        <span className="text-secondary"> Experience Pratyagra Silks.&rdquo;</span>
                    </blockquote>
                </Reveal>
            </div>
        </section>
    );
}
