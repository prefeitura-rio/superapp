import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { withSpan, addSpanEvent } from '@/lib/telemetry'

export async function GET(request: NextRequest) {
  return withSpan('api.cookies.consent.check', async (span) => {
    try {
      const cookieConsent = request.cookies.get('cookieConsent')
      const hasConsented = cookieConsent?.value === 'true'

      span.setAttribute('consent.has_consented', hasConsented)
      addSpanEvent('consent.checked', { status: hasConsented ? 'accepted' : 'not_set' })

      return NextResponse.json({
        hasConsented,
      })
    } catch (error) {
      console.error('Error checking cookie consent:', error)
      span.recordException(error as Error)
      return NextResponse.json(
        { error: 'Failed to check cookie consent' },
        { status: 500 }
      )
    }
  })
}

