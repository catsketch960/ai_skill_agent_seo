'use client'

import { useEffect } from 'react'
import { getAdSensePublisherId } from '@/lib/ads'

declare global {
  interface Window { adsbygoogle: unknown[] }
}

interface AdUnitProps {
  slot: string
  format?: 'auto' | 'rectangle' | 'vertical'
  className?: string
}

export default function AdUnit({ slot, format = 'auto', className = '' }: AdUnitProps) {
  const publisherId = getAdSensePublisherId()

  useEffect(() => {
    if (!publisherId) return
    try {
      ;(window.adsbygoogle = window.adsbygoogle || []).push({})
    } catch {}
  }, [publisherId])

  if (!publisherId) {
    return (
      <div className={`border border-dashed border-violet-200 rounded-lg bg-gray-50 flex items-center justify-center text-[10px] text-gray-400 uppercase tracking-widest ${className}`}>
        Advertisement
      </div>
    )
  }

  return (
    <div className={`rounded-xl bg-white shadow-card p-3 ${className}`}>
      <p className="text-[9px] text-gray-400 uppercase tracking-widest text-center mb-2">Advertisement</p>
      <ins
        className="adsbygoogle block"
        data-ad-client={publisherId}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  )
}
