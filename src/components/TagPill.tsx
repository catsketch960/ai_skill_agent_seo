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
