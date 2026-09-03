import { siteMetadata } from '@/lib/seo/config';
import type { BlogPost } from '@pratyagra/core/types';

export default function BlogPostSchema({ post }: { post: BlogPost }) {
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: post.title,
        description: post.metaDescription ?? undefined,
        image: post.featuredImageUrl ? [post.featuredImageUrl] : undefined,
        datePublished: post.publishedAt.toISOString(),
        dateModified: post.updatedAt.toISOString(),
        author: {
            '@type': 'Organization',
            name: post.author,
        },
        publisher: {
            '@type': 'Organization',
            name: siteMetadata.siteName,
            logo: {
                '@type': 'ImageObject',
                url: `${siteMetadata.baseUrl}/logo.png`,
            },
        },
        mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': `${siteMetadata.baseUrl}/blog/${post.slug}`,
        },
    };

    const breadcrumbSchema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: siteMetadata.baseUrl },
            { '@type': 'ListItem', position: 2, name: 'Blog', item: `${siteMetadata.baseUrl}/blog` },
            { '@type': 'ListItem', position: 3, name: post.title, item: `${siteMetadata.baseUrl}/blog/${post.slug}` },
        ],
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
            />
        </>
    );
}
