import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Script from 'next/script'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import './globals.css'

const inter = Inter({ subsets: ['latin'], display: 'swap' })

export const metadata: Metadata = {
  title: {
    default: 'AI Tools Hub — Reviews, Guides & Agent News',
    template: '%s | AI Tools Hub',
  },
  description:
    'In-depth reviews and guides on AI tools, AI agents, LLMs, DeepSeek, Claude, and GPT.',
  robots: { index: true, follow: true },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const publisherId = process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID
  return (
    <html lang="en" className={inter.className}>
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
      </body>
    </html>
  )
}
