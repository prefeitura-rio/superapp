import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { withSpan, addSpanEvent } from '@/lib/telemetry'

export async function POST(request: NextRequest) {
  return withSpan('api.cookies.consent', async (span) => {
    try {
      const { consent } = await request.json()

      span.setAttribute('consent.value', consent || 'unknown')

      if (consent === 'accepted') {
        addSpanEvent('consent.accepted')
        const response = NextResponse.json({ success: true })

        // Set httpOnly cookie
        response.cookies.set('cookieConsent', 'true', {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 365, // 1 year
          path: '/',
        })

        return response
      }

      addSpanEvent('consent.rejected')
      return NextResponse.json({ success: true })
    } catch (error) {
      console.error('Error setting cookie consent:', error)
      span.recordException(error as Error)
      return NextResponse.json(
        { error: 'Failed to set cookie consent' },
        { status: 500 }
      )
    }
  })
}
