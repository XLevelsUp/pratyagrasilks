import type { MetadataRoute } from 'next'
import { silkCategories } from '@/lib/seo-config'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://pratyagrasilks.com'
  const now = new Date() // Updates to current build date automatically

  // Static pages with their priorities and change frequencies
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/collection`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.95,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/returns`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/shipping`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.7,
    },
  ]

  // Category pages - permanent SEO-optimized pages for each silk type
  // These are the primary SEO drivers instead of temporary product pages
  const categoryPages: MetadataRoute.Sitemap = silkCategories.map(category => ({
    url: `${baseUrl}/silk/${category.slug}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.9, // High priority for category pages
  }))

  // NOTE: Individual product pages are NOT included in the sitemap
  // because they are temporary (removed when sold). This prevents:
  // - High 404/410 rates that could harm SEO
  // - Wasted crawl budget on pages that will be removed
  // - Poor user experience from search results to sold items
  // 
  // Products remain crawlable via internal links and category pages,
  // but search engines won't prioritize them. When sold, they return
  // HTTP 410 Gone status to properly signal permanent removal.

  return [...staticPages, ...categoryPages]
}
