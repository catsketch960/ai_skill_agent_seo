import { getAllPosts } from '@/lib/posts'
import HeroBanner from '@/components/HeroBanner'
import SectionHeader from '@/components/SectionHeader'
import AdUnit from '@/components/AdUnit'
import ArticleSearch from '@/components/ArticleSearch'
import { collectionPageJsonLd, graphJsonLd, SITE_DESCRIPTION, SITE_URL, websiteJsonLd } from '@/lib/seo'

export default function HomePage() {
  const posts = getAllPosts()
  const featured = posts[0]
  const jsonLd = graphJsonLd([
    websiteJsonLd(),
    collectionPageJsonLd({
      name: 'Latest AI tools and agents articles',
      url: SITE_URL,
      description: SITE_DESCRIPTION,
      posts: posts.slice(0, 24),
    }),
  ])

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {featured && <HeroBanner post={featured} />}

      <AdUnit
        slot="homepage-leaderboard"
        format="rectangle"
        className="h-[50px] mb-8 w-full"
      />

      <SectionHeader title="Latest Articles" />

      {posts.length <= 1 && (
        <p className="text-muted text-sm text-center py-20">
          Articles are on their way — check back soon.
        </p>
      )}

      <ArticleSearch posts={posts} featuredSlug={featured?.slug} />
    </>
  )
}
