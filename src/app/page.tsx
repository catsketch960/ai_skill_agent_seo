import { getAllPosts } from '@/lib/posts'
import HeroBanner from '@/components/HeroBanner'
import SectionHeader from '@/components/SectionHeader'
import AdUnit from '@/components/AdUnit'
import ArticleSearch from '@/components/ArticleSearch'

export default function HomePage() {
  const posts = getAllPosts()
  const featured = posts[0]

  return (
    <>
      {featured && <HeroBanner post={featured} />}

      <AdUnit
        slot="homepage-leaderboard"
        format="rectangle"
        className="h-[100px] mb-8 mx-auto w-full max-w-4xl"
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
