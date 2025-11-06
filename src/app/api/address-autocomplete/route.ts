import type { GoogleAddressSuggestion } from '@/types/address'
import { type NextRequest, NextResponse } from 'next/server'
import { withSpan, addSpanEvent } from '@/lib/telemetry'

interface GoogleMapsPrediction {
  description: string
  place_id: string
  structured_formatting?: {
    main_text: string
    secondary_text: string
  }
}

interface GoogleMapsResponse {
  predictions: GoogleMapsPrediction[]
}

export async function GET(req: NextRequest) {
  return withSpan('api.address_autocomplete', async (span) => {
    const query = req.nextUrl.searchParams.get('q')

    span.setAttribute('autocomplete.query', query || '')

    if (!query) {
      addSpanEvent('autocomplete.empty_query')
      return NextResponse.json({ results: [] })
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY
    if (!apiKey) {
      addSpanEvent('autocomplete.validation.failed', { reason: 'missing_api_key' })
      return NextResponse.json(
        { error: 'Missing Google Maps API key' },
        { status: 500 }
      )
    }

    const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(query)}&types=address&language=pt_BR&components=country:br&key=${apiKey}`

    try {
      addSpanEvent('google_maps.autocomplete.request.start')

      const res = await fetch(url)

      span.setAttribute('http.status_code', res.status)

      if (!res.ok) {
        return NextResponse.json(
          { error: 'Failed to fetch from Google' },
          { status: 500 }
        )
      }

      const data: GoogleMapsResponse = await res.json()

      // Map to a simpler format for the frontend
      const results: GoogleAddressSuggestion[] = (data.predictions || []).map(
        item => ({
          main_text: item.structured_formatting?.main_text || item.description,
          secondary_text: item.structured_formatting?.secondary_text || '',
          place_id: item.place_id,
        })
      )

      addSpanEvent('google_maps.autocomplete.results', {
        'results.count': results.length,
      })

      return NextResponse.json({ results })
    } catch (error) {
      console.error('Error in address autocomplete:', error)
      span.recordException(error as Error)
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  })
}
