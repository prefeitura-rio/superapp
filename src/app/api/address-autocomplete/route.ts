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
  const query = req.nextUrl.searchParams.get('q')
  if (!query) {
    return NextResponse.json({ results: [] })
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { error: 'Missing Google Maps API key' },
      { status: 500 }
    )
  }

  const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(query)}&types=address&language=pt_BR&components=country:br&key=${apiKey}`

  try {
    const res = await fetch(url)
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

    return NextResponse.json({ results })
  } catch (error) {
    console.error('Error in address autocomplete:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
