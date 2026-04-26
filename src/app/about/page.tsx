import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About',
  description: 'About AI Tools Hub — your source for AI tool reviews, agent tutorials, and LLM news.',
}

export default function AboutPage() {
  return (
    <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-card p-10">
      <h1 className="text-heading text-3xl font-extrabold mb-6">About AI Tools Hub</h1>
      <div className="prose prose-gray max-w-none prose-headings:text-heading">
        <p>
          AI Tools Hub is an independent publication covering the latest in AI tools, AI agents,
          large language models, and frontier AI research. We publish in-depth reviews, tutorials,
          and comparisons to help developers and professionals navigate the rapidly evolving AI landscape.
        </p>
        <p>
          Our coverage spans DeepSeek, Claude, GPT, Gemini, Harness, and the broader open-source
          ecosystem — with an emphasis on practical, real-world evaluation over hype.
        </p>
        <h2>What We Cover</h2>
        <ul>
          <li><strong>AI Tool Reviews</strong> — hands-on evaluations with real benchmarks</li>
          <li><strong>AI Agent Tutorials</strong> — step-by-step guides for building autonomous agents</li>
          <li><strong>LLM Analysis</strong> — deep dives into frontier models like DeepSeek V4, Claude, and GPT-5</li>
          <li><strong>Developer Guides</strong> — practical API and SDK walkthroughs</li>
        </ul>
      </div>
    </div>
  )
}
