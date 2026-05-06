import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const CANONICAL_HOST = 'aiatoolshub.site'

const TRACKING_PARAMS = new Set([
  'fbclid',
  'gclid',
  'gbraid',
  'igshid',
  'mc_cid',
  'mc_eid',
  'msclkid',
  'ref_src',
  'wbraid',
])

function isTrackingParam(key: string) {
  return key.startsWith('utm_') || TRACKING_PARAMS.has(key)
}

export function proxy(request: NextRequest) {
  const url = request.nextUrl.clone()
  const host = (
    request.headers.get('x-forwarded-host') ??
    request.headers.get('host') ??
    ''
  )
    .split(':')[0]
    .toLowerCase()
  let shouldRedirect = false

  if (host === `www.${CANONICAL_HOST}`) {
    url.protocol = 'https:'
    url.hostname = CANONICAL_HOST
    url.port = ''
    shouldRedirect = true
  }

  if (url.pathname !== '/search') {
    for (const key of Array.from(url.searchParams.keys())) {
      if (isTrackingParam(key)) {
        url.searchParams.delete(key)
        shouldRedirect = true
      }
    }
  }

  if (!shouldRedirect) {
    return NextResponse.next()
  }

  return NextResponse.redirect(url, 308)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|feed.xml|ads.txt|.*\\.(?:css|gif|ico|jpg|jpeg|js|png|svg|txt|webp|xml)$).*)',
  ],
}
