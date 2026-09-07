'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, Clock, ArrowRight } from 'lucide-react';
import { isSupabaseImage } from '@pratyagra/core/utils/image';
import type { BlogPost, BlogCategory } from '@pratyagra/core/types';

const PAGE_SIZE = 9;

interface BlogListClientProps {
    initialPosts: BlogPost[];
    initialTotal: number;
    categories: BlogCategory[];
}

export default function BlogListClient({ initialPosts, initialTotal, categories }: BlogListClientProps) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const activeCategory = searchParams.get('category') || 'all';
    const activeTag = searchParams.get('tag') || undefined;

    const [posts, setPosts] = useState<BlogPost[]>(initialPosts);
    const [total, setTotal] = useState(initialTotal);
    const [loadingMore, setLoadingMore] = useState(false);

    // Re-sync when the URL (category/tag) changes and the server re-fetches
    // a new initialPosts — useState's initial value only applies on mount,
    // so without this the list stays stuck on whatever loaded first.
    useEffect(() => {
        setPosts(initialPosts);
        setTotal(initialTotal);
    }, [initialPosts, initialTotal]);

    const selectCategory = (slug: string) => {
        const params = new URLSearchParams();
        if (slug !== 'all') params.set('category', slug);
        router.push(`/blog${params.toString() ? `?${params.toString()}` : ''}`);
    };

    const loadMore = async () => {
        setLoadingMore(true);
        try {
            const params = new URLSearchParams({
                limit: String(PAGE_SIZE),
                offset: String(posts.length),
            });
            if (activeCategory !== 'all') params.set('category', activeCategory);
            if (activeTag) params.set('tag', activeTag);

            const res = await fetch(`/api/blog/posts?${params.toString()}`);
            if (!res.ok) throw new Error('Failed to load more posts');
            const data = await res.json() as { posts: (Omit<BlogPost, 'publishedAt' | 'createdAt' | 'updatedAt'> & { publishedAt: string; createdAt: string; updatedAt: string })[]; total: number };

            const next = data.posts.map((p) => ({
                ...p,
                publishedAt: new Date(p.publishedAt),
                createdAt: new Date(p.createdAt),
                updatedAt: new Date(p.updatedAt),
            })) as BlogPost[];

            setPosts((prev) => [...prev, ...next]);
            setTotal(data.total);
        } catch {
            // Non-fatal — the button just stays visible for a retry
        } finally {
            setLoadingMore(false);
        }
    };

    return (
        <div>
            {/* Category filter pills */}
            <div className="flex flex-wrap gap-2 mb-10">
                <button
                    onClick={() => selectCategory('all')}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        activeCategory === 'all'
                            ? 'bg-primary text-secondary'
                            : 'bg-primary-50 text-primary hover:bg-primary-100'
                    }`}
                >
                    All Posts
                </button>
                {categories.map((cat) => (
                    <button
                        key={cat.slug}
                        onClick={() => selectCategory(cat.slug)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                            activeCategory === cat.slug
                                ? 'bg-primary text-secondary'
                                : 'bg-primary-50 text-primary hover:bg-primary-100'
                        }`}
                    >
                        {cat.name}
                    </button>
                ))}
            </div>

            {activeTag && (
                <p className="text-sm text-textSecondary mb-6">
                    Showing posts tagged <span className="font-medium text-primary">#{activeTag}</span>
                </p>
            )}

            {posts.length === 0 ? (
                <p className="text-center text-textSecondary py-16">No posts found.</p>
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {posts.map((post) => (
                            <Link
                                key={post.id}
                                href={`/blog/${post.slug}`}
                                className="group block rounded-xl overflow-hidden bg-white shadow-md hover:shadow-xl transition-shadow"
                            >
                                <div className="relative aspect-[4/3] bg-primary-50">
                                    {post.featuredImageUrl && (
                                        <Image
                                            src={post.featuredImageUrl}
                                            alt={post.featuredImageAlt ?? post.title}
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                            unoptimized={isSupabaseImage(post.featuredImageUrl)}
                                        />
                                    )}
                                </div>
                                <div className="p-5">
                                    {post.category && (
                                        <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-primary-50 text-primary mb-3">
                                            {post.category.name}
                                        </span>
                                    )}
                                    <h3 className="font-playfair text-lg font-bold text-primary mb-2 line-clamp-2 group-hover:text-accent transition-colors">
                                        {post.title}
                                    </h3>
                                    <div className="flex items-center gap-4 text-xs text-textSecondary/70 mb-4">
                                        <span className="flex items-center gap-1">
                                            <Calendar className="w-3.5 h-3.5" />
                                            {post.publishedAt.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-3.5 h-3.5" />
                                            {post.readingTimeMinutes} min read
                                        </span>
                                    </div>
                                    <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent group-hover:gap-2.5 transition-all">
                                        Read More
                                        <ArrowRight className="w-4 h-4" />
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>

                    {posts.length < total && (
                        <div className="text-center mt-12">
                            <button
                                onClick={loadMore}
                                disabled={loadingMore}
                                className="px-8 py-3 border-2 border-primary text-primary rounded-full font-semibold hover:bg-primary hover:text-secondary transition-colors disabled:opacity-50"
                            >
                                {loadingMore ? 'Loading…' : 'Load More'}
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
