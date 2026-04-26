# AI Traffic Site — Design Spec

**Date:** 2026-04-26  
**Goal:** Build an English SEO content site covering AI tools / AI agents / frontier models, monetized via Google AdSense. Target: 100 articles, fully automated publishing pipeline.

---

## 1. Architecture Overview

```
GitHub Repo
  ├── content/posts/         ← 100 Markdown articles
  ├── src/                   ← Next.js frontend
  └── scripts/agent/         ← AI writing agent (Python)

         ↓ git push
      GitHub Actions         ← cron: publish 5-10 articles/day
         ↓
       Vercel                ← static site hosting + CDN
         ↓
    Google AdSense           ← ad monetization
```

**Data flow:**
1. GitHub Actions runs `generate.py` on a daily cron schedule
2. Agent calls Claude API → generates article Markdown
3. Agent commits and pushes to GitHub
4. Vercel detects push, rebuilds and deploys automatically
5. Visitors access static pages, AdSense serves ads

---

## 2. Repository Structure

```
/
├── content/
│   └── posts/
│       └── YYYY-MM-DD-slug.md      ← one file per article
├── src/
│   └── app/
│       ├── page.tsx                ← homepage (article list)
│       ├── blog/[slug]/page.tsx    ← article detail page
│       ├── category/[tag]/page.tsx ← category pages
│       └── layout.tsx              ← AdSense script injection
├── scripts/
│   └── agent/
│       ├── generate.py             ← main agent script
│       ├── topics.json             ← topic list (100 items)
│       └── progress.json           ← tracks completed articles
├── public/
│   ├── robots.txt
│   └── privacy-policy/            ← required for AdSense
└── .github/
    └── workflows/
        └── publish.yml             ← daily cron job
```

---

## 3. Article Content Plan (100 articles)

### Phase 1 — First 30 Articles (Priority Publishing)

These are published first to establish topical authority before AdSense application.

| Topic Cluster | Count | Example Titles |
|---------------|-------|----------------|
| Harness (AI testing/evaluation platform) | 6 | "What is Harness?", "Harness AI vs competitors", "Harness CI/CD guide" |
| LLM Wiki (concepts & glossary) | 6 | "What is a Large Language Model?", "LLM benchmarks explained", "Tokens, context window, temperature — a glossary" |
| AI Agents | 6 | "What is an AI agent?", "Best AI agent frameworks 2025", "LangChain vs AutoGen vs CrewAI" |
| DeepSeek V4 | 6 | "DeepSeek V4 review", "DeepSeek V4 vs GPT-5", "How to use DeepSeek V4 API" |
| Claude (Anthropic) | 6 | "Claude Code review", "Claude 3.5 vs GPT-4o", "How to use Claude API", "Claude Code for developers" |

### Phase 2 — Remaining 70 Articles

| Category | Count | Example Topics |
|----------|-------|----------------|
| AI Tool Reviews | 20 | "Best AI tools for X", "Tool A vs Tool B" |
| AI Agent Tutorials | 19 | "How to build an AI agent", "Agent memory explained" |
| Frontier Model Analysis | 16 | GPT-5, Gemini Ultra, Llama 4, Mistral |
| How-to Guides | 15 | "How to use X", "X prompt engineering guide" |

Each article: 1500–2500 words, structured with H2/H3 headings, FAQ section, and internal links.

---

## 4. AI Writing Agent

**Script:** `scripts/agent/generate.py`

**Workflow per run (5-10 articles/day):**
1. Read `topics.json`, pick next unpublished topics
2. Call Claude API (claude-sonnet-4-6) with structured prompt
3. Parse response into Markdown with frontmatter
4. Write to `content/posts/YYYY-MM-DD-{slug}.md`
5. Mark topic as done in `progress.json`
6. `git add && git commit && git push`

**Article frontmatter schema:**
```yaml
---
title: "..."
date: "YYYY-MM-DD"
slug: "..."
description: "..."   # 150-160 chars for meta description
tags: [ai-tools, ai-agents, deepseek, claude-code]
---
```

**Prompt requirements:**
- Output structured Markdown (H2/H3, lists, code blocks where relevant)
- Include FAQ section (boosts Google Featured Snippet eligibility)
- Target Flesch reading ease > 60
- Word count: 1500–2500 words
- Do not mention "as an AI" or similar disclaimers

**Cost estimate:** 100 articles × ~2000 words ≈ $5–15 total (Claude Sonnet pricing)

---

## 5. GitHub Actions Cron

**File:** `.github/workflows/publish.yml`

```yaml
on:
  schedule:
    - cron: '0 8 * * *'   # 8am UTC daily
```

- Runs `generate.py` with `--count 7` (7 articles/day → 100 articles in ~14 days)
- Requires `ANTHROPIC_API_KEY` stored as GitHub Actions secret
- Commits and pushes trigger Vercel deployment automatically

---

## 6. Next.js Frontend

**Framework:** Next.js 14+ with App Router  
**Hosting:** Vercel (free tier sufficient for static site)

**Pages:**
- `/` — homepage with article list and category navigation
- `/blog/[slug]` — article detail page
- `/category/[tag]` — tag/category filtered list
- `/about` — about page (AdSense requirement)
- `/privacy-policy` — privacy policy page (AdSense requirement)
- `/sitemap.xml` — auto-generated via `next-sitemap`
- `/robots.txt` — allow all crawlers

**SEO configuration per article page:**
- Unique `<title>` and `<meta description>` from frontmatter
- Open Graph tags for social sharing
- JSON-LD Article structured data schema
- Canonical URL

**Performance targets:**
- Lighthouse SEO score > 95
- First Contentful Paint < 2s (guaranteed by static HTML + Vercel CDN)

---

## 7. Google AdSense Integration

**Ad placements (article pages):**
- Top of article content (below title)
- Mid-article (after ~50% of content)
- Sidebar (homepage and article pages on desktop)

**Integration:** AdSense `<script>` tag injected in `src/app/layout.tsx`. Publisher ID configured via environment variable.

**AdSense approval checklist:**
| Requirement | Action |
|-------------|--------|
| 20-30 published articles | Publish before applying |
| Privacy Policy page | `/privacy-policy` route |
| About page | `/about` route |
| Site live 2-4 weeks | Wait before applying |
| Google Search Console | Submit sitemap after launch |

**Recommended timeline:**
- Week 1-2: Publish 30 articles, submit to Search Console
- Week 3: Apply for AdSense, continue publishing
- Week 4+: AdSense approved, monetization live

---

## 8. Error Handling

- Agent logs failures per article to `scripts/agent/errors.log`; skips failed topics and continues
- GitHub Actions sends email notification on workflow failure
- Vercel deployment failures visible in Vercel dashboard

---

## 9. Out of Scope

- User accounts / comments
- Newsletter / email capture
- Paid content or subscriptions
- Multi-language support
