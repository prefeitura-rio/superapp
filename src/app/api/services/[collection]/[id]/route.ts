import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ collection: string; id: string }> }
) {
  try {
    const { collection, id } = await params

    // Get reCAPTCHA token from headers
    const recaptchaToken = request.headers.get('X-Recaptcha-Token')

    // Get the root URL from environment
    const rootUrl = process.env.NEXT_PUBLIC_API_BUSCA_ROOT_URL

    if (!rootUrl) {
      return NextResponse.json(
        { error: 'API root URL not configured' },
        { status: 500 }
      )
    }

    const url = `${rootUrl}/documento/${collection}/${id}`

    // Prepare headers for the API request
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }

    // Add reCAPTCHA token if provided
    if (recaptchaToken) {
      headers['X-Recaptcha-Token'] = recaptchaToken
    }

    // Fetch service from the external API
    const response = await fetch(url, {
      headers,
      next: { revalidate: 3600 }, // Cache for 1 hour
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Service API error:', response.status, errorText)
      return NextResponse.json(
        { error: 'Failed to fetch service' },
        { status: response.status }
      )
    }

    const service = await response.json()

    // Return the service with caching headers
    return NextResponse.json(service, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=3600',
      },
    })
  } catch (error) {
    console.error('Service route error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
