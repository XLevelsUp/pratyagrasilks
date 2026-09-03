import Image from 'next/image';
import Link from 'next/link';
import { Lightbulb } from 'lucide-react';
import { isSupabaseImage } from '@pratyagra/core/utils/image';
import type { BlogPost } from '@pratyagra/core/types';

// Renders the fixed post structure as distinct blocks — never a single HTML
// blob — so each part (section, callout, sub-section, Q&A, CTA) keeps its
// own layout regardless of what the writer put in the rich-text bodies.
export default function PostBody({ post }: { post: BlogPost }) {
    return (
        <article className="space-y-10">
            {post.introHtml && (
                <div
                    className="prose prose-lg max-w-none prose-headings:font-playfair prose-headings:text-primary prose-a:text-accent"
                    dangerouslySetInnerHTML={{ __html: post.introHtml }}
                />
            )}

            {post.sections.map((section, i) => (
                <div key={section.id ?? i} className="space-y-4">
                    {section.blockType === 'callout' ? (
                        <div className="flex gap-3 bg-accent-light border border-accent-300/60 rounded-xl p-5">
                            <Lightbulb className="w-5 h-5 text-accent-700 flex-shrink-0 mt-0.5" />
                            <div>
                                {section.heading && (
                                    <p className="font-semibold text-accent-700 mb-1">{section.heading}</p>
                                )}
                                <div
                                    className="prose prose-sm max-w-none prose-a:text-accent"
                                    dangerouslySetInnerHTML={{ __html: section.bodyHtml }}
                                />
                            </div>
                        </div>
                    ) : (
                        <>
                            {section.heading && (
                                <h2 className="font-playfair text-2xl md:text-3xl font-bold text-primary">
                                    {section.heading}
                                </h2>
                            )}
                            <div
                                className="prose prose-lg max-w-none prose-headings:font-playfair prose-headings:text-primary prose-a:text-accent"
                                dangerouslySetInnerHTML={{ __html: section.bodyHtml }}
                            />
                        </>
                    )}

                    {section.subsections.map((sub, j) => (
                        <div key={sub.id ?? j} className="pl-4 border-l-2 border-primary-100 space-y-2">
                            {sub.heading && (
                                <h3 className="font-playfair text-xl font-semibold text-primary">{sub.heading}</h3>
                            )}
                            <div
                                className="prose max-w-none prose-a:text-accent"
                                dangerouslySetInnerHTML={{ __html: sub.bodyHtml }}
                            />
                        </div>
                    ))}

                    {section.secondImageUrl && (
                        <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-primary-50">
                            <Image
                                src={section.secondImageUrl}
                                alt={section.secondImageAlt ?? ''}
                                fill
                                className={section.secondImageMode === 'contain' ? 'object-contain' : 'object-cover'}
                                sizes="(max-width: 1024px) 100vw, 66vw"
                                unoptimized={isSupabaseImage(section.secondImageUrl)}
                            />
                        </div>
                    )}
                </div>
            ))}

            {post.qna.length > 0 && (
                <div className="space-y-5">
                    <h2 className="font-playfair text-2xl md:text-3xl font-bold text-primary">Q&amp;A</h2>
                    {post.qna.map((item, i) => (
                        <div key={item.id ?? i}>
                            <p className="font-semibold text-primary mb-1">{item.question}</p>
                            <p className="text-textSecondary leading-relaxed">{item.answer}</p>
                        </div>
                    ))}
                </div>
            )}

            {(post.ctaIntroText || post.ctaButtons.length > 0) && (
                <div className="bg-primary rounded-xl p-8 text-center">
                    {post.ctaIntroText && (
                        <p className="text-secondary text-lg mb-5 max-w-2xl mx-auto">{post.ctaIntroText}</p>
                    )}
                    {post.ctaButtons.length > 0 && (
                        <div className="flex flex-wrap items-center justify-center gap-3">
                            {post.ctaButtons.map((btn, i) => (
                                <Link
                                    key={btn.id ?? i}
                                    href={btn.url}
                                    className="inline-flex items-center gap-2 bg-secondary text-primary font-semibold px-6 py-3 rounded-full hover:bg-white transition-colors"
                                >
                                    {btn.label}
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </article>
    );
}
