import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q')
  const recaptchaToken = request.headers.get('x-recaptcha-token')
  //TODO: ADD REAL RECAPTCHA TOKEN
  const headers = {
    ...(recaptchaToken
      ? { 'X-Recaptcha-Token': recaptchaToken }
      : { 'X-Recaptcha-Token': 'mockada' }),
  }

  const rootUrl = process.env.NEXT_PUBLIC_API_BUSCA_ROOT_URL

  try {
    const response = await fetch(
      `${rootUrl}/busca-hibrida-multi?q=${q}&collections=carioca-digital,1746,pref-rio&page=1&per_page=10`,
      {
        headers,
      }
    )

    if (!response.ok) {
      throw new Error('Network response was not ok')
    }

    const data = await response.json()

    // Transform the new format to the old format expected by the frontend
    const transformedData = {
      result: data.hits ? data.hits.map((hit: any) => hit.document) : [],
    }

    return NextResponse.json(transformedData)
  } catch (error) {
    console.error('Error fetching data:', error)
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 })
  }
}
