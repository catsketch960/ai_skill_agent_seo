import { getAllTags, getPostsByTag } from '@/lib/posts'
import ArticleCard from '@/components/ArticleCard'
import AdUnit from '@/components/AdUnit'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

interface Props {
  params: Promise<{ tag: string }>
}

export async function generateStaticParams() {
  return getAllTags().map(tag => ({ tag }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tag } = await params
  const label = tag.replace(/-/g, ' ')
  return {
    title: `${label} Articles`,
    description: `Browse all ${label} articles on AI Tools Hub — in-depth reviews, guides, and news.`,
  }
}

export default async function CategoryPage({ params }: Props) {
  const { tag } = await params
  const posts = getPostsByTag(tag)
  if (posts.length === 0) notFound()
  const label = tag.replace(/-/g, ' ')

  const collectionJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${label} Articles`,
    url: `https://aiatoolshub.site/category/${tag}`,
    description: `Browse all ${label} articles on AI Tools Hub.`,
    publisher: { '@type': 'Organization', name: 'AI Tools Hub' },
    numberOfItems: posts.length,
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
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
