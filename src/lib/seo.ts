import type { PostMeta } from '@/lib/posts'

export const SITE_URL = 'https://aiatoolshub.site'
export const SITE_NAME = 'AI Tools Hub'
export const SITE_DESCRIPTION =
  'In-depth reviews and guides on AI tools, AI agents, LLMs, DeepSeek, Claude, and GPT.'

export const organizationJsonLd = {
  '@type': 'Organization',
  '@id': `${SITE_URL}/#organization`,
  name: SITE_NAME,
  url: SITE_URL,
}

export function absoluteUrl(pathname?: string | null) {
  if (!pathname) return undefined
  return new URL(pathname, SITE_URL).toString()
}

export function getPostUrl(slug: string) {
  return `${SITE_URL}/blog/${slug}`
}

export function getCategoryUrl(tag: string) {
  return `${SITE_URL}/category/${tag}`
}

export function formatTagLabel(tag: string) {
  return tag.replace(/-/g, ' ')
}

export function getLatestPostDate(posts: PostMeta[]) {
  const latest = posts
    .map(post => post.date)
    .filter(Boolean)
    .sort()
    .at(-1)

  return latest ? new Date(latest) : undefined
}

export function websiteJsonLd() {
  return {
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    publisher: { '@id': organizationJsonLd['@id'] },
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE_URL}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  }
}

export function itemListJsonLd(posts: PostMeta[]) {
  return {
    '@type': 'ItemList',
    itemListElement: posts.map((post, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: getPostUrl(post.slug),
      name: post.title,
    })),
  }
}

export function collectionPageJsonLd({
  name,
  url,
  description,
  posts,
}: {
  name: string
  url: string
  description: string
  posts: PostMeta[]
}) {
  return {
    '@type': 'CollectionPage',
    name,
    url,
    description,
    publisher: { '@id': organizationJsonLd['@id'] },
    mainEntity: itemListJsonLd(posts),
  }
}

export function graphJsonLd(nodes: object[]) {
  return {
    '@context': 'https://schema.org',
    '@graph': [organizationJsonLd, ...nodes],
  }
}
