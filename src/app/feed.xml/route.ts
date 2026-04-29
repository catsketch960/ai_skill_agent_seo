import { getAllPosts } from '@/lib/posts'

const SITE = 'https://aiatoolshub.site'

export async function GET() {
  const posts = getAllPosts()

  const items = posts
    .map(
      post => `    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${SITE}/blog/${post.slug}</link>
      <guid isPermaLink="true">${SITE}/blog/${post.slug}</guid>
      <description><![CDATA[${post.description}]]></description>
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
      ${post.tags.map(t => `<category>${t}</category>`).join('\n      ')}
    </item>`
    )
    .join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>AI Tools Hub</title>
    <link>${SITE}</link>
    <description>In-depth reviews and guides on AI tools, AI agents, LLMs, DeepSeek, Claude, and GPT.</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${SITE}/feed.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}
