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
