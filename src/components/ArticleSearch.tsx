'use client'

import { useMemo, useState } from 'react'
import ArticleCard from '@/components/ArticleCard'
import type { PostMeta } from '@/lib/posts'

function matchesPost(post: PostMeta, query: string) {
  const normalized = query.trim().toLowerCase()
  if (!normalized) return true

  const haystack = [
    post.title,
    post.description,
    post.slug,
    post.tags.join(' '),
  ].join(' ').toLowerCase()

  return normalized
    .split(/\s+/)
    .filter(Boolean)
    .every(term => haystack.includes(term))
}

export default function ArticleSearch({
  posts,
  featuredSlug,
}: {
  posts: PostMeta[]
  featuredSlug?: string
}) {
  const [query, setQuery] = useState('')
  const hasQuery = query.trim().length > 0
  const filtered = useMemo(
    () => posts.filter(post => (hasQuery || post.slug !== featuredSlug) && matchesPost(post, query)),
    [featuredSlug, hasQuery, posts, query],
  )

  return (
    <section>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <label className="relative block sm:w-[360px]">
          <span className="sr-only">Search articles</span>
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-muted">
            Search
          </span>
          <input
            type="search"
            value={query}
            onChange={event => setQuery(event.target.value)}
            placeholder="Search AI tools, agents, LLMs..."
            className="h-11 w-full rounded-full border border-indigo-100 bg-white pl-[72px] pr-4 text-sm text-body shadow-card outline-none transition focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100"
          />
        </label>
        <p className="text-xs text-muted">
          {hasQuery ? `${filtered.length} result${filtered.length === 1 ? '' : 's'}` : `${filtered.length} articles`}
        </p>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-indigo-100 bg-white/70 p-10 text-center">
          <p className="text-sm font-semibold text-heading">No articles found</p>
          <p className="mt-2 text-sm text-muted">Try a broader keyword such as agent, Claude, RAG, or coding.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(post => (
            <ArticleCard key={post.slug} post={post} />
          ))}
        </div>
      )}
    </section>
  )
}
