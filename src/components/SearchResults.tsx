'use client'

import { useSearchParams } from 'next/navigation'
import ArticleSearch from '@/components/ArticleSearch'
import type { PostMeta } from '@/lib/posts'

export default function SearchResults({ posts }: { posts: PostMeta[] }) {
  const searchParams = useSearchParams()
  const query = searchParams.get('q') ?? ''

  return (
    <section>
      <div className="mb-6 rounded-2xl border border-indigo-100 bg-white/75 px-5 py-4 shadow-card">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">Search</p>
        <h1 className="mt-2 text-2xl font-extrabold text-heading">
          {query ? `Results for "${query}"` : 'Search the article library'}
        </h1>
        <p className="mt-2 text-sm text-muted">
          Search by topic, model name, framework, or use case.
        </p>
      </div>

      <ArticleSearch posts={posts} initialQuery={query} />
    </section>
  )
}
