import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Contact AI Tools Hub for questions, corrections, privacy requests, and feedback.',
}

export default function ContactPage() {
  return (
    <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-card p-10">
      <h1 className="text-heading text-3xl font-extrabold mb-2">Contact AI Tools Hub</h1>
      <p className="text-muted text-sm mb-8">
        Questions, corrections, privacy requests, and business inquiries are welcome.
      </p>

      <div className="prose prose-gray max-w-none prose-headings:text-heading">
        <h2>Email</h2>
        <p>
          The best way to contact us is by email at{' '}
          <a href="mailto:qnikevzkl@gmail.com">qnikevzkl@gmail.com</a>.
        </p>

        <h2>What to Include</h2>
        <p>To help us respond efficiently, please include:</p>
        <ul>
          <li>The page URL related to your message, if applicable.</li>
          <li>A short description of your question, correction, or request.</li>
          <li>Your preferred reply email address.</li>
        </ul>

        <h2>Privacy Requests</h2>
        <p>
          For privacy-related requests, include &quot;Privacy Request&quot; in the subject line. You can read
          more about how this site handles data in our <a href="/privacy-policy">Privacy Policy</a>.
        </p>

        <h2>Editorial Corrections</h2>
        <p>
          We aim to keep AI Tools Hub accurate and useful. If you notice outdated information,
          broken links, or factual issues, please send the article URL and a brief explanation.
        </p>
      </div>
    </div>
  )
}
