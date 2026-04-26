import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy policy for AI Tools Hub.',
}

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-card p-10">
      <h1 className="text-heading text-3xl font-extrabold mb-2">Privacy Policy</h1>
      <p className="text-muted text-sm mb-8">Last updated: April 26, 2026</p>
      <div className="prose prose-gray max-w-none prose-headings:text-heading">
        <h2>Advertising</h2>
        <p>
          This site uses Google AdSense to display advertisements. Google may use cookies to serve
          ads based on your prior visits to this website or other websites. You may opt out of
          personalized advertising by visiting{' '}
          <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer">
            Google Ads Settings
          </a>.
        </p>
        <h2>Analytics</h2>
        <p>
          We may use analytics tools to understand how visitors use this site. No personally
          identifiable information is collected beyond what your browser sends as standard HTTP headers.
        </p>
        <h2>Cookies</h2>
        <p>
          Cookies may be set by Google AdSense for ad personalization. We do not set any first-party
          tracking cookies.
        </p>
        <h2>Contact</h2>
        <p>For privacy-related questions, visit our <a href="/about">About page</a>.</p>
      </div>
    </div>
  )
}
