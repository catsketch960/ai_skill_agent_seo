'use client'

import { useDeferredValue, useMemo } from 'react'
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
  initialQuery = '',
}: {
  posts: PostMeta[]
  featuredSlug?: string
  initialQuery?: string
}) {
  const deferredQuery = useDeferredValue(initialQuery)
  const hasQuery = deferredQuery.trim().length > 0
  const filtered = useMemo(
    () => posts.filter(post => (hasQuery || post.slug !== featuredSlug) && matchesPost(post, deferredQuery)),
    [deferredQuery, featuredSlug, hasQuery, posts],
  )

  return (
    <section>
      <div className="mb-5 flex items-center justify-end">
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
