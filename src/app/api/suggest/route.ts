import { NextResponse } from 'next/server'

const BASE = (
  process.env.NEXT_PUBLIC_BASE_API_URL_APP_BUSCA_SEARCH ?? ''
).replace(/\/$/, '')

// Typeahead autocomplete -> facilita GET /api/v1/suggest.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q')?.trim() || ''

  if (!BASE || q.length < 2) {
    return NextResponse.json({ suggestions: [] })
  }

  try {
    const res = await fetch(
      `${BASE}/api/v1/suggest?q=${encodeURIComponent(q)}`,
      {
        next: { revalidate: 60, tags: ['suggest'] },
      }
    )
    if (!res.ok) return NextResponse.json({ suggestions: [] })
    return NextResponse.json(await res.json())
  } catch (error) {
    console.error('Error fetching suggestions:', error)
    return NextResponse.json({ suggestions: [] })
  }
}
