import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ 'category-slug': string }> }
) {
  try {
    const { 'category-slug': categorySlug } = await params

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

    // Decode the URL-encoded category slug
    const decodedSlug = decodeURIComponent(categorySlug)
    const url = `${rootUrl}/categoria/1746,carioca-digital?categoria=${decodedSlug}&page=1&per_page=20`

    // Prepare headers for the API request
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }

    // Add reCAPTCHA token if provided
    if (recaptchaToken) {
      headers['X-Recaptcha-Token'] = recaptchaToken
    }

    // Fetch services from the external API
    const response = await fetch(url, {
      headers,
      next: { revalidate: 86400 }, // Cache for 1 day
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Services API error:', response.status, errorText)
      return NextResponse.json(
        { error: 'Failed to fetch services' },
        { status: response.status }
      )
    }

    const services = await response.json()

    // Return the services with caching headers
    return NextResponse.json(services, {
      headers: {
        'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=86400',
      },
    })
  } catch (error) {
    console.error('Services route error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
