import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const cookieConsent = request.cookies.get('cookieConsent')

    return NextResponse.json({
      hasConsented: cookieConsent?.value === 'true',
    })
  } catch (error) {
    console.error('Error checking cookie consent:', error)
    return NextResponse.json(
      { error: 'Failed to check cookie consent' },
      { status: 500 }
    )
  }
}

