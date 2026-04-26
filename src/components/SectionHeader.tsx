'use client'

import Link from 'next/link'

interface Tab {
  label: string
  href: string
}

interface SectionHeaderProps {
  title: string
  tabs?: Tab[]
  activeTab?: string
}

const DEFAULT_TABS: Tab[] = [
  { label: 'All', href: '/' },
  { label: 'AI Tools', href: '/category/ai-tools' },
  { label: 'AI Agents', href: '/category/ai-agents' },
  { label: 'LLMs', href: '/category/llm' },
  { label: 'DeepSeek', href: '/category/deepseek' },
  { label: 'Claude', href: '/category/claude' },
]

export default function SectionHeader({ title, tabs = DEFAULT_TABS, activeTab = '/' }: SectionHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div className="flex items-center gap-3">
        <div className="w-1 h-6 rounded-full bg-gradient-brand shrink-0" />
        <h2 className="text-lg font-bold text-heading">{title}</h2>
      </div>
      <div className="flex gap-2 flex-wrap">
        {tabs.map(tab => (
          <Link
            key={tab.href}
            href={tab.href}
            className={`text-[11px] font-semibold px-4 py-1.5 rounded-full transition-colors ${
              tab.href === activeTab
                ? 'gradient-btn text-white'
                : 'bg-white text-muted border border-gray-200 hover:border-indigo-200 hover:text-heading'
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>
    </div>
  )
}
