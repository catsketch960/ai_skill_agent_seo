import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Script from 'next/script'
import { Analytics } from '@vercel/analytics/next'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import { getAdSensePublisherId } from '@/lib/ads'
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from '@/lib/seo'
import './globals.css'

const inter = Inter({ subsets: ['latin'], display: 'swap' })

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — Reviews, Guides & Agent News`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  robots: { index: true, follow: true },
  alternates: { canonical: './' },
  openGraph: {
    type: 'website',
    url: SITE_URL,
    siteName: SITE_NAME,
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_NAME} — Reviews, Guides & Agent News`,
    description: SITE_DESCRIPTION,
  },
  other: {
    'application/rss+xml': `${SITE_URL}/feed.xml`,
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const publisherId = getAdSensePublisherId()
  return (
    <html lang="en" className={inter.className}>
      <head>
        <link
          rel="alternate"
          type="application/rss+xml"
          title="AI Tools Hub RSS Feed"
          href="/feed.xml"
        />
      </head>
      <body className="antialiased">
        <Nav />
        {publisherId && (
          <Script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${publisherId}`}
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
        )}
        <main className="max-w-6xl mx-auto px-6 py-10">{children}</main>
        <Footer />
        <Analytics />
      </body>
    </html>
  )
}
