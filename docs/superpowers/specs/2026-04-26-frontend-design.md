# Frontend Design Spec — AI Tools Hub

**Date:** 2026-04-26  
**Goal:** Define the visual design system for the AI Tools Hub SEO content site — colors, typography, components, layouts, and ad placements.

---

## 1. Design Direction

**Style:** Modern Gradient  
Light blue-to-purple gradient background (`#eff6ff → #f5f3ff`), white card surfaces with soft purple-tinted shadows, pill-shaped tags, gradient text/buttons. Feels like a modern SaaS product page — professional, trustworthy, visually distinct from generic blogs.

**Target audience:** English-speaking developers and tech-curious users searching for AI tool information.

**Design goals:**
- High AdSense RPM — ad placements are first-class citizens in the layout
- SEO-friendly — semantic HTML, fast LCP, clean hierarchy
- Mobile-responsive — all layouts collapse gracefully to single column

---

## 2. Color System

| Token | Value | Usage |
|-------|-------|-------|
| `gradient-from` | `#3b82f6` (blue-500) | Gradient start, primary accent |
| `gradient-to` | `#8b5cf6` (violet-500) | Gradient end, secondary accent |
| `bg-page` | `linear-gradient(135deg, #eff6ff, #f5f3ff)` | Page background |
| `bg-card` | `#ffffff` | Card surfaces |
| `shadow-card` | `0 4px 20px rgba(99,102,241,0.10)` | Card drop shadow |
| `text-heading` | `#1e1b4b` (indigo-950) | H1, H2, card titles |
| `text-body` | `#374151` (gray-700) | Article body text |
| `text-muted` | `#6b7280` (gray-500) | Dates, metadata |
| `text-placeholder` | `#9ca3af` (gray-400) | Captions, ad labels |
| `border-subtle` | `#f3f4f6` (gray-100) | Dividers inside cards |

**Tag color palette** (per category):

| Tag | Background | Text |
|-----|-----------|------|
| `claude` | `#ede9fe` | `#7c3aed` |
| `deepseek` | `#dbeafe` | `#1d4ed8` |
| `llm` | `#fef3c7` | `#92400e` |
| `ai-agents` | `#dcfce7` | `#15803d` |
| `ai-tools` | `#dbeafe` | `#1d4ed8` |
| `harness` | `#ede9fe` | `#7c3aed` |

---

## 3. Typography

| Role | Font | Size | Weight |
|------|------|------|--------|
| Logo | Inter | 15px | 800 |
| H1 (article) | Inter | 32px | 800 |
| H1 (hero overlay) | Inter | 22px | 800 |
| H2 (section) | Inter | 20px | 700 |
| H2 (in-article) | Inter | 18px | 700 |
| Card title | Inter | 13px | 700 |
| Body text | Inter | 14px | 400 |
| Tags / labels | Inter | 9–10px | 500–600 |
| Meta (date, read time) | Inter | 10–11px | 400 |

---

## 4. Component Library

### 4.1 Navigation Bar

- Position: sticky top, `z-index: 50`
- Background: `rgba(255,255,255,0.85)` with `backdrop-filter: blur(12px)`
- Border bottom: `1px solid rgba(99,102,241,0.1)`
- Left: Logo icon (28×28px gradient square, rounded-lg) + wordmark with gradient text
- Right: category links (gray-500) + "Newsletter" pill button (gradient bg, white text)
- Mobile: hamburger menu collapses category links

### 4.2 Hero Banner

- Height: 280px desktop, 200px mobile
- Image: AI-generated via Qwen (neural network visualization, blue-purple palette)
- Overlay: `linear-gradient(135deg, rgba(30,27,75,0.75), rgba(30,58,138,0.5))`
- Content: category pill badge + H1 title + date + "Read Now →" white button
- Border radius: 16px, margin: 20px horizontal

### 4.3 Article Card

Structure (top to bottom):
1. **Color image area** (height: 110px) — dark gradient background per category + emoji icon + radial glow
2. **Card body** (padding: 14px):
   - Tag pills (pill shape, category color)
   - Title (13px, font-weight 700, 2-line clamp)
   - Footer row: date (left, gray-400) + "Read →" (right, gradient text)

Border radius: 14px. Shadow: `shadow-card`. No border.

### 4.4 Tag Pill

```
background: [category bg color]
color: [category text color]
font-size: 9-10px
font-weight: 500
padding: 2-3px 8-10px
border-radius: 20px (fully rounded)
```

### 4.5 Section Header

- Left accent bar: 4px wide, 20px tall, gradient fill, border-radius 2px
- Title: 16px, font-weight 700, `text-heading` color
- Right: filter tabs (active = gradient bg + white text, inactive = white bg + gray border)

### 4.6 AdSense Unit Wrapper

- Container: white card (`bg-card`, `shadow-card`, `border-radius: 12px`, padding: 12px)
- Label above: "Advertisement" in gray-400, 9px, uppercase, letter-spacing 0.06em
- The `<ins class="adsbygoogle">` tag fills the container
- Dashed placeholder shown during dev: `border: 1px dashed #c4b5fd`, `bg: #f9fafb`

---

## 5. Page Layouts

### 5.1 Homepage

```
[Sticky Nav]
[Hero Banner — full width with AI image]
[AdSense 728×90 banner]
[Section Header: "Latest Articles" + filter tabs]
[3-column article card grid]
[Load more button or pagination]
[Footer]
```

**Mobile collapse:** 3-col → 1-col. Hero height 200px. Filter tabs scroll horizontally.

### 5.2 Article Detail Page

```
[Sticky Nav]
[Breadcrumb: Home > Category > Article]
──────────────────────────────────────
[Main content — 65% width]   [Sidebar — 300px fixed]
  [Tag pills]                  [AdSense 300×250]
  [H1 title]                   [Related Articles]
  [Meta: date · read time]     [AdSense 300×150]
  [AdSense 728×90]
  [Article body top half]
  [AdSense in-article]
  [Article body bottom half]
  [FAQ section]
  [Related articles row]
──────────────────────────────────────
[Footer]
```

Sidebar is `position: sticky; top: 80px` on desktop. Collapses below content on mobile.

### 5.3 Category Page

```
[Sticky Nav]
[Category header: title + article count]
[AdSense 728×90]
[Article card grid (3-col desktop, 1-col mobile)]
[Footer]
```

### 5.4 Footer

- Background: white, border-top: `1px solid #f3f4f6`
- Left: logo + tagline
- Center: category links
- Right: About · Privacy Policy
- Bottom bar: copyright + gradient accent line

---

## 6. Ad Placement Summary

| Page | Placement | Size |
|------|-----------|------|
| Homepage | Below hero | 728×90 |
| Article | Above article | 728×90 |
| Article | Mid-article (after 50% of content) | Responsive in-article |
| Article sidebar | Sticky right | 300×250 |
| Article sidebar | Below related articles | 300×150 |
| Category page | Below header | 728×90 |

---

## 7. Hero Image Strategy

- **Generator:** Qwen wanx-v1 via DashScope API
- **Prompt template:** `"A futuristic AI technology illustration, [topic-specific descriptor], blue and purple gradient color palette, clean modern digital art, professional tech blog style, wide format"`
- **Size:** 1280×720 (16:9)
- **Hosting:** Images fetched at build time and stored in `public/images/heroes/` — no runtime API calls
- **Fallback:** CSS gradient placeholder if image fails to load

The AI writing agent generates one hero image per article during the `generate.py` run, saves to `public/images/heroes/{slug}.png`, and references it in the article frontmatter.

---

## 8. Responsive Breakpoints

| Breakpoint | Width | Changes |
|-----------|-------|---------|
| Mobile | < 640px | 1-col grid, no sidebar, hamburger nav |
| Tablet | 640–1024px | 2-col grid, sidebar collapses below |
| Desktop | > 1024px | 3-col grid, full sidebar, sticky nav |

---

## 9. Tech Stack Additions (vs base plan)

- `@tailwindcss/typography` — prose styles for article body
- Tailwind custom colors configured in `tailwind.config.ts` for the gradient system
- `next/font` with Inter for zero-layout-shift font loading
- CSS custom properties for gradient tokens (reused across components)
- Hero images: fetched during agent run, committed to `public/images/heroes/`
