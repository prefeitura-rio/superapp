import { addSpanEvent, withSpan } from '@/lib/telemetry'
import type { GoogleAddressSuggestion } from '@/types/address'
import { type NextRequest, NextResponse } from 'next/server'

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
  return withSpan('api.address_autocomplete', async span => {
    const query = req.nextUrl.searchParams.get('q')

    span.setAttribute('autocomplete.query', query || '')

    if (!query) {
      addSpanEvent('autocomplete.empty_query')
      return NextResponse.json({ results: [] })
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY
    if (!apiKey) {
      // Local demo fallback (no real key): only when explicitly opted in via
      // FACILITA_FLOW_MOCK_PLACES. In every real environment the key is set, so
      // this branch never runs there and the guided flow uses real Google data.
      if (process.env.FACILITA_FLOW_MOCK_PLACES === 'true') {
        addSpanEvent('autocomplete.mock_fallback')
        const bairros = [
          'Copacabana, Rio de Janeiro - RJ, Brasil',
          'Tijuca, Rio de Janeiro - RJ, Brasil',
          'Campo Grande, Rio de Janeiro - RJ, Brasil',
          'Botafogo, Rio de Janeiro - RJ, Brasil',
          'Madureira, Rio de Janeiro - RJ, Brasil',
        ]
        const results: GoogleAddressSuggestion[] = bairros.map((b, i) => ({
          main_text: query,
          secondary_text: b,
          place_id: `mock-${i}`,
        }))
        return NextResponse.json({ results })
      }
      addSpanEvent('autocomplete.validation.failed', {
        reason: 'missing_api_key',
      })
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
