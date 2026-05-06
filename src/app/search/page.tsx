import { Suspense } from 'react'
import { getAllPosts } from '@/lib/posts'
import SearchResults from '@/components/SearchResults'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Search',
  robots: { index: false, follow: true },
  alternates: { canonical: '/search' },
}

export default function SearchPage() {
  const posts = getAllPosts()

  return (
    <Suspense
      fallback={
        <section className="rounded-2xl border border-indigo-100 bg-white/75 px-5 py-12 text-center shadow-card">
          <p className="text-sm text-muted">Loading search…</p>
        </section>
      }
    >
      <SearchResults posts={posts} />
    </Suspense>
  )
}
