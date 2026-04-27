import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About',
  description:
    'About AI Tools Hub, an independent AI tools publication with editorial information and contact details.',
}

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-card p-10">
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

        <h2>Editorial Mission</h2>
        <p>
          Our goal is to help readers understand how AI products work, where they fit, and what
          trade-offs matter before adopting them. We focus on practical explanations, implementation
          patterns, comparison guides, and production considerations for developers and technical
          teams.
        </p>

        <h2>What We Cover</h2>
        <ul>
          <li><strong>AI Tool Reviews</strong> — hands-on evaluations with real benchmarks</li>
          <li><strong>AI Agent Tutorials</strong> — step-by-step guides for building autonomous agents</li>
          <li><strong>LLM Analysis</strong> — deep dives into frontier models like DeepSeek V4, Claude, and GPT-5</li>
          <li><strong>Developer Guides</strong> — practical API and SDK walkthroughs</li>
        </ul>

        <h2>Independence and Advertising</h2>
        <p>
          AI Tools Hub may display advertising, including Google AdSense, to support site
          operations. Advertising does not determine our article topics or editorial conclusions.
          Sponsored content, if published in the future, will be clearly identified.
        </p>

        <h2>Contact</h2>
        <p>
          For questions, corrections, privacy requests, advertising inquiries, or general feedback,
          contact the site operator at{' '}
          <a href="mailto:qnikevzkl@gmail.com">qnikevzkl@gmail.com</a>.
        </p>
      </div>
    </div>
  )
}
