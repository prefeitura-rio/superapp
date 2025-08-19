import { type NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const placeId = req.nextUrl.searchParams.get('place_id')
  const number = req.nextUrl.searchParams.get('number')

  if (!placeId) {
    return NextResponse.json(
      { error: 'Missing place_id parameter' },
      { status: 400 }
    )
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { error: 'Missing Google Maps API key' },
      { status: 500 }
    )
  }

  try {
    // Get place details to extract CEP
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=address_components&key=${apiKey}`

    const res = await fetch(url)
    if (!res.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch place details from Google' },
        { status: 500 }
      )
    }

    const data = await res.json()

    if (!data.result || !data.result.address_components) {
      return NextResponse.json({ cep: null })
    }

    // Extract CEP from address components
    const addressComponents = data.result.address_components
    const postalCodeComponent = addressComponents.find((component: any) =>
      component.types.includes('postal_code')
    )

    let cep = null
    if (postalCodeComponent) {
      const rawCep = postalCodeComponent.long_name
      // Format CEP as XXXXX-XXX
      if (rawCep && rawCep.length === 8) {
        cep = `${rawCep.slice(0, 5)}-${rawCep.slice(5)}`
      } else if (rawCep && rawCep.length === 9 && rawCep.includes('-')) {
        cep = rawCep
      }
    }

    // If we have a number, try to get more specific CEP using Geocoding API
    if (number && cep) {
      try {
        const streetName = addressComponents.find((component: any) =>
          component.types.includes('route')
        )?.long_name

        const neighborhood = addressComponents.find(
          (component: any) =>
            component.types.includes('sublocality') ||
            component.types.includes('political')
        )?.long_name

        const city = addressComponents.find((component: any) =>
          component.types.includes('administrative_area_level_2')
        )?.long_name

        if (streetName && city) {
          const fullAddress =
            `${streetName}, ${number}, ${neighborhood || ''}, ${city}, Brasil`.replace(
              ', ,',
              ','
            )
          const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(fullAddress)}&key=${apiKey}`

          const geocodeRes = await fetch(geocodeUrl)
          if (geocodeRes.ok) {
            const geocodeData = await geocodeRes.json()
            if (geocodeData.results?.[0]) {
              const specificPostalCode =
                geocodeData.results[0].address_components?.find(
                  (component: any) => component.types.includes('postal_code')
                )

              if (specificPostalCode) {
                const specificCep = specificPostalCode.long_name
                if (specificCep && specificCep.length === 8) {
                  cep = `${specificCep.slice(0, 5)}-${specificCep.slice(5)}`
                } else if (
                  specificCep &&
                  specificCep.length === 9 &&
                  specificCep.includes('-')
                ) {
                  cep = specificCep
                }
              }
            }
          }
        }
      } catch (error) {
        // If specific geocoding fails, use the original CEP
        console.warn('Failed to get specific CEP, using general one:', error)
      }
    }

    return NextResponse.json({ cep })
  } catch (error) {
    console.error('Error in CEP lookup:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
