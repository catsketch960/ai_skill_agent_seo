import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'Privacy policy for AI Tools Hub, including analytics, advertising, cookies, and contact information.',
}

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-card p-10">
      <h1 className="text-heading text-3xl font-extrabold mb-2">Privacy Policy</h1>
      <p className="text-muted text-sm mb-8">Last updated: April 27, 2026</p>
      <div className="prose prose-gray max-w-none prose-headings:text-heading">
        <p>
          AI Tools Hub is an independent content website that publishes guides, reviews, and
          analysis about AI tools, AI agents, and large language models. This Privacy Policy
          explains what information may be collected when you visit this website, how that
          information is used, and how you can contact us.
        </p>

        <h2>Information We Collect</h2>
        <p>
          We do not require visitors to create an account, log in, or submit personal information
          to read our articles. When you visit the site, some technical information may be
          collected automatically by our hosting, analytics, advertising, and security providers.
          This may include your IP address, browser type, device type, operating system, referring
          pages, pages visited, approximate location derived from network data, timestamps, and
          standard server log information.
        </p>

        <h2>How We Use Information</h2>
        <p>We use information for the following purposes:</p>
        <ul>
          <li>To operate, maintain, secure, and improve the website.</li>
          <li>To understand traffic patterns, page views, and content performance.</li>
          <li>To detect abuse, spam, fraud, security incidents, or technical issues.</li>
          <li>To display, measure, and improve advertising where advertising is enabled.</li>
          <li>To respond to messages sent to our contact email.</li>
        </ul>

        <h2>Advertising</h2>
        <p>
          This site may use Google AdSense or other Google advertising products to display
          advertisements. Third-party vendors, including Google, may use cookies, web beacons,
          IP addresses, or other identifiers to serve ads based on a user&apos;s prior visits to this
          website or other websites, to measure ad performance, and to help prevent fraud and abuse.
        </p>
        <p>
          Google uses advertising cookies to serve ads. You can learn more about how Google uses
          information from sites or apps that use its services at{' '}
          <a href="https://policies.google.com/technologies/partner-sites" target="_blank" rel="noopener noreferrer">
            Google Privacy & Terms
          </a>
          . You can manage or opt out of personalized ads through{' '}
          <a href="https://adssettings.google.com/" target="_blank" rel="noopener noreferrer">
            Google Ads Settings
          </a>{' '}
          or visit{' '}
          <a href="https://www.aboutads.info/choices/" target="_blank" rel="noopener noreferrer">
            YourAdChoices
          </a>.
        </p>

        <h2>Analytics</h2>
        <p>
          We use Vercel Web Analytics to understand aggregate website traffic and page views.
          Analytics data helps us see which pages are useful and improve site performance. Analytics
          providers may process technical information such as pages visited, browser information,
          device information, referrer, and approximate region.
        </p>

        <h2>Cookies</h2>
        <p>
          Cookies and similar technologies may be used by advertising, analytics, security, and
          hosting providers. These technologies can help remember preferences, measure traffic,
          serve relevant ads, limit repeated ads, and detect invalid activity. You can control or
          delete cookies through your browser settings. If you block cookies, some advertising or
          analytics features may not function as intended.
        </p>

        <h2>Third-Party Services</h2>
        <p>
          This website is hosted on Vercel and may use Google advertising products. These third
          parties may process information according to their own privacy policies and terms. We do
          not control the privacy practices of third-party websites, advertisers, or service
          providers linked from this website.
        </p>

        <h2>Data Sharing</h2>
        <p>
          We do not sell personal information. We may share or allow processing of information with
          service providers that help us host the website, measure traffic, serve ads, improve
          security, or comply with legal obligations. We may also disclose information if required
          by law, regulation, legal process, or to protect the rights, safety, and security of users,
          the public, or this website.
        </p>

        <h2>Your Choices and Rights</h2>
        <p>
          Depending on your location, you may have rights to request access, correction, deletion,
          restriction, portability, or objection to certain processing of personal information. You
          may also control cookies through your browser and manage personalized advertising through
          Google Ads Settings. To make a privacy request, contact us at the email address below.
        </p>

        <h2>Children&apos;s Privacy</h2>
        <p>
          AI Tools Hub is intended for a general professional and developer audience. We do not
          knowingly collect personal information from children under 13. If you believe a child has
          provided personal information to us, please contact us so we can review and remove it
          where appropriate.
        </p>

        <h2>Data Retention</h2>
        <p>
          We retain contact messages and operational records only for as long as reasonably needed
          for the purposes described in this policy, unless a longer retention period is required or
          permitted by law. Analytics and advertising providers may retain data according to their
          own policies.
        </p>

        <h2>International Visitors</h2>
        <p>
          This website may be accessed globally, and service providers may process information in
          countries other than your country of residence. By using the website, you understand that
          information may be processed where our service providers operate.
        </p>

        <h2>Changes to This Policy</h2>
        <p>
          We may update this Privacy Policy from time to time. The updated version will be posted
          on this page with a new &quot;Last updated&quot; date.
        </p>

        <h2>Contact</h2>
        <p>
          For privacy-related questions or requests, contact us at{' '}
          <a href="mailto:qnikevzkl@gmail.com">qnikevzkl@gmail.com</a>. You can also visit our{' '}
          <a href="/contact">Contact page</a>.
        </p>
      </div>
    </div>
  )
}
