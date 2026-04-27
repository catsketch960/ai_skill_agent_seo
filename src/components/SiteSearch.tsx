'use client'

import { usePathname, useSearchParams } from 'next/navigation'

export default function SiteSearch() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const query = pathname === '/search' ? (searchParams.get('q') ?? '') : ''

  return (
    <form
      key={`${pathname}:${query}`}
      action="/search"
      className="hidden md:block md:flex-1 md:max-w-[540px]"
    >
      <label className="relative block">
        <span className="sr-only">Search articles</span>
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-muted">
          Search
        </span>
        <input
          type="search"
          name="q"
          defaultValue={query}
          placeholder="Search AI tools, agents, LLMs..."
          className="h-11 w-full rounded-full border border-indigo-100 bg-white pl-[72px] pr-4 text-sm text-body shadow-card outline-none transition focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100"
        />
      </label>
    </form>
  )
}
