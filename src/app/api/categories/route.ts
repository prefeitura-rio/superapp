import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
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

    // Prepare headers for the API request
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }

    // Add reCAPTCHA token if provided
    if (recaptchaToken) {
      headers['X-Recaptcha-Token'] = recaptchaToken
    }

    // Fetch categories from the external API
    const response = await fetch(
      `${rootUrl}/categorias-relevancia?collections=1746,carioca-digital`,
      {
        headers,
        next: { revalidate: 86400 }, // Cache for 1 day
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Categories API error:', response.status, errorText)
      return NextResponse.json(
        { error: 'Failed to fetch categories' },
        { status: response.status }
      )
    }

    const categories = await response.json()

    // Return the categories with caching headers
    return NextResponse.json(categories, {
      headers: {
        'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=86400',
      },
    })
  } catch (error) {
    console.error('Categories route error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
