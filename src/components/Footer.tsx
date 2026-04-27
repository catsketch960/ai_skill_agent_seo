import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-subtle bg-white/60">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex flex-col md:flex-row justify-between gap-8 mb-8">
          <div>
            <span className="font-extrabold text-base gradient-text block mb-2">AI Tools Hub</span>
            <p className="text-muted text-sm max-w-xs">
              In-depth reviews and guides on AI tools, agents, LLMs, DeepSeek, Claude, and GPT.
            </p>
          </div>
          <div className="flex flex-wrap gap-x-10 gap-y-4 text-sm text-muted">
            <div className="flex flex-col gap-2">
              <span className="text-heading font-semibold text-xs uppercase tracking-wider">Topics</span>
              <Link href="/category/ai-tools" className="hover:text-heading transition-colors">AI Tools</Link>
              <Link href="/category/ai-agents" className="hover:text-heading transition-colors">AI Agents</Link>
              <Link href="/category/llm" className="hover:text-heading transition-colors">LLMs</Link>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-heading font-semibold text-xs uppercase tracking-wider">Models</span>
              <Link href="/category/claude" className="hover:text-heading transition-colors">Claude</Link>
              <Link href="/category/deepseek" className="hover:text-heading transition-colors">DeepSeek</Link>
              <Link href="/category/harness" className="hover:text-heading transition-colors">Harness</Link>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-heading font-semibold text-xs uppercase tracking-wider">Site</span>
              <Link href="/about" className="hover:text-heading transition-colors">About</Link>
              <Link href="/contact" className="hover:text-heading transition-colors">Contact</Link>
              <Link href="/privacy-policy" className="hover:text-heading transition-colors">Privacy Policy</Link>
            </div>
          </div>
        </div>
        <div className="pt-6 border-t border-subtle flex items-center justify-between">
          <span className="text-xs text-muted">© {new Date().getFullYear()} AI Tools Hub. All rights reserved.</span>
          <div className="h-1 w-20 rounded-full bg-gradient-brand" />
        </div>
      </div>
    </footer>
  )
}
