import { getEnv } from '@/env/server'
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

  const env = await getEnv()
  const rootUrl = env.NEXT_PUBLIC_API_BUSCA_ROOT_URL

  try {
    const response = await fetch(
      `${rootUrl}/search/multi?q=${q}&llm_reorder=false&cs=carioca-digital,1746,pref-rio`,
      {
        headers,
      }
    )

    if (!response.ok) {
      throw new Error('Network response was not ok')
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching data:', error)
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 })
  }
}
