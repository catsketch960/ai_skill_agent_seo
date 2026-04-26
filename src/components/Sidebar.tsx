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
