import { getAllPosts } from '@/lib/posts'
import HeroBanner from '@/components/HeroBanner'
import SectionHeader from '@/components/SectionHeader'
import AdUnit from '@/components/AdUnit'
import ArticleSearch from '@/components/ArticleSearch'

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'AI Tools Hub',
  url: 'https://aiatoolshub.site',
  description:
    'In-depth reviews and guides on AI tools, AI agents, LLMs, DeepSeek, Claude, and GPT.',
  publisher: { '@type': 'Organization', name: 'AI Tools Hub' },
}

export default function HomePage() {
  const posts = getAllPosts()
  const featured = posts[0]

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
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
