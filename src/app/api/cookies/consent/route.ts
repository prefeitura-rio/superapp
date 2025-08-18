import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { consent } = await request.json()

    if (consent === 'accepted') {
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

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error setting cookie consent:', error)
    return NextResponse.json(
      { error: 'Failed to set cookie consent' },
      { status: 500 }
    )
  }
}
