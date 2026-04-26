'use client'

import Link from 'next/link'
import { useState } from 'react'

const LINKS = [
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
      <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 rounded-lg gradient-btn flex items-center justify-center text-white font-black text-sm">
            A
          </div>
          <span className="font-extrabold text-[15px] gradient-text">AI Tools Hub</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          {LINKS.map(l => (
            <Link key={l.href} href={l.href} className="text-[13px] text-muted hover:text-heading transition-colors">
              {l.label}
            </Link>
          ))}
          <Link href="/about" className="gradient-btn text-[12px] px-4 py-[6px]">
            About
          </Link>
        </nav>

        {/* Mobile hamburger */}
        <button
          className="md:hidden text-muted p-1"
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
        </nav>
      )}
    </header>
  )
}
