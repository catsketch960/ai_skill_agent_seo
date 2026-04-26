# AI Traffic Site Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an English SEO content site on Next.js + Vercel with a fully automated AI writing agent that publishes 100 articles (7/day via GitHub Actions cron), monetized via Google AdSense.

**Architecture:** Static Next.js site reads Markdown files from `content/posts/`. A Python agent calls the Claude API to generate articles and pushes them to GitHub. GitHub Actions runs the agent daily; Vercel auto-deploys on every push.

**Tech Stack:** Next.js 14 (App Router), TypeScript, Tailwind CSS, gray-matter, next-sitemap, Python 3.11, anthropic SDK, GitHub Actions, Vercel.

---

## File Map

### Next.js Frontend
- Create: `package.json`
- Create: `next.config.ts`
- Create: `tailwind.config.ts`
- Create: `src/app/layout.tsx` — root layout, AdSense script injection
- Create: `src/app/page.tsx` — homepage, article list
- Create: `src/app/blog/[slug]/page.tsx` — article detail page
- Create: `src/app/category/[tag]/page.tsx` — category filtered list
- Create: `src/app/about/page.tsx` — about page (AdSense requirement)
- Create: `src/app/privacy-policy/page.tsx` — privacy policy (AdSense requirement)
- Create: `src/lib/posts.ts` — Markdown file reading + frontmatter parsing utilities
- Create: `src/components/ArticleCard.tsx` — article preview card component
- Create: `src/components/AdUnit.tsx` — Google AdSense ad unit wrapper
- Create: `public/robots.txt`
- Create: `next-sitemap.config.js`

### AI Writing Agent
- Create: `scripts/agent/generate.py` — main agent script
- Create: `scripts/agent/topics.json` — 100 topics list (Phase 1: 30, Phase 2: 70)
- Create: `scripts/agent/progress.json` — tracks published articles
- Create: `scripts/agent/requirements.txt`

### GitHub Actions
- Create: `.github/workflows/publish.yml` — daily cron, runs agent

---

## Task 1: Initialize Next.js Project

**Files:**
- Create: `package.json`
- Create: `next.config.ts`
- Create: `tailwind.config.ts`
- Create: `tsconfig.json`
- Create: `src/app/layout.tsx`

- [ ] **Step 1: Initialize Next.js with TypeScript and Tailwind**

```bash
cd /root/ai_skill_agent_seo
npx create-next-app@latest . --typescript --tailwind --app --no-src-dir --import-alias "@/*" --yes
```

Wait for completion, then verify:
```bash
ls package.json next.config.ts tailwind.config.ts
```
Expected: all three files exist.

- [ ] **Step 2: Install additional dependencies**

```bash
npm install gray-matter next-sitemap
npm install --save-dev @types/node
```

- [ ] **Step 3: Create content directory structure**

```bash
mkdir -p content/posts
mkdir -p src/lib
mkdir -p src/components
```

- [ ] **Step 4: Verify dev server starts**

```bash
npm run dev &
sleep 5 && curl -s http://localhost:3000 | head -20
kill %1
```
Expected: HTML response containing `<!DOCTYPE html>`.

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "feat: initialize Next.js project with TypeScript and Tailwind"
```

---

## Task 2: Markdown Post Utilities

**Files:**
- Create: `src/lib/posts.ts`

- [ ] **Step 1: Create posts utility**

Create `src/lib/posts.ts`:

```typescript
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

- [ ] **Step 2: Add a sample post to verify parsing**

```bash
cat > content/posts/2026-04-26-test-post.md << 'EOF'
---
title: "Test Post"
date: "2026-04-26"
slug: "test-post"
description: "A test article to verify Markdown parsing works."
tags: [ai-tools, test]
---

## Hello

This is a test post.
EOF
```

- [ ] **Step 3: Verify parsing works (quick Node script)**

```bash
node -e "
const matter = require('gray-matter');
const fs = require('fs');
const raw = fs.readFileSync('content/posts/2026-04-26-test-post.md', 'utf8');
const { data, content } = matter(raw);
console.log(JSON.stringify(data, null, 2));
console.log('content length:', content.length);
"
```
Expected: JSON with title/date/description/tags printed, content length > 0.

- [ ] **Step 4: Remove test post and commit**

```bash
rm content/posts/2026-04-26-test-post.md
git add src/lib/posts.ts
git commit -m "feat: add Markdown post reading utilities"
```

---

## Task 3: ArticleCard Component

**Files:**
- Create: `src/components/ArticleCard.tsx`

- [ ] **Step 1: Create component**

Create `src/components/ArticleCard.tsx`:

```tsx
import Link from 'next/link'
import { PostMeta } from '@/lib/posts'

export default function ArticleCard({ post }: { post: PostMeta }) {
  return (
    <article className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
      <Link href={`/blog/${post.slug}`}>
        <h2 className="text-xl font-semibold text-gray-900 hover:text-blue-600 mb-2">
          {post.title}
        </h2>
      </Link>
      <p className="text-gray-600 text-sm mb-3">{post.description}</p>
      <div className="flex items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          {post.tags.map(tag => (
            <Link
              key={tag}
              href={`/category/${tag}`}
              className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200"
            >
              {tag}
            </Link>
          ))}
        </div>
        <time className="text-xs text-gray-400">{post.date}</time>
      </div>
    </article>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ArticleCard.tsx
git commit -m "feat: add ArticleCard component"
```

---

## Task 4: AdUnit Component

**Files:**
- Create: `src/components/AdUnit.tsx`

- [ ] **Step 1: Create AdSense unit component**

Create `src/components/AdUnit.tsx`:

```tsx
'use client'

import { useEffect } from 'react'

interface AdUnitProps {
  slot: string
  style?: React.CSSProperties
}

declare global {
  interface Window {
    adsbygoogle: unknown[]
  }
}

export default function AdUnit({ slot, style }: AdUnitProps) {
  const publisherId = process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID

  useEffect(() => {
    try {
      ;(window.adsbygoogle = window.adsbygoogle || []).push({})
    } catch {}
  }, [])

  if (!publisherId) return null

  return (
    <ins
      className="adsbygoogle"
      style={{ display: 'block', ...style }}
      data-ad-client={publisherId}
      data-ad-slot={slot}
      data-ad-format="auto"
      data-full-width-responsive="true"
    />
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/AdUnit.tsx
git commit -m "feat: add AdSense AdUnit component"
```

---

## Task 5: Root Layout with AdSense Script

**Files:**
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Update root layout**

Replace `src/app/layout.tsx` with:

```tsx
import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import Script from 'next/script'
import './globals.css'

const geist = Geist({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'AI Tools Hub — Reviews, Guides & Agent News',
    template: '%s | AI Tools Hub',
  },
  description: 'In-depth reviews and guides on AI tools, AI agents, LLMs, DeepSeek, Claude, and GPT.',
  robots: { index: true, follow: true },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const publisherId = process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID
  return (
    <html lang="en">
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
      <body className={`${geist.className} bg-white text-gray-900 antialiased`}>
        <header className="border-b border-gray-100 py-4 px-6 flex items-center justify-between max-w-5xl mx-auto">
          <a href="/" className="font-bold text-xl text-blue-700">AI Tools Hub</a>
          <nav className="flex gap-6 text-sm text-gray-600">
            <a href="/category/ai-tools" className="hover:text-blue-600">AI Tools</a>
            <a href="/category/ai-agents" className="hover:text-blue-600">AI Agents</a>
            <a href="/category/llm" className="hover:text-blue-600">LLM</a>
            <a href="/about" className="hover:text-blue-600">About</a>
          </nav>
        </header>
        <main className="max-w-5xl mx-auto px-6 py-10">
          {children}
        </main>
        <footer className="border-t border-gray-100 py-6 text-center text-sm text-gray-400 mt-20">
          © {new Date().getFullYear()} AI Tools Hub ·{' '}
          <a href="/privacy-policy" className="underline">Privacy Policy</a>
        </footer>
      </body>
    </html>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/layout.tsx
git commit -m "feat: root layout with navigation, footer, and AdSense script"
```

---

## Task 6: Homepage

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Write homepage**

Replace `src/app/page.tsx` with:

```tsx
import { getAllPosts, getAllTags } from '@/lib/posts'
import ArticleCard from '@/components/ArticleCard'
import AdUnit from '@/components/AdUnit'

export default function HomePage() {
  const posts = getAllPosts()
  const tags = getAllTags()

  return (
    <div>
      <section className="mb-10">
        <h1 className="text-4xl font-bold mb-3">AI Tools Hub</h1>
        <p className="text-gray-500 text-lg">
          In-depth reviews, tutorials, and news on AI tools, agents, LLMs, DeepSeek, Claude, and GPT.
        </p>
      </section>

      <AdUnit slot="homepage-top" style={{ marginBottom: '2rem' }} />

      <div className="flex gap-8">
        <section className="flex-1">
          <h2 className="text-xl font-semibold mb-5">Latest Articles</h2>
          <div className="flex flex-col gap-4">
            {posts.map(post => (
              <ArticleCard key={post.slug} post={post} />
            ))}
          </div>
        </section>

        <aside className="w-56 shrink-0 hidden lg:block">
          <div className="mb-6">
            <h3 className="font-semibold text-sm uppercase text-gray-400 mb-3">Categories</h3>
            <ul className="flex flex-col gap-2">
              {tags.map(tag => (
                <li key={tag}>
                  <a
                    href={`/category/${tag}`}
                    className="text-blue-600 hover:underline text-sm capitalize"
                  >
                    {tag.replace(/-/g, ' ')}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <AdUnit slot="sidebar" />
        </aside>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: homepage with article list, category sidebar, and AdSense"
```

---

## Task 7: Article Detail Page

**Files:**
- Create: `src/app/blog/[slug]/page.tsx`

- [ ] **Step 1: Install Markdown renderer**

```bash
npm install react-markdown remark-gfm
```

- [ ] **Step 2: Create article page**

Create `src/app/blog/[slug]/page.tsx`:

```tsx
import { notFound } from 'next/navigation'
import { getAllPosts, getPostBySlug } from '@/lib/posts'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import AdUnit from '@/components/AdUnit'
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
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
      publishedTime: post.date,
    },
  }
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params
  const post = getPostBySlug(slug)
  if (!post) notFound()

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    author: { '@type': 'Organization', name: 'AI Tools Hub' },
  }

  const lines = post.content.split('\n')
  const midpoint = Math.floor(lines.length / 2)
  const topHalf = lines.slice(0, midpoint).join('\n')
  const bottomHalf = lines.slice(midpoint).join('\n')

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <article className="max-w-2xl mx-auto">
        <header className="mb-8">
          <div className="flex gap-2 mb-3">
            {post.tags.map(tag => (
              <a
                key={tag}
                href={`/category/${tag}`}
                className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded"
              >
                {tag}
              </a>
            ))}
          </div>
          <h1 className="text-3xl font-bold mb-3">{post.title}</h1>
          <time className="text-sm text-gray-400">{post.date}</time>
        </header>

        <AdUnit slot="article-top" style={{ marginBottom: '2rem' }} />

        <div className="prose prose-gray max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{topHalf}</ReactMarkdown>
        </div>

        <AdUnit slot="article-mid" style={{ margin: '2rem 0' }} />

        <div className="prose prose-gray max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{bottomHalf}</ReactMarkdown>
        </div>
      </article>
    </>
  )
}
```

- [ ] **Step 3: Install Tailwind typography plugin**

```bash
npm install @tailwindcss/typography
```

Add to `tailwind.config.ts` plugins array:
```ts
plugins: [require('@tailwindcss/typography')],
```

- [ ] **Step 4: Commit**

```bash
git add src/app/blog/ tailwind.config.ts package.json package-lock.json
git commit -m "feat: article detail page with AdSense, JSON-LD, and Markdown rendering"
```

---

## Task 8: Category Page

**Files:**
- Create: `src/app/category/[tag]/page.tsx`

- [ ] **Step 1: Create category page**

Create `src/app/category/[tag]/page.tsx`:

```tsx
import { getAllTags, getPostsByTag } from '@/lib/posts'
import ArticleCard from '@/components/ArticleCard'
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
    description: `Browse all articles tagged with ${label} on AI Tools Hub.`,
  }
}

export default async function CategoryPage({ params }: Props) {
  const { tag } = await params
  const posts = getPostsByTag(tag)
  if (posts.length === 0) notFound()
  const label = tag.replace(/-/g, ' ')

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2 capitalize">{label}</h1>
      <p className="text-gray-500 mb-8">{posts.length} articles</p>
      <div className="flex flex-col gap-4">
        {posts.map(post => (
          <ArticleCard key={post.slug} post={post} />
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/category/
git commit -m "feat: category page filtered by tag"
```

---

## Task 9: About + Privacy Policy Pages

**Files:**
- Create: `src/app/about/page.tsx`
- Create: `src/app/privacy-policy/page.tsx`

- [ ] **Step 1: Create about page**

Create `src/app/about/page.tsx`:

```tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About',
  description: 'About AI Tools Hub — your source for AI tool reviews, agent tutorials, and LLM news.',
}

export default function AboutPage() {
  return (
    <div className="max-w-2xl mx-auto prose prose-gray">
      <h1>About AI Tools Hub</h1>
      <p>
        AI Tools Hub is an independent publication covering the latest in AI tools, AI agents,
        large language models, and frontier AI research. We publish in-depth reviews, tutorials,
        and comparisons to help developers and professionals navigate the rapidly evolving AI
        landscape.
      </p>
      <p>
        Our coverage includes DeepSeek, Claude, GPT, Gemini, and the open-source ecosystem.
      </p>
    </div>
  )
}
```

- [ ] **Step 2: Create privacy policy page**

Create `src/app/privacy-policy/page.tsx`:

```tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy policy for AI Tools Hub.',
}

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-2xl mx-auto prose prose-gray">
      <h1>Privacy Policy</h1>
      <p><em>Last updated: April 26, 2026</em></p>
      <h2>Advertising</h2>
      <p>
        This site uses Google AdSense to display advertisements. Google may use cookies to
        serve ads based on your prior visits to this website or other websites. You may opt
        out of personalized advertising by visiting{' '}
        <a href="https://www.google.com/settings/ads">Google Ads Settings</a>.
      </p>
      <h2>Analytics</h2>
      <p>
        We may use analytics tools to understand how visitors use this site. No personally
        identifiable information is collected.
      </p>
      <h2>Contact</h2>
      <p>For privacy-related questions, contact us via the About page.</p>
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/about/ src/app/privacy-policy/
git commit -m "feat: add about and privacy policy pages (AdSense requirements)"
```

---

## Task 10: robots.txt + Sitemap

**Files:**
- Create: `public/robots.txt`
- Create: `next-sitemap.config.js`

- [ ] **Step 1: Create robots.txt**

Create `public/robots.txt`:

```
User-agent: *
Allow: /

Sitemap: https://your-domain.com/sitemap.xml
```

- [ ] **Step 2: Create next-sitemap config**

Create `next-sitemap.config.js`:

```js
/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.SITE_URL || 'https://your-domain.com',
  generateRobotsTxt: false,
  changefreq: 'daily',
  priority: 0.7,
}
```

- [ ] **Step 3: Add postbuild script to package.json**

In `package.json`, update the `scripts` section to add `postbuild`:

```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "postbuild": "next-sitemap",
  "start": "next start",
  "lint": "next lint"
}
```

- [ ] **Step 4: Add SITE_URL to .env.local**

```bash
cat > .env.local << 'EOF'
SITE_URL=https://your-domain.com
NEXT_PUBLIC_ADSENSE_PUBLISHER_ID=
EOF
```

(Fill in real values after Vercel deployment and AdSense approval.)

- [ ] **Step 5: Commit**

```bash
git add public/robots.txt next-sitemap.config.js package.json .env.local
git commit -m "feat: robots.txt and sitemap generation via next-sitemap"
```

---

## Task 11: AI Writing Agent — Topics List

**Files:**
- Create: `scripts/agent/topics.json`
- Create: `scripts/agent/progress.json`
- Create: `scripts/agent/requirements.txt`

- [ ] **Step 1: Create topics.json with 100 topics**

Create `scripts/agent/topics.json`:

```json
[
  {"id": 1, "title": "What is Harness? The AI Testing Platform Explained", "slug": "what-is-harness-ai-testing-platform", "tags": ["harness", "ai-tools"], "phase": 1},
  {"id": 2, "title": "Harness vs GitHub Actions: Which CI/CD Tool is Better for AI Projects?", "slug": "harness-vs-github-actions-cicd", "tags": ["harness", "ai-tools"], "phase": 1},
  {"id": 3, "title": "Getting Started with Harness: A Complete Beginner's Guide", "slug": "getting-started-with-harness-guide", "tags": ["harness", "ai-tools"], "phase": 1},
  {"id": 4, "title": "Harness Feature Flags: How to Use AI-Powered Feature Management", "slug": "harness-feature-flags-ai-management", "tags": ["harness", "ai-tools"], "phase": 1},
  {"id": 5, "title": "Harness AI Pricing: Is It Worth It in 2026?", "slug": "harness-ai-pricing-review-2026", "tags": ["harness", "ai-tools"], "phase": 1},
  {"id": 6, "title": "Harness for DevOps Teams: Real-World Use Cases and Benefits", "slug": "harness-devops-teams-use-cases", "tags": ["harness", "ai-tools"], "phase": 1},
  {"id": 7, "title": "What is an LLM? Large Language Models Explained Simply", "slug": "what-is-an-llm-large-language-models-explained", "tags": ["llm", "ai-tools"], "phase": 1},
  {"id": 8, "title": "LLM Benchmarks Explained: MMLU, HumanEval, and Beyond", "slug": "llm-benchmarks-explained-mmlu-humaneval", "tags": ["llm"], "phase": 1},
  {"id": 9, "title": "LLM Glossary: Tokens, Context Window, Temperature, and More", "slug": "llm-glossary-tokens-context-window-temperature", "tags": ["llm"], "phase": 1},
  {"id": 10, "title": "Closed vs Open Source LLMs: Which Should You Use in 2026?", "slug": "closed-vs-open-source-llms-2026", "tags": ["llm"], "phase": 1},
  {"id": 11, "title": "How LLM Training Works: A Non-Technical Guide", "slug": "how-llm-training-works-guide", "tags": ["llm"], "phase": 1},
  {"id": 12, "title": "LLM Context Windows: Why They Matter and How to Use Them", "slug": "llm-context-windows-explained", "tags": ["llm"], "phase": 1},
  {"id": 13, "title": "What is an AI Agent? Definition, Types, and Examples", "slug": "what-is-an-ai-agent-definition-types-examples", "tags": ["ai-agents"], "phase": 1},
  {"id": 14, "title": "Best AI Agent Frameworks in 2026: LangChain, AutoGen, CrewAI Compared", "slug": "best-ai-agent-frameworks-2026-langchain-autogen-crewai", "tags": ["ai-agents"], "phase": 1},
  {"id": 15, "title": "How to Build Your First AI Agent with Python", "slug": "how-to-build-first-ai-agent-python", "tags": ["ai-agents"], "phase": 1},
  {"id": 16, "title": "LangChain vs AutoGen: Which AI Agent Framework Should You Choose?", "slug": "langchain-vs-autogen-ai-agent-framework", "tags": ["ai-agents"], "phase": 1},
  {"id": 17, "title": "Agentic AI: How Multi-Agent Systems Work", "slug": "agentic-ai-multi-agent-systems-explained", "tags": ["ai-agents"], "phase": 1},
  {"id": 18, "title": "AI Agent Memory: How Agents Remember and Learn", "slug": "ai-agent-memory-how-agents-remember", "tags": ["ai-agents"], "phase": 1},
  {"id": 19, "title": "DeepSeek V4 Review: Is It Really Better Than GPT-5?", "slug": "deepseek-v4-review-vs-gpt5", "tags": ["deepseek", "llm"], "phase": 1},
  {"id": 20, "title": "DeepSeek V4 API Guide: How to Get Started", "slug": "deepseek-v4-api-guide-getting-started", "tags": ["deepseek", "llm"], "phase": 1},
  {"id": 21, "title": "DeepSeek V4 vs Claude 4: Side-by-Side Comparison", "slug": "deepseek-v4-vs-claude-4-comparison", "tags": ["deepseek", "claude", "llm"], "phase": 1},
  {"id": 22, "title": "DeepSeek V4 Benchmark Results: Where It Excels and Where It Falls Short", "slug": "deepseek-v4-benchmark-results", "tags": ["deepseek", "llm"], "phase": 1},
  {"id": 23, "title": "DeepSeek V4 for Coding: A Developer's Honest Review", "slug": "deepseek-v4-for-coding-developer-review", "tags": ["deepseek", "ai-tools"], "phase": 1},
  {"id": 24, "title": "DeepSeek V4 Pricing: Free Tier, API Costs, and Value Analysis", "slug": "deepseek-v4-pricing-api-costs", "tags": ["deepseek"], "phase": 1},
  {"id": 25, "title": "Claude Code Review: Anthropic's AI Coding Assistant Tested", "slug": "claude-code-review-anthropic-coding-assistant", "tags": ["claude", "ai-tools"], "phase": 1},
  {"id": 26, "title": "How to Use Claude API: A Complete Getting Started Guide", "slug": "how-to-use-claude-api-getting-started", "tags": ["claude", "llm"], "phase": 1},
  {"id": 27, "title": "Claude 3.5 vs GPT-4o: Which AI Model Wins in 2026?", "slug": "claude-3-5-vs-gpt-4o-comparison-2026", "tags": ["claude", "llm"], "phase": 1},
  {"id": 28, "title": "Claude for Developers: Prompt Engineering Best Practices", "slug": "claude-prompt-engineering-best-practices", "tags": ["claude", "llm"], "phase": 1},
  {"id": 29, "title": "Anthropic's Constitutional AI: What Makes Claude Different", "slug": "anthropic-constitutional-ai-claude-explained", "tags": ["claude", "llm"], "phase": 1},
  {"id": 30, "title": "Claude Code vs GitHub Copilot: Which Should Developers Use?", "slug": "claude-code-vs-github-copilot-comparison", "tags": ["claude", "ai-tools"], "phase": 1},
  {"id": 31, "title": "Best AI Writing Tools in 2026: Full Comparison", "slug": "best-ai-writing-tools-2026", "tags": ["ai-tools"], "phase": 2},
  {"id": 32, "title": "ChatGPT vs Claude vs Gemini: The Ultimate AI Chatbot Showdown", "slug": "chatgpt-vs-claude-vs-gemini-comparison", "tags": ["ai-tools", "llm"], "phase": 2},
  {"id": 33, "title": "Best AI Code Assistants in 2026: Ranked and Reviewed", "slug": "best-ai-code-assistants-2026", "tags": ["ai-tools"], "phase": 2},
  {"id": 34, "title": "Perplexity AI Review: Is It Worth Paying For?", "slug": "perplexity-ai-review-2026", "tags": ["ai-tools"], "phase": 2},
  {"id": 35, "title": "Cursor vs VS Code + Copilot: Which AI Coding Setup Wins?", "slug": "cursor-vs-vscode-copilot-ai-coding", "tags": ["ai-tools"], "phase": 2},
  {"id": 36, "title": "How to Use ChatGPT for Productivity: 10 Real Use Cases", "slug": "chatgpt-productivity-use-cases", "tags": ["ai-tools"], "phase": 2},
  {"id": 37, "title": "Midjourney vs DALL-E 3 vs Stable Diffusion: Image AI Compared", "slug": "midjourney-vs-dalle-3-vs-stable-diffusion", "tags": ["ai-tools"], "phase": 2},
  {"id": 38, "title": "Notion AI Review: Does It Replace Your Writing Assistant?", "slug": "notion-ai-review-2026", "tags": ["ai-tools"], "phase": 2},
  {"id": 39, "title": "ElevenLabs Review: The Best AI Voice Generator in 2026?", "slug": "elevenlabs-review-ai-voice-generator", "tags": ["ai-tools"], "phase": 2},
  {"id": 40, "title": "Best AI Tools for Students in 2026", "slug": "best-ai-tools-for-students-2026", "tags": ["ai-tools"], "phase": 2},
  {"id": 41, "title": "Best AI Tools for Marketing Teams in 2026", "slug": "best-ai-tools-for-marketing-2026", "tags": ["ai-tools"], "phase": 2},
  {"id": 42, "title": "How to Build a RAG Pipeline with LangChain", "slug": "how-to-build-rag-pipeline-langchain", "tags": ["ai-agents", "llm"], "phase": 2},
  {"id": 43, "title": "CrewAI Tutorial: Build a Multi-Agent System from Scratch", "slug": "crewai-tutorial-multi-agent-system", "tags": ["ai-agents"], "phase": 2},
  {"id": 44, "title": "AutoGen Tutorial: Microsoft's AI Agent Framework Explained", "slug": "autogen-tutorial-microsoft-ai-agents", "tags": ["ai-agents"], "phase": 2},
  {"id": 45, "title": "AI Agent Tools: Function Calling, Code Execution, and Web Search", "slug": "ai-agent-tools-function-calling-explained", "tags": ["ai-agents"], "phase": 2},
  {"id": 46, "title": "How to Give AI Agents Long-Term Memory with Vector Databases", "slug": "ai-agents-long-term-memory-vector-databases", "tags": ["ai-agents"], "phase": 2},
  {"id": 47, "title": "Building a Research Agent with Claude and Python", "slug": "building-research-agent-claude-python", "tags": ["ai-agents", "claude"], "phase": 2},
  {"id": 48, "title": "AI Agent Safety: How to Build Reliable and Controllable Agents", "slug": "ai-agent-safety-reliable-controllable", "tags": ["ai-agents"], "phase": 2},
  {"id": 49, "title": "Agentic Workflows: How to Automate Complex Tasks with AI", "slug": "agentic-workflows-automate-complex-tasks", "tags": ["ai-agents"], "phase": 2},
  {"id": 50, "title": "ReAct Prompting: How AI Agents Reason and Act", "slug": "react-prompting-ai-agents-reason-act", "tags": ["ai-agents", "llm"], "phase": 2},
  {"id": 51, "title": "GPT-5 Review: OpenAI's Most Powerful Model Yet", "slug": "gpt-5-review-openai-most-powerful-model", "tags": ["llm", "ai-tools"], "phase": 2},
  {"id": 52, "title": "Gemini Ultra 2.0 Review: Google's Answer to GPT-5", "slug": "gemini-ultra-2-review-google-gpt5", "tags": ["llm"], "phase": 2},
  {"id": 53, "title": "Llama 4 Review: Meta's Open Source LLM Gets Serious", "slug": "llama-4-review-meta-open-source-llm", "tags": ["llm"], "phase": 2},
  {"id": 54, "title": "Mistral Large 3 Review: Europe's Best AI Model?", "slug": "mistral-large-3-review-europe-ai", "tags": ["llm"], "phase": 2},
  {"id": 55, "title": "Qwen 3 vs DeepSeek V4: Chinese AI Models Compared", "slug": "qwen-3-vs-deepseek-v4-comparison", "tags": ["llm", "deepseek"], "phase": 2},
  {"id": 56, "title": "OpenAI o3 vs Claude Sonnet: Reasoning Model Showdown", "slug": "openai-o3-vs-claude-sonnet-reasoning", "tags": ["llm", "claude"], "phase": 2},
  {"id": 57, "title": "The State of AI in 2026: Models, Tools, and What's Next", "slug": "state-of-ai-2026-models-tools-trends", "tags": ["llm", "ai-tools"], "phase": 2},
  {"id": 58, "title": "Multimodal AI: How Vision + Language Models Work", "slug": "multimodal-ai-vision-language-models", "tags": ["llm"], "phase": 2},
  {"id": 59, "title": "AI Reasoning Models Explained: Chain-of-Thought vs System 2 Thinking", "slug": "ai-reasoning-models-chain-of-thought-system-2", "tags": ["llm"], "phase": 2},
  {"id": 60, "title": "Fine-Tuning vs Prompt Engineering: When to Use Each", "slug": "fine-tuning-vs-prompt-engineering-when-to-use", "tags": ["llm"], "phase": 2},
  {"id": 61, "title": "How to Use the OpenAI API: A Complete Guide for Beginners", "slug": "how-to-use-openai-api-beginners-guide", "tags": ["ai-tools", "llm"], "phase": 2},
  {"id": 62, "title": "OpenAI Playground vs API: What's the Difference?", "slug": "openai-playground-vs-api-difference", "tags": ["ai-tools"], "phase": 2},
  {"id": 63, "title": "How to Use Gemini API in Python: Step-by-Step", "slug": "how-to-use-gemini-api-python-guide", "tags": ["ai-tools", "llm"], "phase": 2},
  {"id": 64, "title": "Prompt Engineering 101: Techniques That Actually Work", "slug": "prompt-engineering-101-techniques", "tags": ["llm", "ai-tools"], "phase": 2},
  {"id": 65, "title": "How to Use Claude for Code Review: A Developer's Guide", "slug": "how-to-use-claude-for-code-review", "tags": ["claude", "ai-tools"], "phase": 2},
  {"id": 66, "title": "LLM Hallucinations: Why AI Makes Things Up and How to Fix It", "slug": "llm-hallucinations-why-ai-makes-things-up", "tags": ["llm"], "phase": 2},
  {"id": 67, "title": "Vector Databases Explained: Pinecone, Weaviate, and Chroma", "slug": "vector-databases-pinecone-weaviate-chroma", "tags": ["ai-tools", "llm"], "phase": 2},
  {"id": 68, "title": "Retrieval-Augmented Generation (RAG) Explained Simply", "slug": "retrieval-augmented-generation-rag-explained", "tags": ["llm", "ai-agents"], "phase": 2},
  {"id": 69, "title": "AI for Data Analysis: Best Tools and Techniques in 2026", "slug": "ai-for-data-analysis-tools-2026", "tags": ["ai-tools"], "phase": 2},
  {"id": 70, "title": "AI in Healthcare: Use Cases and Ethical Considerations", "slug": "ai-in-healthcare-use-cases-ethics", "tags": ["ai-tools"], "phase": 2},
  {"id": 71, "title": "Top 10 AI Browser Extensions for Productivity", "slug": "top-ai-browser-extensions-productivity", "tags": ["ai-tools"], "phase": 2},
  {"id": 72, "title": "How to Build a Chatbot with Claude API in Python", "slug": "how-to-build-chatbot-claude-api-python", "tags": ["claude", "ai-agents"], "phase": 2},
  {"id": 73, "title": "AI Summarization Tools: Best Options for Long Documents", "slug": "ai-summarization-tools-long-documents", "tags": ["ai-tools"], "phase": 2},
  {"id": 74, "title": "AI for SEO: How to Use AI Tools to Rank Higher on Google", "slug": "ai-for-seo-tools-rank-higher-google", "tags": ["ai-tools"], "phase": 2},
  {"id": 75, "title": "How to Run LLMs Locally: Ollama, LM Studio, and More", "slug": "run-llms-locally-ollama-lm-studio", "tags": ["llm", "ai-tools"], "phase": 2},
  {"id": 76, "title": "DeepSeek vs OpenAI: The Full Competitive Analysis", "slug": "deepseek-vs-openai-competitive-analysis", "tags": ["deepseek", "llm"], "phase": 2},
  {"id": 77, "title": "AI Agents for Customer Support: Real-World Deployments", "slug": "ai-agents-customer-support-deployments", "tags": ["ai-agents"], "phase": 2},
  {"id": 78, "title": "Building an AI Agent That Browses the Web", "slug": "building-ai-agent-browses-web", "tags": ["ai-agents"], "phase": 2},
  {"id": 79, "title": "Function Calling with OpenAI API: A Practical Guide", "slug": "function-calling-openai-api-guide", "tags": ["llm", "ai-agents"], "phase": 2},
  {"id": 80, "title": "How AI Agents Are Changing Software Development", "slug": "ai-agents-changing-software-development", "tags": ["ai-agents"], "phase": 2},
  {"id": 81, "title": "Anthropic vs OpenAI: Company Philosophy and Model Differences", "slug": "anthropic-vs-openai-philosophy-models", "tags": ["claude", "llm"], "phase": 2},
  {"id": 82, "title": "Claude Computer Use: How Anthropic's AI Controls Your Screen", "slug": "claude-computer-use-anthropic-screen-control", "tags": ["claude", "ai-agents"], "phase": 2},
  {"id": 83, "title": "How Transformer Architecture Works: Plain English Explanation", "slug": "transformer-architecture-plain-english", "tags": ["llm"], "phase": 2},
  {"id": 84, "title": "AI Safety 101: Alignment, RLHF, and Why It Matters", "slug": "ai-safety-alignment-rlhf-explained", "tags": ["llm"], "phase": 2},
  {"id": 85, "title": "Best AI Tools for Developers in 2026", "slug": "best-ai-tools-for-developers-2026", "tags": ["ai-tools"], "phase": 2},
  {"id": 86, "title": "MCP (Model Context Protocol) Explained: Claude's Plugin System", "slug": "mcp-model-context-protocol-claude-explained", "tags": ["claude", "ai-agents"], "phase": 2},
  {"id": 87, "title": "How to Choose the Right LLM for Your Project", "slug": "how-to-choose-right-llm-for-project", "tags": ["llm"], "phase": 2},
  {"id": 88, "title": "AI Coding Assistants: How They Work and Which to Use", "slug": "ai-coding-assistants-how-they-work", "tags": ["ai-tools"], "phase": 2},
  {"id": 89, "title": "Token Limits and Long Context: Making the Most of 1M Token Windows", "slug": "token-limits-long-context-1m-windows", "tags": ["llm"], "phase": 2},
  {"id": 90, "title": "AI in Education: Best Tools for Teachers and Students", "slug": "ai-in-education-tools-teachers-students", "tags": ["ai-tools"], "phase": 2},
  {"id": 91, "title": "How to Use AI for Content Creation Without Getting Penalized by Google", "slug": "ai-content-creation-google-seo-guide", "tags": ["ai-tools"], "phase": 2},
  {"id": 92, "title": "Embeddings Explained: How AI Understands Text as Vectors", "slug": "embeddings-explained-ai-text-vectors", "tags": ["llm"], "phase": 2},
  {"id": 93, "title": "Zero-Shot vs Few-Shot Prompting: When to Use Each", "slug": "zero-shot-vs-few-shot-prompting", "tags": ["llm"], "phase": 2},
  {"id": 94, "title": "How AI Is Transforming the Job Market in 2026", "slug": "ai-transforming-job-market-2026", "tags": ["ai-tools"], "phase": 2},
  {"id": 95, "title": "GitHub Copilot X Review: Is It Still the Best AI Coding Tool?", "slug": "github-copilot-x-review-2026", "tags": ["ai-tools"], "phase": 2},
  {"id": 96, "title": "How to Deploy an AI Agent as a Web Service", "slug": "how-to-deploy-ai-agent-web-service", "tags": ["ai-agents"], "phase": 2},
  {"id": 97, "title": "AI Agent Orchestration: Managing Multiple Agents at Scale", "slug": "ai-agent-orchestration-multiple-agents", "tags": ["ai-agents"], "phase": 2},
  {"id": 98, "title": "Best Free AI Tools in 2026: No Credit Card Required", "slug": "best-free-ai-tools-2026", "tags": ["ai-tools"], "phase": 2},
  {"id": 99, "title": "The Complete History of ChatGPT: From GPT-1 to GPT-5", "slug": "complete-history-chatgpt-gpt1-gpt5", "tags": ["llm", "ai-tools"], "phase": 2},
  {"id": 100, "title": "AI Trends to Watch in the Second Half of 2026", "slug": "ai-trends-second-half-2026", "tags": ["ai-tools", "llm"], "phase": 2}
]
```

- [ ] **Step 2: Create empty progress file**

Create `scripts/agent/progress.json`:

```json
{
  "published": []
}
```

- [ ] **Step 3: Create requirements.txt**

Create `scripts/agent/requirements.txt`:

```
anthropic>=0.40.0
```

- [ ] **Step 4: Commit**

```bash
git add scripts/
git commit -m "feat: agent topics list (100 articles, phases 1 and 2) and progress tracker"
```

---

## Task 12: AI Writing Agent Script

**Files:**
- Create: `scripts/agent/generate.py`

- [ ] **Step 1: Create generate.py**

Create `scripts/agent/generate.py`:

```python
#!/usr/bin/env python3
"""AI article generation agent. Reads topics.json, generates articles via Claude, commits to git."""

import json
import os
import subprocess
import sys
from datetime import date
from pathlib import Path

import anthropic

SCRIPT_DIR = Path(__file__).parent
REPO_ROOT = SCRIPT_DIR.parent.parent
POSTS_DIR = REPO_ROOT / "content" / "posts"
TOPICS_FILE = SCRIPT_DIR / "topics.json"
PROGRESS_FILE = SCRIPT_DIR / "progress.json"

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


def build_frontmatter(topic: dict, pub_date: str) -> str:
    tags_yaml = ", ".join(topic["tags"])
    return f"""---
title: "{topic['title']}"
date: "{pub_date}"
slug: "{topic['slug']}"
description: "Learn everything about {topic['title'].lower()} in this in-depth guide."
tags: [{tags_yaml}]
---

"""


def write_post(topic: dict, body: str, pub_date: str) -> Path:
    POSTS_DIR.mkdir(parents=True, exist_ok=True)
    filename = f"{pub_date}-{topic['slug']}.md"
    filepath = POSTS_DIR / filename
    content = build_frontmatter(topic, pub_date) + body
    filepath.write_text(content)
    return filepath


def git_commit(filepath: Path, title: str) -> None:
    subprocess.run(["git", "add", str(filepath), str(PROGRESS_FILE)], cwd=REPO_ROOT, check=True)
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
    # Phase 1 first, then phase 2
    pending.sort(key=lambda t: (t["phase"], t["id"]))
    batch = pending[:count]

    if not batch:
        print("All topics published.")
        return

    pub_date = date.today().isoformat()
    pushed = False

    for topic in batch:
        print(f"Generating: {topic['title']}")
        try:
            body = generate_article(client, topic)
            filepath = write_post(topic, body, pub_date)
            progress["published"].append(topic["id"])
            save_progress(progress)
            git_commit(filepath, topic["title"])
            print(f"  ✓ Written: {filepath.name}")
        except Exception as e:
            print(f"  ✗ Failed: {e}", file=sys.stderr)
            continue

    git_push()
    pushed = True
    print(f"Done. {len(batch)} articles published and pushed.")


if __name__ == "__main__":
    main()
```

- [ ] **Step 2: Test the script locally with one article**

```bash
cd /root/ai_skill_agent_seo
pip install anthropic
ANTHROPIC_API_KEY=your_key_here python scripts/agent/generate.py 1
```
Expected: one `.md` file appears in `content/posts/`, committed to git.

- [ ] **Step 3: Verify the generated file has valid frontmatter**

```bash
node -e "
const matter = require('gray-matter');
const fs = require('fs');
const files = fs.readdirSync('content/posts');
const file = files[files.length - 1];
const { data } = matter(fs.readFileSync('content/posts/' + file, 'utf8'));
console.log(data);
"
```
Expected: JSON object with title, date, slug, description, tags.

- [ ] **Step 4: Commit the agent script**

```bash
git add scripts/agent/generate.py
git commit -m "feat: AI writing agent script (generate.py)"
```

---

## Task 13: GitHub Actions Cron Workflow

**Files:**
- Create: `.github/workflows/publish.yml`

- [ ] **Step 1: Create workflow file**

Create `.github/workflows/publish.yml`:

```yaml
name: Publish Articles

on:
  schedule:
    - cron: '0 8 * * *'   # 8:00 AM UTC daily
  workflow_dispatch:        # allow manual trigger

jobs:
  publish:
    runs-on: ubuntu-latest
    permissions:
      contents: write

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
        with:
          token: ${{ secrets.GITHUB_TOKEN }}

      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.11'

      - name: Install agent dependencies
        run: pip install -r scripts/agent/requirements.txt

      - name: Configure git
        run: |
          git config user.name "AI Publisher Bot"
          git config user.email "bot@ai-tools-hub.com"

      - name: Generate and publish articles
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
        run: python scripts/agent/generate.py 7
```

- [ ] **Step 2: Commit**

```bash
git add .github/
git commit -m "feat: GitHub Actions daily cron to publish 7 articles/day"
```

---

## Task 14: Vercel Deployment

**Files:**
- Create: `vercel.json` (minimal config)

- [ ] **Step 1: Create vercel.json**

Create `vercel.json`:

```json
{
  "framework": "nextjs"
}
```

- [ ] **Step 2: Push everything to GitHub**

```bash
git push origin master
```

- [ ] **Step 3: Deploy to Vercel**

1. Go to [vercel.com](https://vercel.com) → New Project → Import from GitHub
2. Select this repository
3. Framework: Next.js (auto-detected)
4. Add environment variables:
   - `SITE_URL` = your Vercel URL (e.g. `https://ai-tools-hub.vercel.app`)
   - `NEXT_PUBLIC_ADSENSE_PUBLISHER_ID` = leave empty until AdSense approved
5. Click Deploy

- [ ] **Step 4: Add ANTHROPIC_API_KEY to GitHub Actions secrets**

1. GitHub repo → Settings → Secrets and variables → Actions
2. New repository secret: `ANTHROPIC_API_KEY` = your key

- [ ] **Step 5: Verify deployment**

```bash
curl -s https://your-vercel-url.vercel.app | grep -c "<article"
```
Expected: number > 0 once articles exist.

- [ ] **Step 6: Commit vercel.json**

```bash
git add vercel.json
git commit -m "chore: add vercel.json deployment config"
git push
```

---

## Task 15: Google Search Console + AdSense

This task is manual (no code).

- [ ] **Step 1: Submit to Google Search Console**

1. Go to [search.google.com/search-console](https://search.google.com/search-console)
2. Add property → URL prefix → enter your Vercel domain
3. Verify via HTML tag (add to `src/app/layout.tsx` `<head>`)
4. Submit sitemap: `https://your-domain.com/sitemap.xml`

- [ ] **Step 2: Add verification meta tag to layout**

In `src/app/layout.tsx`, add to the `metadata` export:

```ts
verification: {
  google: 'YOUR_GOOGLE_VERIFICATION_CODE',
},
```

Commit and push.

- [ ] **Step 3: Apply for Google AdSense (after 30 articles are live)**

1. Go to [adsense.google.com](https://adsense.google.com)
2. Sign up → add your site URL
3. Copy publisher ID (format: `ca-pub-XXXXXXXXXX`)
4. Set `NEXT_PUBLIC_ADSENSE_PUBLISHER_ID=ca-pub-XXXXXXXXXX` in Vercel environment variables
5. Redeploy

- [ ] **Step 4: Add ad slot IDs to AdUnit calls**

Once AdSense is approved, create ad units in AdSense dashboard and replace placeholder slot strings in:
- `src/app/page.tsx` (`slot="homepage-top"` → real slot ID)
- `src/app/blog/[slug]/page.tsx` (`slot="article-top"`, `slot="article-mid"` → real slot IDs)
- `src/app/layout.tsx` sidebar slot

Commit and push.
