import { getAllPosts } from '@/lib/posts'
import ArticleCard from '@/components/ArticleCard'
import AdUnit from '@/components/AdUnit'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Blog — All Articles',
  description:
    'Browse all AI tool reviews, agent tutorials, LLM deep dives, and developer guides on AI Tools Hub.',
}

export default function BlogPage() {
  const posts = getAllPosts()

  return (
    <>
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
