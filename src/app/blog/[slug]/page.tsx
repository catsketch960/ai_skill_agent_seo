import { notFound } from 'next/navigation'
import { getAllPosts, getPostBySlug, getPostsByTag } from '@/lib/posts'
import Image from 'next/image'
import Link from 'next/link'
import TagPill from '@/components/TagPill'
import AdUnit from '@/components/AdUnit'
import Sidebar from '@/components/Sidebar'
import MarkdownContent from '@/components/MarkdownContent'
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
