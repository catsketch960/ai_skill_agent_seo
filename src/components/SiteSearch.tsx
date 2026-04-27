'use client'

import { FormEvent, useTransition } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

export default function SiteSearch() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()
  const query = searchParams.get('q') ?? ''

  function buildHref(nextQuery: string) {
    const normalized = nextQuery.trim()
    return normalized ? `/?q=${encodeURIComponent(normalized)}` : '/'
  }

  function commit(nextQuery: string) {
    const href = buildHref(nextQuery)
    startTransition(() => {
      if (pathname === '/') {
        router.replace(href, { scroll: false })
      } else {
        router.push(href)
      }
    })
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    commit(query)
  }

  return (
    <form onSubmit={handleSubmit} className="hidden md:block md:flex-1 md:max-w-[540px]">
      <label className="relative block">
        <span className="sr-only">Search articles</span>
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-muted">
          Search
        </span>
        <input
          type="search"
          value={query}
          onChange={event => commit(event.target.value)}
          placeholder="Search AI tools, agents, LLMs..."
          className="h-11 w-full rounded-full border border-indigo-100 bg-white pl-[72px] pr-4 text-sm text-body shadow-card outline-none transition focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100"
        />
      </label>
    </form>
  )
}
