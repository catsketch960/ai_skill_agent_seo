import { getAllPosts } from '@/lib/posts'
import HeroBanner from '@/components/HeroBanner'
import ArticleCard from '@/components/ArticleCard'
import SectionHeader from '@/components/SectionHeader'
import AdUnit from '@/components/AdUnit'

export default function HomePage() {
  const posts = getAllPosts()
  const featured = posts[0]
  const rest = posts.slice(1)

  return (
    <>
      {featured && <HeroBanner post={featured} />}

      <AdUnit slot="homepage-leaderboard" className="h-[100px] mb-8" />

      <SectionHeader title="Latest Articles" />

      {rest.length === 0 && (
        <p className="text-muted text-sm text-center py-20">
          Articles are on their way — check back soon.
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {rest.map(post => (
          <ArticleCard key={post.slug} post={post} />
        ))}
      </div>
    </>
  )
}
