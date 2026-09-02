import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { getPostBySlug, getApprovedComments } from '@/lib/actions/blog.actions';
import { siteMetadata } from '@/lib/seo/config';
import { isSupabaseImage } from '@/lib/utils/image';
import BlogPostSchema from '@/components/seo/BlogPostSchema';
import PostBody from '@/components/blog/PostBody';
import PostSidebar from '@/components/blog/PostSidebar';
import CommentSection from '@/components/blog/CommentSection';

interface BlogPostPageProps {
    params: { slug: string };
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
    const post = await getPostBySlug(params.slug);
    if (!post) return { title: `Post Not Found | ${siteMetadata.siteName}` };

    const description = post.metaDescription ?? undefined;
    const url = `${siteMetadata.baseUrl}/blog/${post.slug}`;

    return {
        title: `${post.title} | ${siteMetadata.siteName}`,
        description,
        openGraph: {
            title: post.title,
            description,
            url,
            type: 'article',
            images: post.featuredImageUrl ? [{ url: post.featuredImageUrl }] : [],
            siteName: siteMetadata.siteName,
        },
        twitter: {
            card: 'summary_large_image',
            title: post.title,
            description,
            images: post.featuredImageUrl ? [post.featuredImageUrl] : [],
        },
        alternates: { canonical: url },
    };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
    const post = await getPostBySlug(params.slug);
    if (!post) notFound();

    const comments = await getApprovedComments(post.id);
    const shareUrl = `${siteMetadata.baseUrl}/blog/${post.slug}`;

    return (
        <>
            <BlogPostSchema post={post} />
            <div className="min-h-screen">
                <div className="max-w-4xl mx-auto px-4 pt-10 md:pt-14 text-center">
                    <div className="flex items-center justify-center gap-3 text-sm text-textSecondary/70 mb-5">
                        {post.category && (
                            <span className="px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase bg-accent-light text-accent-700">
                                {post.category.name}
                            </span>
                        )}
                        <span className="flex items-center gap-3">
                            {post.publishedAt.toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
                            <span aria-hidden="true">&middot;</span>
                            {post.readingTimeMinutes} min read
                        </span>
                    </div>
                    <h1 className="font-playfair text-3xl md:text-5xl font-bold text-primary">
                        {post.title}
                    </h1>
                </div>

                {post.featuredImageUrl && (
                    <div className="max-w-6xl mx-auto px-4 mt-8 md:mt-10">
                        <div className="relative w-full h-[45vh] md:h-[55vh] rounded-2xl overflow-hidden bg-primary-50">
                            <Image
                                src={post.featuredImageUrl}
                                alt={post.featuredImageAlt ?? post.title}
                                fill
                                priority
                                className={post.featuredImageMode === 'contain' ? 'object-contain' : 'object-cover'}
                                sizes="(max-width: 1280px) 100vw, 1152px"
                                unoptimized={isSupabaseImage(post.featuredImageUrl)}
                            />
                        </div>
                    </div>
                )}

                <div className="max-w-6xl mx-auto px-4 py-12 md:py-16">
                    <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-12">
                        <PostBody post={post} />
                        <PostSidebar post={post} commentCount={comments.length} shareUrl={shareUrl} />
                    </div>

                    <div className="max-w-3xl mx-auto mt-16 pt-12 border-t border-primary-100">
                        <CommentSection postId={post.id} initialComments={comments} />
                    </div>
                </div>
            </div>
        </>
    );
}
