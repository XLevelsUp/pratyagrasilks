import type { Metadata } from 'next';
import { getPosts, getCategories } from '@/lib/actions/blog-public.actions';
import { siteMetadata } from '@/lib/seo/config';
import BlogListClient from '@/components/blog/BlogListClient';

const PAGE_SIZE = 9;

export const metadata: Metadata = {
    title: `Blog | ${siteMetadata.siteName}`,
    description:
        'Stories of heritage, craftsmanship, and Indian handloom traditions — from the loom to your wardrobe. Read the latest from Pratyagra Silks.',
    alternates: { canonical: `${siteMetadata.baseUrl}/blog` },
};

interface BlogPageProps {
    searchParams: { category?: string; tag?: string };
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
    const categorySlug = searchParams.category;
    const tag = searchParams.tag;

    const [{ posts, total }, categories] = await Promise.all([
        getPosts({ limit: PAGE_SIZE, offset: 0, categorySlug, tag }),
        getCategories(),
    ]);

    const schema = {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: `Blog | ${siteMetadata.siteName}`,
        description: 'Stories of heritage, craftsmanship, and Indian handloom traditions.',
        url: `${siteMetadata.baseUrl}/blog`,
        breadcrumb: {
            '@type': 'BreadcrumbList',
            itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Home', item: siteMetadata.baseUrl },
                { '@type': 'ListItem', position: 2, name: 'Blog', item: `${siteMetadata.baseUrl}/blog` },
            ],
        },
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
            />
            <div className="min-h-screen">
                <div className="relative bg-gradient-to-r from-primary to-primary-light text-white py-12">
                    <div className="container mx-auto px-4 relative z-10">
                        <p className="flex items-center gap-3 text-secondary text-xs font-medium tracking-[0.3em] uppercase mb-4">
                            <span className="inline-block w-8 h-px bg-secondary/70" aria-hidden="true" />
                            The Journal
                        </p>
                        <h1 className="font-playfair text-4xl md:text-5xl font-bold mb-2">Reviving Tradition, One Story at a Time</h1>
                        <p className="text-white/80 mt-2 max-w-3xl">
                            Heritage, craftsmanship, and behind-the-loom stories from Pratyagra Silks.
                        </p>
                    </div>
                </div>

                <div className="container mx-auto px-4 py-12 md:py-16">
                    <BlogListClient initialPosts={posts} initialTotal={total} categories={categories} />
                </div>
            </div>
        </>
    );
}
