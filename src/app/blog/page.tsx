import { getAllPosts } from '@/lib/posts'
import ArticleCard from '@/components/ArticleCard'
import AdUnit from '@/components/AdUnit'
import type { Metadata } from 'next'
import { collectionPageJsonLd, graphJsonLd, SITE_NAME, SITE_URL } from '@/lib/seo'

const description =
  'Browse all AI tool reviews, agent tutorials, LLM deep dives, and developer guides on AI Tools Hub.'

export const metadata: Metadata = {
  title: 'Blog — All Articles',
  description,
  alternates: { canonical: '/blog' },
  openGraph: {
    title: `Blog — All Articles | ${SITE_NAME}`,
    description,
    type: 'website',
    url: `${SITE_URL}/blog`,
    siteName: SITE_NAME,
  },
  twitter: {
    card: 'summary_large_image',
    title: `Blog — All Articles | ${SITE_NAME}`,
    description,
  },
}

export default function BlogPage() {
  const posts = getAllPosts()
  const jsonLd = graphJsonLd([
    collectionPageJsonLd({
      name: 'All AI Tools Hub articles',
      url: `${SITE_URL}/blog`,
      description,
      posts,
    }),
  ])

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mb-8">
        <h1 className="text-heading text-3xl font-extrabold mb-1">All Articles</h1>
        <p className="text-muted text-sm">{posts.length} articles published</p>
      </div>

      <AdUnit slot="blog-leaderboard" className="h-[100px] mb-8" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map(post => (
          <ArticleCard key={post.slug} post={post} />
        ))}
      </div>
    </>
  )
}
