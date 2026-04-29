'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import MermaidDiagram from './MermaidDiagram'

export default function MarkdownContent({ children }: { children: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        code({ className, children: codeChildren, ...props }) {
          const match = /language-mermaid/.test(className || '')
          if (match) {
            return <MermaidDiagram chart={String(codeChildren)} />
          }
          return (
            <code className={className} {...props}>
              {codeChildren}
            </code>
          )
        },
      }}
    >
      {children}
    </ReactMarkdown>
  )
}
