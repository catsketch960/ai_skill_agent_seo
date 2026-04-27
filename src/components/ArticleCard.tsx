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
              className="object-cover"
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
