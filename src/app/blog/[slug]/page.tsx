import { notFound } from 'next/navigation'
import { getAllPosts, getPostBySlug, getPostsByTag } from '@/lib/posts'
import Link from 'next/link'
import TagPill from '@/components/TagPill'
import AdUnit from '@/components/AdUnit'
import Sidebar from '@/components/Sidebar'
import MarkdownContent from '@/components/MarkdownContent'
import type { Metadata } from 'next'
import {
  absoluteUrl,
  formatTagLabel,
  getCategoryUrl,
  getPostUrl,
  graphJsonLd,
  organizationJsonLd,
  SITE_NAME,
  SITE_URL,
} from '@/lib/seo'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return getAllPosts().map(p => ({ slug: p.slug }))
}

export const dynamicParams = false

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = getPostBySlug(slug)
  if (!post) return {}

  const url = getPostUrl(post.slug)
  const image = absoluteUrl(post.heroImage)
  const tags = post.tags.map(formatTagLabel)

  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: `/blog/${post.slug}` },
    authors: [{ name: SITE_NAME, url: SITE_URL }],
    keywords: tags,
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
      url,
      siteName: SITE_NAME,
      publishedTime: post.date,
      modifiedTime: post.date,
      tags,
      images: image ? [{ url: image, alt: post.title }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
      images: image ? [image] : undefined,
    },
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

  const url = getPostUrl(post.slug)
  const image = absoluteUrl(post.heroImage)
  const primaryTag = post.tags[0]
  const wordCount = post.content.split(/\s+/).filter(Boolean).length
  const breadcrumbItems = [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: SITE_URL,
    },
    ...(primaryTag
      ? [
          {
            '@type': 'ListItem',
            position: 2,
            name: formatTagLabel(primaryTag),
            item: getCategoryUrl(primaryTag),
          },
        ]
      : []),
    {
      '@type': 'ListItem',
      position: primaryTag ? 3 : 2,
      name: post.title,
      item: url,
    },
  ]

  const jsonLd = graphJsonLd([
    {
      '@type': 'BlogPosting',
      '@id': `${url}#article`,
      mainEntityOfPage: { '@type': 'WebPage', '@id': url },
      headline: post.title,
      description: post.description,
      url,
      datePublished: post.date,
      dateModified: post.date,
      image: image ? [image] : undefined,
      author: { '@id': organizationJsonLd['@id'] },
      publisher: { '@id': organizationJsonLd['@id'] },
      articleSection: post.tags.map(formatTagLabel),
      keywords: post.tags.map(formatTagLabel).join(', '),
      wordCount,
    },
    {
      '@type': 'BreadcrumbList',
      '@id': `${url}#breadcrumb`,
      itemListElement: breadcrumbItems,
    },
  ])

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
              {formatTagLabel(post.tags[0])}
            </Link>
            <span>/</span>
          </>
        )}
        <span className="text-heading line-clamp-1">{post.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8 items-start">
        {/* Main article */}
        <article className="bg-white rounded-2xl shadow-card p-8 min-w-0">
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
            <MarkdownContent>{topHalf}</MarkdownContent>
          </div>

          {/* Mid ad */}
          <AdUnit slot="article-mid" className="h-[120px] my-8" />

          {/* Article bottom half */}
          <div className="prose prose-gray max-w-none prose-headings:text-heading prose-headings:font-bold prose-a:text-indigo-600">
            <MarkdownContent>{bottomHalf}</MarkdownContent>
          </div>
        </article>

        {/* Sidebar */}
        <Sidebar related={related} />
      </div>
    </>
  )
}
