import { getAllTags, getPostsByTag } from '@/lib/posts'
import ArticleCard from '@/components/ArticleCard'
import AdUnit from '@/components/AdUnit'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import {
  collectionPageJsonLd,
  formatTagLabel,
  getCategoryUrl,
  graphJsonLd,
  SITE_NAME,
} from '@/lib/seo'

interface Props {
  params: Promise<{ tag: string }>
}

export async function generateStaticParams() {
  return getAllTags().map(tag => ({ tag }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tag } = await params
  const label = formatTagLabel(tag)
  const description = `Browse all ${label} articles on AI Tools Hub — in-depth reviews, guides, and news.`

  return {
    title: `${label} Articles`,
    description,
    alternates: { canonical: `/category/${tag}` },
    openGraph: {
      title: `${label} Articles | ${SITE_NAME}`,
      description,
      type: 'website',
      url: getCategoryUrl(tag),
      siteName: SITE_NAME,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${label} Articles | ${SITE_NAME}`,
      description,
    },
  }
}

export const dynamicParams = false

export default async function CategoryPage({ params }: Props) {
  const { tag } = await params
  const posts = getPostsByTag(tag)
  if (posts.length === 0) notFound()
  const label = formatTagLabel(tag)
  const description = `Browse all ${label} articles on AI Tools Hub.`

  const jsonLd = graphJsonLd([
    {
      ...collectionPageJsonLd({
        name: `${label} Articles`,
        url: getCategoryUrl(tag),
        description,
        posts,
      }),
      numberOfItems: posts.length,
    },
  ])

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mb-8">
        <h1 className="text-heading text-3xl font-extrabold capitalize mb-1">{label}</h1>
        <p className="text-muted text-sm">{posts.length} article{posts.length !== 1 ? 's' : ''}</p>
      </div>

      <AdUnit slot="category-leaderboard" className="h-[100px] mb-8" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map(post => (
          <ArticleCard key={post.slug} post={post} />
        ))}
      </div>
    </>
  )
}
