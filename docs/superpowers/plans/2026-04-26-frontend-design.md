# Frontend Design Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the Modern Gradient visual design system for AI Tools Hub — navigation, hero banner, article cards, article detail page, category page, and AdSense placements — fully responsive across mobile/tablet/desktop.

**Architecture:** Next.js 14 App Router with Tailwind CSS extended with custom design tokens. Each UI component is a focused file under `src/components/`. Pages compose components. The Qwen image generation call is added to the Python agent so each article gets a hero image committed to `public/images/heroes/`. Hero images are referenced via frontmatter and served as static assets.

**Tech Stack:** Next.js 14, TypeScript, Tailwind CSS (custom config), `@tailwindcss/typography`, `next/font` (Inter), `next/image`, `react-markdown`, `remark-gfm`, Qwen DashScope API (hero images), Python `anthropic` + `requests` SDKs.

---

## File Map

### Config / global
- Modify: `tailwind.config.ts` — extend with custom colors, shadows, fonts
- Modify: `src/app/globals.css` — CSS custom properties, gradient utilities
- Modify: `src/app/layout.tsx` — Inter font, gradient page bg, sticky nav, footer, AdSense script
- Modify: `src/lib/posts.ts` — add `heroImage` field to `PostMeta` / `Post`

### Components
- Create: `src/components/Nav.tsx` — sticky frosted-glass navbar
- Create: `src/components/Footer.tsx` — footer with links
- Create: `src/components/HeroBanner.tsx` — AI image hero with gradient overlay
- Create: `src/components/ArticleCard.tsx` — card with colored image area, tags, title
- Create: `src/components/TagPill.tsx` — category pill with per-tag color
- Create: `src/components/SectionHeader.tsx` — accent bar + title + filter tabs
- Create: `src/components/AdUnit.tsx` — AdSense wrapper (unchanged from base plan)
- Create: `src/components/Sidebar.tsx` — sticky sidebar with ad + related articles

### Pages
- Modify: `src/app/page.tsx` — homepage: hero + ad + section header + 3-col grid
- Modify: `src/app/blog/[slug]/page.tsx` — article detail: content + sticky sidebar
- Modify: `src/app/category/[tag]/page.tsx` — category: header + ad + grid

### Agent (image generation)
- Modify: `scripts/agent/generate.py` — add `generate_hero_image()` that calls Qwen, saves PNG to `public/images/heroes/{slug}.png`, adds `heroImage` to frontmatter

---

## Task 1: Extend Tailwind Config with Design Tokens

**Files:**
- Modify: `tailwind.config.ts`
- Modify: `src/app/globals.css`

- [ ] **Step 1: Replace tailwind.config.ts**

```ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        heading: '#1e1b4b',
        body: '#374151',
        muted: '#6b7280',
        subtle: '#f3f4f6',
      },
      boxShadow: {
        card: '0 4px 20px rgba(99,102,241,0.10)',
        'card-hover': '0 8px 32px rgba(99,102,241,0.18)',
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
        'gradient-page': 'linear-gradient(135deg, #eff6ff, #f5f3ff)',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
}

export default config
```

- [ ] **Step 2: Add global CSS utilities to src/app/globals.css**

Append to the end of the existing `src/app/globals.css`:

```css
body {
  background-image: linear-gradient(135deg, #eff6ff 0%, #f5f3ff 100%);
  background-attachment: fixed;
  min-height: 100vh;
}

.gradient-text {
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.gradient-btn {
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  color: white;
  font-weight: 600;
  border-radius: 9999px;
  transition: opacity 0.2s;
}

.gradient-btn:hover {
  opacity: 0.9;
}

.frosted {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}
```

- [ ] **Step 3: Verify Tailwind picks up new tokens**

```bash
cd /root/ai_skill_agent_seo
npm run build 2>&1 | tail -5
```
Expected: build completes without error. If `@tailwindcss/typography` missing: `npm install @tailwindcss/typography`.

- [ ] **Step 4: Commit**

```bash
git add tailwind.config.ts src/app/globals.css
git commit -m "feat: extend Tailwind with brand gradient tokens and global CSS utilities

Co-Authored-By: Claude Code <claude-sonnet-4-6> <noreply@anthropic.com>"
```

---

## Task 2: TagPill Component

**Files:**
- Create: `src/components/TagPill.tsx`

- [ ] **Step 1: Create TagPill.tsx**

Create `src/components/TagPill.tsx`:

```tsx
import Link from 'next/link'

const TAG_STYLES: Record<string, { bg: string; text: string }> = {
  claude:      { bg: '#ede9fe', text: '#7c3aed' },
  deepseek:    { bg: '#dbeafe', text: '#1d4ed8' },
  llm:         { bg: '#fef3c7', text: '#92400e' },
  'ai-agents': { bg: '#dcfce7', text: '#15803d' },
  'ai-tools':  { bg: '#dbeafe', text: '#1d4ed8' },
  harness:     { bg: '#ede9fe', text: '#7c3aed' },
}

const DEFAULT_STYLE = { bg: '#f3f4f6', text: '#6b7280' }

interface TagPillProps {
  tag: string
  linked?: boolean
}

export default function TagPill({ tag, linked = true }: TagPillProps) {
  const { bg, text } = TAG_STYLES[tag] ?? DEFAULT_STYLE
  const label = tag.replace(/-/g, ' ')

  const pill = (
    <span
      className="inline-block text-[10px] font-medium px-[10px] py-[3px] rounded-full capitalize leading-none"
      style={{ background: bg, color: text }}
    >
      {label}
    </span>
  )

  if (!linked) return pill
  return <Link href={`/category/${tag}`}>{pill}</Link>
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/TagPill.tsx
git commit -m "feat: TagPill component with per-category color system

Co-Authored-By: Claude Code <claude-sonnet-4-6> <noreply@anthropic.com>"
```

---

## Task 3: Nav Component

**Files:**
- Create: `src/components/Nav.tsx`

- [ ] **Step 1: Create Nav.tsx**

Create `src/components/Nav.tsx`:

```tsx
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
        </nav>
      )}
    </header>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/Nav.tsx
git commit -m "feat: frosted-glass sticky Nav with mobile hamburger

Co-Authored-By: Claude Code <claude-sonnet-4-6> <noreply@anthropic.com>"
```

---

## Task 4: Footer Component

**Files:**
- Create: `src/components/Footer.tsx`

- [ ] **Step 1: Create Footer.tsx**

Create `src/components/Footer.tsx`:

```tsx
import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-subtle bg-white/60">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex flex-col md:flex-row justify-between gap-8 mb-8">
          <div>
            <span className="font-extrabold text-base gradient-text block mb-2">AI Tools Hub</span>
            <p className="text-muted text-sm max-w-xs">
              In-depth reviews and guides on AI tools, agents, LLMs, DeepSeek, Claude, and GPT.
            </p>
          </div>
          <div className="flex flex-wrap gap-x-10 gap-y-4 text-sm text-muted">
            <div className="flex flex-col gap-2">
              <span className="text-heading font-semibold text-xs uppercase tracking-wider">Topics</span>
              <Link href="/category/ai-tools" className="hover:text-heading transition-colors">AI Tools</Link>
              <Link href="/category/ai-agents" className="hover:text-heading transition-colors">AI Agents</Link>
              <Link href="/category/llm" className="hover:text-heading transition-colors">LLMs</Link>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-heading font-semibold text-xs uppercase tracking-wider">Models</span>
              <Link href="/category/claude" className="hover:text-heading transition-colors">Claude</Link>
              <Link href="/category/deepseek" className="hover:text-heading transition-colors">DeepSeek</Link>
              <Link href="/category/harness" className="hover:text-heading transition-colors">Harness</Link>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-heading font-semibold text-xs uppercase tracking-wider">Site</span>
              <Link href="/about" className="hover:text-heading transition-colors">About</Link>
              <Link href="/privacy-policy" className="hover:text-heading transition-colors">Privacy Policy</Link>
            </div>
          </div>
        </div>
        <div className="pt-6 border-t border-subtle flex items-center justify-between">
          <span className="text-xs text-muted">© {new Date().getFullYear()} AI Tools Hub. All rights reserved.</span>
          <div className="h-1 w-20 rounded-full bg-gradient-brand" />
        </div>
      </div>
    </footer>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/Footer.tsx
git commit -m "feat: Footer with topic/model/site links and gradient accent

Co-Authored-By: Claude Code <claude-sonnet-4-6> <noreply@anthropic.com>"
```

---

## Task 5: Root Layout with Nav + Footer

**Files:**
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Replace layout.tsx**

Replace the full contents of `src/app/layout.tsx`:

```tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Script from 'next/script'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import './globals.css'

const inter = Inter({ subsets: ['latin'], display: 'swap' })

export const metadata: Metadata = {
  title: {
    default: 'AI Tools Hub — Reviews, Guides & Agent News',
    template: '%s | AI Tools Hub',
  },
  description:
    'In-depth reviews and guides on AI tools, AI agents, LLMs, DeepSeek, Claude, and GPT.',
  robots: { index: true, follow: true },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const publisherId = process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID
  return (
    <html lang="en" className={inter.className}>
      <head>
        {publisherId && (
          <Script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${publisherId}`}
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
        )}
      </head>
      <body className="antialiased">
        <Nav />
        <main className="max-w-6xl mx-auto px-6 py-10">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
```

- [ ] **Step 2: Verify dev server renders nav and footer**

```bash
npm run dev &
sleep 4 && curl -s http://localhost:3000 | grep -c "AI Tools Hub"
kill %1
```
Expected: number ≥ 2 (appears in nav logo and footer).

- [ ] **Step 3: Commit**

```bash
git add src/app/layout.tsx
git commit -m "feat: root layout with Inter font, Nav, Footer, and AdSense script

Co-Authored-By: Claude Code <claude-sonnet-4-6> <noreply@anthropic.com>"
```

---

## Task 6: AdUnit Component

**Files:**
- Create: `src/components/AdUnit.tsx`

- [ ] **Step 1: Create AdUnit.tsx**

Create `src/components/AdUnit.tsx`:

```tsx
'use client'

import { useEffect } from 'react'

declare global {
  interface Window { adsbygoogle: unknown[] }
}

interface AdUnitProps {
  slot: string
  format?: 'auto' | 'rectangle' | 'vertical'
  className?: string
}

export default function AdUnit({ slot, format = 'auto', className = '' }: AdUnitProps) {
  const publisherId = process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID

  useEffect(() => {
    try {
      ;(window.adsbygoogle = window.adsbygoogle || []).push({})
    } catch {}
  }, [])

  if (!publisherId) {
    return (
      <div className={`border border-dashed border-violet-200 rounded-lg bg-gray-50 flex items-center justify-center text-[10px] text-gray-400 uppercase tracking-widest ${className}`}>
        Advertisement
      </div>
    )
  }

  return (
    <div className={`rounded-xl bg-white shadow-card p-3 ${className}`}>
      <p className="text-[9px] text-gray-400 uppercase tracking-widest text-center mb-2">Advertisement</p>
      <ins
        className="adsbygoogle block"
        data-ad-client={publisherId}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/AdUnit.tsx
git commit -m "feat: AdUnit with dev placeholder and AdSense production mode

Co-Authored-By: Claude Code <claude-sonnet-4-6> <noreply@anthropic.com>"
```

---

## Task 7: Update PostMeta to Include heroImage

**Files:**
- Modify: `src/lib/posts.ts`

- [ ] **Step 1: Add heroImage to PostMeta and Post interfaces**

In `src/lib/posts.ts`, update the `PostMeta` interface and the mapping function:

```ts
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const postsDir = path.join(process.cwd(), 'content/posts')

export interface PostMeta {
  slug: string
  title: string
  date: string
  description: string
  tags: string[]
  heroImage: string | null   // ← added
}

export interface Post extends PostMeta {
  content: string
}

export function getAllPosts(): PostMeta[] {
  if (!fs.existsSync(postsDir)) return []
  const files = fs.readdirSync(postsDir).filter(f => f.endsWith('.md'))
  return files
    .map(filename => {
      const slug = filename.replace(/^\d{4}-\d{2}-\d{2}-/, '').replace(/\.md$/, '')
      const raw = fs.readFileSync(path.join(postsDir, filename), 'utf8')
      const { data } = matter(raw)
      return {
        slug,
        title: data.title ?? '',
        date: data.date ?? '',
        description: data.description ?? '',
        tags: data.tags ?? [],
        heroImage: data.heroImage ?? null,   // ← added
      }
    })
    .sort((a, b) => (a.date < b.date ? 1 : -1))
}

export function getPostBySlug(slug: string): Post | null {
  if (!fs.existsSync(postsDir)) return null
  const files = fs.readdirSync(postsDir).filter(f => f.endsWith('.md'))
  const file = files.find(f => f.includes(slug))
  if (!file) return null
  const raw = fs.readFileSync(path.join(postsDir, file), 'utf8')
  const { data, content } = matter(raw)
  return {
    slug,
    title: data.title ?? '',
    date: data.date ?? '',
    description: data.description ?? '',
    tags: data.tags ?? [],
    heroImage: data.heroImage ?? null,   // ← added
    content,
  }
}

export function getPostsByTag(tag: string): PostMeta[] {
  return getAllPosts().filter(p => p.tags.includes(tag))
}

export function getAllTags(): string[] {
  const posts = getAllPosts()
  const tags = new Set<string>()
  posts.forEach(p => p.tags.forEach(t => tags.add(t)))
  return Array.from(tags).sort()
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/posts.ts
git commit -m "feat: add heroImage field to PostMeta and Post types

Co-Authored-By: Claude Code <claude-sonnet-4-6> <noreply@anthropic.com>"
```

---

## Task 8: ArticleCard Component

**Files:**
- Create: `src/components/ArticleCard.tsx`

- [ ] **Step 1: Create ArticleCard.tsx**

Create `src/components/ArticleCard.tsx`:

```tsx
import Link from 'next/link'
import Image from 'next/image'
import TagPill from '@/components/TagPill'
import { PostMeta } from '@/lib/posts'

const CARD_GRADIENTS: Record<string, string> = {
  claude:      'from-[#1e1b4b] to-[#312e81]',
  deepseek:    'from-[#0c4a6e] to-[#075985]',
  llm:         'from-[#7c2d12] to-[#9a3412]',
  'ai-agents': 'from-[#14532d] to-[#166534]',
  'ai-tools':  'from-[#1e3a5f] to-[#1e2d5f]',
  harness:     'from-[#4a044e] to-[#701a75]',
}

const CARD_EMOJIS: Record<string, string> = {
  claude:      '🤖',
  deepseek:    '🔬',
  llm:         '📚',
  'ai-agents': '🧠',
  'ai-tools':  '⚡',
  harness:     '🔗',
}

function getCardStyle(tags: string[]) {
  for (const tag of tags) {
    if (CARD_GRADIENTS[tag]) {
      return { gradient: CARD_GRADIENTS[tag], emoji: CARD_EMOJIS[tag] ?? '✨' }
    }
  }
  return { gradient: 'from-[#1e1b4b] to-[#312e81]', emoji: '✨' }
}

export default function ArticleCard({ post }: { post: PostMeta }) {
  const { gradient, emoji } = getCardStyle(post.tags)

  return (
    <Link href={`/blog/${post.slug}`} className="group block">
      <article className="bg-white rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-shadow duration-200">
        {/* Image / color area */}
        <div className={`relative h-[110px] bg-gradient-to-br ${gradient} flex items-center justify-center overflow-hidden`}>
          {post.heroImage ? (
            <Image
              src={post.heroImage}
              alt={post.title}
              fill
              className="object-cover opacity-80"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
          ) : (
            <>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(99,102,241,0.35),transparent_70%)]" />
              <span className="text-4xl relative z-10">{emoji}</span>
            </>
          )}
        </div>

        {/* Body */}
        <div className="p-4">
          <div className="flex flex-wrap gap-1.5 mb-2">
            {post.tags.slice(0, 2).map(tag => (
              <TagPill key={tag} tag={tag} linked={false} />
            ))}
          </div>
          <h3 className="text-heading text-[13px] font-bold leading-snug line-clamp-2 mb-3 group-hover:gradient-text transition-colors">
            {post.title}
          </h3>
          <div className="flex items-center justify-between">
            <time className="text-[10px] text-muted">{post.date}</time>
            <span className="gradient-text text-[10px] font-bold">Read →</span>
          </div>
        </div>
      </article>
    </Link>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ArticleCard.tsx
git commit -m "feat: ArticleCard with per-tag color gradients, hero image, and emoji fallback

Co-Authored-By: Claude Code <claude-sonnet-4-6> <noreply@anthropic.com>"
```

---

## Task 9: HeroBanner Component

**Files:**
- Create: `src/components/HeroBanner.tsx`

- [ ] **Step 1: Create HeroBanner.tsx**

Create `src/components/HeroBanner.tsx`:

```tsx
import Image from 'next/image'
import Link from 'next/link'
import TagPill from '@/components/TagPill'
import { PostMeta } from '@/lib/posts'

export default function HeroBanner({ post }: { post: PostMeta }) {
  return (
    <div className="relative rounded-2xl overflow-hidden mb-6" style={{ height: 280 }}>
      {/* Background image or gradient fallback */}
      {post.heroImage ? (
        <Image
          src={post.heroImage}
          alt={post.title}
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-brand" />
      )}

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-[rgba(30,27,75,0.78)] to-[rgba(30,58,138,0.52)]" />

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-end p-8">
        <div className="flex flex-wrap gap-2 mb-3">
          <span className="bg-white/20 text-white text-[10px] font-semibold px-3 py-1 rounded-full backdrop-blur-sm border border-white/30">
            ⭐ Featured
          </span>
          {post.tags.slice(0, 1).map(tag => (
            <TagPill key={tag} tag={tag} linked={false} />
          ))}
        </div>
        <h1 className="text-white text-2xl md:text-3xl font-extrabold leading-tight mb-3 drop-shadow-lg max-w-2xl">
          {post.title}
        </h1>
        <div className="flex items-center gap-4">
          <time className="text-white/70 text-xs">{post.date}</time>
          <Link
            href={`/blog/${post.slug}`}
            className="bg-white text-indigo-600 text-xs font-bold px-5 py-2 rounded-full hover:bg-indigo-50 transition-colors"
          >
            Read Now →
          </Link>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/HeroBanner.tsx
git commit -m "feat: HeroBanner with Qwen AI image, gradient overlay, and featured article CTA

Co-Authored-By: Claude Code <claude-sonnet-4-6> <noreply@anthropic.com>"
```

---

## Task 10: SectionHeader Component

**Files:**
- Create: `src/components/SectionHeader.tsx`

- [ ] **Step 1: Create SectionHeader.tsx**

Create `src/components/SectionHeader.tsx`:

```tsx
'use client'

import Link from 'next/link'

interface Tab {
  label: string
  href: string
}

interface SectionHeaderProps {
  title: string
  tabs?: Tab[]
  activeTab?: string
}

const DEFAULT_TABS: Tab[] = [
  { label: 'All', href: '/' },
  { label: 'AI Tools', href: '/category/ai-tools' },
  { label: 'AI Agents', href: '/category/ai-agents' },
  { label: 'LLMs', href: '/category/llm' },
  { label: 'DeepSeek', href: '/category/deepseek' },
  { label: 'Claude', href: '/category/claude' },
]

export default function SectionHeader({ title, tabs = DEFAULT_TABS, activeTab = '/' }: SectionHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div className="flex items-center gap-3">
        <div className="w-1 h-6 rounded-full bg-gradient-brand shrink-0" />
        <h2 className="text-lg font-bold text-heading">{title}</h2>
      </div>
      <div className="flex gap-2 flex-wrap">
        {tabs.map(tab => (
          <Link
            key={tab.href}
            href={tab.href}
            className={`text-[11px] font-semibold px-4 py-1.5 rounded-full transition-colors ${
              tab.href === activeTab
                ? 'gradient-btn text-white'
                : 'bg-white text-muted border border-gray-200 hover:border-indigo-200 hover:text-heading'
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/SectionHeader.tsx
git commit -m "feat: SectionHeader with gradient accent bar and filter tabs

Co-Authored-By: Claude Code <claude-sonnet-4-6> <noreply@anthropic.com>"
```

---

## Task 11: Sidebar Component

**Files:**
- Create: `src/components/Sidebar.tsx`

- [ ] **Step 1: Create Sidebar.tsx**

Create `src/components/Sidebar.tsx`:

```tsx
import AdUnit from '@/components/AdUnit'
import TagPill from '@/components/TagPill'
import Link from 'next/link'
import { PostMeta } from '@/lib/posts'

interface SidebarProps {
  related: PostMeta[]
}

export default function Sidebar({ related }: SidebarProps) {
  return (
    <aside className="flex flex-col gap-5 lg:sticky lg:top-24 lg:self-start">
      {/* Primary ad */}
      <AdUnit slot="sidebar-primary" className="h-[300px]" />

      {/* Related articles */}
      {related.length > 0 && (
        <div className="bg-white rounded-2xl shadow-card p-5">
          <h3 className="text-[11px] font-bold text-muted uppercase tracking-widest mb-4">
            Related Articles
          </h3>
          <div className="flex flex-col divide-y divide-subtle">
            {related.map(post => (
              <Link key={post.slug} href={`/blog/${post.slug}`} className="py-3 first:pt-0 last:pb-0 group">
                <div className="flex flex-wrap gap-1 mb-1.5">
                  {post.tags.slice(0, 1).map(tag => (
                    <TagPill key={tag} tag={tag} linked={false} />
                  ))}
                </div>
                <p className="text-[12px] font-semibold text-heading leading-snug group-hover:gradient-text transition-colors line-clamp-2">
                  {post.title}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Secondary ad */}
      <AdUnit slot="sidebar-secondary" className="h-[160px]" />
    </aside>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/Sidebar.tsx
git commit -m "feat: Sidebar with sticky positioning, two ad units, and related articles

Co-Authored-By: Claude Code <claude-sonnet-4-6> <noreply@anthropic.com>"
```

---

## Task 12: Homepage

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Replace page.tsx**

Replace the full contents of `src/app/page.tsx`:

```tsx
import { getAllPosts } from '@/lib/posts'
import HeroBanner from '@/components/HeroBanner'
import ArticleCard from '@/components/ArticleCard'
import SectionHeader from '@/components/SectionHeader'
import AdUnit from '@/components/AdUnit'

export default function HomePage() {
  const posts = getAllPosts()
  const featured = posts[0]
  const rest = posts.slice(1)

  return (
    <>
      {featured && <HeroBanner post={featured} />}

      <AdUnit slot="homepage-leaderboard" className="h-[100px] mb-8" />

      <SectionHeader title="Latest Articles" />

      {rest.length === 0 && (
        <p className="text-muted text-sm text-center py-20">
          Articles are on their way — check back soon.
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {rest.map(post => (
          <ArticleCard key={post.slug} post={post} />
        ))}
      </div>
    </>
  )
}
```

- [ ] **Step 2: Start dev server and visually verify homepage**

```bash
npm run dev &
sleep 5
echo "Dev server started — open http://localhost:3000 in your browser"
echo "Check: gradient background, nav, hero area, article grid, footer"
kill %1
```

- [ ] **Step 3: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: homepage with HeroBanner, AdSense leaderboard, SectionHeader, and 3-col grid

Co-Authored-By: Claude Code <claude-sonnet-4-6> <noreply@anthropic.com>"
```

---

## Task 13: Article Detail Page

**Files:**
- Modify: `src/app/blog/[slug]/page.tsx`

- [ ] **Step 1: Install react-markdown if not already installed**

```bash
npm list react-markdown 2>/dev/null | grep react-markdown || npm install react-markdown remark-gfm
```

- [ ] **Step 2: Replace blog/[slug]/page.tsx**

Replace the full contents of `src/app/blog/[slug]/page.tsx`:

```tsx
import { notFound } from 'next/navigation'
import { getAllPosts, getPostBySlug, getPostsByTag } from '@/lib/posts'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import Image from 'next/image'
import Link from 'next/link'
import TagPill from '@/components/TagPill'
import AdUnit from '@/components/AdUnit'
import Sidebar from '@/components/Sidebar'
import type { Metadata } from 'next'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return getAllPosts().map(p => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = getPostBySlug(slug)
  if (!post) return {}
  return {
    title: post.title,
    description: post.description,
    openGraph: { title: post.title, description: post.description, type: 'article', publishedTime: post.date },
  }
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params
  const post = getPostBySlug(slug)
  if (!post) notFound()

  const related = post.tags
    .flatMap(tag => getPostsByTag(tag))
    .filter(p => p.slug !== post.slug)
    .slice(0, 3)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    image: post.heroImage ?? undefined,
    author: { '@type': 'Organization', name: 'AI Tools Hub' },
  }

  const lines = post.content.split('\n')
  const mid = Math.floor(lines.length / 2)
  const topHalf = lines.slice(0, mid).join('\n')
  const bottomHalf = lines.slice(mid).join('\n')

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Breadcrumb */}
      <nav className="text-xs text-muted mb-6 flex items-center gap-1.5">
        <Link href="/" className="hover:text-heading">Home</Link>
        <span>/</span>
        {post.tags[0] && (
          <>
            <Link href={`/category/${post.tags[0]}`} className="hover:text-heading capitalize">
              {post.tags[0].replace(/-/g, ' ')}
            </Link>
            <span>/</span>
          </>
        )}
        <span className="text-heading line-clamp-1">{post.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8 items-start">
        {/* Main article */}
        <article className="bg-white rounded-2xl shadow-card p-8 min-w-0">
          {/* Hero image */}
          {post.heroImage && (
            <div className="relative w-full h-52 rounded-xl overflow-hidden mb-6">
              <Image src={post.heroImage} alt={post.title} fill className="object-cover" sizes="100vw" priority />
            </div>
          )}

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags.map(tag => <TagPill key={tag} tag={tag} />)}
          </div>

          {/* Title */}
          <h1 className="text-heading text-2xl md:text-3xl font-extrabold leading-tight mb-3">
            {post.title}
          </h1>

          {/* Meta */}
          <div className="flex items-center gap-3 text-xs text-muted mb-6 pb-6 border-b border-subtle">
            <time>{post.date}</time>
            <span>·</span>
            <span>{Math.ceil(post.content.split(' ').length / 200)} min read</span>
          </div>

          {/* Top ad */}
          <AdUnit slot="article-top" className="h-[100px] mb-6" />

          {/* Article top half */}
          <div className="prose prose-gray max-w-none prose-headings:text-heading prose-headings:font-bold prose-a:text-indigo-600">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{topHalf}</ReactMarkdown>
          </div>

          {/* Mid ad */}
          <AdUnit slot="article-mid" className="h-[120px] my-8" />

          {/* Article bottom half */}
          <div className="prose prose-gray max-w-none prose-headings:text-heading prose-headings:font-bold prose-a:text-indigo-600">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{bottomHalf}</ReactMarkdown>
          </div>
        </article>

        {/* Sidebar */}
        <Sidebar related={related} />
      </div>
    </>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/blog/
git commit -m "feat: article detail page with hero image, breadcrumb, 3 ad units, sticky sidebar

Co-Authored-By: Claude Code <claude-sonnet-4-6> <noreply@anthropic.com>"
```

---

## Task 14: Category Page

**Files:**
- Modify: `src/app/category/[tag]/page.tsx`

- [ ] **Step 1: Replace category/[tag]/page.tsx**

Replace the full contents of `src/app/category/[tag]/page.tsx`:

```tsx
import { getAllTags, getPostsByTag } from '@/lib/posts'
import ArticleCard from '@/components/ArticleCard'
import AdUnit from '@/components/AdUnit'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

interface Props {
  params: Promise<{ tag: string }>
}

export async function generateStaticParams() {
  return getAllTags().map(tag => ({ tag }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tag } = await params
  const label = tag.replace(/-/g, ' ')
  return {
    title: `${label} Articles`,
    description: `Browse all ${label} articles on AI Tools Hub — in-depth reviews, guides, and news.`,
  }
}

export default async function CategoryPage({ params }: Props) {
  const { tag } = await params
  const posts = getPostsByTag(tag)
  if (posts.length === 0) notFound()
  const label = tag.replace(/-/g, ' ')

  return (
    <>
      <div className="mb-8">
        <h1 className="text-heading text-3xl font-extrabold capitalize mb-1">{label}</h1>
        <p className="text-muted text-sm">{posts.length} article{posts.length !== 1 ? 's' : ''}</p>
      </div>

      <AdUnit slot="category-leaderboard" className="h-[100px] mb-8" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map(post => (
          <ArticleCard key={post.slug} post={post} />
        ))}
      </div>
    </>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/category/
git commit -m "feat: category page with article count, ad unit, and responsive grid

Co-Authored-By: Claude Code <claude-sonnet-4-6> <noreply@anthropic.com>"
```

---

## Task 15: About + Privacy Policy Pages

**Files:**
- Modify: `src/app/about/page.tsx`
- Modify: `src/app/privacy-policy/page.tsx`

- [ ] **Step 1: Replace about/page.tsx**

Replace `src/app/about/page.tsx`:

```tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About',
  description: 'About AI Tools Hub — your source for AI tool reviews, agent tutorials, and LLM news.',
}

export default function AboutPage() {
  return (
    <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-card p-10">
      <h1 className="text-heading text-3xl font-extrabold mb-6">About AI Tools Hub</h1>
      <div className="prose prose-gray max-w-none prose-headings:text-heading">
        <p>
          AI Tools Hub is an independent publication covering the latest in AI tools, AI agents,
          large language models, and frontier AI research. We publish in-depth reviews, tutorials,
          and comparisons to help developers and professionals navigate the rapidly evolving AI landscape.
        </p>
        <p>
          Our coverage spans DeepSeek, Claude, GPT, Gemini, Harness, and the broader open-source
          ecosystem — with an emphasis on practical, real-world evaluation over hype.
        </p>
        <h2>What We Cover</h2>
        <ul>
          <li><strong>AI Tool Reviews</strong> — hands-on evaluations with real benchmarks</li>
          <li><strong>AI Agent Tutorials</strong> — step-by-step guides for building autonomous agents</li>
          <li><strong>LLM Analysis</strong> — deep dives into frontier models like DeepSeek V4, Claude, and GPT-5</li>
          <li><strong>Developer Guides</strong> — practical API and SDK walkthroughs</li>
        </ul>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Replace privacy-policy/page.tsx**

Replace `src/app/privacy-policy/page.tsx`:

```tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy policy for AI Tools Hub.',
}

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-card p-10">
      <h1 className="text-heading text-3xl font-extrabold mb-2">Privacy Policy</h1>
      <p className="text-muted text-sm mb-8">Last updated: April 26, 2026</p>
      <div className="prose prose-gray max-w-none prose-headings:text-heading">
        <h2>Advertising</h2>
        <p>
          This site uses Google AdSense to display advertisements. Google may use cookies to serve
          ads based on your prior visits to this website or other websites. You may opt out of
          personalized advertising by visiting{' '}
          <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer">
            Google Ads Settings
          </a>.
        </p>
        <h2>Analytics</h2>
        <p>
          We may use analytics tools to understand how visitors use this site. No personally
          identifiable information is collected beyond what your browser sends as standard HTTP headers.
        </p>
        <h2>Cookies</h2>
        <p>
          Cookies may be set by Google AdSense for ad personalization. We do not set any first-party
          tracking cookies.
        </p>
        <h2>Contact</h2>
        <p>For privacy-related questions, visit our <a href="/about">About page</a>.</p>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/about/ src/app/privacy-policy/
git commit -m "feat: styled About and Privacy Policy pages with card layout

Co-Authored-By: Claude Code <claude-sonnet-4-6> <noreply@anthropic.com>"
```

---

## Task 16: Hero Image Generation in Agent

**Files:**
- Modify: `scripts/agent/generate.py`

- [ ] **Step 1: Add Qwen image generation to generate.py**

Replace the full contents of `scripts/agent/generate.py`:

```python
#!/usr/bin/env python3
"""AI article + hero image generation agent."""

import json
import os
import subprocess
import sys
import time
from datetime import date
from pathlib import Path

import anthropic
import requests

SCRIPT_DIR = Path(__file__).parent
REPO_ROOT = SCRIPT_DIR.parent.parent
POSTS_DIR = REPO_ROOT / "content" / "posts"
HEROES_DIR = REPO_ROOT / "public" / "images" / "heroes"
TOPICS_FILE = SCRIPT_DIR / "topics.json"
PROGRESS_FILE = SCRIPT_DIR / "progress.json"

DASHSCOPE_API_KEY = os.environ.get("DASHSCOPE_API_KEY", "")

ARTICLE_PROMPT = """Write a comprehensive English blog article about: "{title}"

Requirements:
- Length: 1800-2400 words
- Structure: use H2 and H3 Markdown headings
- Include: introduction, 4-6 main sections, a FAQ section (3-5 questions), conclusion
- Tone: informative, practical, developer-friendly
- Do NOT include any disclaimer about being AI-generated
- Do NOT use phrases like "In conclusion," or "In summary,"
- Output ONLY the Markdown body (no frontmatter, no title heading)
- Ensure high Flesch readability score (short sentences, active voice)
"""

IMAGE_PROMPT_TEMPLATE = (
    "A futuristic AI technology illustration for an article titled '{title}', "
    "blue and purple gradient color palette, glowing neural network nodes, "
    "clean modern digital art, professional tech blog style, wide 16:9 format, "
    "no text, no letters"
)


def load_topics() -> list[dict]:
    return json.loads(TOPICS_FILE.read_text())


def load_progress() -> dict:
    return json.loads(PROGRESS_FILE.read_text())


def save_progress(progress: dict) -> None:
    PROGRESS_FILE.write_text(json.dumps(progress, indent=2))


def generate_article(client: anthropic.Anthropic, topic: dict) -> str:
    message = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=4096,
        messages=[{"role": "user", "content": ARTICLE_PROMPT.format(title=topic["title"])}],
    )
    return message.content[0].text


def generate_hero_image(title: str, slug: str) -> str | None:
    """Generate hero image via Qwen wanx-v1. Returns public path or None on failure."""
    if not DASHSCOPE_API_KEY:
        return None

    HEROES_DIR.mkdir(parents=True, exist_ok=True)
    out_path = HEROES_DIR / f"{slug}.png"
    if out_path.exists():
        return f"/images/heroes/{slug}.png"

    # Submit async task
    resp = requests.post(
        "https://dashscope.aliyuncs.com/api/v1/services/aigc/text2image/image-synthesis",
        headers={
            "Authorization": f"Bearer {DASHSCOPE_API_KEY}",
            "Content-Type": "application/json",
            "X-DashScope-Async": "enable",
        },
        json={
            "model": "wanx-v1",
            "input": {"prompt": IMAGE_PROMPT_TEMPLATE.format(title=title)},
            "parameters": {"size": "1280*720", "n": 1},
        },
        timeout=30,
    )
    if resp.status_code != 200:
        print(f"  Image submit failed: {resp.text}", file=sys.stderr)
        return None

    task_id = resp.json()["output"]["task_id"]

    # Poll until done (max 90s)
    for _ in range(18):
        time.sleep(5)
        poll = requests.get(
            f"https://dashscope.aliyuncs.com/api/v1/tasks/{task_id}",
            headers={"Authorization": f"Bearer {DASHSCOPE_API_KEY}"},
            timeout=15,
        )
        status = poll.json()["output"]["task_status"]
        if status == "SUCCEEDED":
            img_url = poll.json()["output"]["results"][0]["url"]
            img_data = requests.get(img_url, timeout=30).content
            out_path.write_bytes(img_data)
            return f"/images/heroes/{slug}.png"
        if status == "FAILED":
            return None

    return None


def build_frontmatter(topic: dict, pub_date: str, hero_image: str | None) -> str:
    tags_yaml = ", ".join(topic["tags"])
    hero_line = f'\nheroImage: "{hero_image}"' if hero_image else ""
    return f"""---
title: "{topic['title']}"
date: "{pub_date}"
slug: "{topic['slug']}"
description: "Learn everything about {topic['title'].lower()} in this in-depth guide."{hero_line}
tags: [{tags_yaml}]
---

"""


def write_post(topic: dict, body: str, pub_date: str, hero_image: str | None) -> Path:
    POSTS_DIR.mkdir(parents=True, exist_ok=True)
    filename = f"{pub_date}-{topic['slug']}.md"
    filepath = POSTS_DIR / filename
    content = build_frontmatter(topic, pub_date, hero_image) + body
    filepath.write_text(content)
    return filepath


def git_commit(filepath: Path, hero_path: Path | None, title: str) -> None:
    files = [str(filepath), str(PROGRESS_FILE)]
    if hero_path and hero_path.exists():
        files.append(str(hero_path))
    subprocess.run(["git", "add"] + files, cwd=REPO_ROOT, check=True)
    subprocess.run(
        ["git", "commit", "-m", f"content: add article — {title}"],
        cwd=REPO_ROOT,
        check=True,
    )


def git_push() -> None:
    subprocess.run(["git", "push"], cwd=REPO_ROOT, check=True)


def main() -> None:
    count = int(sys.argv[1]) if len(sys.argv) > 1 else 7
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        print("ERROR: ANTHROPIC_API_KEY not set", file=sys.stderr)
        sys.exit(1)

    client = anthropic.Anthropic(api_key=api_key)
    topics = load_topics()
    progress = load_progress()
    published_ids = set(progress["published"])

    pending = [t for t in topics if t["id"] not in published_ids]
    pending.sort(key=lambda t: (t["phase"], t["id"]))
    batch = pending[:count]

    if not batch:
        print("All topics published.")
        return

    pub_date = date.today().isoformat()

    for topic in batch:
        print(f"Generating: {topic['title']}")
        try:
            body = generate_article(client, topic)
            print(f"  ✓ Article written ({len(body.split())} words)")

            hero_image = None
            if DASHSCOPE_API_KEY:
                print(f"  Generating hero image...")
                hero_image = generate_hero_image(topic["title"], topic["slug"])
                print(f"  {'✓ Hero image saved' if hero_image else '✗ Hero image failed (skipping)'}")

            hero_path = HEROES_DIR / f"{topic['slug']}.png" if hero_image else None
            filepath = write_post(topic, body, pub_date, hero_image)
            progress["published"].append(topic["id"])
            save_progress(progress)
            git_commit(filepath, hero_path, topic["title"])
            print(f"  ✓ Committed: {filepath.name}")
        except Exception as e:
            print(f"  ✗ Failed: {e}", file=sys.stderr)
            continue

    git_push()
    print(f"Done. {len(batch)} articles published and pushed.")


if __name__ == "__main__":
    main()
```

- [ ] **Step 2: Add DASHSCOPE_API_KEY to .env.local**

```bash
echo 'DASHSCOPE_API_KEY=sk-fadb91c86bf14db1afd61d791ad8a960' >> .env.local
```

- [ ] **Step 3: Add DASHSCOPE_API_KEY to GitHub Actions workflow**

In `.github/workflows/publish.yml`, add to the `env:` block of the "Generate and publish articles" step:

```yaml
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
          DASHSCOPE_API_KEY: ${{ secrets.DASHSCOPE_API_KEY }}
```

Then add `DASHSCOPE_API_KEY` as a GitHub Actions secret (same process as `ANTHROPIC_API_KEY`).

- [ ] **Step 4: Add public/images/heroes/ to .gitignore exception**

Ensure the directory is tracked by git:

```bash
mkdir -p public/images/heroes
touch public/images/heroes/.gitkeep
git add public/images/heroes/.gitkeep
```

- [ ] **Step 5: Commit**

```bash
git add scripts/agent/generate.py .github/workflows/publish.yml public/
git commit -m "feat: agent generates Qwen hero images per article, saves to public/images/heroes/

Co-Authored-By: Claude Code <claude-sonnet-4-6> <noreply@anthropic.com>"
```

---

## Task 17: Full Build + Visual Smoke Test

**Files:** No new files — verification only.

- [ ] **Step 1: Run full production build**

```bash
cd /root/ai_skill_agent_seo
npm run build 2>&1 | tail -20
```
Expected: `✓ Compiled successfully` with no TypeScript errors.

- [ ] **Step 2: Generate one sample article to populate the site**

```bash
pip install anthropic requests
ANTHROPIC_API_KEY=your_key DASHSCOPE_API_KEY=sk-fadb91c86bf14db1afd61d791ad8a960 python scripts/agent/generate.py 1
```
Expected: one `.md` in `content/posts/`, one `.png` in `public/images/heroes/`, committed.

- [ ] **Step 3: Rebuild and start production server**

```bash
npm run build && npm start &
sleep 5
curl -s http://localhost:3000 | grep -c "AI Tools Hub"
kill %1
```
Expected: count ≥ 2.

- [ ] **Step 4: Check Lighthouse SEO score (optional but recommended)**

```bash
npx lighthouse http://localhost:3000 --only-categories=seo --chrome-flags="--headless" --output=json 2>/dev/null | python3 -c "import sys,json; d=json.load(sys.stdin); print('SEO score:', int(d['categories']['seo']['score']*100))"
```
Expected: SEO score ≥ 90.

- [ ] **Step 5: Push to GitHub → Vercel auto-deploys**

```bash
git push origin master
```

Expected: Vercel dashboard shows a new deployment triggered within 30 seconds.
