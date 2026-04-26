import type { Config } from 'tailwindcss'
import typography from '@tailwindcss/typography'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        heading: '#1e1b4b',
        body: '#374151',
        muted: '#6b7280',
        subtle: '#f3f4f6',
      },
      boxShadow: {
        card: '0 4px 20px rgba(99,102,241,0.10)',
        'card-hover': '0 8px 32px rgba(99,102,241,0.18)',
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
        'gradient-page': 'linear-gradient(135deg, #eff6ff, #f5f3ff)',
      },
    },
  },
  plugins: [typography],
}

export default config
