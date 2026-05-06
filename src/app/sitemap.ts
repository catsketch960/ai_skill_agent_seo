import type { MetadataRoute } from 'next'
import { getAllPosts, getAllTags } from '@/lib/posts'

const SITE = 'https://aiatoolshub.site'

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts()
  const tags = getAllTags()

  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${SITE}/blog`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE}/about`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE}/contact`, changeFrequency: 'monthly', priority: 0.3 },
    { url: `${SITE}/privacy-policy`, changeFrequency: 'yearly', priority: 0.2 },
  ]

  const postPages: MetadataRoute.Sitemap = posts.map(post => ({
    url: `${SITE}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  const categoryPages: MetadataRoute.Sitemap = tags.map(tag => ({
    url: `${SITE}/category/${tag}`,
    changeFrequency: 'weekly',
    priority: 0.6,
  }))

  return [...staticPages, ...postPages, ...categoryPages]
}
