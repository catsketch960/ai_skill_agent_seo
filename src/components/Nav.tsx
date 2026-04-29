'use client'

import Link from 'next/link'
import { Suspense, useState } from 'react'
import SiteSearch from '@/components/SiteSearch'

const LINKS = [
  { label: 'Blog', href: '/blog' },
  { label: 'AI Tools', href: '/category/ai-tools' },
  { label: 'AI Agents', href: '/category/ai-agents' },
  { label: 'LLMs', href: '/category/llm' },
  { label: 'DeepSeek', href: '/category/deepseek' },
  { label: 'Claude', href: '/category/claude' },
]

export default function Nav() {
  const [open, setOpen] = useState(false)

  return (
    <header className="frosted sticky top-0 z-50 border-b border-indigo-100/40">
      <div className="max-w-6xl mx-auto px-6 py-3 flex items-center gap-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 rounded-lg gradient-btn flex items-center justify-center text-white font-black text-sm">
            A
          </div>
          <span className="font-extrabold text-[15px] gradient-text">AI Tools Hub</span>
        </Link>

        <Suspense fallback={<div className="hidden md:block md:flex-1 md:max-w-[540px]" />}>
          <SiteSearch />
        </Suspense>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6 ml-auto">
          {LINKS.map(l => (
            <Link key={l.href} href={l.href} className="text-[13px] text-muted hover:text-heading transition-colors">
              {l.label}
            </Link>
          ))}
          <Link href="/about" className="gradient-btn text-[12px] px-4 py-[6px]">
            About
          </Link>
          <Link href="/contact" className="text-[13px] text-muted hover:text-heading transition-colors">
            Contact
          </Link>
        </nav>

        {/* Mobile hamburger */}
        <button
          className="md:hidden text-muted p-1 ml-auto"
          onClick={() => setOpen(o => !o)}
          aria-label="Toggle menu"
        >
          {open ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <nav className="md:hidden border-t border-indigo-100/40 px-6 py-4 flex flex-col gap-3 bg-white/90">
          {LINKS.map(l => (
            <Link key={l.href} href={l.href} className="text-[14px] text-body" onClick={() => setOpen(false)}>
              {l.label}
            </Link>
          ))}
          <Link href="/about" className="text-[14px] text-body" onClick={() => setOpen(false)}>
            About
          </Link>
          <Link href="/contact" className="text-[14px] text-body" onClick={() => setOpen(false)}>
            Contact
          </Link>
        </nav>
      )}
    </header>
  )
}
