import type { MetadataRoute } from 'next'
import { getAllPosts, getAllTags, getPostsByTag } from '@/lib/posts'
import { absoluteUrl, getCategoryUrl, getLatestPostDate, getPostUrl, SITE_URL } from '@/lib/seo'

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts()
  const tags = getAllTags()
  const latestPostDate = getLatestPostDate(posts)

  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: latestPostDate, changeFrequency: 'daily', priority: 1.0 },
    { url: `${SITE_URL}/blog`, lastModified: latestPostDate, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/about`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/contact`, changeFrequency: 'monthly', priority: 0.3 },
    { url: `${SITE_URL}/privacy-policy`, changeFrequency: 'yearly', priority: 0.2 },
  ]

  const postPages: MetadataRoute.Sitemap = posts.map(post => {
    const image = absoluteUrl(post.heroImage)

    return {
      url: getPostUrl(post.slug),
      lastModified: new Date(post.date),
      changeFrequency: 'weekly',
      priority: 0.8,
      ...(image ? { images: [image] } : {}),
    }
  })

  const categoryPages: MetadataRoute.Sitemap = tags.map(tag => ({
    url: getCategoryUrl(tag),
    lastModified: getLatestPostDate(getPostsByTag(tag)),
    changeFrequency: 'weekly',
    priority: 0.6,
  }))

  return [...staticPages, ...postPages, ...categoryPages]
}
